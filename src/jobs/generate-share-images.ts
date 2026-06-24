import { generateShareImagesForAvailablePets } from "@/lib/pets/share-image-generation";

generateShareImagesForAvailablePets()
  .then((summary) => {
    console.info("Share image generation finished", summary);
    process.exit(summary.errors.length > 0 ? 1 : 0);
  })
  .catch((error) => {
    console.error("Share image generation crashed", error);
    process.exit(1);
  });
