"use client";

import { Heart, PawPrint } from "lucide-react";
import Link from "next/link";
import React from "react";

import { appCopy } from "@/content/ro";
import { AdoptionInfo } from "@/components/pet-deck/AdoptionInfo";
import { Pill } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buildPetProfile } from "@/components/pet-deck/petProfile";
import {
  buildPetPath,
  getWaitingLabel,
  getWaitingProgressPercent,
} from "@/lib/pets/gallery";
import type { PetCard } from "@/lib/pets/types";
import { cn } from "@/lib/ui/classNames";

type DogOfDaySpotlightProps = {
  pet: PetCard | null;
  saved: boolean;
  onToggleSave: (id: string) => void;
};

export function DogOfDaySpotlight({
  pet,
  saved,
  onToggleSave,
}: DogOfDaySpotlightProps) {
  if (!pet) {
    return null;
  }

  const profile = buildPetProfile(pet);
  const waitingLabel = getWaitingLabel(pet);
  const waitingProgress = getWaitingProgressPercent(pet) ?? 8;

  return (
    <section className="overflow-hidden rounded-lg border border-white/70 bg-card/90 shadow-[0_24px_70px_hsl(var(--shadow-soft)_/_0.18)] ring-1 ring-border/50 backdrop-blur-sm">
      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-[240px_1fr] sm:gap-4 sm:p-5">
        <Link
          href={buildPetPath(pet)}
          className="relative block aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card sm:aspect-auto sm:min-h-40 sm:w-auto"
        >
          {pet.imageUrl ? (
            <img
              src={pet.imageUrl}
              alt={`${appCopy.status.imageAltPrefix} ${pet.registryNumber}`}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <div className="grid h-full place-items-center text-muted-foreground">
              <PawPrint className="h-10 w-10" />
            </div>
          )}
        </Link>

        <div className="min-w-0">
          <span className="inline-flex rounded-full bg-success px-3 py-1 text-xs font-black text-success-foreground">
            {appCopy.gallery.dogOfDay}
          </span>
          <h2 className="mt-3 text-2xl font-black leading-none text-foreground sm:text-3xl">
            <Link
              href={buildPetPath(pet)}
              className="underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {profile.name}
            </Link>
          </h2>
          <p className="mt-2 text-xs font-black uppercase tracking-[0.08em] text-muted-foreground">
            {appCopy.deck.registryPrefix} {pet.registryNumber}
          </p>
          <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-card-foreground">
            {profile.description}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {profile.chips.slice(0, 3).map((chip) => (
              <Pill key={chip} tone="bio" className="py-1">
                {chip}
              </Pill>
            ))}
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{
                width: `${waitingProgress}%`,
              }}
            />
          </div>
          <p className="mt-2 text-xs font-black text-muted-foreground">
            {[pet.captureDateText ? `${appCopy.deck.captureDate}: ${pet.captureDateText}` : null, waitingLabel]
              .filter(Boolean)
              .join(" · ") || appCopy.gallery.dogOfDayFallback}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <AdoptionInfo petName={profile.name} petSex={pet.sex} />
            <Button
              variant={saved ? "primary" : "secondary"}
              className="h-12"
              onClick={() => onToggleSave(pet.id)}
              icon={<Heart className={cn("h-4 w-4", saved ? "fill-current" : "")} />}
            >
              {saved ? appCopy.gallery.saved : appCopy.gallery.save}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
