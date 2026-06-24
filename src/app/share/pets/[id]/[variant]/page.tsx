import { notFound } from "next/navigation";
import React from "react";

import { PetShareImageCard } from "@/components/pet-share/PetShareImageCard";
import {
  PET_SHARE_IMAGE_SIZES,
  buildPetShareImageProfile,
  type PetShareImageVariant,
} from "@/lib/pets/share-images";
import { getPetCardById } from "@/lib/pets/repository";

export const dynamic = "force-dynamic";

type ShareRenderPageProps = {
  params: Promise<{
    id: string;
    variant: string;
  }>;
};

export default async function ShareRenderPage({ params }: ShareRenderPageProps) {
  const { id, variant: rawVariant } = await params;
  const variant = parseVariant(rawVariant);

  if (!variant) {
    notFound();
  }

  const pet = await getPetCardById(id);

  if (!pet) {
    notFound();
  }

  const size = PET_SHARE_IMAGE_SIZES[variant];
  const profile = buildPetShareImageProfile(pet);

  return (
    <main
      data-share-render-page
      className="overflow-hidden bg-background"
      style={{
        width: size.width,
        height: size.height,
      }}
    >
      <PetShareImageCard pet={pet} profile={profile} variant={variant} />
    </main>
  );
}

function parseVariant(value: string): PetShareImageVariant | null {
  if (value === "profile" || value === "story") {
    return value;
  }

  return null;
}
