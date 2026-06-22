import type { PrismaClient } from "@prisma/client";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  enrichPetProfiles: vi.fn(async () => ({
    attemptedCount: 0,
    updatedCount: 0,
    skippedCount: 0,
    errors: [],
    model: null,
  })),
}));

vi.mock("@/lib/pets/profile-generator", () => ({
  enrichPetProfiles: mocks.enrichPetProfiles,
}));

describe("shelter sync", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("syncs each active shelter and scopes pet reconciliation to that shelter", async () => {
    const db = createSyncDb();
    const fetchMock = vi.fn(async (url: string | URL | Request) => {
      const response = responses.get(String(url));

      if (!response) {
        return new Response("missing", { status: 404 });
      }

      return new Response(response, { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const { syncShelterPets } = await import("@/lib/shelter/sync");
    const summary = await syncShelterPets({
      db,
      requestDelayMs: 0,
      shelterConfigs: [
        {
          slug: "first-shelter",
          name: "First Shelter",
          sitemapIndexUrl: "https://first.example/sitemap_index.xml",
          isActive: true,
          isDefault: true,
        },
        {
          slug: "second-shelter",
          name: "Second Shelter",
          sitemapIndexUrl: "https://second.example/sitemap_index.xml",
          isActive: true,
          isDefault: false,
        },
      ],
    });

    expect(summary).toMatchObject({
      status: "success",
      foundCount: 3,
      upsertedCount: 3,
      unavailableCount: 2,
      profileEnrichedCount: 0,
    });
    expect(summary.shelters?.map((shelter) => shelter.shelterSlug)).toEqual([
      "first-shelter",
      "second-shelter",
    ]);
    expect(db.scrapeRun.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          shelterId: "shelter_first-shelter",
        }),
      }),
    );
    expect(db.scrapeRun.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          shelterId: "shelter_second-shelter",
        }),
      }),
    );
    expect(db.pet.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          shelterId: "shelter_first-shelter",
        },
      }),
    );
    expect(db.pet.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          shelterId: "shelter_second-shelter",
        },
      }),
    );
    expect(mocks.enrichPetProfiles).toHaveBeenCalledWith(
      expect.objectContaining({
        pets: expect.arrayContaining([
          expect.objectContaining({ id: "pet_101" }),
          expect.objectContaining({ id: "pet_102" }),
        ]),
        usedNames: ["Old"],
      }),
    );
    expect(mocks.enrichPetProfiles).toHaveBeenCalledWith(
      expect.objectContaining({
        pets: [expect.objectContaining({ id: "pet_202" })],
        usedNames: ["Old"],
      }),
    );
    expect(db.pet.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          shelterId_sourceUrl: {
            shelterId: "shelter_first-shelter",
            sourceUrl: "https://first.example/anunturi-caini/101/",
          },
        },
        create: expect.objectContaining({
          shelterId: "shelter_first-shelter",
          registryNumber: "101",
        }),
      }),
    );
    expect(db.pet.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          shelterId_sourceUrl: {
            shelterId: "shelter_first-shelter",
            sourceUrl: "https://first.example/anunturi-caini/102/",
          },
        },
        create: expect.objectContaining({
          shelterId: "shelter_first-shelter",
          registryNumber: "102",
        }),
      }),
    );
    expect(db.pet.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          shelterId_sourceUrl: {
            shelterId: "shelter_second-shelter",
            sourceUrl: "https://second.example/anunturi-caini/202/",
          },
        },
        create: expect.objectContaining({
          shelterId: "shelter_second-shelter",
          registryNumber: "202",
        }),
      }),
    );
    expect(db.pet.updateMany).toHaveBeenCalledWith({
      where: {
        shelterId: "shelter_first-shelter",
        sourceUrl: {
          in: ["https://first.example/anunturi-caini/old/"],
        },
      },
      data: expect.objectContaining({
        isAvailable: false,
      }),
    });
    expect(db.pet.updateMany).toHaveBeenCalledWith({
      where: {
        shelterId: "shelter_second-shelter",
        sourceUrl: {
          in: ["https://second.example/anunturi-caini/old/"],
        },
      },
      data: expect.objectContaining({
        isAvailable: false,
      }),
    });
  });

  it("does not mark pets unavailable when the sitemap count collapses unexpectedly", async () => {
    const db = createSyncDb({
      existingPets: Array.from({ length: 20 }, (_, index) => ({
        sourceUrl: `https://first.example/anunturi-caini/${index + 1}/`,
        isAvailable: true,
        profileName: "Old",
        profileBio: "Old bio",
      })),
    });
    const fetchMock = vi.fn(async (url: string | URL | Request) => {
      const response = collapseResponses.get(String(url));

      if (!response) {
        return new Response("missing", { status: 404 });
      }

      return new Response(response, { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const { syncShelterPets } = await import("@/lib/shelter/sync");
    const summary = await syncShelterPets({
      db,
      requestDelayMs: 0,
      shelterConfigs: [
        {
          slug: "first-shelter",
          name: "First Shelter",
          sitemapIndexUrl: "https://first.example/sitemap_index.xml",
          isActive: true,
          isDefault: true,
        },
      ],
    });

    expect(summary).toMatchObject({
      status: "partial",
      foundCount: 1,
      upsertedCount: 1,
      unavailableCount: 0,
    });
    expect(summary.errors[0]).toContain("Skipped unavailable reconciliation");
    expect(db.pet.updateMany).not.toHaveBeenCalled();
  });
});

function createSyncDb({
  existingPets,
}: {
  existingPets?: Array<{
    sourceUrl: string;
    isAvailable: boolean;
    profileName: string | null;
    profileBio: string | null;
  }>;
} = {}) {
  const shelters = new Map<string, { id: string; slug: string; name: string; sitemapIndexUrl: string; isActive: boolean; isDefault: boolean; createdAt: Date; updatedAt: Date }>();
  const db = {
    shelter: {
      updateMany: vi.fn(async () => ({ count: 0 })),
      upsert: vi.fn(async ({ where, create, update }) => {
        const existing = shelters.get(where.slug);
        const shelter = {
          ...(existing ?? {
            id: `shelter_${where.slug}`,
            slug: where.slug,
            createdAt: new Date("2026-06-09T00:00:00.000Z"),
          }),
          ...create,
          ...update,
          id: existing?.id ?? `shelter_${where.slug}`,
          slug: where.slug,
          updatedAt: new Date("2026-06-09T00:00:00.000Z"),
        };
        shelters.set(where.slug, shelter);
        return shelter;
      }),
    },
    scrapeRun: {
      create: vi.fn(async ({ data }) => ({
        id: `run_${data.shelterId}`,
        ...data,
      })),
      update: vi.fn(async ({ data }) => data),
    },
    pet: {
      findMany: vi.fn(async ({ where }) => {
        if (existingPets) {
          return existingPets;
        }

        if (where.shelterId === "shelter_first-shelter") {
          return [
            {
              sourceUrl: "https://first.example/anunturi-caini/old/",
              isAvailable: true,
              profileName: "Old",
              profileBio: "Old bio",
            },
          ];
        }

        return [
          {
            sourceUrl: "https://second.example/anunturi-caini/old/",
            isAvailable: true,
            profileName: "Old",
            profileBio: "Old bio",
          },
        ];
      }),
      upsert: vi.fn(async ({ where, create }) => ({
        id: `pet_${create.registryNumber}`,
        registryNumber: create.registryNumber,
        approximateAge: create.approximateAge,
        sex: create.sex,
        color: create.color,
        captureLocation: create.captureLocation,
        characteristics: create.characteristics,
        profileName: null,
        profileBio: null,
        sourceUrl: where.shelterId_sourceUrl.sourceUrl,
      })),
      updateMany: vi.fn(async () => ({ count: 1 })),
    },
  };

  return db as unknown as PrismaClient & {
    shelter: {
      updateMany: ReturnType<typeof vi.fn>;
      upsert: ReturnType<typeof vi.fn>;
    };
    scrapeRun: {
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
    pet: {
      findMany: ReturnType<typeof vi.fn>;
      upsert: ReturnType<typeof vi.fn>;
      updateMany: ReturnType<typeof vi.fn>;
    };
  };
}

const responses = new Map<string, string>([
  [
    "https://first.example/sitemap_index.xml",
    sitemapIndex([
      "https://first.example/product-sitemap.xml",
      "https://first.example/product-sitemap-2.xml",
    ]),
  ],
  [
    "https://first.example/product-sitemap.xml",
    productSitemap("https://first.example/anunturi-caini/101/"),
  ],
  [
    "https://first.example/product-sitemap-2.xml",
    productSitemap("https://first.example/anunturi-caini/102/"),
  ],
  [
    "https://first.example/anunturi-caini/101/",
    listingHtml("101"),
  ],
  [
    "https://first.example/anunturi-caini/102/",
    listingHtml("102"),
  ],
  [
    "https://second.example/sitemap_index.xml",
    sitemapIndex(["https://second.example/product-sitemap.xml"]),
  ],
  [
    "https://second.example/product-sitemap.xml",
    productSitemap("https://second.example/anunturi-caini/202/"),
  ],
  [
    "https://second.example/anunturi-caini/202/",
    listingHtml("202"),
  ],
]);

const collapseResponses = new Map<string, string>([
  [
    "https://first.example/sitemap_index.xml",
    sitemapIndex(["https://first.example/product-sitemap.xml"]),
  ],
  [
    "https://first.example/product-sitemap.xml",
    productSitemap("https://first.example/anunturi-caini/999/"),
  ],
  [
    "https://first.example/anunturi-caini/999/",
    listingHtml("999"),
  ],
]);

function sitemapIndex(productSitemapUrls: string[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${productSitemapUrls
    .map(
      (productSitemapUrl) => `<sitemap>
    <loc>${productSitemapUrl}</loc>
  </sitemap>`,
    )
    .join("\n")}
</sitemapindex>`;
}

function productSitemap(listingUrl: string) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${listingUrl}</loc>
    <lastmod>2026-06-05T09:16:17+00:00</lastmod>
  </url>
</urlset>`;
}

function listingHtml(registryNumber: string) {
  return `<!doctype html>
<html lang="ro-RO">
  <head>
    <title>Adopta un caine -${registryNumber}</title>
    <meta property="og:image" content="https://example.com/${registryNumber}.jpg" />
  </head>
  <body>
    <p>Data capturarii: 04.06.2026</p>
    <p>Locul capturarii: Cartier Test</p>
    <p>Varsta aproximativa: 3-4 ani</p>
    <p>Sex: Mascul</p>
    <p>Numar registru intrare: ${registryNumber}</p>
    <p>Alte caracteristici: Talie mijlocie, culoare maro.</p>
  </body>
</html>`;
}
