import type { PrismaClient } from "@prisma/client";
import { z } from "zod";

export const defaultProfileModel = "gpt-5-mini";
export const defaultProfileBatchSize = 50;
export const openAiResponsesUrl = "https://api.openai.com/v1/responses";
const openAiRequestTimeoutMs = 60_000;

export const petProfilePrompt = `You write wholesome Tinder-style adoption bios for rescue dogs.

Style:
- Warm
- Funny
- Short
- Optimistic
- Family friendly
- Never mention euthanasia or trauma
- 40-60 words max for each bio
- Mention likely personality traits inferred from description
- Add a cute hook (without marking it as such)
- Avoid repeating phrases or repeating the name in the bio
- Must not mention behaviour traits to avoid misleading possible adopters
- Must use first person

Name rules:
- Pick a short, friendly pet name that works naturally in Romanian (it can be an international name).
- Match the provided sex when it is clear.
- Avoid duplicate names inside the same batch when possible.
- Try using common pet names

Write the name and bio in Romanian.
Return ONLY valid JSON matching this shape:
{"profiles":[{"id":"pet-id","name":"Maya","bio":"..."}]}
Preserve each input id exactly and include one profile for every input pet.`;

export type PetProfileCandidate = {
  id: string;
  registryNumber: string;
  approximateAge: string | null;
  sex: string | null;
  color: string | null;
  captureLocation: string | null;
  characteristics: string | null;
};

export type GeneratedPetProfile = {
  id: string;
  name: string;
  bio: string;
};

type GeneratePetProfilesOptions = {
  apiKey?: string;
  model?: string;
  responsesUrl?: string;
  request?: typeof fetch;
  logIo?: boolean;
  logger?: Pick<Console, "info">;
};

type EnrichPetProfilesOptions = GeneratePetProfilesOptions & {
  db: PrismaClient;
  pets: PetProfileCandidate[];
  batchSize?: number;
  now?: () => Date;
};

export type PetProfileEnrichmentSummary = {
  attemptedCount: number;
  updatedCount: number;
  skippedCount: number;
  errors: string[];
  model: string | null;
};

const generatedPetProfileSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  name: z.string().trim().min(1).max(64),
  bio: z.string().trim().min(1).max(800),
});

const generatedPetProfilesSchema = z
  .union([
    z.array(generatedPetProfileSchema),
    z.object({
      profiles: z.array(generatedPetProfileSchema),
    }),
  ])
  .transform((value) => (Array.isArray(value) ? value : value.profiles));

const petProfilesJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["profiles"],
  properties: {
    profiles: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "name", "bio"],
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          bio: { type: "string" },
        },
      },
    },
  },
};

export async function enrichPetProfiles({
  db,
  pets,
  batchSize = getProfileBatchSize(),
  now = () => new Date(),
  apiKey = process.env.OPENAI_API_KEY,
  model = process.env.OPENAI_MODEL ?? defaultProfileModel,
  responsesUrl = process.env.OPENAI_RESPONSES_URL ?? openAiResponsesUrl,
  request,
  logIo = isProfileIoLoggingEnabled(),
  logger = console,
}: EnrichPetProfilesOptions): Promise<PetProfileEnrichmentSummary> {
  if (logIo) {
    logger.info("OpenAI profile enrichment candidates", {
      count: pets.length,
      batchSize: normalizeBatchSize(batchSize),
      model,
      hasApiKey: Boolean(apiKey),
    });
  }

  if (pets.length === 0) {
    return {
      attemptedCount: 0,
      updatedCount: 0,
      skippedCount: 0,
      errors: [],
      model: null,
    };
  }

  if (!apiKey) {
    return {
      attemptedCount: 0,
      updatedCount: 0,
      skippedCount: pets.length,
      errors: [],
      model: null,
    };
  }

  const batches = createProfileBatches(pets, batchSize);
  const errors: string[] = [];
  let updatedCount = 0;

  for (const [index, batch] of batches.entries()) {
    try {
      const generatedProfiles = await generatePetProfiles(batch, {
        apiKey,
        model,
        responsesUrl,
        request,
        logIo,
        logger,
      });
      const batchIds = new Set(batch.map((pet) => pet.id));
      const generatedIds = new Set<string>();

      for (const profile of generatedProfiles) {
        if (!batchIds.has(profile.id)) {
          errors.push(
            `Batch ${index + 1}: ignored profile for unknown pet id ${profile.id}.`,
          );
          continue;
        }

        generatedIds.add(profile.id);
        await db.pet.update({
          where: { id: profile.id },
          data: {
            profileName: profile.name,
            profileBio: profile.bio,
            profileGeneratedAt: now(),
            profileModel: model,
          },
        });
        updatedCount += 1;
      }

      for (const pet of batch) {
        if (!generatedIds.has(pet.id)) {
          errors.push(
            `Batch ${index + 1}: missing generated profile for ${pet.registryNumber}.`,
          );
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`Batch ${index + 1}: ${message}`);
    }
  }

  return {
    attemptedCount: pets.length,
    updatedCount,
    skippedCount: pets.length - updatedCount,
    errors,
    model,
  };
}

export async function generatePetProfiles(
  pets: PetProfileCandidate[],
  {
    apiKey = process.env.OPENAI_API_KEY,
    model = process.env.OPENAI_MODEL ?? defaultProfileModel,
    responsesUrl = process.env.OPENAI_RESPONSES_URL ?? openAiResponsesUrl,
    request = fetch,
    logIo = isProfileIoLoggingEnabled(),
    logger = console,
  }: GeneratePetProfilesOptions = {},
): Promise<GeneratedPetProfile[]> {
  if (pets.length === 0 || !apiKey) {
    return [];
  }

  const profileInputs = toProfileInputs(pets);

  if (logIo) {
    logger.info("OpenAI profile generation input", {
      model,
      count: profileInputs.length,
      pets: profileInputs,
    });
  }

  const response = await request(responsesUrl, {
    method: "POST",
    signal: timeoutSignal(openAiRequestTimeoutMs),
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      instructions: petProfilePrompt,
      input: [
        {
          role: "user",
          content: JSON.stringify(profileInputs),
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "pet_profiles",
          strict: true,
          schema: petProfilesJsonSchema,
        },
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    if (logIo) {
      logger.info("OpenAI profile generation error output", {
        status: response.status,
        body,
      });
    }

    throw new Error(
      `OpenAI profile generation failed with HTTP ${response.status}: ${body}`,
    );
  }

  const json = (await response.json()) as unknown;
  const text = extractResponseText(json);
  if (logIo) {
    logger.info("OpenAI profile generation raw output", text);
  }

  const parsed = JSON.parse(text);
  const generatedProfiles = generatedPetProfilesSchema.parse(parsed);

  if (logIo) {
    logger.info("OpenAI profile generation parsed output", {
      count: generatedProfiles.length,
      profiles: generatedProfiles,
    });
  }

  return generatedProfiles;
}

export function createProfileBatches<T>(
  items: T[],
  batchSize = defaultProfileBatchSize,
): T[][] {
  const safeBatchSize = normalizeBatchSize(batchSize);
  const batches: T[][] = [];

  for (let index = 0; index < items.length; index += safeBatchSize) {
    batches.push(items.slice(index, index + safeBatchSize));
  }

  return batches;
}

export function getProfileBatchSize(
  value = process.env.PROFILE_BATCH_SIZE,
): number {
  return normalizeBatchSize(Number(value));
}

function normalizeBatchSize(value: number): number {
  if (!Number.isFinite(value) || value < 1) {
    return defaultProfileBatchSize;
  }

  return Math.min(Math.floor(value), 100);
}

function isProfileIoLoggingEnabled(
  value = process.env.PROFILE_LOG_IO,
): boolean {
  return value === "1" || value?.toLowerCase() === "true";
}

function toProfileInputs(pets: PetProfileCandidate[]) {
  return pets.map((pet) => ({
    id: pet.id,
    registryNumber: pet.registryNumber,
    age: pet.approximateAge,
    sex: toRomanianSex(pet.sex),
    color: pet.color,
    location: pet.captureLocation,
    characteristics: pet.characteristics,
  }));
}

function toRomanianSex(value: string | null): string | null {
  if (value === "female") {
    return "Femela";
  }

  if (value === "male") {
    return "Mascul";
  }

  return value;
}

function extractResponseText(response: unknown): string {
  if (response && typeof response === "object" && "output_text" in response) {
    const outputText = (response as { output_text?: unknown }).output_text;
    if (typeof outputText === "string") {
      return outputText;
    }
  }

  const output =
    response && typeof response === "object"
      ? (response as { output?: unknown }).output
      : null;
  if (Array.isArray(output)) {
    const text = output
      .flatMap((item) => {
        if (!item || typeof item !== "object") {
          return [];
        }

        const content = (item as { content?: unknown }).content;
        return Array.isArray(content) ? content : [];
      })
      .map((content) => {
        if (!content || typeof content !== "object") {
          return "";
        }

        const text = (content as { text?: unknown }).text;
        return typeof text === "string" ? text : "";
      })
      .join("");

    if (text) {
      return text;
    }
  }

  throw new Error("OpenAI response did not include output text.");
}

function timeoutSignal(timeoutMs: number): AbortSignal | undefined {
  return typeof AbortSignal.timeout === "function"
    ? AbortSignal.timeout(timeoutMs)
    : undefined;
}
