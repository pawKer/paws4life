import type { Pet, ScrapeRun } from "@prisma/client";

import { prisma } from "@/lib/db";
import { sortPetsForDeck } from "@/lib/pets/sort";
import type { LatestSync, PetCard, PetSex, PetSize } from "@/lib/pets/types";
import { getDefaultShelter } from "@/lib/shelters/config";

export async function getPetCards({
  includeUnavailable = false
}: {
  includeUnavailable?: boolean;
} = {}): Promise<PetCard[]> {
  try {
    const shelter = await getDefaultShelter(prisma);

    if (!shelter) {
      return [];
    }

    const pets = await prisma.pet.findMany({
      where: {
        shelterId: shelter.id,
        ...(includeUnavailable ? {} : { isAvailable: true })
      },
      orderBy: [{ createdAt: "desc" }]
    });

    return sortPetsForDeck(pets).map(toPetCard);
  } catch (error) {
    if (isMissingDatabaseError(error)) {
      return [];
    }

    throw error;
  }
}

export async function getLatestScrapeRun(): Promise<LatestSync> {
  try {
    const shelter = await getDefaultShelter(prisma);

    if (!shelter) {
      return null;
    }

    const run = await prisma.scrapeRun.findFirst({
      where: {
        shelterId: shelter.id
      },
      orderBy: { startedAt: "desc" }
    });

    return run ? toLatestSync(run) : null;
  } catch (error) {
    if (isMissingDatabaseError(error)) {
      return null;
    }

    throw error;
  }
}

export function toPetCard(pet: Pet): PetCard {
  return {
    id: pet.id,
    sourceUrl: pet.sourceUrl,
    registryNumber: pet.registryNumber,
    title: pet.title,
    imageUrl: pet.imageUrl,
    captureDateText: pet.captureDateText,
    captureLocation: pet.captureLocation,
    approximateAge: pet.approximateAge,
    sex: coerceSex(pet.sex),
    size: coerceSize(pet.size),
    color: pet.color,
    characteristics: pet.characteristics,
    profileName: pet.profileName,
    profileBio: pet.profileBio,
    isAvailable: pet.isAvailable
  };
}

function toLatestSync(run: ScrapeRun): LatestSync {
  return {
    startedAt: run.startedAt.toISOString(),
    finishedAt: run.finishedAt?.toISOString() ?? null,
    status: run.status,
    foundCount: run.foundCount,
    unavailableCount: run.unavailableCount
  };
}

function coerceSex(value: string | null): PetSex {
  if (value === "female" || value === "male") {
    return value;
  }

  return "unknown";
}

function coerceSize(value: string | null): PetSize {
  if (value === "small" || value === "medium" || value === "large") {
    return value;
  }

  return "unknown";
}

function isMissingDatabaseError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.includes("does not exist") ||
      error.message.includes("no such table") ||
      error.message.includes("Unable to open the database file"))
  );
}
