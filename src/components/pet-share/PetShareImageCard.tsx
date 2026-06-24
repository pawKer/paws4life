import {
  BadgeCheck,
  CalendarDays,
  MapPin,
  PawPrint,
  Phone,
  ShieldCheck,
} from "lucide-react";
import React from "react";

import type { PetShareImageProfile, PetShareImageVariant } from "@/lib/pets/share-images";
import { PET_SHARE_IMAGE_SIZES } from "@/lib/pets/share-images";
import type { PetCard } from "@/lib/pets/types";
import { cn } from "@/lib/ui/classNames";

type PetShareImageCardProps = {
  pet: PetCard;
  profile: PetShareImageProfile;
  variant: PetShareImageVariant;
};

export function PetShareImageCard({
  pet,
  profile,
  variant,
}: PetShareImageCardProps) {
  const size = PET_SHARE_IMAGE_SIZES[variant];
  const isStory = variant === "story";
  const stats = getStats(profile);

  return (
    <article
      data-share-card
      className="relative overflow-hidden bg-background text-foreground"
      style={{
        width: size.width,
        height: size.height,
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_8%,hsl(var(--muted))_0,transparent_32%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--muted)/0.34))]" />

      <section
        className={cn(
          "absolute inset-x-0 top-0 overflow-hidden bg-success/15",
          isStory ? "h-[1115px]" : "h-[790px]",
        )}
      >
        {pet.imageUrl ? (
          <img
            src={pet.imageUrl}
            alt={profile.imageAlt}
            className="h-full w-full object-cover object-center"
            draggable={false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-6xl font-black text-muted-foreground">
            {profile.name}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-foreground/90 via-foreground/45 to-transparent" />

        <div
          className={cn(
            "absolute left-14 top-14 rounded-full bg-card/75 font-black text-foreground/85 shadow-sm ring-1 ring-white/55 backdrop-blur-sm",
            isStory ? "px-7 py-4 text-3xl" : "px-6 py-3 text-2xl",
          )}
        >
          {profile.registryLabel}
        </div>

        <div
          className={cn(
            "absolute left-16 text-white",
            isStory ? "bottom-[165px]" : "bottom-[150px]",
          )}
        >
          <h1
            className={cn(
              "flex items-center font-black leading-none tracking-normal drop-shadow-[0_4px_18px_rgba(0,0,0,0.5)]",
              isStory ? "text-[108px]" : "text-[82px]",
            )}
          >
            {profile.name}
            {profile.age ? <span className="font-bold">, {profile.age}</span> : null}
            <BadgeCheck
              aria-label={profile.verifiedLabel}
              className={cn(
                "ml-6 shrink-0 fill-info text-info-foreground",
                isStory ? "h-14 w-14" : "h-11 w-11",
              )}
            />
          </h1>

          <p
            className={cn(
              "mt-5 max-w-[820px] truncate font-black text-white/90",
              isStory ? "text-[34px]" : "text-[28px]",
            )}
          >
            {profile.subtitle}
          </p>
        </div>

      </section>

      <section
        className={cn(
          "absolute left-10 right-10 overflow-visible",
          isStory ? "top-[1050px] min-h-[820px] p-12 pt-16" : "top-[700px] min-h-[580px] p-10 pt-14",
        )}
      >
        <CardBackdrop />

        <div className="relative z-10">
          <div className="grid grid-cols-3 items-center gap-0">
            <Stat icon={<PawPrint />} label={stats.sex} />
            <Stat icon={<ShieldCheck />} label={stats.size} withDivider />
            <Stat icon={<CalendarDays />} label={stats.age} withDivider />
          </div>

          <div
            className={cn(
              "relative mt-9 rounded-[2.25rem] border border-border/60 bg-muted/35 text-center text-card-foreground",
              isStory ? "px-12 py-8" : "px-10 py-6",
            )}
          >
            <p
              className={cn(
                "mx-auto max-w-[820px] font-semibold leading-tight",
                isStory ? "text-[28px]" : "text-[23px]",
              )}
            >
              {profile.description}
            </p>
          </div>

          <div
            className={cn(
              "mx-auto overflow-hidden rounded-[2rem] border border-border bg-card shadow-gentle",
              isStory ? "mt-8" : "mt-7",
              isStory ? "w-[840px]" : "w-[806px]",
            )}
          >
            <div
              className={cn(
                "flex items-center justify-center gap-6 bg-primary px-8 text-primary-foreground",
                isStory ? "py-8" : "py-6",
              )}
            >
              <span
                className={cn(
                  "grid place-items-center rounded-full bg-card text-primary",
                  isStory ? "h-16 w-16" : "h-14 w-14",
                )}
              >
                <Phone className={cn(isStory ? "h-8 w-8" : "h-7 w-7")} />
              </span>
              <span className={cn("font-black", isStory ? "text-[34px]" : "text-[28px]")}>
                {profile.adoptionCta}
              </span>
            </div>
            <div
              className={cn(
                "flex flex-col items-center justify-center px-8 text-center",
                isStory ? "py-7" : "py-5",
              )}
            >
              <div
                className={cn(
                  "font-black leading-none text-success",
                  isStory ? "text-[50px]" : "text-[40px]",
                )}
              >
                {profile.shelterPhone}
              </div>
              <div
                className={cn(
                  "mt-4 flex items-center gap-3 font-bold text-muted-foreground",
                  isStory ? "text-[26px]" : "text-[22px]",
                )}
              >
                <MapPin className="h-7 w-7 text-success" />
                <span>{profile.shelterName}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}

function CardBackdrop() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 top-[-34px] h-[calc(100%+34px)] w-full overflow-visible"
      preserveAspectRatio="none"
      viewBox="0 0 1000 900"
    >
      <defs>
        <mask id="share-card-bite-mask" maskUnits="userSpaceOnUse">
          <rect x="22" y="38" width="956" height="846" rx="78" fill="white" />
          <circle cx="972" cy="44" r="84" fill="black" />
          <circle cx="900" cy="38" r="27" fill="black" />
          <circle cx="978" cy="116" r="27" fill="black" />
          <circle cx="936" cy="70" r="18" fill="black" />
        </mask>
        <mask id="share-card-bite-shadow-mask" maskUnits="userSpaceOnUse">
          <rect x="24" y="56" width="952" height="834" rx="78" fill="white" />
          <circle cx="970" cy="62" r="84" fill="black" />
          <circle cx="898" cy="56" r="27" fill="black" />
          <circle cx="976" cy="134" r="27" fill="black" />
          <circle cx="934" cy="88" r="18" fill="black" />
        </mask>
      </defs>
      <rect
        x="24"
        y="56"
        width="952"
        height="834"
        rx="78"
        fill="hsl(var(--success) / 0.10)"
        mask="url(#share-card-bite-shadow-mask)"
      />
      <rect
        x="22"
        y="38"
        width="956"
        height="846"
        rx="78"
        fill="hsl(var(--card) / 0.96)"
        mask="url(#share-card-bite-mask)"
        stroke="hsl(var(--border) / 0.55)"
        strokeWidth="1.5"
      />
      <path
        d="M104 68 H830"
        fill="none"
        stroke="hsl(var(--background) / 0.75)"
        strokeLinecap="round"
        strokeWidth="2"
        mask="url(#share-card-bite-mask)"
      />
    </svg>
  );
}

function Stat({
  icon,
  label,
  withDivider = false,
}: {
  icon: React.ReactElement<{ className?: string }>;
  label: string;
  withDivider?: boolean;
}) {
  return (
    <div className="relative flex min-w-0 flex-col items-center justify-center gap-4 px-4">
      {withDivider ? (
        <span className="absolute left-0 top-6 h-20 w-px bg-border" aria-hidden="true" />
      ) : null}
      <span className="grid h-16 w-16 place-items-center text-success">
        {React.cloneElement(icon, { className: "h-12 w-12" })}
      </span>
      <span className="max-w-full truncate text-center text-[24px] font-black text-card-foreground">
        {label}
      </span>
    </div>
  );
}

function getStats(profile: PetShareImageProfile) {
  const sex = profile.chips
    .find((chip) => chip.toLocaleLowerCase("ro-RO").startsWith("sex:"))
    ?.replace(/^Sex:\s*/i, "");
  const size = profile.chips.find((chip) =>
    chip.toLocaleLowerCase("ro-RO").startsWith("talie "),
  );
  const age = profile.chips[0] ?? (profile.age ? `${profile.age} ani` : "");

  return {
    sex: sex || profile.subtitle.split(" - ")[0] || "",
    size: size || "",
    age,
  };
}
