"use client";

import { ArrowRight, BadgeCheck, Heart, Share2, UserRound } from "lucide-react";
import { motion, useReducedMotion, useTransform } from "motion/react";
import type { MotionValue } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import React from "react";

import { appCopy } from "@/content/ro";
import { Pill } from "@/components/ui/badge";
import { IconButton } from "@/components/ui/button";
import { buildPetProfile } from "@/components/pet-deck/petProfile";
import { buildPetPath } from "@/lib/pets/gallery";
import type { PetCard } from "@/lib/pets/types";

type PetCardViewProps = {
  pet: PetCard;
  dragX: MotionValue<number>;
  onLike: () => void;
  onNext: () => void;
};

export function PetCardView({ pet, dragX, onLike, onNext }: PetCardViewProps) {
  const profile = buildPetProfile(pet);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const rotate = useTransform(dragX, [-220, 0, 220], [-9, 0, 9]);
  const likeOpacity = useTransform(dragX, [36, 130], [0, 1]);
  const nextOpacity = useTransform(dragX, [-130, -36], [1, 0]);

  function resetDrag() {
    dragX.set(0);
  }

  async function sharePet() {
    const path = buildPetPath(pet);
    const url = `${window.location.origin}${path}`;
    const title = `${profile.name} - ${appCopy.app.name}`;

    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        setShareStatus(appCopy.gallery.shareDone);
        window.setTimeout(() => setShareStatus(null), 2200);
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setShareStatus(appCopy.gallery.copied);
        window.setTimeout(() => setShareStatus(null), 2200);
        return;
      }

      setShareStatus(appCopy.gallery.shareUnavailable);
      window.setTimeout(() => setShareStatus(null), 2200);
    } catch {
      setShareStatus(appCopy.gallery.shareUnavailable);
      window.setTimeout(() => setShareStatus(null), 2200);
    }
  }

  return (
    <motion.article
      data-testid="pet-card"
      key={pet.id}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.16}
      dragMomentum={false}
      onDragEnd={(_, info) => {
        resetDrag();

        if (info.offset.x > 120) {
          onLike();
          return;
        }

        if (info.offset.x < -120) {
          onNext();
        }
      }}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      style={{ x: dragX, rotate: shouldReduceMotion ? 0 : rotate }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.22 }}
      className="touch-pan-y cursor-grab overflow-hidden rounded-lg border border-white/70 bg-card/90 shadow-[0_24px_70px_hsl(var(--shadow-soft)_/_0.22)] ring-1 ring-border/55 backdrop-blur-sm active:cursor-grabbing"
    >
      <div className="relative aspect-[3/4] bg-success/15">
        {pet.imageUrl ? (
          <img
            src={pet.imageUrl}
            alt={`${appCopy.status.imageAltPrefix} ${pet.registryNumber}`}
            draggable={false}
            decoding="async"
            className="pointer-events-none h-full w-full select-none object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            {appCopy.status.loading}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-foreground/85 via-foreground/35 to-transparent" />
        <motion.div
          aria-hidden="true"
          style={{ opacity: likeOpacity }}
          className="absolute right-4 top-5 z-20 rotate-12 rounded-md border-2 border-primary bg-card/90 px-3 py-2 text-sm font-black uppercase tracking-[0.12em] text-primary shadow-sm"
        >
          {appCopy.deck.like}
        </motion.div>
        <motion.div
          aria-hidden="true"
          style={{ opacity: nextOpacity }}
          className="absolute left-3 top-3 z-20 -rotate-12 rounded-md border-2 border-success bg-card/90 px-3 py-2 text-sm font-black uppercase tracking-[0.12em] text-success shadow-sm"
        >
          {appCopy.deck.next}
        </motion.div>
        <div className="absolute left-3 top-3 z-10 rounded-full bg-card/75 px-3 py-2 text-xs font-black text-foreground/85 shadow-sm backdrop-blur-sm">
          {appCopy.deck.registryPrefix} <span>{pet.registryNumber}</span>
        </div>
        <div className="absolute bottom-5 left-4 right-4">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <h2
                aria-label={
                  profile.age ? `${profile.name}, ${profile.age}` : profile.name
                }
                className="truncate text-4xl font-black leading-none text-white"
              >
                {profile.name}
                {profile.age ? (
                  <span className="font-bold">, {profile.age}</span>
                ) : null}
                <BadgeCheck className="ml-2 inline h-5 w-5 translate-y-[-3px] fill-info text-info-foreground" />
              </h2>
              <p className="mt-2 truncate text-sm font-black text-white/90">
                {profile.subtitle}
              </p>
            </div>
            <IconButton
              label={appCopy.deck.like}
              onClick={onLike}
              tone="primary"
              className="h-14 w-14 hover:-translate-y-1"
            >
              <Heart className="h-7 w-7 fill-current" />
            </IconButton>
          </div>
        </div>
      </div>

      <div className="space-y-4 bg-card/95 p-4 sm:p-5">
        <section className="rounded-lg border border-border/70 bg-muted/25 p-4">
          <h3 className="text-sm font-black text-foreground">
            {appCopy.deck.about}
          </h3>
          <p className="mt-2 text-base font-bold leading-6 text-card-foreground">
            {profile.description}
          </p>
        </section>

        <div className="flex flex-wrap gap-2">
          {profile.chips.map((chip) => (
            <Pill key={chip} className="bg-card/90">
              {chip}
            </Pill>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <a
            href={pet.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-black text-success underline-offset-4 hover:underline"
          >
            {appCopy.app.sourceLink}
          </a>
          <div className="flex items-center justify-end gap-2">
            <Link
              href={buildPetPath(pet)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-secondary/35 bg-card/95 px-4 text-sm font-black text-secondary-foreground shadow-sm transition motion-safe:hover:-translate-y-0.5 hover:bg-secondary/10 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <UserRound className="h-4 w-4" />
              {appCopy.deck.profile}
            </Link>
            <div className="relative">
              {shareStatus ? (
                <span
                  role="status"
                  className="absolute bottom-[calc(100%+0.45rem)] right-0 z-20 whitespace-nowrap rounded-full border border-white/70 bg-foreground px-3 py-1 text-xs font-black text-background shadow-gentle ring-1 ring-border/45"
                >
                  {shareStatus}
                </span>
              ) : null}
              <IconButton
                label={shareStatus ?? appCopy.gallery.share}
                onClick={sharePet}
                tone="secondary"
                className="h-11 w-11"
              >
                <Share2 className="h-5 w-5" />
              </IconButton>
            </div>
            <IconButton
              label={appCopy.deck.next}
              onClick={onNext}
              tone="light"
              className="h-14 w-14 hover:-translate-y-1"
            >
              <ArrowRight className="h-7 w-7" />
            </IconButton>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
