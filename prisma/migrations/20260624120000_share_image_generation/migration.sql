-- Track whether static profile/story share images have been generated for a pet.
ALTER TABLE "Pet" ADD COLUMN "shareImagesGeneratedAt" DATETIME;
