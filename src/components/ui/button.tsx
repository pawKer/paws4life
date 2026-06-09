import type { ButtonHTMLAttributes, ReactNode } from "react";
import React from "react";

import { cn } from "@/lib/ui/classNames";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  icon?: ReactNode;
};

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-primary hover:bg-primary-hover",
  secondary:
    "border border-secondary/35 bg-card/95 text-secondary-foreground shadow-sm hover:bg-secondary/10",
  ghost:
    "border border-border bg-card text-secondary-foreground hover:bg-secondary/10",
  danger: "text-destructive underline-offset-4 hover:underline",
};

export function Button({
  variant = "secondary",
  icon,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-black transition motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-55",
        buttonVariants[variant],
        className,
      )}
      {...props}
    >
      {icon ? <span className="grid h-4 w-4 place-items-center">{icon}</span> : null}
      {children}
    </button>
  );
}

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  tone?: "primary" | "secondary" | "light";
  badge?: number;
  children: ReactNode;
};

const iconButtonTones = {
  primary:
    "bg-primary text-primary-foreground shadow-primary hover:bg-primary-hover",
  secondary:
    "border border-secondary/35 bg-card/95 text-secondary-foreground shadow-sm hover:bg-secondary/10",
  light:
    "border-2 border-card bg-card text-success shadow-gentle hover:bg-success/10",
};

export function IconButton({
  label,
  tone = "secondary",
  badge,
  className,
  children,
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "relative grid h-11 w-11 shrink-0 place-items-center rounded-full transition motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-55",
        iconButtonTones[tone],
        className,
      )}
      {...props}
    >
      {children}
      {badge !== undefined ? (
        <span
          aria-hidden="true"
          className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-black text-accent-foreground"
        >
          {badge}
        </span>
      ) : null}
    </button>
  );
}
