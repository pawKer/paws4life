import { describe, expect, it, vi } from "vitest";

import {
  createProfileBatches,
  enrichPetProfiles,
  generatePetProfiles,
  petProfilePrompt
} from "@/lib/pets/profile-generator";

describe("pet profile generator", () => {
  it("batches profile candidates", () => {
    expect(createProfileBatches([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it("requests structured JSON profiles from the Responses API", async () => {
    const request = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          output_text: JSON.stringify({
            profiles: [
              {
                id: "pet_868",
                name: "Maya",
                bio: "Maya are un zambet bland, pasi curiosi si chef de plimbari senine."
              }
            ]
          })
        }),
        { status: 200 }
      );
    });
    const logger = {
      info: vi.fn()
    };

    const profiles = await generatePetProfiles(
      [
        {
          id: "pet_868",
          registryNumber: "868",
          approximateAge: "4-5 ani",
          sex: "female",
          color: "alb-maro",
          captureLocation: "Cartier Bariera Valcii",
          characteristics: "Talie mijlocie, culoare alb-maro."
        }
      ],
      {
        apiKey: "test-key",
        model: "gpt-5-mini",
        request,
        usedNames: ["Luna"],
        logIo: true,
        logger
      }
    );

    expect(profiles).toEqual([
      {
        id: "pet_868",
        name: "Maya",
        bio: "Maya are un zambet bland, pasi curiosi si chef de plimbari senine."
      }
    ]);

    const requestCalls = request.mock.calls as unknown as Array<
      [string | URL | Request, RequestInit?]
    >;
    const [, init] = requestCalls[0];
    const body = JSON.parse(String(init?.body));
    const input = JSON.parse(body.input[0].content);

    expect(body.model).toBe("gpt-5-mini");
    expect(body.instructions).toBe(petProfilePrompt);
    expect(body.text.format).toMatchObject({
      type: "json_schema",
      name: "pet_profiles",
      strict: true
    });
    expect(input).toEqual({
      usedNames: ["Luna"],
      pets: [
        {
          id: "pet_868",
          registryNumber: "868",
          age: "4-5 ani",
          sex: "Femela",
          color: "alb-maro",
          location: "Cartier Bariera Valcii",
          characteristics: "Talie mijlocie, culoare alb-maro."
        }
      ]
    });
    expect(logger.info).toHaveBeenCalledWith(
      "OpenAI profile generation input",
      expect.objectContaining({
        model: "gpt-5-mini",
        count: 1,
        input
      })
    );
    expect(logger.info).toHaveBeenCalledWith(
      "OpenAI profile generation parsed output",
      {
        count: 1,
        profiles
      }
    );
  });

  it("logs OpenAI error output when profile generation fails", async () => {
    const request = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          error: {
            message: "quota exceeded",
            type: "insufficient_quota"
          }
        }),
        { status: 429 }
      );
    });
    const logger = {
      info: vi.fn()
    };

    await expect(
      generatePetProfiles(
        [
          {
            id: "pet_868",
            registryNumber: "868",
            approximateAge: "4-5 ani",
            sex: "female",
            color: "alb-maro",
            captureLocation: "Cartier Bariera Valcii",
            characteristics: "Talie mijlocie, culoare alb-maro."
          }
        ],
        {
          apiKey: "test-key",
          model: "gpt-5-mini",
          request,
          logIo: true,
          logger
        }
      )
    ).rejects.toThrow("OpenAI profile generation failed with HTTP 429");

    expect(logger.info).toHaveBeenCalledWith(
      "OpenAI profile generation error output",
      {
        status: 429,
        body: JSON.stringify({
          error: {
            message: "quota exceeded",
            type: "insufficient_quota"
          }
        })
      }
    );
  });

  it("passes generated names from earlier batches into later batch used names", async () => {
    const requestInputs: Array<{ usedNames: string[] }> = [];
    const request = vi.fn(async (_url, init) => {
      const input = JSON.parse(
        JSON.parse(String(init?.body)).input[0].content,
      ) as { usedNames: string[]; pets: Array<{ id: string }> };
      requestInputs.push(input);
      const pet = input.pets[0];
      const name = pet.id === "pet_1" ? "Maya" : "Toby";

      return new Response(
        JSON.stringify({
          output_text: JSON.stringify({
            profiles: [
              {
                id: pet.id,
                name,
                bio: `${name} are chef de plimbari si priviri senine.`,
              },
            ],
          }),
        }),
        { status: 200 },
      );
    });
    const db = {
      pet: {
        update: vi.fn(async ({ data }) => data),
      },
    };

    await enrichPetProfiles({
      db: db as never,
      pets: [
        {
          id: "pet_1",
          registryNumber: "1",
          approximateAge: null,
          sex: "female",
          color: null,
          captureLocation: null,
          characteristics: null,
        },
        {
          id: "pet_2",
          registryNumber: "2",
          approximateAge: null,
          sex: "male",
          color: null,
          captureLocation: null,
          characteristics: null,
        },
      ],
      batchSize: 1,
      apiKey: "test-key",
      request,
      usedNames: ["Luna"],
    });

    expect(requestInputs.map((input) => input.usedNames)).toEqual([
      ["Luna"],
      ["Luna", "Maya"],
    ]);
  });

  it("keeps existing names when requested while still updating generated bios", async () => {
    const request = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          output_text: JSON.stringify({
            profiles: [
              {
                id: "pet_1",
                name: "Maya",
                bio: "Maya stie sa transforme fiecare zi intr-o plimbare cu zambet.",
              },
            ],
          }),
        }),
        { status: 200 },
      );
    });
    const db = {
      pet: {
        update: vi.fn(async ({ data }) => data),
      },
    };
    const now = () => new Date("2026-06-22T12:00:00.000Z");

    await enrichPetProfiles({
      db: db as never,
      pets: [
        {
          id: "pet_1",
          registryNumber: "1",
          approximateAge: null,
          sex: "female",
          color: null,
          captureLocation: null,
          characteristics: null,
          profileName: "Luna",
        },
      ],
      apiKey: "test-key",
      request,
      nameMode: "keep",
      now,
    });

    expect(db.pet.update).toHaveBeenCalledWith({
      where: { id: "pet_1" },
      data: {
        profileBio: "Maya stie sa transforme fiecare zi intr-o plimbare cu zambet.",
        profileGeneratedAt: now(),
        profileModel: "gpt-5-mini",
        shareImagesGeneratedAt: null,
      },
    });
  });

  it("fills missing names even when keep mode is requested", async () => {
    const request = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          output_text: JSON.stringify({
            profiles: [
              {
                id: "pet_1",
                name: "Maya",
                bio: "Maya vine cu pasi curiosi si chef de joaca molipsitor.",
              },
            ],
          }),
        }),
        { status: 200 },
      );
    });
    const db = {
      pet: {
        update: vi.fn(async ({ data }) => data),
      },
    };

    await enrichPetProfiles({
      db: db as never,
      pets: [
        {
          id: "pet_1",
          registryNumber: "1",
          approximateAge: null,
          sex: "female",
          color: null,
          captureLocation: null,
          characteristics: null,
          profileName: null,
        },
      ],
      apiKey: "test-key",
      request,
      nameMode: "keep",
    });

    expect(db.pet.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          profileName: "Maya",
          profileBio: "Maya vine cu pasi curiosi si chef de joaca molipsitor.",
        }),
      }),
    );
  });
});
