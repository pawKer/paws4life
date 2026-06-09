import { describe, expect, it, vi } from "vitest";

import {
  createProfileBatches,
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

    const [, init] = request.mock.calls[0];
    const body = JSON.parse(String(init?.body));
    const input = JSON.parse(body.input[0].content);

    expect(body.model).toBe("gpt-5-mini");
    expect(body.instructions).toBe(petProfilePrompt);
    expect(body.text.format).toMatchObject({
      type: "json_schema",
      name: "pet_profiles",
      strict: true
    });
    expect(input).toEqual([
      {
        id: "pet_868",
        registryNumber: "868",
        age: "4-5 ani",
        sex: "Femela",
        color: "alb-maro",
        location: "Cartier Bariera Valcii",
        characteristics: "Talie mijlocie, culoare alb-maro."
      }
    ]);
    expect(logger.info).toHaveBeenCalledWith(
      "OpenAI profile generation input",
      expect.objectContaining({
        model: "gpt-5-mini",
        count: 1,
        pets: input
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
});
