import { describe, expect, it } from "vitest";

import {
  parseListingPage,
  parseProductSitemap,
  parseSitemapIndex
} from "@/lib/shelter/parser";

const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://www.adapostcanincraiova.ro/post-sitemap.xml</loc>
    <lastmod>2026-04-29T08:56:02+00:00</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://www.adapostcanincraiova.ro/product-sitemap.xml</loc>
    <lastmod>2026-06-05T09:16:17+00:00</lastmod>
  </sitemap>
</sitemapindex>`;

const productSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.adapostcanincraiova.ro/magazin/</loc>
    <lastmod>2026-06-05T09:16:17+00:00</lastmod>
  </url>
  <url>
    <loc>https://www.adapostcanincraiova.ro/anunturi-caini/931-2/</loc>
    <lastmod>2026-05-21T10:15:47+00:00</lastmod>
  </url>
  <url>
    <loc>https://www.adapostcanincraiova.ro/anunturi-caini/1022-3/</loc>
    <lastmod>2026-06-05T09:16:17+00:00</lastmod>
  </url>
</urlset>`;

const listingHtml = `<!doctype html>
<html lang="ro-RO">
  <head>
    <title>Adoptă un câine -1022 - Adăpost Canin Craiova</title>
    <meta property="og:image" content="https://www.adapostcanincraiova.ro/wp-content/uploads/2026/06/1022.jpg" />
    <script type="application/ld+json" class="yoast-schema-graph">
      {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebPage",
            "name": "Adoptă un câine -1022 - Adăpost Canin Craiova",
            "thumbnailUrl": "https://www.adapostcanincraiova.ro/wp-content/uploads/2026/06/1022.jpg",
            "datePublished": "2026-06-05T09:16:17+00:00"
          }
        ]
      }
    </script>
  </head>
  <body>
    <div class="fusion-text"><p>Data capturării: 04.06.2026</p></div>
    <div class="fusion-text"><p>Locul capturării: Cartier Brestei</p></div>
    <div class="fusion-text"><p>Vârstă aproximativă: 3-4 ani</p></div>
    <div class="fusion-text"><p>Sex: Femelă</p></div>
    <div class="fusion-text"><p>Număr registru intrare: 1022</p></div>
    <div class="fusion-text"><p>Alte caracteristici: Talie mică, culoare negru-maro.</p></div>
  </body>
</html>`;

describe("shelter parser", () => {
  it("finds the product sitemap from the sitemap index", () => {
    expect(parseSitemapIndex(sitemapIndex)).toEqual([
      "https://www.adapostcanincraiova.ro/post-sitemap.xml",
      "https://www.adapostcanincraiova.ro/product-sitemap.xml"
    ]);
  });

  it("extracts only dog listing URLs from the product sitemap", () => {
    expect(parseProductSitemap(productSitemap)).toEqual([
      {
        url: "https://www.adapostcanincraiova.ro/anunturi-caini/931-2/",
        lastModified: new Date("2026-05-21T10:15:47+00:00")
      },
      {
        url: "https://www.adapostcanincraiova.ro/anunturi-caini/1022-3/",
        lastModified: new Date("2026-06-05T09:16:17+00:00")
      }
    ]);
  });

  it("parses a dog listing into structured profile facts", () => {
    const pet = parseListingPage(
      listingHtml,
      "https://www.adapostcanincraiova.ro/anunturi-caini/1022-3/",
      new Date("2026-06-05T09:16:17+00:00")
    );

    expect(pet).toMatchObject({
      sourceUrl: "https://www.adapostcanincraiova.ro/anunturi-caini/1022-3/",
      registryNumber: "1022",
      title: "Adoptă un câine -1022 - Adăpost Canin Craiova",
      imageUrl: "https://www.adapostcanincraiova.ro/wp-content/uploads/2026/06/1022.jpg",
      captureDateText: "04.06.2026",
      captureLocation: "Cartier Brestei",
      approximateAge: "3-4 ani",
      sex: "female",
      size: "small",
      color: "negru-maro",
      characteristics: "Talie mică, culoare negru-maro.",
      sourceLastModified: new Date("2026-06-05T09:16:17+00:00"),
      publishedAt: new Date("2026-06-05T09:16:17+00:00")
    });
    expect(pet.captureDate?.toISOString()).toBe("2026-06-04T00:00:00.000Z");
    expect(pet.rawFacts).toMatchObject({
      "Data capturării": "04.06.2026",
      "Număr registru intrare": "1022"
    });
  });
});
