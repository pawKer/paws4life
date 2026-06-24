import { describe, expect, it } from "vitest";

import {
  PET_SHARE_IMAGE_SIZES,
  buildGeneratedPetShareImageFilename,
  buildGeneratedPetShareImagePath,
  buildGeneratedPetShareImageStorageFilename,
  buildPetShareImageProfile,
  buildPetShareRenderPath,
  hasShareImageRelevantChange,
} from "@/lib/pets/share-images";
import type { PetCard } from "@/lib/pets/types";

const pet: PetCard = {
  id: "pet_1022",
  sourceUrl: "https://example.test/pet",
  registryNumber: "1022",
  title: "Adopta un caine -1022 - Adapost Canin Craiova",
  imageUrl: "https://example.test/dog.jpg",
  captureDate: "2026-06-04T00:00:00.000Z",
  captureDateText: "04.06.2026",
  firstSeenAt: "2026-06-04T00:00:00.000Z",
  captureLocation: "Cartier Brestei",
  approximateAge: "3-4 ani",
  sex: "female",
  size: "small",
  color: "negru-maro",
  characteristics: "Talie mica, culoare negru-maro.",
  profileName: "Maya",
  profileBio: "Maya cauta o familie rabdatoare.",
  shareImagesGeneratedAt: "2026-06-10T00:00:00.000Z",
  isAvailable: true,
};

describe("pet share images", () => {
  it("defines fixed browser screenshot sizes", () => {
    expect(PET_SHARE_IMAGE_SIZES.profile).toEqual({ width: 1080, height: 1350 });
    expect(PET_SHARE_IMAGE_SIZES.story).toEqual({ width: 1080, height: 1920 });
  });

  it("builds render and generated asset paths", () => {
    expect(buildPetShareRenderPath(pet.id, "profile")).toBe(
      "/share/pets/pet_1022/profile",
    );
    expect(buildPetShareRenderPath(pet.id, "story")).toBe(
      "/share/pets/pet_1022/story",
    );
    expect(buildGeneratedPetShareImageFilename(pet, "profile")).toBe(
      "pawsforlife-1022.png",
    );
    expect(buildGeneratedPetShareImageFilename(pet, "story")).toBe(
      "pawsforlife-1022-story.png",
    );
    expect(buildGeneratedPetShareImageStorageFilename(pet, "profile")).toBe(
      "pawsforlife-pet_1022.png",
    );
    expect(buildGeneratedPetShareImageStorageFilename(pet, "story")).toBe(
      "pawsforlife-pet_1022-story.png",
    );
    expect(buildGeneratedPetShareImagePath(pet, "story")).toBe(
      "/generated/pets/pawsforlife-pet_1022-story.png",
    );
  });

  it("detects changes that make generated images stale", () => {
    const previous = {
      registryNumber: "1022",
      imageUrl: "https://example.test/dog.jpg",
      captureLocation: "Cartier Brestei",
      approximateAge: "3-4 ani",
      sex: "female",
      size: "small",
      color: "negru-maro",
      characteristics: "Talie mica, culoare negru-maro.",
      profileName: "Maya",
      profileBio: "Maya cauta o familie rabdatoare.",
    };

    expect(hasShareImageRelevantChange(previous, previous)).toBe(false);
    expect(
      hasShareImageRelevantChange(previous, {
        ...previous,
        profileBio: "Maya are un text nou.",
      }),
    ).toBe(true);
    expect(
      hasShareImageRelevantChange(previous, {
        ...previous,
        imageUrl: "https://example.test/new-dog.jpg",
      }),
    ).toBe(true);
  });

  it("uses real pet profile data for image copy", () => {
    const profile = buildPetShareImageProfile(pet);

    expect(profile.name).toBe("Maya");
    expect(profile.subtitle).toBe("Femelă - Cartier Brestei");
    expect(profile.registryLabel).toBe("Nr. de registru 1022");
    expect(profile.description).toBe("Maya cauta o familie rabdatoare.");
    expect(profile.adoptionCta).toContain("Maya");
    expect(profile.shelterPhone).toBe("0722.328.442");
  });
});
