import { readFile } from "node:fs/promises";
import path from "node:path";

import { notFound } from "next/navigation";

const generatedPetImagesDir = path.join(process.cwd(), "public", "generated", "pets");
const generatedPetImageFilenamePattern = /^pawsforlife-[a-zA-Z0-9_-]+(?:-story)?\.png$/;

type GeneratedPetImageRouteProps = {
  params: Promise<{
    filename: string;
  }>;
};

export async function GET(_request: Request, { params }: GeneratedPetImageRouteProps) {
  const { filename } = await params;
  const response = await getGeneratedPetImageResponse(filename);

  if (!response) {
    notFound();
  }

  return response;
}

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
