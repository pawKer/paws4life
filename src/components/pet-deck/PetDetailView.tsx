"use client";

import { ArrowLeft, Heart, Share2 } from "lucide-react";
import Link from "next/link";
import { useMotionValue } from "motion/react";
import { useState } from "react";
import React from "react";

import { appCopy } from "@/content/ro";
import { AdoptionInfo } from "@/components/pet-deck/AdoptionInfo";
import { SourceLinkButton } from "@/components/pet-deck/SourceLinkButton";
import { DeckBackground } from "@/components/pet-deck/DeckBackground";
import { buildPetProfile } from "@/components/pet-deck/petProfile";
import { useShortlist } from "@/components/pet-deck/useShortlist";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/badge";
import type { PetCard } from "@/lib/pets/types";
import { cn } from "@/lib/ui/classNames";

type PetDetailViewProps = {
  pet: PetCard;
};

export function PetDetailView({ pet }: PetDetailViewProps) {
  const backgroundX = useMotionValue(0);
  const profile = buildPetProfile(pet);
  const { toggleShortlist, isShortlisted } = useShortlist([pet]);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const saved = isShortlisted(pet.id);

  async function sharePet() {
    const url = window.location.href;
    const title = `${profile.name} - ${appCopy.app.name}`;

    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShareStatus(appCopy.gallery.copied);
      }
    } catch {
      setShareStatus(null);
    }
  }

  return (
    <main className="relative min-h-dvh overflow-x-hidden bg-background text-foreground">
      <DeckBackground dragX={backgroundX} />

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-4 sm:px-6 sm:py-6">
        <header className="flex items-center justify-between gap-3">
          <Link
            href="/gallery"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-card/90 text-foreground shadow-sm backdrop-blur-sm transition hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={appCopy.gallery.detailsBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <p className="text-sm font-black uppercase tracking-[0.12em] text-muted-foreground">
            {appCopy.gallery.detailTitle}
          </p>
          <button
            type="button"
            onClick={() => toggleShortlist(pet.id)}
            aria-label={saved ? appCopy.gallery.saved : appCopy.gallery.save}
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-card/90 shadow-sm backdrop-blur-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              saved ? "text-primary" : "text-muted-foreground hover:text-primary",
            )}
          >
            <Heart className={cn("h-5 w-5", saved ? "fill-current" : "")} />
          </button>
        </header>

        <article className="mt-4 overflow-hidden rounded-lg border border-white/70 bg-card/95 shadow-[0_24px_70px_hsl(var(--shadow-soft)_/_0.2)] ring-1 ring-border/50 backdrop-blur-sm">
          <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:items-stretch">
            <div className="relative aspect-[4/5] overflow-hidden bg-success/15 lg:aspect-auto lg:h-full lg:min-h-[560px]">
              {pet.imageUrl ? (
                <img
                  src={pet.imageUrl}
                  alt={`${appCopy.status.imageAltPrefix} ${pet.registryNumber}`}
                  decoding="async"
                  className="h-full w-full object-cover object-center"
                />
              ) : (
                <div className="flex h-full items-center justify-center font-bold text-muted-foreground">
                  {appCopy.status.loading}
                </div>
              )}
              {!pet.isAvailable ? (
                <span className="absolute left-4 top-4 rounded-md bg-accent px-3 py-2 text-xs font-black text-accent-foreground shadow-sm">
                  {appCopy.deck.unavailable}
                </span>
              ) : null}
            </div>

            <div className="bg-card/95 p-5 sm:p-7">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-primary">
                {appCopy.deck.registryPrefix} {pet.registryNumber}
              </p>
              <h1 className="mt-2 text-4xl font-black leading-none text-foreground sm:text-5xl">
                {profile.name}
                {profile.age ? <span className="font-bold">, {profile.age}</span> : null}
              </h1>
              <p className="mt-3 text-base font-black text-muted-foreground">
                {profile.subtitle}
              </p>

              {!pet.isAvailable ? (
                <p className="mt-4 rounded-lg bg-accent/45 p-3 text-sm font-bold text-accent-foreground">
                  {appCopy.gallery.unavailableDetail}
                </p>
              ) : null}

              <section className="mt-5 rounded-lg border border-border/70 bg-muted/25 p-4">
                <h2 className="text-sm font-black text-foreground">
                  {appCopy.deck.about}
                </h2>
                <p className="mt-2 text-base font-semibold leading-7 text-card-foreground">
                  {profile.description}
                </p>
              </section>

              <div className="mt-5 flex flex-wrap gap-2">
                {profile.chips.map((chip) => (
                  <Pill key={chip} tone="bio">
                    {chip}
                  </Pill>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <Button
                  variant={saved ? "primary" : "secondary"}
                  onClick={() => toggleShortlist(pet.id)}
                  icon={<Heart className={cn("h-4 w-4", saved ? "fill-current" : "")} />}
                >
                  {saved ? appCopy.gallery.saved : appCopy.gallery.save}
                </Button>
                <Button onClick={sharePet} icon={<Share2 className="h-4 w-4" />}>
                  {shareStatus ?? appCopy.gallery.share}
                </Button>
                <SourceLinkButton href={pet.sourceUrl} />
              </div>

              <AdoptionInfo
                className="mt-6"
                petName={profile.name}
                petSex={pet.sex}
              />
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
