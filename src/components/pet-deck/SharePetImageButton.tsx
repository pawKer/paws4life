"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Image, Link2, Share2, Smartphone, X } from "lucide-react";
import { useState } from "react";
import React from "react";

import { appCopy } from "@/content/ro";
import { buildPetProfile } from "@/components/pet-deck/petProfile";
import { Button, IconButton } from "@/components/ui/button";
import { buildPetPath } from "@/lib/pets/gallery";
import {
  buildGeneratedPetShareImageFilename,
  buildGeneratedPetShareImagePath,
  type PetShareImageVariant,
} from "@/lib/pets/share-images";
import type { PetCard } from "@/lib/pets/types";

type SharePetImageButtonProps = {
  pet: PetCard;
  kind?: "icon" | "button";
  className?: string;
};

export function SharePetImageButton({
  pet,
  kind = "icon",
  className,
}: SharePetImageButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [activeAction, setActiveAction] = useState<"link" | PetShareImageVariant | null>(
    null,
  );
  const profile = buildPetProfile(pet);

  async function sharePetImage(variant: PetShareImageVariant) {
    if (isSharing) {
      return;
    }

    if (!pet.shareImagesGeneratedAt) {
      setActiveAction(variant);
      showStatus(appCopy.gallery.shareUnavailable);
      return;
    }

    setIsSharing(true);
    setActiveAction(variant);
    setShareStatus(appCopy.gallery.sharePreparing);

    try {
      const imagePath = buildGeneratedPetShareImagePath(pet, variant);
      const filename = buildGeneratedPetShareImageFilename(pet, variant);
      const response = await fetch(imagePath);

      if (!response.ok) {
        throw new Error("Share image request failed");
      }

      const sourceBlob = await response.blob();
      const imageBlob =
        sourceBlob.type === "image/png"
          ? sourceBlob
          : new Blob([sourceBlob], { type: "image/png" });
      const file = new File([imageBlob], filename, {
        type: "image/png",
      });
      const shareData: ShareData = {
        files: [file],
        title: `${profile.name} - ${appCopy.app.name}`,
        text: appCopy.deck.lookingFor,
      };

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share(shareData);
        setIsOpen(false);
        showStatus(appCopy.gallery.shareDone);
        return;
      }

      downloadBlob(imageBlob, file.name);
      setIsOpen(false);
      showStatus(appCopy.gallery.downloaded);
    } catch {
      showStatus(appCopy.gallery.shareUnavailable);
    } finally {
      setIsSharing(false);
      setActiveAction(null);
    }
  }

  async function sharePetLink() {
    if (isSharing) {
      return;
    }

    setIsSharing(true);
    setActiveAction("link");
    setShareStatus(appCopy.gallery.shareLinkPreparing);

    const url = new URL(buildPetPath(pet), window.location.href).toString();
    const shareData: ShareData = {
      title: `${profile.name} - ${appCopy.app.name}`,
      text: appCopy.deck.lookingFor,
      url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setIsOpen(false);
        showStatus(appCopy.gallery.shareDone);
        return;
      }

      await navigator.clipboard.writeText(url);
      setIsOpen(false);
      showStatus(appCopy.gallery.copied);
    } catch {
      showStatus(appCopy.gallery.shareUnavailable);
    } finally {
      setIsSharing(false);
      setActiveAction(null);
    }
  }

  function showStatus(nextStatus: string) {
    setShareStatus(nextStatus);
    window.setTimeout(() => setShareStatus(null), 2200);
  }

  const triggerButton =
    kind === "button" ? (
      <Button
        disabled={isSharing}
        icon={<Share2 className="h-4 w-4" />}
        className={className}
      >
        {shareStatus ?? appCopy.gallery.share}
      </Button>
    ) : (
      <IconButton
        label={shareStatus ?? appCopy.gallery.share}
        disabled={isSharing}
        tone="secondary"
        className={className}
      >
        <Share2 className="h-5 w-5" />
      </IconButton>
    );

  return (
    <div className="relative">
      {kind === "icon" && shareStatus ? (
        <span
          role="status"
          className="absolute bottom-[calc(100%+0.45rem)] right-0 z-20 whitespace-nowrap rounded-full border border-white/70 bg-foreground px-3 py-1 text-xs font-black text-background shadow-gentle ring-1 ring-border/45"
        >
          {shareStatus}
        </span>
      ) : null}
      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Trigger asChild>{triggerButton}</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-foreground/40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border-2 border-accent bg-popover p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Dialog.Title className="text-lg font-black text-foreground">
                  {appCopy.gallery.shareDialogTitle}
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-sm font-semibold leading-6 text-muted-foreground">
                  {appCopy.gallery.shareDialogDescription}
                </Dialog.Description>
              </div>
              <Dialog.Close
                aria-label={appCopy.app.menuClose}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-card text-muted-foreground transition hover:bg-secondary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <X className="h-4 w-4" />
              </Dialog.Close>
            </div>

            <div className="mt-5 grid gap-3">
              <Button
                onClick={sharePetLink}
                disabled={isSharing}
                icon={<Link2 className="h-4 w-4" />}
                className="w-full justify-start"
              >
                {activeAction === "link" && shareStatus
                  ? shareStatus
                  : appCopy.gallery.shareLink}
              </Button>
              <Button
                onClick={() => sharePetImage("profile")}
                disabled={isSharing}
                icon={<Image className="h-4 w-4" />}
                className="w-full justify-start"
              >
                {activeAction === "profile" && shareStatus
                  ? shareStatus
                  : appCopy.gallery.shareProfileImage}
              </Button>
              <Button
                onClick={() => sharePetImage("story")}
                disabled={isSharing}
                icon={<Smartphone className="h-4 w-4" />}
                className="w-full justify-start"
              >
                {activeAction === "story" && shareStatus
                  ? shareStatus
                  : appCopy.gallery.shareStory}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
