import type { Prisma, PrismaClient } from "@prisma/client";

import { prisma } from "@/lib/db";
import {
  enrichPetProfiles,
  type PetProfileCandidate
} from "@/lib/pets/profile-generator";
import {
  readShelterConfigs,
  upsertConfiguredShelters,
  type ShelterConfig
} from "@/lib/shelters/config";
import {
  parseListingPage,
  parseProductSitemap,
  parseSitemapIndex,
  type SitemapListing
} from "@/lib/shelter/parser";
import { planAvailabilityChanges } from "@/lib/shelter/reconcile";

export type SyncSummary = {
  status: "success" | "partial" | "failed";
  foundCount: number;
  upsertedCount: number;
  unavailableCount: number;
  profileEnrichedCount: number;
  errors: string[];
  shelters?: ShelterSyncSummary[];
};

export type ShelterSyncSummary = Omit<SyncSummary, "shelters"> & {
  shelterId: string;
  shelterSlug: string;
  shelterName: string;
};

type SyncOptions = {
  db?: PrismaClient;
  sitemapIndexUrl?: string;
  sheltersJson?: string;
  shelterConfigs?: ShelterConfig[];
  shelterSlug?: string;
  requestDelayMs?: number;
  now?: () => Date;
};

const fetchTimeoutMs = 30_000;
const fetchRetryCount = 2;

export async function syncShelterPets(options: SyncOptions = {}): Promise<SyncSummary> {
  const db = options.db ?? prisma;
  const configs =
    options.shelterConfigs ??
    readShelterConfigs({
      sheltersJson: options.sheltersJson,
      sitemapIndexUrl: options.sitemapIndexUrl
    });
  const configuredShelters = await upsertConfiguredShelters({ db, configs });
  const shelters = configuredShelters.filter(
    (shelter) =>
      shelter.isActive && (!options.shelterSlug || shelter.slug === options.shelterSlug)
  );

  if (shelters.length === 0) {
    return {
      status: "failed",
      foundCount: 0,
      upsertedCount: 0,
      unavailableCount: 0,
      profileEnrichedCount: 0,
      errors: options.shelterSlug
        ? [`No active shelter found for slug ${options.shelterSlug}.`]
        : ["No active shelters configured."]
    };
  }

  const summaries: ShelterSyncSummary[] = [];

  for (const shelter of shelters) {
    const summary = await syncOneShelter({
      db,
      shelter,
      requestDelayMs: options.requestDelayMs ?? 250,
      now: options.now ?? (() => new Date())
    });
    summaries.push(summary);
  }

  return aggregateShelterSummaries(summaries);
}

async function syncOneShelter({
  db,
  shelter,
  requestDelayMs,
  now
}: {
  db: PrismaClient;
  shelter: {
    id: string;
    slug: string;
    name: string;
    sitemapIndexUrl: string;
  };
  requestDelayMs: number;
  now: () => Date;
}): Promise<ShelterSyncSummary> {
  const startedAt = now();
  const run = await db.scrapeRun.create({
    data: {
      shelterId: shelter.id,
      startedAt,
      status: "running"
    }
  });

  try {
    const summary = await performSync({
      db,
      shelterId: shelter.id,
      sitemapIndexUrl: shelter.sitemapIndexUrl,
      requestDelayMs,
      now
    });

    await db.scrapeRun.update({
      where: { id: run.id },
      data: {
        finishedAt: now(),
        status: summary.status,
        foundCount: summary.foundCount,
        upsertedCount: summary.upsertedCount,
        unavailableCount: summary.unavailableCount,
        errorMessage: summary.errors.length ? summary.errors.join("\n") : null
      }
    });

    return toShelterSyncSummary(summary, shelter);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await db.scrapeRun.update({
      where: { id: run.id },
      data: {
        finishedAt: now(),
        status: "failed",
        errorMessage: message
      }
    });

    return {
      shelterId: shelter.id,
      shelterSlug: shelter.slug,
      shelterName: shelter.name,
      status: "failed",
      foundCount: 0,
      upsertedCount: 0,
      unavailableCount: 0,
      profileEnrichedCount: 0,
      errors: [message]
    };
  }
}

async function performSync({
  db,
  shelterId,
  sitemapIndexUrl,
  requestDelayMs,
  now
}: {
  db: PrismaClient;
  shelterId: string;
  sitemapIndexUrl: string;
  requestDelayMs: number;
  now: () => Date;
}): Promise<SyncSummary> {
  const sitemapIndexXml = await fetchText(sitemapIndexUrl);
  const sitemapUrls = parseSitemapIndex(sitemapIndexXml);
  const productSitemapUrls = sitemapUrls.filter((url) => url.includes("product-sitemap"));

  if (productSitemapUrls.length === 0) {
    throw new Error("Product sitemap not found in sitemap index.");
  }

  const listings = dedupeListings(
    (
      await Promise.all(
        productSitemapUrls.map(async (productSitemapUrl) =>
          parseProductSitemap(await fetchText(productSitemapUrl))
        )
      )
    ).flat()
  );
  const currentSourceUrls = new Set(listings.map((listing) => listing.url));
  const existingPets = await db.pet.findMany({
    where: {
      shelterId
    },
    select: {
      sourceUrl: true,
      isAvailable: true,
      profileName: true,
      profileBio: true
    }
  });
  const existingPetsBySourceUrl = new Map(
    existingPets.map((pet) => [pet.sourceUrl, pet] as const)
  );
  const availabilityPlan = planAvailabilityChanges(existingPets, currentSourceUrls);
  const errors: string[] = [];
  const profileCandidates: PetProfileCandidate[] = [];
  let upsertedCount = 0;
  let unavailableCount = 0;

  for (const [index, listing] of listings.entries()) {
    if (index > 0 && requestDelayMs > 0) {
      await delay(requestDelayMs);
    }

    try {
      const html = await fetchText(listing.url);
      const parsed = parseListingPage(html, listing.url, listing.lastModified);
      const existingPet = existingPetsBySourceUrl.get(parsed.sourceUrl);

      const pet = await db.pet.upsert({
        where: {
          shelterId_sourceUrl: {
            shelterId,
            sourceUrl: parsed.sourceUrl
          }
        },
        create: {
          ...toPetWriteData(parsed, shelterId, now()),
          firstSeenAt: now()
        },
        update: {
          ...toPetWriteData(parsed, shelterId, now()),
          isAvailable: true,
          unavailableSince: null
        },
        select: {
          id: true,
          registryNumber: true,
          approximateAge: true,
          sex: true,
          color: true,
          captureLocation: true,
          characteristics: true,
          profileName: true,
          profileBio: true
        }
      });

      if (!existingPet || !pet.profileName || !pet.profileBio) {
        profileCandidates.push(toProfileCandidate(pet));
      }

      upsertedCount += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${listing.url}: ${message}`);
    }
  }

  const shouldMarkUnavailable = canSafelyMarkUnavailable({
    existingPets,
    currentSourceUrls,
    markUnavailableCount: availabilityPlan.markUnavailable.length
  });

  if (!shouldMarkUnavailable) {
    errors.push(
      `Skipped unavailable reconciliation because sitemap count ${currentSourceUrls.size} is unexpectedly low for ${countAvailablePets(existingPets)} available pets.`
    );
  } else if (availabilityPlan.markUnavailable.length > 0) {
    await db.pet.updateMany({
      where: {
        shelterId,
        sourceUrl: { in: availabilityPlan.markUnavailable }
      },
      data: {
        isAvailable: false,
        unavailableSince: now()
      }
    });
    unavailableCount = availabilityPlan.markUnavailable.length;
  }

  const profileSummary = await enrichPetProfiles({
    db,
    pets: profileCandidates,
    now
  });
  errors.push(...profileSummary.errors.map((error) => `profile enrichment: ${error}`));

  return {
    status: errors.length > 0 ? "partial" : "success",
    foundCount: listings.length,
    upsertedCount,
    unavailableCount,
    profileEnrichedCount: profileSummary.updatedCount,
    errors
  };
}

async function fetchText(url: string, attempt = 0): Promise<string> {
  try {
    const response = await fetch(url, {
      signal: timeoutSignal(fetchTimeoutMs),
      headers: {
        "user-agent": "PawsForLifeBot/0.1 (+private adoption browsing MVP)"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} while fetching ${url}`);
    }

    return response.text();
  } catch (error) {
    if (attempt < fetchRetryCount) {
      await delay(400 * (attempt + 1));
      return fetchText(url, attempt + 1);
    }

    throw error;
  }
}

function toPetWriteData(
  parsed: ReturnType<typeof parseListingPage>,
  shelterId: string,
  seenAt: Date
): Prisma.PetUncheckedCreateInput {
  return {
    shelterId,
    sourceUrl: parsed.sourceUrl,
    registryNumber: parsed.registryNumber,
    title: parsed.title,
    imageUrl: parsed.imageUrl,
    captureDate: parsed.captureDate,
    captureDateText: parsed.captureDateText,
    captureLocation: parsed.captureLocation,
    approximateAge: parsed.approximateAge,
    sex: parsed.sex,
    size: parsed.size,
    color: parsed.color,
    characteristics: parsed.characteristics,
    isAvailable: true,
    sourceLastModified: parsed.sourceLastModified,
    publishedAt: parsed.publishedAt,
    rawFacts: parsed.rawFacts,
    lastSeenAt: seenAt
  };
}

function toShelterSyncSummary(
  summary: SyncSummary,
  shelter: {
    id: string;
    slug: string;
    name: string;
  }
): ShelterSyncSummary {
  return {
    shelterId: shelter.id,
    shelterSlug: shelter.slug,
    shelterName: shelter.name,
    status: summary.status,
    foundCount: summary.foundCount,
    upsertedCount: summary.upsertedCount,
    unavailableCount: summary.unavailableCount,
    profileEnrichedCount: summary.profileEnrichedCount,
    errors: summary.errors
  };
}

function aggregateShelterSummaries(shelters: ShelterSyncSummary[]): SyncSummary {
  const errors = shelters.flatMap((summary) =>
    summary.errors.map((error) => `${summary.shelterSlug}: ${error}`)
  );
  const failedCount = shelters.filter((summary) => summary.status === "failed").length;
  const partialCount = shelters.filter((summary) => summary.status === "partial").length;
  const status =
    failedCount === shelters.length
      ? "failed"
      : failedCount > 0 || partialCount > 0 || errors.length > 0
        ? "partial"
        : "success";

  return {
    status,
    foundCount: shelters.reduce((total, summary) => total + summary.foundCount, 0),
    upsertedCount: shelters.reduce((total, summary) => total + summary.upsertedCount, 0),
    unavailableCount: shelters.reduce(
      (total, summary) => total + summary.unavailableCount,
      0
    ),
    profileEnrichedCount: shelters.reduce(
      (total, summary) => total + summary.profileEnrichedCount,
      0
    ),
    errors,
    shelters
  };
}

function dedupeListings(listings: SitemapListing[]): SitemapListing[] {
  const byUrl = new Map<string, SitemapListing>();

  for (const listing of listings) {
    byUrl.set(listing.url, listing);
  }

  return Array.from(byUrl.values());
}

function canSafelyMarkUnavailable({
  existingPets,
  currentSourceUrls,
  markUnavailableCount
}: {
  existingPets: Array<{ isAvailable: boolean }>;
  currentSourceUrls: Set<string>;
  markUnavailableCount: number;
}): boolean {
  if (markUnavailableCount === 0) {
    return true;
  }

  const availableCount = countAvailablePets(existingPets);

  if (availableCount === 0) {
    return true;
  }

  if (currentSourceUrls.size === 0) {
    return false;
  }

  return (
    availableCount < 10 ||
    currentSourceUrls.size >= Math.ceil(availableCount * 0.5) ||
    markUnavailableCount < Math.ceil(availableCount * 0.5)
  );
}

function countAvailablePets(pets: Array<{ isAvailable: boolean }>): number {
  return pets.filter((pet) => pet.isAvailable).length;
}

function timeoutSignal(timeoutMs: number): AbortSignal | undefined {
  return typeof AbortSignal.timeout === "function"
    ? AbortSignal.timeout(timeoutMs)
    : undefined;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toProfileCandidate(
  pet: Pick<
    PetProfileCandidate,
    | "id"
    | "registryNumber"
    | "approximateAge"
    | "sex"
    | "color"
    | "captureLocation"
    | "characteristics"
  >
): PetProfileCandidate {
  return {
    id: pet.id,
    registryNumber: pet.registryNumber,
    approximateAge: pet.approximateAge,
    sex: pet.sex,
    color: pet.color,
    captureLocation: pet.captureLocation,
    characteristics: pet.characteristics
  };
}
