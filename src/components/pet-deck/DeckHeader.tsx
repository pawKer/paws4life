"use client";

import { GalleryHorizontalEnd, Heart, Layers3, Menu, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import React from "react";

import { appCopy } from "@/content/ro";
import { Button, IconButton } from "@/components/ui/button";
import { useCompactHeader } from "@/components/pet-deck/useCompactHeader";
import type { BrowseView } from "@/components/pet-deck/types";

type DeckHeaderProps = {
  currentView: BrowseView;
  shortlistCount: number;
  isFiltersOpen: boolean;
  isShortlistOpen: boolean;
  isMobileMenuOpen: boolean;
  onToggleFilters: () => void;
  onOpenFilters: () => void;
  onOpenShortlist: () => void;
  onToggleMobileMenu: () => void;
  onCloseMobileMenu: () => void;
};

export function DeckHeader({
  currentView,
  shortlistCount,
  isFiltersOpen,
  isShortlistOpen,
  isMobileMenuOpen,
  onToggleFilters,
  onOpenFilters,
  onOpenShortlist,
  onToggleMobileMenu,
  onCloseMobileMenu,
}: DeckHeaderProps) {
  const isCompactHeader = useCompactHeader();

  useEffect(() => {
    if (!isCompactHeader && isMobileMenuOpen) {
      onCloseMobileMenu();
    }
  }, [isCompactHeader, isMobileMenuOpen, onCloseMobileMenu]);

  return (
    <header className="relative z-30">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div
          className={
            isCompactHeader
              ? "min-w-0 flex-1"
              : "min-w-0 basis-[min(30rem,100%)] flex-1"
          }
        >
          <p
            className={
              isCompactHeader
                ? "sr-only"
                : "text-xs font-black uppercase tracking-[0.14em] text-success"
            }
          >
            {appCopy.app.eyebrow}
          </p>
          <h1
            className={
              isCompactHeader
                ? "truncate text-xl font-black text-foreground"
                : "mt-1 max-w-full text-balance break-words text-2xl font-black leading-tight text-foreground sm:text-3xl"
            }
          >
            {appCopy.app.name}
          </h1>
          <p
            className={
              isCompactHeader
                ? "sr-only"
                : "mt-1 max-w-prose text-sm font-semibold leading-snug text-muted-foreground"
            }
          >
            {appCopy.app.tagline}
          </p>
        </div>

        {isCompactHeader ? (
          <div className="flex shrink-0 items-center gap-2">
            <IconButton
              label={`${appCopy.shortlist.open} ${shortlistCount}`}
              aria-expanded={isShortlistOpen}
              onClick={onOpenShortlist}
              tone="primary"
              badge={shortlistCount}
            >
              <Heart className="h-5 w-5 fill-current" />
            </IconButton>
            <IconButton
              label={isMobileMenuOpen ? appCopy.app.menuClose : appCopy.app.menuOpen}
              aria-expanded={isMobileMenuOpen}
              onClick={onToggleMobileMenu}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </IconButton>
          </div>
        ) : (
          <div className="ml-auto flex shrink-0 flex-wrap items-center justify-end gap-2">
            <Button
              aria-label={appCopy.filters.open}
              aria-expanded={isFiltersOpen}
              icon={<SlidersHorizontal className="h-4 w-4" />}
              onClick={onToggleFilters}
            >
              {appCopy.filters.open}
            </Button>
            <div className="flex rounded-lg border border-border bg-card/90 p-1 shadow-sm">
              <Link
                href="/"
                aria-current={currentView === "deck" ? "page" : undefined}
                className={
                  currentView === "deck"
                    ? "inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-black text-primary-foreground shadow-sm"
                    : "inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-black text-muted-foreground transition hover:bg-muted/60 hover:text-foreground"
                }
              >
                <Layers3 className="h-4 w-4" />
                {appCopy.app.deckView}
              </Link>
              <Link
                href="/gallery"
                aria-current={currentView === "gallery" ? "page" : undefined}
                className={
                  currentView === "gallery"
                    ? "inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-black text-primary-foreground shadow-sm"
                    : "inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-black text-muted-foreground transition hover:bg-muted/60 hover:text-foreground"
                }
              >
                <GalleryHorizontalEnd className="h-4 w-4" />
                {appCopy.app.galleryView}
              </Link>
            </div>
            <Button
              variant="primary"
              aria-label={`${appCopy.shortlist.open} ${shortlistCount}`}
              aria-expanded={isShortlistOpen}
              icon={<Heart className="h-4 w-4 fill-current" />}
              onClick={onOpenShortlist}
              className="pr-3"
            >
              <span>{appCopy.shortlist.open}</span>
              <span
                aria-hidden="true"
                className="grid h-6 min-w-6 place-items-center rounded-full bg-accent px-1 text-xs font-black text-accent-foreground"
              >
                {shortlistCount}
              </span>
            </Button>
          </div>
        )}
      </div>

      {isCompactHeader && isMobileMenuOpen ? (
        <div className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-40 rounded-lg border-2 border-accent bg-popover p-3 shadow-panel">
          <Link
            href="/"
            aria-current={currentView === "deck" ? "page" : undefined}
            onClick={onCloseMobileMenu}
            className="flex h-12 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-black text-secondary-foreground transition hover:bg-secondary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Layers3 className="h-5 w-5" />
            <span>{appCopy.app.deckView}</span>
          </Link>
          <Link
            href="/gallery"
            aria-current={currentView === "gallery" ? "page" : undefined}
            onClick={onCloseMobileMenu}
            className="mt-1 flex h-12 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-black text-secondary-foreground transition hover:bg-secondary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <GalleryHorizontalEnd className="h-5 w-5" />
            <span>{appCopy.app.galleryView}</span>
          </Link>
          <button
            type="button"
            aria-label={appCopy.filters.open}
            onClick={onOpenFilters}
            className="mt-1 flex h-12 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-black text-secondary-foreground transition hover:bg-secondary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <SlidersHorizontal className="h-5 w-5" />
            <span>{appCopy.filters.open}</span>
          </button>
          <button
            type="button"
            aria-label={`${appCopy.shortlist.open} ${shortlistCount}`}
            onClick={onOpenShortlist}
            className="mt-1 flex h-12 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-black text-primary transition hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Heart className="h-5 w-5 fill-current" />
            <span>{appCopy.shortlist.open}</span>
            <span className="ml-auto grid h-6 min-w-6 place-items-center rounded-full bg-accent px-1 text-xs text-accent-foreground">
              {shortlistCount}
            </span>
          </button>
        </div>
      ) : null}
    </header>
  );
}
