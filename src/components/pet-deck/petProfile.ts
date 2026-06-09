import { appCopy } from "@/content/ro";
import type { LatestSync, PetCard, PetSex, PetSize } from "@/lib/pets/types";

const generatedPetNames = [
  "Luna",
  "Milo",
  "Nala",
  "Toby",
  "Maya",
  "Bruno",
  "Kira",
  "Max",
  "Bella",
  "Rex",
  "Dora",
  "Oscar",
];

const generatedPersonalityLines = [
  "Imi plac plimbarile linistite si oamenii care au rabdare sa ma cunoasca.",
  "Sunt gata sa transform o zi obisnuita intr-una cu mai mult chef de joaca.",
  "Caut un om bun, o lesa comoda si un colt numai al meu acasa.",
  "Am energie buna, ochi curiosi si chef sa invat rutina unei familii.",
];

export function buildPetProfile(pet: PetCard) {
  const seed = numericSeed(pet.registryNumber || pet.id);
  const name =
    pet.profileName ?? generatedPetNames[seed % generatedPetNames.length];
  const age = pet.approximateAge?.match(/\d+/)?.[0] ?? null;
  const subtitle = [sexLabel(pet.sex), pet.captureLocation]
    .filter(Boolean)
    .join(" - ");
  const generatedLine =
    generatedPersonalityLines[seed % generatedPersonalityLines.length];
  const fallbackDescription = pet.characteristics
    ? `${pet.characteristics} ${generatedLine}`
    : generatedLine;
  const description = pet.profileBio ?? fallbackDescription;
  const chips = [
    pet.approximateAge,
    `${appCopy.deck.size}: ${sizeLabel(pet.size)}`,
    `${appCopy.deck.sex}: ${sexLabel(pet.sex)}`,
    pet.color ? `${appCopy.deck.color}: ${pet.color}` : null,
    pet.captureDateText
      ? `${appCopy.deck.captureDate}: ${pet.captureDateText}`
      : null,
    appCopy.deck.lookingFor,
  ].filter((chip): chip is string => Boolean(chip));

  return {
    name,
    age,
    subtitle,
    description,
    chips,
  };
}

export function formatSync(latestRun: LatestSync): string {
  if (!latestRun) {
    return appCopy.status.syncNever;
  }

  if (latestRun.status === "failed") {
    return appCopy.status.syncFailed;
  }

  const value = latestRun.finishedAt ?? latestRun.startedAt;
  return new Intl.DateTimeFormat("ro-RO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function numericSeed(value: string) {
  return [...value].reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );
}

function sexLabel(sex: PetSex): string {
  return appCopy.filters[sex];
}

function sizeLabel(size: PetSize): string {
  return appCopy.filters[size];
}
