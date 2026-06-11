"use client";

import { useMotionValue } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import React from "react";

import { appCopy } from "@/content/ro";
import { DeckBackground } from "@/components/pet-deck/DeckBackground";
import { DeckHeader } from "@/components/pet-deck/DeckHeader";
import { EmptyDeck } from "@/components/pet-deck/EmptyDeck";
import { FiltersPanel } from "@/components/pet-deck/FiltersPanel";
import { GalleryView } from "@/components/pet-deck/GalleryView";
import { MatchDialog } from "@/components/pet-deck/MatchDialog";
import { PetCardView } from "@/components/pet-deck/PetCardView";
import { ShortlistDrawer } from "@/components/pet-deck/ShortlistDrawer";
import { SwipeHint } from "@/components/pet-deck/SwipeHint";
import { formatSync } from "@/components/pet-deck/petProfile";
import { useShortlist } from "@/components/pet-deck/useShortlist";
import {
  type BrowseView,
  type Filters,
  initialFilters,
} from "@/components/pet-deck/types";
import { filterPetCards } from "@/lib/pets/filter";
import type { LatestSync, PetCard } from "@/lib/pets/types";
import { cn } from "@/lib/ui/classNames";

type PetDeckProps = {
  initialPets: PetCard[];
  latestRun: LatestSync;
  initialView?: BrowseView;
};

export function PetDeck({ initialPets, latestRun, initialView }: PetDeckProps) {
  const pathname = usePathname();
  const currentView: BrowseView =
    initialView ?? (pathname === "/gallery" ? "gallery" : "deck");
  const cardDragX = useMotionValue(0);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchedPet, setMatchedPet] = useState<PetCard | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isShortlistOpen, setIsShortlistOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSwipeHints, setShowSwipeHints] = useState(true);
  const {
    shortlistedPets,
    addToShortlist,
    removeFromShortlist,
    toggleShortlist,
    isShortlisted,
  } = useShortlist(initialPets);

  const availablePets = useMemo(
    () => initialPets.filter((pet) => pet.isAvailable),
    [initialPets],
  );
  const filteredPets = useMemo(
    () => filterPetCards(availablePets, filters),
    [availablePets, filters],
  );
  const currentPet =
    filteredPets[currentIndex % Math.max(filteredPets.length, 1)] ?? null;
  useEffect(() => {
    cardDragX.set(0);
  }, [cardDragX, currentPet?.id]);

  useEffect(() => {
    if (currentView !== "deck" || !showSwipeHints) {
      return;
    }

    const hideHints = () => setShowSwipeHints(false);
    const options = { once: true } as AddEventListenerOptions;

    window.addEventListener("pointerdown", hideHints, options);
    window.addEventListener("keydown", hideHints, options);
    window.addEventListener("wheel", hideHints, options);
    window.addEventListener("touchstart", hideHints, options);

    return () => {
      window.removeEventListener("pointerdown", hideHints);
      window.removeEventListener("keydown", hideHints);
      window.removeEventListener("wheel", hideHints);
      window.removeEventListener("touchstart", hideHints);
    };
  }, [currentView, showSwipeHints]);

  function updateFilters(nextFilters: Filters) {
    setFilters(nextFilters);
    setCurrentIndex(0);
  }

  function likeCurrentPet() {
    if (!currentPet) {
      return;
    }

    setShowSwipeHints(false);
    addToShortlist(currentPet.id);

    setMatchedPet(currentPet);
  }

  function showNextPet() {
    setShowSwipeHints(false);

    if (filteredPets.length > 0) {
      setCurrentIndex((index) => (index + 1) % filteredPets.length);
    }
  }

  function closeMatch() {
    setMatchedPet(null);
    showNextPet();
  }

  function openFiltersFromMenu() {
    setIsFiltersOpen(true);
    setIsMobileMenuOpen(false);
  }

  function openShortlist() {
    setIsShortlistOpen(true);
    setIsMobileMenuOpen(false);
  }

  return (
    <main
      data-testid="pet-deck-root"
      data-theme="playful-adoption-pass"
      className="relative min-h-dvh overflow-x-hidden bg-background text-foreground"
    >
      <DeckBackground dragX={cardDragX} />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-4 sm:px-6 sm:py-5">
        <DeckHeader
          currentView={currentView}
          shortlistCount={shortlistedPets.length}
          isFiltersOpen={isFiltersOpen}
          isShortlistOpen={isShortlistOpen}
          isMobileMenuOpen={isMobileMenuOpen}
          onToggleFilters={() => setIsFiltersOpen((value) => !value)}
          onOpenFilters={openFiltersFromMenu}
          onOpenShortlist={openShortlist}
          onToggleMobileMenu={() => setIsMobileMenuOpen((value) => !value)}
          onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
        />

        {isFiltersOpen ? (
          <>
            <div
              aria-hidden="true"
              data-testid="filters-dismiss-layer"
              className="fixed inset-0 z-20"
              onClick={() => setIsFiltersOpen(false)}
            />
            <div className="fixed inset-x-4 top-24 z-30 mx-auto max-w-3xl sm:top-28">
              <FiltersPanel
                filters={filters}
                onChange={updateFilters}
                onClose={() => setIsFiltersOpen(false)}
              />
            </div>
          </>
        ) : null}

        {currentView === "gallery" ? (
          <GalleryView
            pets={filteredPets}
            spotlightPets={availablePets}
            onToggleSave={toggleShortlist}
            isSaved={isShortlisted}
          />
        ) : (
          <section className="flex flex-1 items-start justify-center py-5 sm:items-center sm:py-7">
            {currentPet ? (
              <div className="grid w-full max-w-5xl grid-cols-2 items-center gap-3 sm:grid-cols-[minmax(8rem,1fr)_minmax(0,450px)_minmax(8rem,1fr)] sm:gap-5">
                {showSwipeHints ? (
                  <SwipeHint
                    direction="left"
                    className="col-start-1 row-start-1 justify-self-start sm:col-start-1 sm:row-start-1 sm:justify-self-end"
                  />
                ) : null}
                <div
                  className={cn(
                    "w-full max-w-[450px] justify-self-center",
                    showSwipeHints
                      ? "col-span-2 col-start-1 row-start-2 sm:col-span-1 sm:col-start-2 sm:row-start-1"
                      : "col-span-2 col-start-1 row-start-1 sm:col-span-1 sm:col-start-2",
                  )}
                >
                  <PetCardView
                    pet={currentPet}
                    dragX={cardDragX}
                    onLike={likeCurrentPet}
                    onNext={showNextPet}
                  />
                </div>
                {showSwipeHints ? (
                  <SwipeHint
                    direction="right"
                    className="col-start-2 row-start-1 justify-self-end sm:col-start-3 sm:row-start-1 sm:justify-self-start"
                  />
                ) : null}
              </div>
            ) : (
              <EmptyDeck />
            )}
          </section>
        )}

        <footer className="pb-3 text-center text-xs font-bold text-muted-foreground">
          {appCopy.app.lastSyncPrefix}: {formatSync(latestRun)}
        </footer>
      </div>

      <ShortlistDrawer
        pets={shortlistedPets}
        open={isShortlistOpen}
        onClose={() => setIsShortlistOpen(false)}
        onRemove={removeFromShortlist}
      />

      <MatchDialog pet={matchedPet} onClose={closeMatch} />
    </main>
  );
}
