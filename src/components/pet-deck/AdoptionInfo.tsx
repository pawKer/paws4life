"use client";

import {
  ChevronDown,
  Clock,
  ExternalLink,
  FileText,
  HeartHandshake,
  MapPin,
  Phone,
} from "lucide-react";
import { useId, useState } from "react";
import React from "react";

import { appCopy } from "@/content/ro";
import { cn } from "@/lib/ui/classNames";

type AdoptionInfoProps = {
  className?: string;
};

export function AdoptionInfo({ className }: AdoptionInfoProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();

  return (
    <div className={cn("text-left", className)}>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((value) => !value)}
        className="adoption-rainbow-border group inline-flex rounded-full p-[2px] text-sm font-black shadow-primary transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <span className="inline-flex min-h-11 items-center gap-2 rounded-full bg-card px-4 py-2 text-foreground transition group-hover:bg-card/90">
          <HeartHandshake className="h-4 w-4 text-primary" />
          {appCopy.adoption.cta}
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition",
              isOpen ? "rotate-180" : "",
            )}
          />
        </span>
      </button>

      {isOpen ? (
        <section
          id={panelId}
          className="mt-3 rounded-lg border border-border bg-card p-4 shadow-gentle"
        >
          <h3 className="text-base font-black text-foreground">
            {appCopy.adoption.title}
          </h3>
          <p className="mt-1 text-sm font-semibold leading-6 text-muted-foreground">
            {appCopy.adoption.intro}
          </p>

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
        </section>
      ) : null}
    </div>
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
