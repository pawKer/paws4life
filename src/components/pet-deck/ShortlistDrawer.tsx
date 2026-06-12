"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { HeartMinus as Trash2, X } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

import { appCopy } from "@/content/ro";
import { AdoptionInfo } from "@/components/pet-deck/AdoptionInfo";
import { IconButton } from "@/components/ui/button";
import { buildPetProfile } from "@/components/pet-deck/petProfile";
import { SourceLinkButton } from "@/components/pet-deck/SourceLinkButton";
import { buildPetPath } from "@/lib/pets/gallery";
import type { PetCard } from "@/lib/pets/types";
import { cn } from "@/lib/ui/classNames";

const previewHeight = 288;
const previewViewportPadding = 16;

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
  const [preview, setPreview] = useState<{
    imageUrl: string;
    top: number;
  } | null>(null);

  function showPreview(
    imageUrl: string,
    target: HTMLElement,
  ) {
    const rect = target.getBoundingClientRect();
    const centeredTop = rect.top + rect.height / 2;
    const viewportHeight = window.innerHeight || previewHeight;
    const minTop = previewHeight / 2 + previewViewportPadding;
    const maxTop = Math.max(
      minTop,
      viewportHeight - previewHeight / 2 - previewViewportPadding,
    );

    setPreview({
      imageUrl,
      top: Math.min(Math.max(centeredTop, minTop), maxTop),
    });
  }

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
          {preview ? (
            <div
              aria-hidden="true"
              data-testid="shortlist-image-preview"
              style={{ top: preview.top }}
              className="pointer-events-none fixed left-1/2 z-[60] hidden h-72 w-56 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg border-2 border-card bg-card shadow-2xl md:left-auto md:right-[calc(min(100vw-1.5rem,24rem)+2rem)] md:block md:translate-x-0"
            >
              <img
                src={preview.imageUrl}
                alt=""
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}

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
                const imageUrl = pet.imageUrl;

                return (
                  <article
                    key={pet.id}
                    className="rounded-lg border border-border bg-card p-3"
                  >
                    <div
                      className={cn(
                        "grid items-start gap-x-3 gap-y-2",
                        imageUrl
                          ? "grid-cols-[4rem_minmax(0,1fr)_auto]"
                          : "grid-cols-[minmax(0,1fr)_auto]",
                      )}
                    >
                      {imageUrl ? (
                        <a
                          href={`/pets/${pet.id}`}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`${appCopy.app.sourceLink} ${pet.registryNumber}`}
                          onMouseEnter={(event) =>
                            showPreview(imageUrl, event.currentTarget)
                          }
                          onMouseLeave={() => setPreview(null)}
                          onFocus={(event) =>
                            showPreview(imageUrl, event.currentTarget)
                          }
                          onBlur={() => setPreview(null)}
                          className="relative z-10 col-start-1 row-span-3 block h-20 w-16 shrink-0 self-start rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                        >
                          <img
                            src={imageUrl}
                            alt={`${appCopy.status.imageAltPrefix} ${pet.registryNumber}`}
                            loading="lazy"
                            decoding="async"
                            className="h-20 w-16 rounded-md object-cover shadow-sm transition motion-safe:hover:brightness-105 motion-reduce:transition-none"
                          />
                        </a>
                      ) : null}

                      <IconButton
                        label={appCopy.shortlist.remove}
                        tone="danger"
                        onClick={() => onRemove(pet.id)}
                        className={cn(
                          "col-start-3 row-start-1 h-8 w-8",
                          !imageUrl && "col-start-2",
                        )}
                      >
                        <Trash2 className="h-4 w-4" />
                      </IconButton>

                      <div
                        className={cn(
                          "col-start-2 row-start-1 min-w-0",
                          !imageUrl && "col-start-1",
                        )}
                      >
                        <Link
                          href={buildPetPath(pet)}
                          className="block truncate font-black text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {profile.name}
                        </Link>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2">
                          <p className="text-xs font-black uppercase tracking-[0.08em] text-muted-foreground">
                            {appCopy.deck.registryPrefix} {pet.registryNumber}
                          </p>
                          {!pet.isAvailable ? (
                            <span className="rounded-md bg-accent px-2 py-1 text-xs font-black text-accent-foreground">
                              {appCopy.deck.unavailable}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <p
                        className={cn(
                          "col-start-2 row-start-2 text-sm font-semibold text-muted-foreground",
                          !imageUrl && "col-start-1",
                        )}
                      >
                        {pet.captureLocation}
                      </p>

                      <SourceLinkButton
                        href={pet.sourceUrl}
                        className={cn(
                          "col-start-2 row-start-3 mt-0",
                          !imageUrl && "col-start-1",
                        )}
                      />
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
