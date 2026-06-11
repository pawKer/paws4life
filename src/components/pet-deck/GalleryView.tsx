"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import React from "react";

import { appCopy } from "@/content/ro";
import { DogOfDaySpotlight } from "@/components/pet-deck/DogOfDaySpotlight";
import { GalleryPetCard } from "@/components/pet-deck/GalleryPetCard";
import { Select } from "@/components/ui/select";
import {
  type GallerySort,
  type QuickFilter,
  filterByQuickFilter,
  pickDogOfTheDay,
  sortGalleryPets,
} from "@/lib/pets/gallery";
import type { PetCard } from "@/lib/pets/types";
import { cn } from "@/lib/ui/classNames";

const mobileBatchSize = 6;

const quickFilters: Array<{ value: QuickFilter; label: string }> = [
  { value: "small", label: appCopy.filters.small },
  { value: "medium", label: appCopy.filters.medium },
  { value: "large", label: appCopy.filters.large },
  { value: "young", label: appCopy.gallery.young },
  { value: "adult", label: appCopy.gallery.adult },
  { value: "senior", label: appCopy.gallery.senior },
];

type GalleryViewProps = {
  pets: PetCard[];
  spotlightPets: PetCard[];
  onToggleSave: (id: string) => void;
  isSaved: (id: string) => boolean;
};

export function GalleryView({
  pets,
  spotlightPets,
  onToggleSave,
  isSaved,
}: GalleryViewProps) {
  const [quickFilter, setQuickFilter] = useState<QuickFilter | null>(null);
  const [sort, setSort] = useState<GallerySort>("recommended");
  const [visibleCount, setVisibleCount] = useState(mobileBatchSize);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const dogOfDay = useMemo(() => pickDogOfTheDay(spotlightPets), [spotlightPets]);
  const visiblePets = useMemo(
    () => sortGalleryPets(filterByQuickFilter(pets, quickFilter), sort),
    [pets, quickFilter, sort],
  );
  const renderedPets = visiblePets.slice(0, visibleCount);

  useEffect(() => {
    const isMobile =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(max-width: 639px)").matches;
    setVisibleCount(isMobile ? mobileBatchSize : visiblePets.length);
  }, [visiblePets.length]);

  useEffect(() => {
    if (visibleCount >= visiblePets.length || !sentinelRef.current) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setVisibleCount((count) => Math.min(count + mobileBatchSize, visiblePets.length));
      }
    });

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [visibleCount, visiblePets.length]);

  return (
    <section className="w-full space-y-5 py-5 sm:py-7">
      <DogOfDaySpotlight
        pet={dogOfDay}
        saved={dogOfDay ? isSaved(dogOfDay.id) : false}
        onToggleSave={onToggleSave}
      />

      <div className="rounded-lg border border-white/70 bg-card/90 p-4 shadow-[0_24px_70px_hsl(var(--shadow-soft)_/_0.16)] ring-1 ring-border/50 backdrop-blur-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-black text-foreground">{appCopy.gallery.title}</h2>
            <p className="mt-1 text-sm font-semibold text-muted-foreground">
              {visiblePets.length} {appCopy.gallery.subtitle}
            </p>
          </div>
          <label className="grid gap-1 text-sm font-black text-foreground sm:w-56">
            {appCopy.gallery.sortLabel}
            <Select
              value={sort}
              onChange={(event) => setSort(event.target.value as GallerySort)}
            >
              <option value="recommended">{appCopy.gallery.recommended}</option>
              <option value="longestWaiting">{appCopy.gallery.longestWaiting}</option>
              <option value="newestCapture">{appCopy.gallery.newestCapture}</option>
              <option value="recentlyAdded">{appCopy.gallery.recentlyAdded}</option>
            </Select>
          </label>
        </div>

        <div
          aria-label={appCopy.gallery.quickFilters}
          className="mt-4 flex gap-2 overflow-x-auto pb-1"
        >
          {quickFilters.map((filter) => {
            const active = quickFilter === filter.value;

            return (
              <button
                key={filter.value}
                type="button"
                aria-pressed={active}
                onClick={() => setQuickFilter(active ? null : filter.value)}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-2 text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "border-primary bg-primary text-primary-foreground shadow-primary"
                    : "border-border/70 bg-card/90 text-muted-foreground shadow-sm hover:border-primary/45 hover:text-foreground",
                )}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {visiblePets.length === 0 ? (
        <div className="rounded-lg border border-white/70 bg-card/90 p-6 text-center shadow-[0_24px_70px_hsl(var(--shadow-soft)_/_0.14)] ring-1 ring-border/50 backdrop-blur-sm">
          <h2 className="text-xl font-black text-foreground">{appCopy.deck.emptyTitle}</h2>
          <p className="mt-2 text-sm font-semibold text-muted-foreground">
            {appCopy.deck.emptyBody}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {renderedPets.map((pet) => (
              <GalleryPetCard
                key={pet.id}
                pet={pet}
                saved={isSaved(pet.id)}
                onToggleSave={onToggleSave}
              />
            ))}
          </div>
          {visibleCount < visiblePets.length ? (
            <div
              ref={sentinelRef}
              className="py-5 text-center text-sm font-black text-muted-foreground"
            >
              {appCopy.gallery.loadingMore}
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
