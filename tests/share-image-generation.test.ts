import { mkdtemp, readdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  cleanupOrphanGeneratedPetShareImages,
  shouldGenerateShareImages,
} from "@/lib/pets/share-image-generation";

describe("share image generation helpers", () => {
  it("queues only available pets without generated images unless forced", () => {
    expect(
      shouldGenerateShareImages({
        isAvailable: true,
        shareImagesGeneratedAt: null,
      }),
    ).toBe(true);
    expect(
      shouldGenerateShareImages({
        isAvailable: true,
        shareImagesGeneratedAt: new Date("2026-06-10T00:00:00.000Z"),
      }),
    ).toBe(false);
    expect(
      shouldGenerateShareImages(
        {
          isAvailable: true,
          shareImagesGeneratedAt: new Date("2026-06-10T00:00:00.000Z"),
        },
        true,
      ),
    ).toBe(true);
    expect(
      shouldGenerateShareImages({
        isAvailable: false,
        shareImagesGeneratedAt: null,
      }),
    ).toBe(false);
  });

  it("removes generated PNGs that do not belong to available pets", async () => {
    const outputDir = await mkdtemp(path.join(os.tmpdir(), "paws-share-images-"));

    await writeFile(path.join(outputDir, "pawsforlife-pet_1.png"), "profile");
    await writeFile(path.join(outputDir, "pawsforlife-pet_1-story.png"), "story");
    await writeFile(path.join(outputDir, "pawsforlife-gone.png"), "old");
    await writeFile(path.join(outputDir, "notes.txt"), "keep");

    const deletedCount = await cleanupOrphanGeneratedPetShareImages(
      [{ id: "pet_1", registryNumber: "1022" }],
      outputDir,
    );

    await expect(readdir(outputDir).then((files) => files.sort())).resolves.toEqual([
      "notes.txt",
      "pawsforlife-pet_1-story.png",
      "pawsforlife-pet_1.png",
    ].sort());
    expect(deletedCount).toBe(1);
  });
});
