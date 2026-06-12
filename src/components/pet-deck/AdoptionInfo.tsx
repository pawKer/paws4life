"use client";

import {
  Clock,
  ExternalLink,
  FileText,
  HeartHandshake,
  MapPin,
  Phone,
  X,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useId, useState } from "react";
import React from "react";

import { appCopy } from "@/content/ro";
import { cn } from "@/lib/ui/classNames";
import { buildAdoptionCtaLabel } from "@/lib/pets/gallery";
import type { PetSex } from "@/lib/pets/types";

type AdoptionInfoProps = {
  className?: string;
  petName?: string;
  petSex?: PetSex;
};

export function AdoptionInfo({
  className,
  petName,
  petSex = "unknown",
}: AdoptionInfoProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();
  const ctaLabel = petName
    ? buildAdoptionCtaLabel(petName, petSex)
    : appCopy.adoption.cta;

  return (
    <div className={cn("text-left", className)}>
      <AdoptionTrigger
        ctaLabel={ctaLabel}
        isOpen={isOpen}
        panelId={panelId}
        onClick={() => setIsOpen(true)}
      />

      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-foreground/40" />
          <Dialog.Content
            id={panelId}
            className="fixed left-1/2 top-1/2 z-50 max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-lg border border-border bg-popover p-5 text-left shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <Dialog.Title asChild>
                  <h2 className="text-xl font-black text-foreground">
                    {appCopy.adoption.title}
                  </h2>
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-sm font-semibold leading-6 text-muted-foreground">
                  {appCopy.adoption.intro}
                </Dialog.Description>
              </div>
              <Dialog.Close
                aria-label={appCopy.shortlist.close}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="h-4 w-4" />
              </Dialog.Close>
            </div>
            <AdoptionDetails />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

type AdoptionTriggerProps = {
  ctaLabel: string;
  isOpen: boolean;
  panelId: string;
  onClick: () => void;
};

function AdoptionTrigger({
  ctaLabel,
  isOpen,
  panelId,
  onClick,
}: AdoptionTriggerProps) {
  return (
    <button
      type="button"
      aria-expanded={isOpen}
      aria-controls={panelId}
      onClick={onClick}
      className="adoption-rainbow-border group relative isolate inline-flex rounded-full p-[2px] text-sm font-black transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <span className="relative z-10 inline-flex min-h-11 items-center gap-2 rounded-full bg-card px-4 py-2 text-foreground transition group-hover:bg-card/90">
        <HeartHandshake className="h-4 w-4 text-primary" />
        {ctaLabel}
      </span>
    </button>
  );
}

function AdoptionDetails() {
  return (
    <>
      <div className="mt-4 grid gap-3">
        <InfoRow
          icon={<MapPin className="h-4 w-4" />}
          label={appCopy.adoption.addressLabel}
        >
          <a
            href={appCopy.adoption.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-primary underline-offset-4 hover:underline"
          >
            <span>{appCopy.adoption.address}</span>
            <ExternalLink className="h-4 w-4 shrink-0" />
          </a>
        </InfoRow>
        <InfoRow
          icon={<Phone className="h-4 w-4" />}
          label={appCopy.adoption.dispatchPhoneLabel}
        >
          <a
            href={`tel:${toTelHref(appCopy.adoption.dispatchPhone)}`}
            className="text-primary underline-offset-4 hover:underline"
          >
            {appCopy.adoption.dispatchPhone}
          </a>
        </InfoRow>
        <InfoRow
          icon={<Phone className="h-4 w-4" />}
          label={appCopy.adoption.shelterPhoneLabel}
        >
          <a
            href={`tel:${toTelHref(appCopy.adoption.shelterPhone)}`}
            className="text-primary underline-offset-4 hover:underline"
          >
            {appCopy.adoption.shelterPhone}
          </a>
        </InfoRow>
        <InfoRow
          icon={<Clock className="h-4 w-4" />}
          label={appCopy.adoption.scheduleLabel}
        >
          <span>{appCopy.adoption.weekdaySchedule}</span>
          <span>{appCopy.adoption.weekendSchedule}</span>
        </InfoRow>
      </div>

      <div className="mt-4">
        <p className="mb-2 flex items-center gap-2 text-sm font-black text-foreground">
          <FileText className="h-4 w-4 text-secondary" />
          {appCopy.adoption.linksLabel}
        </p>
        <div className="grid gap-2">
          {appCopy.adoption.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-between gap-3 rounded-md border border-border bg-muted/45 px-3 py-2 text-sm font-bold text-foreground transition hover:border-primary/45 hover:bg-primary/10"
            >
              <span>{link.label}</span>
              <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
            </a>
          ))}
        </div>
      </div>
    </>
  );
}

type InfoRowProps = {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
};

function InfoRow({ icon, label, children }: InfoRowProps) {
  return (
    <div className="flex gap-3 rounded-md bg-muted/35 p-3">
      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-card text-secondary shadow-sm">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-[0.08em] text-muted-foreground">
          {label}
        </p>
        <div className="mt-1 grid gap-1 text-sm font-bold leading-5 text-foreground">
          {children}
        </div>
      </div>
    </div>
  );
}

function toTelHref(value: string) {
  return value.replace(/\D/g, "");
}
