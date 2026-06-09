import { describe, expect, it } from "vitest";

import { sortPetsForDeck } from "@/lib/pets/sort";

const baseDate = new Date("2026-06-08T00:00:00.000Z");

function pet(
  id: string,
  captureDate: string | null,
  isAvailable = true,
  publishedAt = "2026-06-08T00:00:00.000Z"
) {
  return {
    id,
    isAvailable,
    captureDate: captureDate ? new Date(captureDate) : null,
    publishedAt: publishedAt ? new Date(publishedAt) : null,
    createdAt: baseDate
  };
}

describe("pet deck sorting", () => {
  it("shows available pets captured longest ago first", () => {
    const sorted = sortPetsForDeck([
      pet("newer", "2026-06-04T00:00:00.000Z"),
      pet("unknown", null),
      pet("older", "2026-05-20T00:00:00.000Z"),
      pet("unavailable-old", "2026-04-01T00:00:00.000Z", false)
    ]);

    expect(sorted.map((item) => item.id)).toEqual([
      "older",
      "newer",
      "unknown",
      "unavailable-old"
    ]);
  });
});
