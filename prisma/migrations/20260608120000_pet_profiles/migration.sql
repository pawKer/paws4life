-- Add optional AI-generated adoption profile copy for each pet.
ALTER TABLE "Pet" ADD COLUMN "profileName" TEXT;
ALTER TABLE "Pet" ADD COLUMN "profileBio" TEXT;
ALTER TABLE "Pet" ADD COLUMN "profileGeneratedAt" DATETIME;
ALTER TABLE "Pet" ADD COLUMN "profileModel" TEXT;
