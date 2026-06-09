"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Trash2, X } from "lucide-react";
import React from "react";

import { appCopy } from "@/content/ro";
import { AdoptionInfo } from "@/components/pet-deck/AdoptionInfo";
import { Button, IconButton } from "@/components/ui/button";
import { buildPetProfile } from "@/components/pet-deck/petProfile";
import type { PetCard } from "@/lib/pets/types";

type ShortlistDrawerProps = {
  pets: PetCard[];
  open: boolean;
  onClose: () => void;
  onRemove: (id: string) => void;
};

export function ShortlistDrawer({
  pets,
  open,
  onClose,
  onRemove,
}: ShortlistDrawerProps) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-foreground/25" />
        <Dialog.Content className="fixed inset-y-3 right-3 z-50 flex w-[calc(100vw-1.5rem)] max-w-sm flex-col rounded-lg border-2 border-accent bg-popover p-4 shadow-2xl">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <Dialog.Title asChild>
                <h2 className="text-xl font-black text-foreground">
                  {appCopy.shortlist.title}
                </h2>
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm font-bold text-muted-foreground">
                {pets.length} {appCopy.shortlist.countSuffix}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <IconButton label={appCopy.shortlist.close} className="h-9 w-9">
                <X className="h-4 w-4" />
              </IconButton>
            </Dialog.Close>
          </div>

          <AdoptionInfo className="mb-4" />

          {pets.length === 0 ? (
            <p className="text-sm leading-6 text-muted-foreground">
              {appCopy.shortlist.empty}
            </p>
          ) : (
            <div className="space-y-3 overflow-auto pr-1">
              {pets.map((pet) => {
                const profile = buildPetProfile(pet);

                return (
                  <article
                    key={pet.id}
                    className="rounded-lg border border-border bg-card p-3"
                  >
                    <div className="flex gap-3">
                      {pet.imageUrl ? (
                        <a
                          href={pet.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`${appCopy.app.sourceLink} ${pet.registryNumber}`}
                          className="group/preview relative z-10 block h-20 w-16 shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                        >
                          <img
                            src={pet.imageUrl}
                            alt={`${appCopy.status.imageAltPrefix} ${pet.registryNumber}`}
                            loading="lazy"
                            decoding="async"
                            className="h-20 w-16 origin-top-left rounded-md object-cover shadow-sm transition motion-safe:group-hover/preview:scale-[2.15] motion-safe:group-hover/preview:shadow-2xl motion-safe:group-focus-visible/preview:scale-[2.15] motion-safe:group-focus-visible/preview:shadow-2xl motion-reduce:transition-none"
                          />
                        </a>
                      ) : null}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <a
                              href={pet.sourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="block truncate font-black text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              {profile.name}
                            </a>
                            <p className="mt-0.5 text-xs font-black uppercase tracking-[0.08em] text-muted-foreground">
                              {appCopy.deck.registryPrefix} {pet.registryNumber}
                            </p>
                          </div>
                          {!pet.isAvailable ? (
                            <span className="shrink-0 rounded-md bg-accent px-2 py-1 text-xs font-black text-accent-foreground">
                              {appCopy.deck.unavailable}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-sm font-semibold text-muted-foreground">
                          {pet.captureLocation}
                        </p>
                        <a
                          href={pet.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-block text-sm font-black text-success underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {appCopy.app.sourceLink}
                        </a>
                        <Button
                          variant="danger"
                          onClick={() => onRemove(pet.id)}
                          icon={<Trash2 className="h-4 w-4" />}
                          className="mt-2 h-auto px-0"
                        >
                          {appCopy.shortlist.remove}
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
