"use client";

import { SlidersHorizontal, X } from "lucide-react";
import React from "react";

import { appCopy } from "@/content/ro";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { type Filters, initialFilters } from "@/components/pet-deck/types";

type FiltersPanelProps = {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onClose: () => void;
};

export function FiltersPanel({ filters, onChange, onClose }: FiltersPanelProps) {
  return (
    <section className="rounded-lg border-2 border-accent bg-popover p-4 shadow-panel">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-black text-foreground">
          <SlidersHorizontal className="h-5 w-5 text-secondary" />
          {appCopy.filters.label}
        </h2>
        <Button
          variant="ghost"
          onClick={onClose}
          icon={<X className="h-4 w-4" />}
          className="h-9 px-3"
        >
          {appCopy.filters.close}
        </Button>
      </div>

      <form
        className="grid gap-3 md:grid-cols-[1fr_150px_150px_auto]"
        onSubmit={(event) => event.preventDefault()}
      >
        <label className="grid gap-1 text-sm font-black text-foreground">
          {appCopy.filters.searchLabel}
          <Input
            value={filters.q}
            onChange={(event) =>
              onChange({ ...filters, q: event.target.value })
            }
            placeholder={appCopy.filters.searchPlaceholder}
          />
        </label>
        <label className="grid gap-1 text-sm font-black text-foreground">
          {appCopy.filters.sexLabel}
          <Select
            value={filters.sex}
            onChange={(event) =>
              onChange({
                ...filters,
                sex: event.target.value as Filters["sex"],
              })
            }
          >
            <option value="all">{appCopy.filters.all}</option>
            <option value="female">{appCopy.filters.female}</option>
            <option value="male">{appCopy.filters.male}</option>
            <option value="unknown">{appCopy.filters.unknown}</option>
          </Select>
        </label>
        <label className="grid gap-1 text-sm font-black text-foreground">
          {appCopy.filters.sizeLabel}
          <Select
            value={filters.size}
            onChange={(event) =>
              onChange({
                ...filters,
                size: event.target.value as Filters["size"],
              })
            }
          >
            <option value="all">{appCopy.filters.all}</option>
            <option value="small">{appCopy.filters.small}</option>
            <option value="medium">{appCopy.filters.medium}</option>
            <option value="large">{appCopy.filters.large}</option>
            <option value="unknown">{appCopy.filters.unknown}</option>
          </Select>
        </label>
        <Button
          onClick={() => onChange(initialFilters)}
          className="h-11 self-end"
        >
          {appCopy.filters.reset}
        </Button>
      </form>
    </section>
  );
}
