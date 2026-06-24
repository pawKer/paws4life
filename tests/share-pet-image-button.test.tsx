import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SharePetImageButton } from "@/components/pet-deck/SharePetImageButton";
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
  profileName: "Maya",
  profileBio: "Maya cauta o familie rabdatoare.",
  shareImagesGeneratedAt: "2026-06-10T00:00:00.000Z",
  isAvailable: true,
};

function mockImageResponse(status = 200) {
  return new Response(new Blob(["png"], { type: "image/png" }), { status });
}

describe("SharePetImageButton", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockImageResponse()));
    Object.defineProperty(window.navigator, "canShare", {
      configurable: true,
      value: vi.fn().mockReturnValue(true),
    });
    Object.defineProperty(window.navigator, "share", {
      configurable: true,
      value: vi.fn().mockResolvedValue(undefined),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("opens a chooser with link, profile image, and story actions", () => {
    render(<SharePetImageButton pet={pet} />);

    fireEvent.click(screen.getByRole("button", { name: appCopy.gallery.share }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: appCopy.gallery.shareLink })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: appCopy.gallery.shareProfileImage }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: appCopy.gallery.shareStory })).toBeInTheDocument();
  });

  it("shares the profile image PNG through the native file share sheet", async () => {
    render(<SharePetImageButton pet={pet} />);

    fireEvent.click(screen.getByRole("button", { name: appCopy.gallery.share }));
    fireEvent.click(screen.getByRole("button", { name: appCopy.gallery.shareProfileImage }));

    await waitFor(() => {
      expect(window.fetch).toHaveBeenCalledWith("/generated/pets/pawsforlife-1.png");
    });
    expect(window.navigator.share).toHaveBeenCalledWith(
      expect.objectContaining({
        title: `${buildPetProfile(pet).name} - ${appCopy.app.name}`,
        text: appCopy.deck.lookingFor,
      }),
    );
    const sharePayload = vi.mocked(window.navigator.share).mock.calls[0]?.[0] as ShareData;
    expect(sharePayload.files?.[0]).toBeInstanceOf(File);
    expect(sharePayload.files?.[0]?.name).toBe("pawsforlife-1022.png");
    expect(sharePayload.files?.[0]?.type).toBe("image/png");
    expect(await screen.findByText(appCopy.gallery.shareDone)).toBeInTheDocument();
  });

  it("shares the story PNG through the native file share sheet", async () => {
    render(<SharePetImageButton pet={pet} />);

    fireEvent.click(screen.getByRole("button", { name: appCopy.gallery.share }));
    fireEvent.click(screen.getByRole("button", { name: appCopy.gallery.shareStory }));

    await waitFor(() => {
      expect(window.fetch).toHaveBeenCalledWith("/generated/pets/pawsforlife-1-story.png");
    });
    const sharePayload = vi.mocked(window.navigator.share).mock.calls[0]?.[0] as ShareData;
    expect(sharePayload.files?.[0]).toBeInstanceOf(File);
    expect(sharePayload.files?.[0]?.name).toBe("pawsforlife-1022-story.png");
  });

  it("shares the pet profile link from the chooser", async () => {
    render(<SharePetImageButton pet={pet} />);

    fireEvent.click(screen.getByRole("button", { name: appCopy.gallery.share }));
    fireEvent.click(screen.getByRole("button", { name: appCopy.gallery.shareLink }));

    await waitFor(() => {
      expect(window.navigator.share).toHaveBeenCalledWith(
        expect.objectContaining({
          title: `${buildPetProfile(pet).name} - ${appCopy.app.name}`,
          url: expect.stringContaining("/pets/1"),
        }),
      );
    });
  });

  it("downloads the generated image when native file sharing is unavailable", async () => {
    const click = vi.fn();
    const createElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tagName) => {
      const element = createElement(tagName);

      if (tagName === "a") {
        Object.defineProperty(element, "click", {
          configurable: true,
          value: click,
        });
      }

      return element;
    });
    Object.defineProperty(window.URL, "createObjectURL", {
      configurable: true,
      value: vi.fn().mockReturnValue("#paws-share"),
    });
    Object.defineProperty(window.URL, "revokeObjectURL", {
      configurable: true,
      value: vi.fn(),
    });
    Object.defineProperty(window.navigator, "canShare", {
      configurable: true,
      value: vi.fn().mockReturnValue(false),
    });

    render(<SharePetImageButton kind="button" pet={pet} />);

    fireEvent.click(screen.getByRole("button", { name: appCopy.gallery.share }));
    fireEvent.click(screen.getByRole("button", { name: appCopy.gallery.shareProfileImage }));

    await waitFor(() => {
      expect(click).toHaveBeenCalled();
    });
    expect(await screen.findByText(appCopy.gallery.downloaded)).toBeInTheDocument();
  });

  it("shows unavailable feedback when images are not generated yet", async () => {
    render(<SharePetImageButton pet={{ ...pet, shareImagesGeneratedAt: null }} />);

    fireEvent.click(screen.getByRole("button", { name: appCopy.gallery.share }));
    fireEvent.click(screen.getByRole("button", { name: appCopy.gallery.shareProfileImage }));

    expect(window.fetch).not.toHaveBeenCalled();
    expect(await screen.findAllByText(appCopy.gallery.shareUnavailable)).not.toHaveLength(0);
  });

  it("shows unavailable feedback when a generated image cannot be fetched", async () => {
    vi.mocked(window.fetch).mockResolvedValue(new Response("nope", { status: 404 }));

    render(<SharePetImageButton pet={pet} />);

    fireEvent.click(screen.getByRole("button", { name: appCopy.gallery.share }));
    fireEvent.click(screen.getByRole("button", { name: appCopy.gallery.shareProfileImage }));

    expect(await screen.findByText(appCopy.gallery.shareUnavailable)).toBeInTheDocument();
  });
});
