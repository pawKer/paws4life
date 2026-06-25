import { notFound } from "next/navigation";

import { getGeneratedPetImageResponse } from "@/lib/pets/generated-share-image-response";

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
