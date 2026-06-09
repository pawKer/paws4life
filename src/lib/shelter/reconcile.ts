export type PetAvailabilitySnapshot = {
  sourceUrl: string;
  isAvailable: boolean;
};

export type AvailabilityChangePlan = {
  markUnavailable: string[];
  markAvailable: string[];
};

export function planAvailabilityChanges(
  existingPets: PetAvailabilitySnapshot[],
  currentSourceUrls: Set<string>
): AvailabilityChangePlan {
  const markUnavailable: string[] = [];
  const markAvailable: string[] = [];

  for (const pet of existingPets) {
    const existsInCurrentSitemap = currentSourceUrls.has(pet.sourceUrl);

    if (pet.isAvailable && !existsInCurrentSitemap) {
      markUnavailable.push(pet.sourceUrl);
    }

    if (!pet.isAvailable && existsInCurrentSitemap) {
      markAvailable.push(pet.sourceUrl);
    }
  }

  return { markUnavailable, markAvailable };
}
