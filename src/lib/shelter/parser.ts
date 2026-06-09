import { load } from "cheerio";
import { XMLParser } from "fast-xml-parser";

export type SitemapListing = {
  url: string;
  lastModified: Date | null;
};

export type ParsedPetListing = {
  sourceUrl: string;
  registryNumber: string;
  title: string | null;
  imageUrl: string | null;
  captureDate: Date | null;
  captureDateText: string | null;
  captureLocation: string | null;
  approximateAge: string | null;
  sex: "female" | "male" | "unknown";
  size: "small" | "medium" | "large" | "unknown";
  color: string | null;
  characteristics: string | null;
  sourceLastModified: Date | null;
  publishedAt: Date | null;
  rawFacts: Record<string, string>;
};

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  removeNSPrefix: true,
  trimValues: true
});

export function parseSitemapIndex(xml: string): string[] {
  const parsed = xmlParser.parse(xml);
  const sitemaps = asArray(parsed?.sitemapindex?.sitemap);

  return sitemaps.map((entry) => String(entry.loc ?? "")).filter(Boolean);
}

export function parseProductSitemap(xml: string): SitemapListing[] {
  const parsed = xmlParser.parse(xml);
  const urls = asArray(parsed?.urlset?.url);

  return urls
    .map((entry) => ({
      url: String(entry.loc ?? ""),
      lastModified: parseIsoDate(entry.lastmod)
    }))
    .filter((entry) => entry.url.includes("/anunturi-caini/"));
}

export function parseListingPage(
  html: string,
  sourceUrl: string,
  sourceLastModified: Date | null = null
): ParsedPetListing {
  const $ = load(html);
  const title = normalizeText($("title").first().text()) || null;
  const schema = readYoastSchema($);
  const webPage = findSchemaNode(schema, "WebPage");
  const imageObject = findSchemaNode(schema, "ImageObject");
  const rawFacts = extractFacts($("p").toArray().map((element) => $(element).text()));
  const characteristics = rawFacts["Alte caracteristici"] ?? null;
  const registryNumber =
    rawFacts["Număr registru intrare"] ??
    extractRegistryNumber(String(webPage?.name ?? title ?? "")) ??
    extractRegistryNumber(sourceUrl) ??
    "necunoscut";

  return {
    sourceUrl,
    registryNumber,
    title: title ?? stringOrNull(webPage?.name),
    imageUrl: findImageUrl($, webPage, imageObject),
    captureDate: parseRomanianDate(rawFacts["Data capturării"]),
    captureDateText: rawFacts["Data capturării"] ?? null,
    captureLocation: rawFacts["Locul capturării"] ?? null,
    approximateAge: rawFacts["Vârstă aproximativă"] ?? null,
    sex: normalizeSex(rawFacts.Sex),
    size: normalizeSize(characteristics),
    color: extractColor(characteristics),
    characteristics,
    sourceLastModified,
    publishedAt: parseIsoDate(webPage?.datePublished),
    rawFacts
  };
}

function readYoastSchema($: ReturnType<typeof load>): unknown[] {
  const schemas: unknown[] = [];

  $('script[type="application/ld+json"]').each((_, element) => {
    const content = $(element).text().trim();

    if (!content) {
      return;
    }

    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed?.["@graph"])) {
        schemas.push(...parsed["@graph"]);
      } else {
        schemas.push(parsed);
      }
    } catch {
      // Ignore unrelated or malformed JSON-LD blocks.
    }
  });

  return schemas;
}

function findSchemaNode(nodes: unknown[], type: string): Record<string, unknown> | null {
  return (
    nodes.find((node): node is Record<string, unknown> => {
      if (!node || typeof node !== "object") {
        return false;
      }

      const nodeType = (node as Record<string, unknown>)["@type"];
      return nodeType === type || (Array.isArray(nodeType) && nodeType.includes(type));
    }) ?? null
  );
}

function extractFacts(paragraphs: string[]): Record<string, string> {
  const facts: Record<string, string> = {};

  for (const paragraph of paragraphs) {
    const text = normalizeText(paragraph);
    const separator = text.indexOf(":");

    if (separator === -1) {
      continue;
    }

    const label = normalizeLabel(text.slice(0, separator));
    const value = text.slice(separator + 1).trim();

    if (label && value) {
      facts[label] = value;
    }
  }

  return facts;
}

function normalizeLabel(label: string): string {
  const normalized = normalizeText(label);
  const knownLabels: Record<string, string> = {
    "data capturarii": "Data capturării",
    "locul capturarii": "Locul capturării",
    "varsta aproximativa": "Vârstă aproximativă",
    sex: "Sex",
    "numar registru intrare": "Număr registru intrare",
    "alte caracteristici": "Alte caracteristici"
  };

  return knownLabels[withoutDiacritics(normalized).toLowerCase()] ?? normalized;
}

function findImageUrl(
  $: ReturnType<typeof load>,
  webPage: Record<string, unknown> | null,
  imageObject: Record<string, unknown> | null
): string | null {
  return (
    stringOrNull(webPage?.thumbnailUrl) ??
    stringOrNull(imageObject?.contentUrl) ??
    stringOrNull(imageObject?.url) ??
    stringOrNull($('meta[property="og:image"]').first().attr("content")) ??
    stringOrNull($('meta[name="twitter:image"]').first().attr("content"))
  );
}

export function normalizeSex(value: string | null | undefined): "female" | "male" | "unknown" {
  const text = withoutDiacritics(value ?? "").toLowerCase();

  if (text.includes("femela")) {
    return "female";
  }

  if (text.includes("mascul")) {
    return "male";
  }

  return "unknown";
}

export function normalizeSize(value: string | null | undefined): "small" | "medium" | "large" | "unknown" {
  const text = withoutDiacritics(value ?? "").toLowerCase();

  if (text.includes("talie mica")) {
    return "small";
  }

  if (text.includes("talie mijlocie") || text.includes("talie medie")) {
    return "medium";
  }

  if (text.includes("talie mare")) {
    return "large";
  }

  return "unknown";
}

export function extractColor(value: string | null | undefined): string | null {
  const text = normalizeText(value ?? "");
  const match = text.match(/(?:^|[\s,.;])culoare\s*:?\s*([^.;,]+)/i);

  if (!match) {
    return null;
  }

  const color = match[1].replace(/\s+/g, " ").trim();
  return color || null;
}

function parseRomanianDate(value: string | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  const match = value.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!match) {
    return null;
  }

  const [, day, month, year] = match;
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
}

function parseIsoDate(value: unknown): Date | null {
  if (typeof value !== "string" || !value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function extractRegistryNumber(value: string): string | null {
  return value.match(/(?:-|\/)(\d{2,5})(?:\D|$)/)?.[1] ?? value.match(/\b(\d{2,5})\b/)?.[1] ?? null;
}

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function withoutDiacritics(value: string): string {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function asArray<T>(value: T | T[] | undefined | null): T[] {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}
