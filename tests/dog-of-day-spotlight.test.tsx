import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";

import { DogOfDaySpotlight } from "@/components/pet-deck/DogOfDaySpotlight";
import { appCopy } from "@/content/ro";
import type { PetCard } from "@/lib/pets/types";

const pet: PetCard = {
  id: "1",
  sourceUrl: "https://www.adapostcanincraiova.ro/anunturi-caini/1022-3/",
  registryNumber: "1022",
  title: "Adopta un caine -1022 - Adapost Canin Craiova",
  imageUrl: "https://www.adapostcanincraiova.ro/wp-content/uploads/2026/06/1022.jpg",
  captureDate: "2026-06-04T00:00:00.000Z",
  captureDateText: "04.06.2026",
  firstSeenAt: "2026-06-04T00:00:00.000Z",
  captureLocation: "Cartier Brestei",
  approximateAge: "3-4 ani",
  sex: "female",
  size: "small",
  color: "negru-maro",
  characteristics: "Talie mica, culoare negru-maro.",
  profileName: "Bruno",
  profileBio: null,
  isAvailable: true,
};

describe("DogOfDaySpotlight", () => {
  it("links the image and name to the pet detail page", () => {
    render(
      <DogOfDaySpotlight
        pet={pet}
        saved={false}
        onToggleSave={() => undefined}
      />,
    );

    expect(screen.getByRole("link", { name: "Bruno" })).toHaveAttribute(
      "href",
      "/pets/1",
    );
    expect(
      screen.getByRole("link", {
        name: `${appCopy.status.imageAltPrefix} ${pet.registryNumber}`,
      }),
    ).toHaveAttribute("href", "/pets/1");
  });
});
