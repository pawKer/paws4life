import { describe, expect, it } from "vitest";

import {
  buildAdoptionCtaLabel,
  filterByQuickFilter,
  getAgeBucket,
  getWaitingLabel,
  getWaitingProgressPercent,
  pickDogOfTheDay,
  sortGalleryPets,
} from "@/lib/pets/gallery";
import type { PetCard } from "@/lib/pets/types";

const basePet: PetCard = {
  id: "pet_1",
  sourceUrl: "https://example.com/pet-1",
  registryNumber: "1001",
  title: null,
  imageUrl: null,
  captureDate: "2026-05-20T00:00:00.000Z",
  captureDateText: "20.05.2026",
  firstSeenAt: "2026-06-01T00:00:00.000Z",
  captureLocation: "Craiova",
  approximateAge: "3-4 ani",
  sex: "female",
  size: "medium",
  color: "maro",
  characteristics: null,
  profileName: "Luna",
  profileBio: null,
  shareImagesGeneratedAt: "2026-06-10T00:00:00.000Z",
  isAvailable: true,
};

function pet(overrides: Partial<PetCard>): PetCard {
  return { ...basePet, ...overrides };
}

describe("gallery helpers", () => {
  it("buckets approximate ages for quick filters", () => {
    expect(getAgeBucket("1-2 ani")).toBe("young");
    expect(getAgeBucket("3-4 ani")).toBe("adult");
    expect(getAgeBucket("8 ani")).toBe("senior");
    expect(getAgeBucket("necunoscut")).toBeNull();
  });

  it("filters quick size and age pills without matching unknown ages", () => {
    const pets = [
      pet({ id: "small", size: "small", approximateAge: "1 an" }),
      pet({ id: "adult", size: "large", approximateAge: "4 ani" }),
      pet({ id: "unknown", size: "large", approximateAge: "necunoscut" }),
    ];

    expect(filterByQuickFilter(pets, "large").map((item) => item.id)).toEqual([
      "adult",
      "unknown",
    ]);
    expect(filterByQuickFilter(pets, "adult").map((item) => item.id)).toEqual([
      "adult",
    ]);
  });

  it("sorts by waiting time, capture date, and recently added", () => {
    const pets = [
      pet({
        id: "middle",
        captureDate: "2026-05-20T00:00:00.000Z",
        firstSeenAt: "2026-06-01T00:00:00.000Z",
      }),
      pet({
        id: "oldest",
        captureDate: "2026-05-01T00:00:00.000Z",
        firstSeenAt: "2026-05-30T00:00:00.000Z",
      }),
      pet({
        id: "newest-added",
        captureDate: "2026-06-01T00:00:00.000Z",
        firstSeenAt: "2026-06-09T00:00:00.000Z",
      }),
    ];

    expect(sortGalleryPets(pets, "longestWaiting").map((item) => item.id)).toEqual([
      "oldest",
      "middle",
      "newest-added",
    ]);
    expect(sortGalleryPets(pets, "recentlyAdded").map((item) => item.id)).toEqual([
      "newest-added",
      "middle",
      "oldest",
    ]);
  });

  it("picks a stable dog of the day only from available dogs captured over a week ago", () => {
    const featured = pickDogOfTheDay(
      [
        pet({ id: "too-new", captureDate: "2026-06-07T00:00:00.000Z" }),
        pet({ id: "missing-date", captureDate: null }),
        pet({ id: "gone", captureDate: "2026-05-01T00:00:00.000Z", isAvailable: false }),
        pet({ id: "eligible", captureDate: "2026-05-20T00:00:00.000Z" }),
      ],
      new Date("2026-06-10T12:00:00.000Z"),
    );

    expect(featured?.id).toBe("eligible");
  });

  it("builds sex-aware Romanian adoption CTAs", () => {
    expect(buildAdoptionCtaLabel("Bruno", "male")).toBe("Adoptă-l pe Bruno");
    expect(buildAdoptionCtaLabel("Luna", "female")).toBe("Adopt-o pe Luna");
    expect(buildAdoptionCtaLabel("Max", "unknown")).toBe("Adoptă acum: Max");
  });

  it("shows dog-of-day waiting progress against a 30-day cap", () => {
    const today = new Date("2026-06-10T00:00:00.000Z");

    expect(getWaitingProgressPercent(pet({ captureDate: "2026-06-01T00:00:00.000Z" }), today)).toBe(30);
    expect(getWaitingProgressPercent(pet({ captureDate: "2026-05-11T00:00:00.000Z" }), today)).toBe(100);
    expect(getWaitingLabel(pet({ captureDate: "2026-05-01T00:00:00.000Z" }), today)).toBe(
      "Așteaptă de 1 lună",
    );
  });
});
