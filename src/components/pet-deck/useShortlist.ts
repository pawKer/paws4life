"use client";

import { useEffect, useMemo, useState } from "react";

import { shortlistStorageKey } from "@/components/pet-deck/types";
import type { PetCard } from "@/lib/pets/types";

export function useShortlist(pets: PetCard[]) {
  const [shortlistIds, setShortlistIds] = useState<string[]>([]);
  const petsById = useMemo(
    () => new Map(pets.map((pet) => [pet.id, pet] as const)),
    [pets],
  );
  const shortlistedPets = shortlistIds
    .map((id) => petsById.get(id))
    .filter((pet): pet is PetCard => Boolean(pet));

  useEffect(() => {
    const storedShortlist = readStoredShortlist();

    if (storedShortlist) {
      setShortlistIds(storedShortlist);
    }
  }, []);

  function persistShortlist(nextIds: string[]) {
    setShortlistIds(nextIds);

    try {
      window.localStorage.setItem(shortlistStorageKey, JSON.stringify(nextIds));
    } catch {
      // Keep the in-memory shortlist usable if browser storage is unavailable.
    }
  }

  function addToShortlist(id: string) {
    if (!shortlistIds.includes(id)) {
      persistShortlist([...shortlistIds, id]);
    }
  }

  function removeFromShortlist(id: string) {
    persistShortlist(shortlistIds.filter((shortlistId) => shortlistId !== id));
  }

  function toggleShortlist(id: string) {
    if (shortlistIds.includes(id)) {
      removeFromShortlist(id);
      return;
    }

    persistShortlist([...shortlistIds, id]);
  }

  function isShortlisted(id: string) {
    return shortlistIds.includes(id);
  }

  return {
    shortlistIds,
    shortlistedPets,
    addToShortlist,
    removeFromShortlist,
    toggleShortlist,
    isShortlisted,
  };
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
