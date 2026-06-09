"use client";

import { ArrowRight, BadgeCheck, Heart } from "lucide-react";
import { motion, useReducedMotion, useTransform } from "motion/react";
import type { MotionValue } from "motion/react";
import React from "react";

import { appCopy } from "@/content/ro";
import { Pill } from "@/components/ui/badge";
import { IconButton } from "@/components/ui/button";
import { buildPetProfile } from "@/components/pet-deck/petProfile";
import type { PetCard } from "@/lib/pets/types";

type PetCardViewProps = {
  pet: PetCard;
  dragX: MotionValue<number>;
  onLike: () => void;
  onNext: () => void;
};

export function PetCardView({ pet, dragX, onLike, onNext }: PetCardViewProps) {
  const profile = buildPetProfile(pet);
  const shouldReduceMotion = useReducedMotion();
  const rotate = useTransform(dragX, [-220, 0, 220], [-9, 0, 9]);
  const likeOpacity = useTransform(dragX, [36, 130], [0, 1]);
  const nextOpacity = useTransform(dragX, [-130, -36], [1, 0]);

  function resetDrag() {
    dragX.set(0);
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
      className="touch-pan-y cursor-grab overflow-hidden rounded-lg border border-border bg-card shadow-card ring-1 ring-card/80 active:cursor-grabbing"
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

      <div className="space-y-4 bg-accent/25 p-4">
        <section>
          <h3 className="text-sm font-black text-foreground">
            {appCopy.deck.about}
          </h3>
          <p className="mt-2 text-base font-bold leading-6 text-card-foreground">
            {profile.description}
          </p>
        </section>

        <div className="flex flex-wrap gap-2">
          {profile.chips.map((chip) => (
            <Pill key={chip}>{chip}</Pill>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <a
            href={pet.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-black text-success underline-offset-4 hover:underline"
          >
            {appCopy.app.sourceLink}
          </a>
          <div className="flex justify-end gap-3">
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
