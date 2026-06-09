import { appCopy } from "@/content/ro";
import React from "react";

export function EmptyDeck() {
  return (
    <div className="max-w-md rounded-lg border border-accent bg-card p-6 text-center shadow-panel">
      <h2 className="text-xl font-black">{appCopy.deck.emptyTitle}</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {appCopy.deck.emptyBody}
      </p>
    </div>
  );
}
