-- CreateTable
CREATE TABLE "Pet" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "characteristics" TEXT,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "unavailableSince" DATETIME,
    "sourceLastModified" DATETIME,
    "publishedAt" DATETIME,
    "rawFacts" JSONB,
    "firstSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ScrapeRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" DATETIME,
    "status" TEXT NOT NULL,
    "foundCount" INTEGER NOT NULL DEFAULT 0,
    "upsertedCount" INTEGER NOT NULL DEFAULT 0,
    "unavailableCount" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Pet_sourceUrl_key" ON "Pet"("sourceUrl");
