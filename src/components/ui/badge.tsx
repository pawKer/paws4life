import type { ReactNode } from "react";
import React from "react";

import { cn } from "@/lib/ui/classNames";

export function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "max-w-full truncate rounded-full border border-border bg-muted/65 px-3 py-2 text-xs font-black text-accent-foreground shadow-sm",
        className,
      )}
    >
      {children}
    </span>
  );
}
