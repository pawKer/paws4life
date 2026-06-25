import { readFile } from "node:fs/promises";
import path from "node:path";

const generatedPetImagesDir = path.join(process.cwd(), "public", "generated", "pets");
const generatedPetImageFilenamePattern = /^pawsforlife-[a-zA-Z0-9_-]+(?:-story)?\.png$/;

export async function getGeneratedPetImageResponse(
  filename: string,
  imageDir = generatedPetImagesDir,
): Promise<Response | null> {
  if (!isGeneratedPetImageFilename(filename)) {
    return null;
  }

  try {
    const image = await readFile(path.join(imageDir, filename));

    return new Response(image, {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "image/png",
      },
    });
  } catch {
    return null;
  }
}

function isGeneratedPetImageFilename(filename: string): boolean {
  return (
    filename === path.basename(filename) &&
    generatedPetImageFilenamePattern.test(filename)
  );
}
