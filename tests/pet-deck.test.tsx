import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, beforeEach, vi } from "vitest";

import { PetDeck } from "@/components/PetDeck";
import { appCopy } from "@/content/ro";
import type { PetCard } from "@/lib/pets/types";

const pets: PetCard[] = [
  {
    id: "1",
    sourceUrl: "https://www.adapostcanincraiova.ro/anunturi-caini/1022-3/",
    registryNumber: "1022",
    title: "Adoptă un câine -1022 - Adăpost Canin Craiova",
    imageUrl: "https://www.adapostcanincraiova.ro/wp-content/uploads/2026/06/1022.jpg",
    captureDateText: "04.06.2026",
    captureLocation: "Cartier Brestei",
    approximateAge: "3-4 ani",
    sex: "female",
    size: "small",
    color: "negru-maro",
    characteristics: "Talie mică, culoare negru-maro.",
    profileName: null,
    profileBio: null,
    isAvailable: true
  },
  {
    id: "2",
    sourceUrl: "https://www.adapostcanincraiova.ro/anunturi-caini/931-2/",
    registryNumber: "931",
    title: "Adoptă un câine -931 - Adăpost Canin Craiova",
    imageUrl: "https://www.adapostcanincraiova.ro/wp-content/uploads/2026/05/931.jpg",
    captureDateText: "20.05.2026",
    captureLocation: "Craiovița Nouă",
    approximateAge: "6-7 ani",
    sex: "male",
    size: "medium",
    color: "maro",
    characteristics: "Talie mijlocie, culoare maro.",
    profileName: null,
    profileBio: null,
    isAvailable: true
  }
];

describe("PetDeck", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("starts with filters minimized and expands them on request", () => {
    render(<PetDeck initialPets={pets} latestRun={null} />);

    expect(screen.getByTestId("pet-deck-root")).toHaveAttribute(
      "data-theme",
      "playful-adoption-pass"
    );
    expect(screen.queryByPlaceholderText(appCopy.filters.searchPlaceholder)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: appCopy.filters.open }));

    expect(screen.getByPlaceholderText(appCopy.filters.searchPlaceholder)).toBeInTheDocument();
  });

  it("dismisses filters when clicking outside the filter panel", () => {
    render(<PetDeck initialPets={pets} latestRun={null} />);

    fireEvent.click(screen.getByRole("button", { name: appCopy.filters.open }));
    expect(screen.getByPlaceholderText(appCopy.filters.searchPlaceholder)).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("filters-dismiss-layer"));

    expect(screen.queryByPlaceholderText(appCopy.filters.searchPlaceholder)).not.toBeInTheDocument();
  });

  it("keeps filter form submission on the page", () => {
    render(<PetDeck initialPets={pets} latestRun={null} />);

    fireEvent.click(screen.getByRole("button", { name: appCopy.filters.open }));

    const searchInput = screen.getByPlaceholderText(appCopy.filters.searchPlaceholder);
    fireEvent.submit(searchInput.closest("form") as HTMLFormElement);

    expect(searchInput).toBeInTheDocument();
  });

  it("collapses mobile header actions behind icon buttons", () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: true,
      media: "(max-width: 639px)",
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn()
    });

    render(<PetDeck initialPets={pets} latestRun={null} />);

    expect(screen.getByRole("button", { name: appCopy.app.menuOpen })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: `${appCopy.shortlist.open} 0` })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: appCopy.filters.open })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: appCopy.app.menuOpen }));
    fireEvent.click(screen.getByRole("button", { name: appCopy.filters.open }));

    expect(screen.getByPlaceholderText(appCopy.filters.searchPlaceholder)).toBeInTheDocument();
  });

  it("renders a dating-profile style card with generated name and attribute pills", () => {
    render(<PetDeck initialPets={pets} latestRun={null} />);

    expect(screen.getByRole("heading", { name: /Bruno, 3/ })).toBeInTheDocument();
    expect(screen.getByText(appCopy.deck.about)).toBeInTheDocument();
    expect(screen.getByText(`${appCopy.deck.size}: ${appCopy.filters.small}`)).toBeInTheDocument();
    expect(screen.getByText(`${appCopy.deck.color}: negru-maro`)).toBeInTheDocument();
    expect(screen.getByText(appCopy.deck.lookingFor)).toBeInTheDocument();
  });

  it("prefers AI generated profile copy when it is available", () => {
    render(
      <PetDeck
        initialPets={[
          {
            ...pets[0],
            profileName: "Maya",
            profileBio: "Maya is a sunny little shadow who loves calm walks and loyal humans."
          }
        ]}
        latestRun={null}
      />
    );

    expect(screen.getByRole("heading", { name: /Maya, 3/ })).toBeInTheDocument();
    expect(
      screen.getByText("Maya is a sunny little shadow who loves calm walks and loyal humans.")
    ).toBeInTheDocument();
  });

  it("adds a liked pet to the browser shortlist and advances after the match modal", () => {
    render(<PetDeck initialPets={pets} latestRun={null} />);

    expect(screen.getByText("1022")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: appCopy.deck.like }));

    expect(screen.getByText(appCopy.match.title)).toBeInTheDocument();
    expect(screen.getByTestId("match-confetti")).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem("pawsforlife.shortlist.v1") ?? "[]")).toEqual([
      "1"
    ]);

    fireEvent.click(screen.getByRole("button", { name: appCopy.match.close }));
    expect(screen.getByText("931")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: `${appCopy.shortlist.open} 1` })
    ).toBeInTheDocument();
  });

  it("ignores corrupt shortlist storage instead of crashing", () => {
    window.localStorage.setItem("pawsforlife.shortlist.v1", "{not-json");

    render(<PetDeck initialPets={pets} latestRun={null} />);

    expect(screen.getByText("1022")).toBeInTheDocument();
    expect(window.localStorage.getItem("pawsforlife.shortlist.v1")).toBeNull();
  });

  it("shows adoption contact information from the match modal", () => {
    render(<PetDeck initialPets={pets} latestRun={null} />);

    fireEvent.click(screen.getByRole("button", { name: appCopy.deck.like }));
    fireEvent.click(screen.getByRole("button", { name: appCopy.adoption.cta }));

    expect(screen.getByText(appCopy.adoption.title)).toBeInTheDocument();
    expect(screen.getByText(appCopy.adoption.address)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: appCopy.adoption.address })).toHaveAttribute(
      "href",
      appCopy.adoption.mapsUrl
    );
    expect(screen.getByRole("link", { name: appCopy.adoption.dispatchPhone })).toHaveAttribute(
      "href",
      "tel:0251422733"
    );
    expect(
      screen.getByRole("link", { name: appCopy.adoption.links[1].label })
    ).toHaveAttribute("href", appCopy.adoption.links[1].href);
  });

  it("keeps the shortlist minimized until the cart-style button is opened", () => {
    render(<PetDeck initialPets={pets} latestRun={null} />);

    fireEvent.click(screen.getByRole("button", { name: appCopy.deck.like }));
    fireEvent.click(screen.getByRole("button", { name: appCopy.match.close }));

    expect(screen.queryByRole("button", { name: appCopy.shortlist.remove })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: `${appCopy.shortlist.open} 1` }));

    expect(screen.getByRole("button", { name: appCopy.shortlist.remove })).toBeInTheDocument();
  });

  it("shows the pet profile name in the shortlist", () => {
    render(
      <PetDeck
        initialPets={[
          {
            ...pets[0],
            profileName: "Maya"
          }
        ]}
        latestRun={null}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: appCopy.deck.like }));
    fireEvent.click(screen.getByRole("button", { name: appCopy.match.close }));
    fireEvent.click(screen.getByRole("button", { name: `${appCopy.shortlist.open} 1` }));

    expect(screen.getAllByText("Maya")).toHaveLength(2);
    expect(screen.getByText(`${appCopy.deck.registryPrefix} 1022`)).toBeInTheDocument();
  });

  it("links shortlist items to the official listing and enlarges thumbnails on hover", () => {
    render(<PetDeck initialPets={pets} latestRun={null} />);

    fireEvent.click(screen.getByRole("button", { name: appCopy.deck.like }));
    fireEvent.click(screen.getByRole("button", { name: appCopy.match.close }));
    fireEvent.click(screen.getByRole("button", { name: `${appCopy.shortlist.open} 1` }));

    expect(screen.getByRole("link", { name: `${appCopy.app.sourceLink} 1022` })).toHaveAttribute(
      "href",
      pets[0].sourceUrl
    );
    expect(screen.getByRole("link", { name: "Bruno" })).toHaveAttribute(
      "href",
      pets[0].sourceUrl
    );
    expect(screen.getAllByRole("link", { name: appCopy.app.sourceLink }).at(-1)).toHaveAttribute(
      "href",
      pets[0].sourceUrl
    );
    expect(screen.getAllByAltText(`${appCopy.status.imageAltPrefix} 1022`).at(-1)).toHaveClass(
      "motion-safe:group-hover/preview:scale-[2.15]"
    );
  });

  it("shows adoption contact information from the shortlist", () => {
    render(<PetDeck initialPets={pets} latestRun={null} />);

    fireEvent.click(screen.getByRole("button", { name: appCopy.deck.like }));
    fireEvent.click(screen.getByRole("button", { name: appCopy.match.close }));
    fireEvent.click(screen.getByRole("button", { name: `${appCopy.shortlist.open} 1` }));
    fireEvent.click(screen.getByRole("button", { name: appCopy.adoption.cta }));

    expect(screen.getByText(appCopy.adoption.shelterPhoneLabel)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: appCopy.adoption.shelterPhone })).toHaveAttribute(
      "href",
      "tel:0722328442"
    );
    expect(screen.getByText(appCopy.adoption.weekendSchedule)).toBeInTheDocument();
  });

  it("moves to the next pet without changing the shortlist", () => {
    render(<PetDeck initialPets={pets} latestRun={null} />);

    fireEvent.click(screen.getByRole("button", { name: appCopy.deck.next }));

    expect(screen.getByText("931")).toBeInTheDocument();
    expect(window.localStorage.getItem("pawsforlife.shortlist.v1")).toBeNull();
  });

  it("keeps unavailable pets out of the browse deck but resolves cached shortlist entries", async () => {
    const unavailablePet = {
      ...pets[1],
      id: "gone",
      registryNumber: "777",
      isAvailable: false
    };
    window.localStorage.setItem("pawsforlife.shortlist.v1", JSON.stringify(["gone"]));

    render(<PetDeck initialPets={[unavailablePet, pets[0]]} latestRun={null} />);

    expect(screen.getByText("1022")).toBeInTheDocument();
    expect(screen.queryByText(`${appCopy.deck.registryPrefix} 777`)).not.toBeInTheDocument();

    fireEvent.click(
      await screen.findByRole("button", { name: `${appCopy.shortlist.open} 1` })
    );

    expect(screen.getByText(`${appCopy.deck.registryPrefix} 777`)).toBeInTheDocument();
    expect(screen.getByText(appCopy.deck.unavailable)).toBeInTheDocument();
  });

  it("disables native image dragging so photo drags can become card swipes", () => {
    render(<PetDeck initialPets={pets} latestRun={null} />);

    const image = screen.getByAltText(`${appCopy.status.imageAltPrefix} 1022`);

    expect(screen.getByTestId("pet-card")).toHaveClass("touch-pan-y");
    expect(image).toHaveAttribute("draggable", "false");
    expect(image).toHaveClass("pointer-events-none");
  });
});
