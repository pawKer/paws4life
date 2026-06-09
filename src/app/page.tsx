import React from "react";

import { PetDeck } from "@/components/PetDeck";
import { getLatestScrapeRun, getPetCards } from "@/lib/pets/repository";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [pets, latestRun] = await Promise.all([
    // Include unavailable pets only so browser-cached shortlist items can resolve.
    // PetDeck keeps them out of the browse deck.
    getPetCards({ includeUnavailable: true }),
    getLatestScrapeRun()
  ]);

  return <PetDeck initialPets={pets} latestRun={latestRun} />;
}
