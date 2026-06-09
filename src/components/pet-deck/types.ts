import type { PetSex, PetSize } from "@/lib/pets/types";

export type Filters = {
  sex: PetSex | "all";
  size: PetSize | "all";
  q: string;
};

export const initialFilters: Filters = {
  sex: "all",
  size: "all",
  q: "",
};

export const shortlistStorageKey = "pawsforlife.shortlist.v1";
