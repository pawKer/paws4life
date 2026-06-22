import type { PrismaClient } from "@prisma/client";

import {
  enrichPetProfiles,
  type PetProfileCandidate,
  type PetProfileEnrichmentSummary,
  type ProfileNameMode,
} from "@/lib/pets/profile-generator";
import { prisma } from "@/lib/db";

type RegenerateAvailablePetProfilesOptions = {
  db?: PrismaClient;
  shelterSlug?: string;
  batchSize?: number;
  now?: () => Date;
  apiKey?: string;
  model?: string;
  responsesUrl?: string;
  request?: typeof fetch;
  logIo?: boolean;
  logger?: Pick<Console, "info">;
  nameMode?: ProfileNameMode;
  enrich?: typeof enrichPetProfiles;
};

export type ProfileRegenerationSummary = PetProfileEnrichmentSummary & {
  availableCount: number;
};

export async function regenerateAvailablePetProfiles({
  db = prisma,
  shelterSlug = process.env.SHELTER_SLUG,
  batchSize,
  now,
  apiKey,
  model,
  responsesUrl,
  request,
  logIo,
  logger,
  nameMode = getProfileRegenerationNameMode(),
  enrich = enrichPetProfiles,
}: RegenerateAvailablePetProfilesOptions = {}): Promise<ProfileRegenerationSummary> {
  const pets = await db.pet.findMany({
    where: {
      isAvailable: true,
      shelter: {
        isActive: true,
        ...(shelterSlug ? { slug: shelterSlug } : {})
      }
    },
    orderBy: [
      {
        captureDate: "asc",
      },
      {
        registryNumber: "asc",
      },
    ],
    select: {
      id: true,
      registryNumber: true,
      approximateAge: true,
      sex: true,
      color: true,
      captureLocation: true,
      characteristics: true,
      profileName: true,
    },
  });

  const enrichmentSummary = await enrich({
    db,
    pets: pets.map(toProfileCandidate),
    batchSize,
    now,
    apiKey,
    model,
    responsesUrl,
    request,
    usedNames: nameMode === "keep" ? getExistingProfileNames(pets) : [],
    nameMode,
    logIo,
    logger,
  });

  return {
    availableCount: pets.length,
    ...enrichmentSummary,
  };
}

function toProfileCandidate(
  pet: Pick<
    PetProfileCandidate,
    | "id"
    | "registryNumber"
    | "approximateAge"
    | "sex"
    | "color"
    | "captureLocation"
    | "characteristics"
    | "profileName"
  >,
): PetProfileCandidate {
  return {
    id: pet.id,
    registryNumber: pet.registryNumber,
    approximateAge: pet.approximateAge,
    sex: pet.sex,
    color: pet.color,
    captureLocation: pet.captureLocation,
    characteristics: pet.characteristics,
    profileName: pet.profileName,
  };
}

function getExistingProfileNames(
  pets: Array<{ profileName?: string | null }>,
): string[] {
  return pets.flatMap((pet) => {
    const name = pet.profileName?.trim();
    return name ? [name] : [];
  });
}

export function getProfileRegenerationNameMode(
  value = process.env.PROFILE_REGENERATE_NAMES,
): ProfileNameMode {
  return value === "keep" ? "keep" : "replace";
}
