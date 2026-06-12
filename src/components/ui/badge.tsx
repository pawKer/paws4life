import type { ReactNode } from "react";
import React from "react";

import { cn } from "@/lib/ui/classNames";

type PillTone = "default" | "bio";

const pillTones: Record<PillTone, string> = {
  default: "border-border bg-muted/65 text-accent-foreground",
  bio: "border-border/70 bg-muted/25 text-card-foreground",
};

export function Pill({
  children,
  className,
  tone = "default",
}: {
  children: ReactNode;
  className?: string;
  tone?: PillTone;
}) {
  return (
    <span
      className={cn(
        "max-w-full truncate rounded-full border px-3 py-2 text-xs font-black shadow-sm",
        pillTones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
