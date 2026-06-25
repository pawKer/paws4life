import { mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { getGeneratedPetImageResponse } from "@/lib/pets/generated-share-image-response";

describe("generated pet image route", () => {
  it("serves generated PNGs from the runtime image directory", async () => {
    const imageDir = await mkdtemp(path.join(os.tmpdir(), "paws-generated-route-"));
    const filename = "pawsforlife-pet_1022-story.png";

    await writeFile(path.join(imageDir, filename), "png-bytes");

    const response = await getGeneratedPetImageResponse(filename, imageDir);

    expect(response?.status).toBe(200);
    expect(response?.headers.get("Content-Type")).toBe("image/png");
    expect(response?.headers.get("Cache-Control")).toBe("no-store");
    await expect(response?.text()).resolves.toBe("png-bytes");
  });

  it("rejects invalid or missing generated image filenames", async () => {
    const imageDir = await mkdtemp(path.join(os.tmpdir(), "paws-generated-route-"));

    await expect(getGeneratedPetImageResponse("../secret.png", imageDir)).resolves.toBeNull();
    await expect(getGeneratedPetImageResponse("pawsforlife-pet_1022.svg", imageDir)).resolves.toBeNull();
    await expect(getGeneratedPetImageResponse("pawsforlife-missing.png", imageDir)).resolves.toBeNull();
  });
});
