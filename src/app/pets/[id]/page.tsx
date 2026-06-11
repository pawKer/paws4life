import { notFound } from "next/navigation";
import React from "react";

import { PetDetailView } from "@/components/pet-deck/PetDetailView";
import { getPetCardById } from "@/lib/pets/repository";

export const dynamic = "force-dynamic";

type PetPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PetPage({ params }: PetPageProps) {
  const { id } = await params;
  const pet = await getPetCardById(id);

  if (!pet) {
    notFound();
  }

  return <PetDetailView pet={pet} />;
}
