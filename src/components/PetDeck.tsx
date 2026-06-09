"use client";

import { useMotionValue } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import React from "react";

import { appCopy } from "@/content/ro";
import { DeckBackground } from "@/components/pet-deck/DeckBackground";
import { DeckHeader } from "@/components/pet-deck/DeckHeader";
import { EmptyDeck } from "@/components/pet-deck/EmptyDeck";
import { FiltersPanel } from "@/components/pet-deck/FiltersPanel";
import { MatchDialog } from "@/components/pet-deck/MatchDialog";
import { PetCardView } from "@/components/pet-deck/PetCardView";
import { ShortlistDrawer } from "@/components/pet-deck/ShortlistDrawer";
import { formatSync } from "@/components/pet-deck/petProfile";
import {
  type Filters,
  initialFilters,
  shortlistStorageKey,
} from "@/components/pet-deck/types";
import { filterPetCards } from "@/lib/pets/filter";
import type { LatestSync, PetCard } from "@/lib/pets/types";

type PetDeckProps = {
  initialPets: PetCard[];
  latestRun: LatestSync;
};

export function PetDeck({ initialPets, latestRun }: PetDeckProps) {
  const cardDragX = useMotionValue(0);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shortlistIds, setShortlistIds] = useState<string[]>([]);
  const [matchedPet, setMatchedPet] = useState<PetCard | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isShortlistOpen, setIsShortlistOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
  const petsById = useMemo(
    () => new Map(initialPets.map((pet) => [pet.id, pet] as const)),
    [initialPets],
  );
  const shortlistedPets = shortlistIds
    .map((id) => petsById.get(id))
    .filter((pet): pet is PetCard => Boolean(pet));

  useEffect(() => {
    cardDragX.set(0);
  }, [cardDragX, currentPet?.id]);

  useEffect(() => {
    const storedShortlist = readStoredShortlist();

    if (storedShortlist) {
      setShortlistIds(storedShortlist);
    }
  }, []);

  function updateFilters(nextFilters: Filters) {
    setFilters(nextFilters);
    setCurrentIndex(0);
  }

  function persistShortlist(nextIds: string[]) {
    setShortlistIds(nextIds);

    try {
      window.localStorage.setItem(shortlistStorageKey, JSON.stringify(nextIds));
    } catch {
      // Keep the in-memory shortlist usable if browser storage is unavailable.
    }
  }

  function likeCurrentPet() {
    if (!currentPet) {
      return;
    }

    if (!shortlistIds.includes(currentPet.id)) {
      persistShortlist([...shortlistIds, currentPet.id]);
    }

    setMatchedPet(currentPet);
  }

  function showNextPet() {
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

  function removeFromShortlist(id: string) {
    persistShortlist(shortlistIds.filter((shortlistId) => shortlistId !== id));
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

        <section className="flex flex-1 items-start justify-center py-5 sm:items-center sm:py-7">
          {currentPet ? (
            <div className="w-full max-w-[450px]">
              <PetCardView
                pet={currentPet}
                dragX={cardDragX}
                onLike={likeCurrentPet}
                onNext={showNextPet}
              />
            </div>
          ) : (
            <EmptyDeck />
          )}
        </section>

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

function readStoredShortlist(): string[] | null {
  const stored = window.localStorage.getItem(shortlistStorageKey);

  if (!stored) {
    return null;
  }

  try {
    const parsed = JSON.parse(stored) as unknown;

    if (Array.isArray(parsed) && parsed.every((id) => typeof id === "string")) {
      return parsed;
    }
  } catch {
    // Clear corrupt data so future visits start cleanly.
  }

  window.localStorage.removeItem(shortlistStorageKey);
  return null;
}
