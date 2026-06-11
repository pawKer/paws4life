import { appCopy } from "@/content/ro";
import type { PetCard, PetSex, PetSize } from "@/lib/pets/types";

export type AgeBucket = "young" | "adult" | "senior";
export type QuickFilter = PetSize | AgeBucket;
export type GallerySort = "recommended" | "longestWaiting" | "newestCapture" | "recentlyAdded";

const dayMs = 24 * 60 * 60 * 1000;
const spotlightProgressMaxDays = 30;

export function getAgeBucket(approximateAge: string | null): AgeBucket | null {
  if (!approximateAge) {
    return null;
  }

  const ages = approximateAge.match(/\d+/g)?.map(Number).filter(Number.isFinite);

  if (!ages || ages.length === 0) {
    return null;
  }

  const age = Math.max(...ages);

  if (age <= 2) {
    return "young";
  }

  if (age <= 7) {
    return "adult";
  }

  return "senior";
}

export function filterByQuickFilter<TPet extends PetCard>(
  pets: TPet[],
  quickFilter: QuickFilter | null,
): TPet[] {
  if (!quickFilter) {
    return pets;
  }

  if (quickFilter === "small" || quickFilter === "medium" || quickFilter === "large") {
    return pets.filter((pet) => pet.size === quickFilter);
  }

  return pets.filter((pet) => getAgeBucket(pet.approximateAge) === quickFilter);
}

export function sortGalleryPets<TPet extends PetCard>(
  pets: TPet[],
  sort: GallerySort,
): TPet[] {
  if (sort === "recommended") {
    return pets;
  }

  return [...pets].sort((left, right) => {
    if (sort === "longestWaiting") {
      return compareNullableDateAsc(left.captureDate, right.captureDate);
    }

    if (sort === "newestCapture") {
      return compareNullableDateDesc(left.captureDate, right.captureDate);
    }

    return compareNullableDateDesc(left.firstSeenAt, right.firstSeenAt);
  });
}

export function pickDogOfTheDay<TPet extends PetCard>(
  pets: TPet[],
  today = new Date(),
): TPet | null {
  const eligiblePets = pets.filter((pet) => {
    if (!pet.isAvailable || !pet.captureDate) {
      return false;
    }

    return today.getTime() - new Date(pet.captureDate).getTime() > 7 * dayMs;
  });

  if (eligiblePets.length === 0) {
    return null;
  }

  const dateKey = today.toISOString().slice(0, 10);
  const seed = numericSeed(dateKey);

  return eligiblePets[seed % eligiblePets.length];
}

export function buildAdoptionCtaLabel(name: string, sex: PetSex): string {
  if (sex === "male") {
    return `${appCopy.adoption.ctaMale} ${name}`;
  }

  if (sex === "female") {
    return `${appCopy.adoption.ctaFemale} ${name}`;
  }

  return `${appCopy.adoption.ctaNeutral} ${name}`;
}

export function buildPetPath(pet: Pick<PetCard, "id">): string {
  return `/pets/${encodeURIComponent(pet.id)}`;
}

export function getWaitingDays(pet: Pick<PetCard, "captureDate">, today = new Date()): number | null {
  if (!pet.captureDate) {
    return null;
  }

  const days = Math.floor((today.getTime() - new Date(pet.captureDate).getTime()) / dayMs);

  return Math.max(days, 0);
}

export function getWaitingProgressPercent(
  pet: Pick<PetCard, "captureDate">,
  today = new Date(),
): number | null {
  const days = getWaitingDays(pet, today);

  if (days === null) {
    return null;
  }

  return Math.min(100, Math.max(8, Math.round((days / spotlightProgressMaxDays) * 100)));
}

export function getWaitingLabel(pet: Pick<PetCard, "captureDate">, today = new Date()): string | null {
  const days = getWaitingDays(pet, today);

  if (days === null) {
    return null;
  }

  if (days < 30) {
    return days === 1 ? "Așteaptă de 1 zi" : `Așteaptă de ${days} zile`;
  }

  const months = Math.floor(days / 30);

  return months === 1 ? "Așteaptă de 1 lună" : `Așteaptă de ${months} luni`;
}

function compareNullableDateAsc(left: string | null, right: string | null): number {
  if (!left && !right) {
    return 0;
  }

  if (!left) {
    return 1;
  }

  if (!right) {
    return -1;
  }

  return new Date(left).getTime() - new Date(right).getTime();
}

function compareNullableDateDesc(left: string | null, right: string | null): number {
  if (!left && !right) {
    return 0;
  }

  if (!left) {
    return 1;
  }

  if (!right) {
    return -1;
  }

  return new Date(right).getTime() - new Date(left).getTime();
}

function numericSeed(value: string) {
  return [...value].reduce((total, character) => total + character.charCodeAt(0), 0);
}
