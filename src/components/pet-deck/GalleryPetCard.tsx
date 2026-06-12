"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import React from "react";

import { appCopy } from "@/content/ro";
import { buildPetPath } from "@/lib/pets/gallery";
import type { PetCard } from "@/lib/pets/types";
import { Pill } from "@/components/ui/badge";
import { buildPetProfile } from "@/components/pet-deck/petProfile";
import { cn } from "@/lib/ui/classNames";

type GalleryPetCardProps = {
  pet: PetCard;
  saved: boolean;
  onToggleSave: (id: string) => void;
};

export function GalleryPetCard({ pet, saved, onToggleSave }: GalleryPetCardProps) {
  const profile = buildPetProfile(pet);

  return (
    <article className="group overflow-hidden rounded-lg border border-white/70 bg-card/90 shadow-[0_18px_52px_hsl(var(--shadow-soft)_/_0.18)] ring-1 ring-border/50 backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-card sm:hover:-translate-y-1">
      <div className="grid grid-cols-[42%_1fr] sm:block">
        <div className="relative min-h-40 bg-muted/30 sm:aspect-[4/3]">
          <Link
            href={buildPetPath(pet)}
            className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          >
            {pet.imageUrl ? (
              <img
                src={pet.imageUrl}
                alt={`${appCopy.status.imageAltPrefix} ${pet.registryNumber}`}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition group-hover:scale-[1.02] motion-reduce:transition-none"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm font-bold text-muted-foreground">
                {appCopy.status.loading}
              </div>
            )}
          </Link>
          <button
            type="button"
            aria-label={saved ? appCopy.gallery.saved : appCopy.gallery.save}
            title={saved ? appCopy.gallery.saved : appCopy.gallery.save}
            onClick={() => onToggleSave(pet.id)}
            className={cn(
              "absolute right-3 top-3 z-10 grid h-11 w-11 place-items-center rounded-full transition motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
              saved
                ? "bg-primary text-primary-foreground shadow-primary"
                : "border border-secondary/35 bg-card/95 text-secondary-foreground shadow-sm hover:bg-secondary/10",
            )}
          >
            <Heart className={cn("h-5 w-5", saved ? "fill-current" : "")} />
          </button>
        </div>

        <div className="relative min-w-0 bg-card/95 p-4">
          <Link
            href={buildPetPath(pet)}
            className="block text-2xl font-black leading-none text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {profile.name}
          </Link>
          <p className="mt-2 text-xs font-black uppercase tracking-[0.08em] text-muted-foreground">
            {appCopy.deck.registryPrefix} {pet.registryNumber}
          </p>
          <p className="mt-3 line-clamp-3 text-sm font-semibold leading-6 text-card-foreground">
            {profile.description}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {profile.chips.slice(0, 3).map((chip) => (
              <Pill key={chip} tone="bio" className="py-1">
                {chip}
              </Pill>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
