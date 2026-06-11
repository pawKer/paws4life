import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  prisma: {
    pet: {
      findMany: vi.fn(),
    },
    scrapeRun: {
      findFirst: vi.fn(),
    },
  },
  getDefaultShelter: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  prisma: mocks.prisma,
}));

vi.mock("@/lib/shelters/config", () => ({
  getDefaultShelter: mocks.getDefaultShelter,
}));

describe("pet repository", () => {
  beforeEach(() => {
    vi.resetModules();
    mocks.prisma.pet.findMany.mockReset();
    mocks.prisma.scrapeRun.findFirst.mockReset();
    mocks.getDefaultShelter.mockReset();
  });

  it("returns default-shelter pets without exposing shelter data", async () => {
    mocks.getDefaultShelter.mockResolvedValue({
      id: "shelter_1",
      slug: "adapost-canin-craiova",
    });
    mocks.prisma.pet.findMany.mockResolvedValue([
      {
        id: "pet_1",
        shelterId: "shelter_1",
        sourceUrl: "https://example.com/anunturi-caini/1/",
        registryNumber: "931",
        title: "Pet 931",
        imageUrl: null,
        captureDate: new Date("2026-05-20T00:00:00.000Z"),
        captureDateText: "20.05.2026",
        captureLocation: "Craiova",
        approximateAge: "6-7 ani",
        sex: "male",
        size: "medium",
        color: "maro",
        characteristics: "Talie mijlocie, culoare maro.",
        profileName: "Rex",
        profileBio: "Rex cauta o familie.",
        isAvailable: true,
        unavailableSince: null,
        sourceLastModified: null,
        publishedAt: null,
        rawFacts: null,
        firstSeenAt: new Date("2026-06-01T00:00:00.000Z"),
        lastSeenAt: new Date("2026-06-01T00:00:00.000Z"),
        createdAt: new Date("2026-06-01T00:00:00.000Z"),
        updatedAt: new Date("2026-06-01T00:00:00.000Z"),
      },
    ]);

    const { getPetCards } = await import("@/lib/pets/repository");
    const pets = await getPetCards();

    expect(mocks.prisma.pet.findMany).toHaveBeenCalledWith({
      where: {
        shelterId: "shelter_1",
        isAvailable: true,
      },
      orderBy: [{ createdAt: "desc" }],
    });
    expect(pets).toEqual([
      expect.not.objectContaining({
        shelterId: "shelter_1",
      }),
    ]);
    expect(pets[0]).toMatchObject({
      id: "pet_1",
      registryNumber: "931",
      profileName: "Rex",
      captureDate: "2026-05-20T00:00:00.000Z",
      firstSeenAt: "2026-06-01T00:00:00.000Z",
    });
  });

  it("returns latest scrape run for the default shelter", async () => {
    mocks.getDefaultShelter.mockResolvedValue({
      id: "shelter_1",
      slug: "adapost-canin-craiova",
    });
    mocks.prisma.scrapeRun.findFirst.mockResolvedValue({
      id: "run_1",
      shelterId: "shelter_1",
      startedAt: new Date("2026-06-09T09:00:00.000Z"),
      finishedAt: new Date("2026-06-09T09:02:00.000Z"),
      status: "success",
      foundCount: 3,
      upsertedCount: 3,
      unavailableCount: 0,
      errorMessage: null,
    });

    const { getLatestScrapeRun } = await import("@/lib/pets/repository");
    const run = await getLatestScrapeRun();

    expect(mocks.prisma.scrapeRun.findFirst).toHaveBeenCalledWith({
      where: {
        shelterId: "shelter_1",
      },
      orderBy: { startedAt: "desc" },
    });
    expect(run).toEqual({
      startedAt: "2026-06-09T09:00:00.000Z",
      finishedAt: "2026-06-09T09:02:00.000Z",
      status: "success",
      foundCount: 3,
      unavailableCount: 0,
    });
  });
});
