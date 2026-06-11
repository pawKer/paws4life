"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import React from "react";

import { appCopy } from "@/content/ro";
import { cn } from "@/lib/ui/classNames";

type SwipeHintProps = {
  direction: "left" | "right";
  className?: string;
};

export function SwipeHint({ direction, className }: SwipeHintProps) {
  const isLeft = direction === "left";
  const Icon = isLeft ? ArrowLeft : ArrowRight;

  return (
    <div
      className={cn(
        "pointer-events-none flex w-full max-w-[8rem] select-none flex-col items-center gap-1 text-center",
        className,
      )}
    >
      <span className="block text-[11px] font-black uppercase tracking-[0.08em] text-muted-foreground">
        {isLeft ? appCopy.deck.swipeLeft : appCopy.deck.swipeRight}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/70 bg-card/85 shadow-sm ring-1 ring-border/45 backdrop-blur-sm",
          isLeft ? "swipe-hint-left text-success" : "swipe-hint-right text-primary",
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
    </div>
  );
}
