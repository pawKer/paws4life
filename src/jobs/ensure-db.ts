import { prisma } from "@/lib/db";
import { upsertConfiguredShelters } from "@/lib/shelters/config";

async function ensureDatabase() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Shelter" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "slug" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "sitemapIndexUrl" TEXT NOT NULL,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "isDefault" BOOLEAN NOT NULL DEFAULT false,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "Shelter_slug_key" ON "Shelter"("slug")
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Pet" (
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
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "ScrapeRun" (
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
    )
  `);

  const shelters = await upsertConfiguredShelters({ db: prisma });
  const defaultShelter =
    shelters.find((shelter) => shelter.isActive && shelter.isDefault) ??
    shelters.find((shelter) => shelter.isActive);

  if (!defaultShelter) {
    throw new Error("No active shelter configured.");
  }

  for (const [column, type] of [
    ["shelterId", "TEXT"],
    ["color", "TEXT"],
    ["profileName", "TEXT"],
    ["profileBio", "TEXT"],
    ["profileGeneratedAt", "DATETIME"],
    ["profileModel", "TEXT"]
  ] as const) {
    await addColumnIfMissing("Pet", column, type);
  }

  await addColumnIfMissing("ScrapeRun", "shelterId", "TEXT");

  for (const table of ["Pet", "ScrapeRun"] as const) {
    await backfillShelterId(table, defaultShelter.id);
  }

  await rebuildPetTable(defaultShelter.id);
  await rebuildScrapeRunTable(defaultShelter.id);

  await prisma.$executeRawUnsafe(`
    DROP INDEX IF EXISTS "Pet_sourceUrl_key"
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "Pet_shelterId_sourceUrl_key" ON "Pet"("shelterId", "sourceUrl")
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "Pet_shelterId_idx" ON "Pet"("shelterId")
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "ScrapeRun_shelterId_idx" ON "ScrapeRun"("shelterId")
  `);
}

async function addColumnIfMissing(
  table: "Pet" | "ScrapeRun",
  column: string,
  type: string
) {
  const columns = await prisma.$queryRawUnsafe<Array<{ name: string }>>(
    `PRAGMA table_info("${table}")`
  );

  if (columns.some((existingColumn) => existingColumn.name === column)) {
    return;
  }

  await prisma.$executeRawUnsafe(`ALTER TABLE "${table}" ADD COLUMN "${column}" ${type}`);
}

async function backfillShelterId(table: "Pet" | "ScrapeRun", shelterId: string) {
  const escapedShelterId = shelterId.replaceAll("'", "''");

  await prisma.$executeRawUnsafe(
    `UPDATE "${table}" SET "shelterId" = '${escapedShelterId}' WHERE "shelterId" IS NULL`
  );
}

async function rebuildPetTable(defaultShelterId: string) {
  const escapedShelterId = defaultShelterId.replaceAll("'", "''");

  await prisma.$executeRawUnsafe(`PRAGMA foreign_keys=OFF`);
  await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "Pet_sourceUrl_key"`);
  await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "Pet_shelterId_sourceUrl_key"`);
  await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "Pet_shelterId_idx"`);
  await prisma.$executeRawUnsafe(`
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
    )
  `);
  await prisma.$executeRawUnsafe(`
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
      COALESCE("shelterId", '${escapedShelterId}'),
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
    FROM "Pet"
  `);
  await prisma.$executeRawUnsafe(`DROP TABLE "Pet"`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "new_Pet" RENAME TO "Pet"`);
  await prisma.$executeRawUnsafe(`PRAGMA foreign_keys=ON`);
}

async function rebuildScrapeRunTable(defaultShelterId: string) {
  const escapedShelterId = defaultShelterId.replaceAll("'", "''");

  await prisma.$executeRawUnsafe(`PRAGMA foreign_keys=OFF`);
  await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "ScrapeRun_shelterId_idx"`);
  await prisma.$executeRawUnsafe(`
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
    )
  `);
  await prisma.$executeRawUnsafe(`
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
      COALESCE("shelterId", '${escapedShelterId}'),
      "startedAt",
      "finishedAt",
      "status",
      "foundCount",
      "upsertedCount",
      "unavailableCount",
      "errorMessage"
    FROM "ScrapeRun"
  `);
  await prisma.$executeRawUnsafe(`DROP TABLE "ScrapeRun"`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "new_ScrapeRun" RENAME TO "ScrapeRun"`);
  await prisma.$executeRawUnsafe(`PRAGMA foreign_keys=ON`);
}

ensureDatabase()
  .then(async () => {
    await prisma.$disconnect();
    console.info("Database schema is ready.");
  })
  .catch(async (error) => {
    await prisma.$disconnect();
    console.error("Failed to ensure database schema.", error);
    process.exit(1);
  });
