import { describe, expect, it } from "vitest";

import {
  defaultShelterName,
  defaultShelterSlug,
  defaultSitemapIndexUrl,
  readShelterConfigs,
} from "@/lib/shelters/config";

describe("shelter config", () => {
  it("parses SHELTERS_JSON and keeps exactly one active default", () => {
    const configs = readShelterConfigs({
      sheltersJson: JSON.stringify([
        {
          slug: "first-shelter",
          name: "First Shelter",
          sitemapIndexUrl: "https://example.com/first-sitemap.xml",
          isActive: true,
          isDefault: true,
        },
        {
          slug: "second-shelter",
          name: "Second Shelter",
          sitemapIndexUrl: "https://example.com/second-sitemap.xml",
          isActive: true,
          isDefault: true,
        },
      ]),
    });

    expect(configs).toEqual([
      {
        slug: "first-shelter",
        name: "First Shelter",
        sitemapIndexUrl: "https://example.com/first-sitemap.xml",
        isActive: true,
        isDefault: true,
      },
      {
        slug: "second-shelter",
        name: "Second Shelter",
        sitemapIndexUrl: "https://example.com/second-sitemap.xml",
        isActive: true,
        isDefault: false,
      },
    ]);
  });

  it("falls back to the current single shelter config", () => {
    expect(
      readShelterConfigs({
        sheltersJson: "",
        sitemapIndexUrl: "https://example.com/sitemap_index.xml",
      }),
    ).toEqual([
      {
        slug: defaultShelterSlug,
        name: defaultShelterName,
        sitemapIndexUrl: "https://example.com/sitemap_index.xml",
        isActive: true,
        isDefault: true,
      },
    ]);
  });

  it("falls back to the built-in sitemap URL when no env URL is provided", () => {
    expect(readShelterConfigs({ sheltersJson: "", sitemapIndexUrl: "" })[0]).toMatchObject({
      slug: defaultShelterSlug,
      sitemapIndexUrl: defaultSitemapIndexUrl,
      isDefault: true,
    });
  });

  it("uses the first active shelter as default when none is marked default", () => {
    const configs = readShelterConfigs({
      sheltersJson: JSON.stringify([
        {
          slug: "inactive-shelter",
          name: "Inactive Shelter",
          sitemapIndexUrl: "https://example.com/inactive-sitemap.xml",
          isActive: false,
          isDefault: true,
        },
        {
          slug: "active-shelter",
          name: "Active Shelter",
          sitemapIndexUrl: "https://example.com/active-sitemap.xml",
          isActive: true,
        },
      ]),
    });

    expect(configs.map((config) => [config.slug, config.isDefault])).toEqual([
      ["inactive-shelter", false],
      ["active-shelter", true],
    ]);
  });
});
