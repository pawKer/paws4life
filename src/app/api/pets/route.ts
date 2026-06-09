import { NextRequest, NextResponse } from "next/server";

import { filterPetCards } from "@/lib/pets/filter";
import { getLatestScrapeRun, getPetCards } from "@/lib/pets/repository";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const includeUnavailable = searchParams.get("status") === "all";
  const pets = await getPetCards({ includeUnavailable });

  return NextResponse.json({
    pets: filterPetCards(pets, {
      sex: searchParams.get("sex") ?? "all",
      size: searchParams.get("size") ?? "all",
      q: searchParams.get("q") ?? ""
    }),
    sync: await getLatestScrapeRun()
  });
}
