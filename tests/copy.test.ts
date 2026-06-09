import { describe, expect, it } from "vitest";

import { appCopy } from "@/content/ro";

function flattenValues(value: unknown): string[] {
  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap(flattenValues);
  }

  if (value && typeof value === "object") {
    return Object.values(value).flatMap(flattenValues);
  }

  return [];
}

describe("Romanian copy", () => {
  it("keeps user-facing copy centralized and non-empty", () => {
    expect(appCopy).toHaveProperty("deck");
    expect(appCopy).toHaveProperty("filters");
    expect(appCopy).toHaveProperty("shortlist");
    expect(appCopy).toHaveProperty("match");
    expect(flattenValues(appCopy).every((text) => text.trim().length > 0)).toBe(true);
  });
});
