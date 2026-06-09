import { describe, expect, it } from "vitest";

import { planAvailabilityChanges } from "@/lib/shelter/reconcile";

describe("availability reconciliation", () => {
  it("hides available pets that disappeared from the sitemap", () => {
    const result = planAvailabilityChanges(
      [
        { sourceUrl: "https://example.com/anunturi-caini/1/", isAvailable: true },
        { sourceUrl: "https://example.com/anunturi-caini/2/", isAvailable: true },
        { sourceUrl: "https://example.com/anunturi-caini/3/", isAvailable: false }
      ],
      new Set([
        "https://example.com/anunturi-caini/2/",
        "https://example.com/anunturi-caini/3/"
      ])
    );

    expect(result.markUnavailable).toEqual(["https://example.com/anunturi-caini/1/"]);
    expect(result.markAvailable).toEqual(["https://example.com/anunturi-caini/3/"]);
  });
});
