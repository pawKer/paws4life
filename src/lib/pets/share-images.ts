import { appCopy } from "@/content/ro";
import { buildPetProfile } from "@/components/pet-deck/petProfile";
import type { PetCard } from "@/lib/pets/types";

export type PetShareImageVariant = "profile" | "story";

export const PET_SHARE_IMAGE_SIZES = {
  profile: {
    width: 1080,
    height: 1350,
  },
  story: {
    width: 1080,
    height: 1920,
  },
} as const satisfies Record<PetShareImageVariant, { width: number; height: number }>;

export type PetShareImageProfile = {
  name: string;
  age: string | null;
  subtitle: string;
  description: string;
  chips: string[];
  registryLabel: string;
  intentLabel: string;
  verifiedLabel: string;
  shelterName: string;
  shelterPhoneLabel: string;
  shelterPhone: string;
  adoptionCta: string;
  imageAlt: string;
};

export type PetShareImageComparable = {
  registryNumber: string;
  imageUrl: string | null;
  captureLocation: string | null;
  approximateAge: string | null;
  sex: string | null;
  size: string | null;
  color: string | null;
  characteristics: string | null;
  profileName: string | null;
  profileBio: string | null;
};

const renderRelevantPetFields = [
  "registryNumber",
  "imageUrl",
  "captureLocation",
  "approximateAge",
  "sex",
  "size",
  "color",
  "characteristics",
  "profileName",
  "profileBio",
] as const satisfies readonly (keyof PetShareImageComparable)[];

export function buildPetShareImageProfile(pet: PetCard): PetShareImageProfile {
  const profile = buildPetProfile(pet);

  return {
    name: profile.name,
    age: profile.age,
    subtitle: profile.subtitle,
    description: profile.description,
    chips: profile.chips,
    registryLabel: `${appCopy.deck.registryPrefix} ${pet.registryNumber}`,
    intentLabel: appCopy.deck.lookingFor,
    verifiedLabel: appCopy.deck.verified,
    shelterName: appCopy.app.eyebrow,
    shelterPhoneLabel: appCopy.adoption.shelterPhoneLabel,
    shelterPhone: appCopy.adoption.shelterPhone,
    adoptionCta: buildShareImageCta(profile.name, pet.sex),
    imageAlt: `${appCopy.status.imageAltPrefix} ${pet.registryNumber}`,
  };
}

export function buildPetShareRenderPath(
  petId: string,
  variant: PetShareImageVariant,
): string {
  return `/share/pets/${petId}/${variant}`;
}

export function buildGeneratedPetShareImagePath(
  pet: Pick<PetCard, "id" | "registryNumber">,
  variant: PetShareImageVariant,
): string {
  return `/generated/pets/${buildGeneratedPetShareImageStorageFilename(pet, variant)}`;
}

export function buildGeneratedPetShareImageFilePath(
  pet: Pick<PetCard, "id" | "registryNumber">,
  variant: PetShareImageVariant,
): string {
  return buildGeneratedPetShareImagePath(pet, variant).replace(/^\//, "");
}

export function buildGeneratedPetShareImageStorageFilename(
  pet: Pick<PetCard, "id" | "registryNumber">,
  variant: PetShareImageVariant,
): string {
  const suffix = variant === "story" ? "-story" : "";

  return `pawsforlife-${pet.id}${suffix}.png`;
}

export function buildGeneratedPetShareImageFilename(
  pet: Pick<PetCard, "id" | "registryNumber">,
  variant: PetShareImageVariant,
): string {
  const base = sanitizeFilenamePart(pet.registryNumber || pet.id) || pet.id;
  const suffix = variant === "story" ? "-story" : "";

  return `pawsforlife-${base}${suffix}.png`;
}

export function hasShareImageRelevantChange(
  previous: PetShareImageComparable,
  next: PetShareImageComparable,
): boolean {
  return renderRelevantPetFields.some((field) => previous[field] !== next[field]);
}

function buildShareImageCta(name: string, sex: PetCard["sex"]): string {
  if (sex === "female") {
    return `${appCopy.shareImage.callFemale} ${name}`;
  }

  if (sex === "male") {
    return `${appCopy.shareImage.callMale} ${name}`;
  }

  return `${appCopy.shareImage.callNeutral} ${name}`;
}

function sanitizeFilenamePart(value: string): string {
  return value
    .toLocaleLowerCase("ro-RO")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
