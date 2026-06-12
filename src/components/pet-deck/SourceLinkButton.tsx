import { ExternalLink } from "lucide-react";
import React from "react";

import { appCopy } from "@/content/ro";
import { cn } from "@/lib/ui/classNames";

type SourceLinkButtonProps = {
  href: string;
  className?: string;
};

export function SourceLinkButton({ href, className }: SourceLinkButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-md border border-secondary/35 bg-card/95 px-4 text-sm font-black text-secondary-foreground shadow-sm transition hover:bg-secondary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      {appCopy.app.sourceLink}
      <ExternalLink className="h-4 w-4" />
    </a>
  );
}
