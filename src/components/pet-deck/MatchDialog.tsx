"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Heart } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useEffect } from "react";
import React from "react";

import { appCopy } from "@/content/ro";
import { AdoptionInfo } from "@/components/pet-deck/AdoptionInfo";
import { Button } from "@/components/ui/button";
import type { PetCard } from "@/lib/pets/types";

const confettiColorTokens = [
  "--primary",
  "--accent",
  "--success",
  "--secondary",
  "--info",
];
const confettiFallbackColors = [
  "hsl(7 91% 69%)",
  "hsl(45 100% 70%)",
  "hsl(145 42% 48%)",
  "hsl(176 54% 45%)",
  "hsl(204 95% 59%)",
];

function getConfettiColors() {
  if (typeof window === "undefined") {
    return confettiFallbackColors;
  }

  const styles = window.getComputedStyle(document.documentElement);
  const colors = confettiColorTokens
    .map((token) => styles.getPropertyValue(token).trim())
    .filter(Boolean)
    .map((value) => `hsl(${value})`);

  return colors.length > 0 ? colors : confettiFallbackColors;
}

type MatchDialogProps = {
  pet: PetCard | null;
  onClose: () => void;
};

export function MatchDialog({ pet, onClose }: MatchDialogProps) {
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!pet || shouldReduceMotion || process.env.NODE_ENV === "test") {
      return;
    }

    let isMounted = true;

    void import("canvas-confetti").then(({ default: confetti }) => {
      if (!isMounted) {
        return;
      }

      const confettiColors = getConfettiColors();

      void confetti({
        particleCount: 84,
        spread: 72,
        startVelocity: 34,
        origin: { y: 0.58 },
        colors: confettiColors,
      });
      void confetti({
        particleCount: 34,
        angle: 60,
        spread: 48,
        origin: { x: 0.12, y: 0.76 },
        colors: confettiColors,
      });
      void confetti({
        particleCount: 34,
        angle: 120,
        spread: 48,
        origin: { x: 0.88, y: 0.76 },
        colors: confettiColors,
      });
    });

    return () => {
      isMounted = false;
    };
  }, [pet, shouldReduceMotion]);

  return (
    <Dialog.Root
      open={Boolean(pet)}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
    >
      {pet ? (
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-foreground/45" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-lg border-2 border-accent bg-popover p-6 text-center shadow-2xl">
            <div
              aria-hidden="true"
              data-testid="match-confetti"
              className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(180deg,hsl(var(--accent)_/_0.24)_0%,hsl(var(--accent)_/_0)_46%)]"
            />
            <div className="relative z-10">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-primary">
                <Heart className="h-7 w-7 fill-current" />
              </div>
              <p className="mt-4 text-sm font-black uppercase tracking-[0.12em] text-primary">
                {pet.registryNumber}
              </p>
              <Dialog.Title asChild>
                <h2 className="mt-2 text-3xl font-black text-foreground">
                  {appCopy.match.title}
                </h2>
              </Dialog.Title>
              <Dialog.Description className="mt-3 font-semibold text-muted-foreground">
                {appCopy.match.body}
              </Dialog.Description>
              <AdoptionInfo className="mt-5 text-center" />
              <Dialog.Close asChild>
                <Button variant="primary" className="mt-4 px-5">
                  {appCopy.match.close}
                </Button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      ) : null}
    </Dialog.Root>
  );
}
