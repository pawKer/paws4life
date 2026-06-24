import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";

import { PetDetailView } from "@/components/pet-deck/PetDetailView";
import { appCopy } from "@/content/ro";
import type { PetCard } from "@/lib/pets/types";

const pet: PetCard = {
  id: "1",
  sourceUrl: "https://www.adapostcanincraiova.ro/anunturi-caini/1022-3/",
  registryNumber: "1022",
  title: "Adoptă un câine -1022 - Adăpost Canin Craiova",
  imageUrl: "https://www.adapostcanincraiova.ro/wp-content/uploads/2026/06/1022.jpg",
  captureDate: "2026-06-04T00:00:00.000Z",
  captureDateText: "04.06.2026",
  firstSeenAt: "2026-06-04T00:00:00.000Z",
  captureLocation: "Cartier Brestei",
  approximateAge: "3-4 ani",
  sex: "female",
  size: "small",
  color: "negru-maro",
  characteristics: "Talie mică, culoare negru-maro.",
  profileName: null,
  profileBio: null,
  shareImagesGeneratedAt: "2026-06-10T00:00:00.000Z",
  isAvailable: true,
};

describe("PetDetailView", () => {
  it("opens adoption information in a dialog instead of expanding the detail card", () => {
    render(<PetDetailView pet={pet} />);

    expect(screen.getByText(appCopy.deck.about)).toBeInTheDocument();
    const sizePill = screen.getByText(
      `${appCopy.deck.size} ${appCopy.filters.small.toLocaleLowerCase("ro-RO")}`,
    );
    expect(sizePill).toHaveClass("bg-muted/25", "text-card-foreground");
    const adoptionTrigger = screen.getByRole("button", { name: /Bruno/ });
    expect(adoptionTrigger.querySelector(".lucide-heart-handshake")).toBeInTheDocument();
    expect(adoptionTrigger.querySelector(".lucide-chevron-down")).not.toBeInTheDocument();
    fireEvent.click(adoptionTrigger);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(appCopy.adoption.title)).toBeInTheDocument();
  });
});
