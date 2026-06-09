import type { PrismaClient, Shelter } from "@prisma/client";
import { z } from "zod";

import { prisma } from "@/lib/db";

export const defaultShelterSlug = "adapost-canin-craiova";
export const defaultShelterName = "Adăpost Canin Craiova";
export const defaultSitemapIndexUrl =
  "https://www.adapostcanincraiova.ro/sitemap_index.xml";

export type ShelterConfig = {
  slug: string;
  name: string;
  sitemapIndexUrl: string;
  isActive: boolean;
  isDefault: boolean;
};

type ReadShelterConfigsOptions = {
  sheltersJson?: string;
  sitemapIndexUrl?: string;
};

const shelterConfigSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().trim().min(1),
  sitemapIndexUrl: z.string().trim().url(),
  isActive: z.boolean().optional().default(true),
  isDefault: z.boolean().optional().default(false),
});

const sheltersJsonSchema = z.array(shelterConfigSchema).min(1);

export function readShelterConfigs({
  sheltersJson = process.env.SHELTERS_JSON,
  sitemapIndexUrl = process.env.SITEMAP_INDEX_URL,
}: ReadShelterConfigsOptions = {}): ShelterConfig[] {
  if (sheltersJson?.trim()) {
    const parsed = JSON.parse(sheltersJson) as unknown;
    return normalizeShelterConfigs(sheltersJsonSchema.parse(parsed));
  }

  return normalizeShelterConfigs([
    {
      slug: defaultShelterSlug,
      name: defaultShelterName,
      sitemapIndexUrl: sitemapIndexUrl || defaultSitemapIndexUrl,
      isActive: true,
      isDefault: true,
    },
  ]);
}

export async function upsertConfiguredShelters({
  db = prisma,
  configs = readShelterConfigs(),
}: {
  db?: PrismaClient;
  configs?: ShelterConfig[];
} = {}): Promise<Shelter[]> {
  const normalizedConfigs = normalizeShelterConfigs(configs);
  const defaultConfig = normalizedConfigs.find((config) => config.isDefault);

  if (!defaultConfig) {
    throw new Error("No default shelter configured.");
  }

  await db.shelter.updateMany({
    where: {
      slug: {
        not: defaultConfig.slug,
      },
    },
    data: {
      isDefault: false,
    },
  });

  const shelters: Shelter[] = [];

  for (const config of normalizedConfigs) {
    const shelter = await db.shelter.upsert({
      where: {
        slug: config.slug,
      },
      create: {
        slug: config.slug,
        name: config.name,
        sitemapIndexUrl: config.sitemapIndexUrl,
        isActive: config.isActive,
        isDefault: config.isDefault,
      },
      update: {
        name: config.name,
        sitemapIndexUrl: config.sitemapIndexUrl,
        isActive: config.isActive,
        isDefault: config.isDefault,
      },
    });

    shelters.push(shelter);
  }

  return shelters;
}

export async function getDefaultShelter(db: PrismaClient = prisma): Promise<Shelter | null> {
  return (
    (await db.shelter.findFirst({
      where: {
        isActive: true,
        isDefault: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    })) ??
    (await db.shelter.findFirst({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    }))
  );
}

export function normalizeShelterConfigs(configs: ShelterConfig[]): ShelterConfig[] {
  const activeConfigs = configs.filter((config) => config.isActive);

  if (activeConfigs.length === 0) {
    throw new Error("At least one active shelter must be configured.");
  }

  const defaultSlug =
    activeConfigs.find((config) => config.isDefault)?.slug ?? activeConfigs[0].slug;

  return configs.map((config) => ({
    ...config,
    isDefault: config.slug === defaultSlug,
  }));
}
