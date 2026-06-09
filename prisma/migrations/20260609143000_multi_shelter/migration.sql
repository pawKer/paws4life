CREATE TABLE IF NOT EXISTS "Shelter" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "sitemapIndexUrl" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "Shelter_slug_key" ON "Shelter"("slug");

INSERT OR IGNORE INTO "Shelter" (
  "id",
  "slug",
  "name",
  "sitemapIndexUrl",
  "isActive",
  "isDefault",
  "createdAt",
  "updatedAt"
) VALUES (
  'shelter_adapost_canin_craiova',
  'adapost-canin-craiova',
  'Adăpost Canin Craiova',
  'https://www.adapostcanincraiova.ro/sitemap_index.xml',
  true,
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

DROP INDEX IF EXISTS "Pet_sourceUrl_key";

PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Pet" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "shelterId" TEXT NOT NULL,
  "sourceUrl" TEXT NOT NULL,
  "registryNumber" TEXT NOT NULL,
  "title" TEXT,
  "imageUrl" TEXT,
  "captureDate" DATETIME,
  "captureDateText" TEXT,
  "captureLocation" TEXT,
  "approximateAge" TEXT,
  "sex" TEXT,
  "size" TEXT,
  "color" TEXT,
  "characteristics" TEXT,
  "profileName" TEXT,
  "profileBio" TEXT,
  "profileGeneratedAt" DATETIME,
  "profileModel" TEXT,
  "isAvailable" BOOLEAN NOT NULL DEFAULT true,
  "unavailableSince" DATETIME,
  "sourceLastModified" DATETIME,
  "publishedAt" DATETIME,
  "rawFacts" JSONB,
  "firstSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "Pet_shelterId_fkey" FOREIGN KEY ("shelterId") REFERENCES "Shelter" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "new_Pet" (
  "id",
  "shelterId",
  "sourceUrl",
  "registryNumber",
  "title",
  "imageUrl",
  "captureDate",
  "captureDateText",
  "captureLocation",
  "approximateAge",
  "sex",
  "size",
  "color",
  "characteristics",
  "profileName",
  "profileBio",
  "profileGeneratedAt",
  "profileModel",
  "isAvailable",
  "unavailableSince",
  "sourceLastModified",
  "publishedAt",
  "rawFacts",
  "firstSeenAt",
  "lastSeenAt",
  "createdAt",
  "updatedAt"
)
SELECT
  "id",
  'shelter_adapost_canin_craiova',
  "sourceUrl",
  "registryNumber",
  "title",
  "imageUrl",
  "captureDate",
  "captureDateText",
  "captureLocation",
  "approximateAge",
  "sex",
  "size",
  "color",
  "characteristics",
  "profileName",
  "profileBio",
  "profileGeneratedAt",
  "profileModel",
  "isAvailable",
  "unavailableSince",
  "sourceLastModified",
  "publishedAt",
  "rawFacts",
  "firstSeenAt",
  "lastSeenAt",
  "createdAt",
  "updatedAt"
FROM "Pet";

DROP TABLE "Pet";
ALTER TABLE "new_Pet" RENAME TO "Pet";

CREATE TABLE "new_ScrapeRun" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "shelterId" TEXT NOT NULL,
  "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "finishedAt" DATETIME,
  "status" TEXT NOT NULL,
  "foundCount" INTEGER NOT NULL DEFAULT 0,
  "upsertedCount" INTEGER NOT NULL DEFAULT 0,
  "unavailableCount" INTEGER NOT NULL DEFAULT 0,
  "errorMessage" TEXT,
  CONSTRAINT "ScrapeRun_shelterId_fkey" FOREIGN KEY ("shelterId") REFERENCES "Shelter" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "new_ScrapeRun" (
  "id",
  "shelterId",
  "startedAt",
  "finishedAt",
  "status",
  "foundCount",
  "upsertedCount",
  "unavailableCount",
  "errorMessage"
)
SELECT
  "id",
  'shelter_adapost_canin_craiova',
  "startedAt",
  "finishedAt",
  "status",
  "foundCount",
  "upsertedCount",
  "unavailableCount",
  "errorMessage"
FROM "ScrapeRun";

DROP TABLE "ScrapeRun";
ALTER TABLE "new_ScrapeRun" RENAME TO "ScrapeRun";

PRAGMA foreign_keys=ON;

CREATE UNIQUE INDEX IF NOT EXISTS "Pet_shelterId_sourceUrl_key" ON "Pet"("shelterId", "sourceUrl");
CREATE INDEX IF NOT EXISTS "Pet_shelterId_idx" ON "Pet"("shelterId");
CREATE INDEX IF NOT EXISTS "ScrapeRun_shelterId_idx" ON "ScrapeRun"("shelterId");
