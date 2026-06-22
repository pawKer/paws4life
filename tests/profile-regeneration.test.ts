import type { PrismaClient } from "@prisma/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { enrichPetProfiles } from "@/lib/pets/profile-generator";
import { regenerateAvailablePetProfiles } from "@/lib/pets/profile-regeneration";

describe("profile regeneration", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("regenerates profiles for every available pet, regardless of existing copy", async () => {
    const availablePets = [
      {
        id: "pet_1",
        registryNumber: "931",
        approximateAge: "6-7 ani",
        sex: "female",
        color: "maro",
        captureLocation: "Cartier Craiovita Noua",
        characteristics: "Talie mijlocie, culoare maro.",
        profileName: "Luna",
      },
      {
        id: "pet_2",
        registryNumber: "932",
        approximateAge: "5-6 ani",
        sex: "female",
        color: "alb-galben",
        captureLocation: "Cartier Veterani",
        characteristics: "Talie mica, culoare alb-galben.",
        profileName: "Maya",
      },
    ];
    const findMany = vi.fn(async () => availablePets);
    const db = {
      pet: {
        findMany,
      },
    } as unknown as PrismaClient;
    const enrichMock = vi.fn(async () => ({
      attemptedCount: 2,
      updatedCount: 2,
      skippedCount: 0,
      errors: [],
      model: "gpt-5-mini",
    }));

    const summary = await regenerateAvailablePetProfiles({
      db,
      batchSize: 7,
      apiKey: "test-key",
      logIo: true,
      enrich: enrichMock as unknown as typeof enrichPetProfiles,
    });

    expect(findMany).toHaveBeenCalledWith({
      where: {
        isAvailable: true,
        shelter: {
          isActive: true,
        },
      },
      orderBy: [{ captureDate: "asc" }, { registryNumber: "asc" }],
      select: {
        id: true,
        registryNumber: true,
        approximateAge: true,
        sex: true,
        color: true,
        captureLocation: true,
        characteristics: true,
        profileName: true,
      },
    });
    expect(enrichMock).toHaveBeenCalledWith(
      expect.objectContaining({
        db,
        pets: availablePets,
        batchSize: 7,
        apiKey: "test-key",
        logIo: true,
        nameMode: "replace",
      }),
    );
    expect(summary).toEqual({
      availableCount: 2,
      attemptedCount: 2,
      updatedCount: 2,
      skippedCount: 0,
      errors: [],
      model: "gpt-5-mini",
    });
  });

  it("uses keep mode from PROFILE_REGENERATE_NAMES", async () => {
    vi.stubEnv("PROFILE_REGENERATE_NAMES", "keep");
    const findMany = vi.fn(async () => [
      {
        id: "pet_1",
        registryNumber: "931",
        approximateAge: "6-7 ani",
        sex: "female",
        color: "maro",
        captureLocation: "Cartier Craiovita Noua",
        characteristics: "Talie mijlocie, culoare maro.",
        profileName: "Luna",
      },
    ]);
    const db = {
      pet: {
        findMany,
      },
    } as unknown as PrismaClient;
    const enrichMock = vi.fn(async () => ({
      attemptedCount: 1,
      updatedCount: 1,
      skippedCount: 0,
      errors: [],
      model: "gpt-5-mini",
    }));

    await regenerateAvailablePetProfiles({
      db,
      enrich: enrichMock as unknown as typeof enrichPetProfiles,
    });

    expect(enrichMock).toHaveBeenCalledWith(
      expect.objectContaining({
        nameMode: "keep",
      }),
    );
  });

  it("falls back to replace mode for invalid PROFILE_REGENERATE_NAMES values", async () => {
    vi.stubEnv("PROFILE_REGENERATE_NAMES", "rename-everybody");
    const db = {
      pet: {
        findMany: vi.fn(async () => []),
      },
    } as unknown as PrismaClient;
    const enrichMock = vi.fn(async () => ({
      attemptedCount: 0,
      updatedCount: 0,
      skippedCount: 0,
      errors: [],
      model: null,
    }));

    await regenerateAvailablePetProfiles({
      db,
      enrich: enrichMock as unknown as typeof enrichPetProfiles,
    });

    expect(enrichMock).toHaveBeenCalledWith(
      expect.objectContaining({
        nameMode: "replace",
      }),
    );
  });

  it("can limit regeneration to one shelter slug", async () => {
    const findMany = vi.fn(async () => []);
    const db = {
      pet: {
        findMany,
      },
    } as unknown as PrismaClient;

    await regenerateAvailablePetProfiles({
      db,
      shelterSlug: "adapost-canin-craiova",
      enrich: vi.fn(async () => ({
        attemptedCount: 0,
        updatedCount: 0,
        skippedCount: 0,
        errors: [],
        model: null,
      })) as unknown as typeof enrichPetProfiles,
    });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          isAvailable: true,
          shelter: {
            isActive: true,
            slug: "adapost-canin-craiova",
          },
        },
      }),
    );
  });
});
