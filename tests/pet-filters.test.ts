import { describe, expect, it } from "vitest";

import { filterPetCards } from "@/lib/pets/filter";

const pets = [
  {
    id: "1",
    registryNumber: "1022",
    sex: "female",
    size: "small",
    captureLocation: "Cartier Brestei",
    approximateAge: "3-4 ani",
    color: "negru-maro",
    characteristics: "Talie mică, culoare negru-maro."
  },
  {
    id: "2",
    registryNumber: "931",
    sex: "male",
    size: "medium",
    captureLocation: "Craiovița Nouă",
    approximateAge: "6-7 ani",
    color: "maro",
    characteristics: "Talie mijlocie, culoare maro."
  }
];

describe("pet filters", () => {
  it("filters by sex, size, and free text", () => {
    expect(
      filterPetCards(pets, {
        sex: "female",
        size: "small",
        q: "brestei negru"
      }).map((pet) => pet.registryNumber)
    ).toEqual(["1022"]);
  });

  it("treats empty filters as all pets", () => {
    expect(filterPetCards(pets, { sex: "all", size: "all", q: "" })).toHaveLength(2);
  });

  it("searches the names shown on pet profiles", () => {
    expect(filterPetCards(pets, { q: "Bruno" })).toHaveLength(1);
    expect(
      filterPetCards([{ ...pets[0], profileName: "Maya" }], { q: "maya" }),
    ).toHaveLength(1);
  });
});
