import { execFile } from "node:child_process";
import { spawn, type ChildProcess } from "node:child_process";
import { constants } from "node:fs";
import { access, mkdir, readdir, unlink } from "node:fs/promises";
import path from "node:path";

import type { Pet, PrismaClient } from "@prisma/client";
import { chromium, type Browser } from "playwright";

import { prisma } from "@/lib/db";
import { toPetCard } from "@/lib/pets/repository";
import {
  PET_SHARE_IMAGE_SIZES,
  buildGeneratedPetShareImageStorageFilename,
  buildPetShareRenderPath,
  type PetShareImageVariant,
} from "@/lib/pets/share-images";

export type ShareImageGenerationSummary = {
  generatedCount: number;
  skippedCount: number;
  deletedCount: number;
  errors: string[];
};

export type ShareImageGenerationOptions = {
  db?: PrismaClient;
  petId?: string;
  limit?: number;
  force?: boolean;
  cleanupOrphans?: boolean;
  baseUrl?: string;
  port?: number;
  outputDir?: string;
  now?: () => Date;
};

const variants = ["profile", "story"] as const satisfies readonly PetShareImageVariant[];
export const generatedShareImageOutputDir = path.join(
  process.cwd(),
  "public",
  "generated",
  "pets",
);

export function isShareImageGenerationEnabled(
  value = process.env.SHARE_IMAGES_ON_SYNC,
): boolean {
  return value?.toLowerCase() !== "false" && value !== "0";
}

export function shouldGenerateShareImages(
  pet: Pick<Pet, "isAvailable" | "shareImagesGeneratedAt">,
  force = false,
): boolean {
  return pet.isAvailable && (force || !pet.shareImagesGeneratedAt);
}

export async function generateShareImagesForAvailablePets({
  db = prisma,
  petId = process.env.SHARE_IMAGE_PET_ID,
  limit = Number(process.env.SHARE_IMAGE_LIMIT ?? "0"),
  force = isTruthy(process.env.SHARE_IMAGE_FORCE),
  cleanupOrphans = !petId,
  baseUrl = process.env.SHARE_IMAGE_BASE_URL,
  port = Number(process.env.SHARE_IMAGE_PORT ?? "3036"),
  outputDir = generatedShareImageOutputDir,
  now = () => new Date(),
}: ShareImageGenerationOptions = {}): Promise<ShareImageGenerationSummary> {
  await mkdir(outputDir, { recursive: true });

  const summary: ShareImageGenerationSummary = {
    generatedCount: 0,
    skippedCount: 0,
    deletedCount: 0,
    errors: [],
  };
  const allPets = await findShareImagePets(db, petId);
  const unavailablePets = allPets.filter((pet) => !pet.isAvailable);

  for (const pet of unavailablePets) {
    summary.deletedCount += await deleteGeneratedPetShareImages(pet, outputDir);
  }

  if (unavailablePets.length > 0) {
    await db.pet.updateMany({
      where: {
        id: {
          in: unavailablePets.map((pet) => pet.id),
        },
      },
      data: {
        shareImagesGeneratedAt: null,
      },
    });
  }

  const availablePets = allPets.filter((pet) => pet.isAvailable);
  const targetPets = availablePets
    .filter((pet) => shouldGenerateShareImages(pet, force))
    .slice(0, limit > 0 ? limit : undefined);
  summary.skippedCount = availablePets.length - targetPets.length;

  if (targetPets.length > 0) {
    const renderBaseUrl = baseUrl ?? `http://127.0.0.1:${port}`;
    const server = baseUrl ? null : startNextServer(port);

    try {
      await waitForServer(renderBaseUrl);

      const browser = await launchBrowser();

      try {
        for (const pet of targetPets) {
          try {
            await renderPetShareImages({
              browser,
              pet,
              baseUrl: renderBaseUrl,
              outputDir,
            });
            await db.pet.update({
              where: { id: pet.id },
              data: { shareImagesGeneratedAt: now() },
            });
            summary.generatedCount += 1;
          } catch (error) {
            summary.errors.push(
              `${pet.registryNumber}: ${error instanceof Error ? error.message : String(error)}`,
            );
          }
        }
      } finally {
        await browser.close();
      }
    } finally {
      if (server) {
        await stopServer(server);
      }
    }
  }

  if (cleanupOrphans) {
    summary.deletedCount += await cleanupOrphanGeneratedPetShareImages(
      availablePets,
      outputDir,
    );
  }

  return summary;
}

export async function cleanupOrphanGeneratedPetShareImages(
  availablePets: Array<Pick<Pet, "id" | "registryNumber">>,
  outputDir = generatedShareImageOutputDir,
): Promise<number> {
  let filenames: string[];

  try {
    filenames = await readdir(outputDir);
  } catch {
    return 0;
  }

  const expected = new Set(
    availablePets.flatMap((pet) =>
      variants.map((variant) => buildGeneratedPetShareImageStorageFilename(pet, variant)),
    ),
  );
  let deletedCount = 0;

  for (const filename of filenames) {
    if (!filename.endsWith(".png") || expected.has(filename)) {
      continue;
    }

    await unlink(path.join(outputDir, filename));
    deletedCount += 1;
  }

  return deletedCount;
}

export async function deleteGeneratedPetShareImages(
  pet: Pick<Pet, "id" | "registryNumber">,
  outputDir = generatedShareImageOutputDir,
): Promise<number> {
  let deletedCount = 0;

  for (const variant of variants) {
    const filePath = path.join(
      outputDir,
      buildGeneratedPetShareImageStorageFilename(pet, variant),
    );

    if (await fileExists(filePath)) {
      await unlink(filePath);
      deletedCount += 1;
    }
  }

  return deletedCount;
}

async function findShareImagePets(db: PrismaClient, petId?: string): Promise<Pet[]> {
  return db.pet.findMany({
    where: petId
      ? { id: petId }
      : {
          shelter: {
            isActive: true,
          },
        },
    orderBy: [{ createdAt: "desc" }],
  });
}

async function renderPetShareImages({
  browser,
  pet,
  baseUrl,
  outputDir,
}: {
  browser: Browser;
  pet: Pet;
  baseUrl: string;
  outputDir: string;
}) {
  const page = await browser.newPage({
    deviceScaleFactor: 1,
  });
  const petCard = toPetCard(pet);

  try {
    for (const variant of variants) {
      const size = PET_SHARE_IMAGE_SIZES[variant];
      const url = new URL(buildPetShareRenderPath(pet.id, variant), baseUrl);
      const filePath = path.join(
        outputDir,
        buildGeneratedPetShareImageStorageFilename(petCard, variant),
      );

      await page.setViewportSize(size);
      await page.goto(url.toString(), { waitUntil: "networkidle" });
      await page.locator("[data-share-card]").screenshot({
        path: filePath,
        animations: "disabled",
      });
    }
  } finally {
    await page.close();
  }
}

function startNextServer(port: number): ChildProcess {
  const command = process.platform === "win32" ? "cmd.exe" : "npm";
  const args =
    process.platform === "win32"
      ? ["/c", "npm.cmd", "run", "dev", "--", "-p", String(port)]
      : ["run", "dev", "--", "-p", String(port)];

  return spawn(command, args, {
    env: {
      ...process.env,
      NEXT_TELEMETRY_DISABLED: "1",
    },
    stdio: "inherit",
    windowsHide: true,
  });
}

async function waitForServer(url: string) {
  const deadline = Date.now() + 45_000;
  let lastError: unknown;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);

      if (response.ok || response.status === 404) {
        return;
      }
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Timed out waiting for ${url}: ${String(lastError)}`);
}

async function launchBrowser(): Promise<Browser> {
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;

  try {
    return await chromium.launch({
      executablePath,
    });
  } catch (error) {
    throw new Error(
      [
        "Could not launch Chromium for share image generation.",
        "Run `npx playwright install chromium`, or set PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH.",
        String(error),
      ].join("\n"),
    );
  }
}

async function stopServer(server: ChildProcess) {
  if (server.exitCode !== null) {
    return;
  }

  if (process.platform === "win32" && server.pid) {
    await new Promise<void>((resolve) => {
      execFile(
        "taskkill",
        ["/pid", String(server.pid), "/T", "/F"],
        { windowsHide: true },
        () => resolve(),
      );
    });
    return;
  }

  server.kill();
  await new Promise((resolve) => server.once("exit", resolve));
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function isTruthy(value: string | undefined): boolean {
  return value === "1" || value?.toLowerCase() === "true";
}
