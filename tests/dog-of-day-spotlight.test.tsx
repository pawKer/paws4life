import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

import { DogOfDaySpotlight } from "@/components/pet-deck/DogOfDaySpotlight";
import { buildPetProfile } from "@/components/pet-deck/petProfile";
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

  it("shows the registry number and gallery-style profile pills", () => {
    render(
      <DogOfDaySpotlight
        pet={pet}
        saved={false}
        onToggleSave={() => undefined}
      />,
    );

    expect(
      screen.getByText(`${appCopy.deck.registryPrefix} ${pet.registryNumber}`),
    ).toBeInTheDocument();

    for (const chip of buildPetProfile(pet).chips.slice(0, 3)) {
      expect(screen.getByText(chip)).toHaveClass("bg-muted/25", "py-1");
    }
  });

  it("opens adoption details and matches the profile save-button states", () => {
    const onToggleSave = vi.fn();
    const { rerender } = render(
      <DogOfDaySpotlight
        pet={pet}
        saved={false}
        onToggleSave={onToggleSave}
      />,
    );

    const adoptionTrigger = screen.getByRole("button", { name: /Bruno/ });
    fireEvent.click(adoptionTrigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(appCopy.adoption.title)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: appCopy.shortlist.close }));
    const saveButton = screen.getByRole("button", { name: appCopy.gallery.save });
    expect(saveButton).toHaveClass(
      "h-12",
      "bg-card/95",
      "text-secondary-foreground",
    );
    fireEvent.click(saveButton);
    expect(onToggleSave).toHaveBeenCalledWith(pet.id);

    rerender(
      <DogOfDaySpotlight
        pet={pet}
        saved
        onToggleSave={onToggleSave}
      />,
    );
    expect(screen.getByRole("button", { name: appCopy.gallery.saved })).toHaveClass(
      "bg-primary",
      "text-primary-foreground",
    );
  });
});
