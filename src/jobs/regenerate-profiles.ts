import { regenerateAvailablePetProfiles } from "@/lib/pets/profile-regeneration";

regenerateAvailablePetProfiles()
  .then((summary) => {
    console.info("Profile regeneration finished", summary);
    process.exit(summary.errors.length > 0 ? 1 : 0);
  })
  .catch((error) => {
    console.error("Profile regeneration crashed", error);
    process.exit(1);
  });
