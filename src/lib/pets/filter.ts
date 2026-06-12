import { getPetProfileName } from "@/lib/pets/profile-name";

export type PetFilterInput = {
  sex?: string | null;
  size?: string | null;
  q?: string | null;
};

export type FilterablePet = {
  id: string;
  sex?: string | null;
  size?: string | null;
  registryNumber?: string | null;
  profileName?: string | null;
  captureLocation?: string | null;
  approximateAge?: string | null;
  color?: string | null;
  characteristics?: string | null;
};

export function filterPetCards<TPet extends FilterablePet>(
  pets: TPet[],
  filters: PetFilterInput
): TPet[] {
  const sex = filters.sex && filters.sex !== "all" ? filters.sex : null;
  const size = filters.size && filters.size !== "all" ? filters.size : null;
  const terms = tokenize(filters.q ?? "");

  return pets.filter((pet) => {
    if (sex && pet.sex !== sex) {
      return false;
    }

    if (size && pet.size !== size) {
      return false;
    }

    if (terms.length === 0) {
      return true;
    }

    const searchableText = normalizeSearchText([
      getPetProfileName(pet),
      pet.registryNumber,
      pet.captureLocation,
      pet.approximateAge,
      pet.color,
      pet.characteristics
    ]);

    return terms.every((term) => searchableText.includes(term));
  });
}

function tokenize(value: string): string[] {
  return normalizeSearchText([value]).split(" ").filter(Boolean);
}

function normalizeSearchText(values: Array<string | null | undefined>): string {
  return values
    .filter((value): value is string => Boolean(value))
    .join(" ")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
