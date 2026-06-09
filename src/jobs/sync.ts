import { syncShelterPets } from "@/lib/shelter/sync";

syncShelterPets()
  .then((summary) => {
    console.info("Shelter sync finished", summary);
    process.exit(summary.status === "failed" ? 1 : 0);
  })
  .catch((error) => {
    console.error("Shelter sync crashed", error);
    process.exit(1);
  });
