import { afterEach, describe, expect, it, vi } from "vitest";
import { sendChatMessage } from "./messaging";
import { ChatTurn } from "./types";

describe("sendChatMessage", () => {
  const turn: ChatTurn = {
    name: "Guest",
    avatar: "",
    image: null,
    message: "Recommend a tent",
    status: "done",
    type: "user",
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("appends product links from context metadata", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          answer: "TrailMaster X4 Tent and Alpine Explorer Tent are great options.",
          context: [
            { name: "TrailMaster X4 Tent", slug: "trailmaster-x4-tent" },
            {
              structData: {
                name: "Alpine Explorer Tent",
                url: "/products/alpine-explorer-tent",
              },
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    const result = await sendChatMessage(turn, "1");

    expect(result.message).toContain("**Product links:**");
    expect(result.message).toContain("- [TrailMaster X4 Tent](/products/trailmaster-x4-tent)");
    expect(result.message).toContain("- [Alpine Explorer Tent](/products/alpine-explorer-tent)");
  });

  it("does not duplicate product links already present in model output", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          answer:
            "Try [TrailMaster X4 Tent](/products/trailmaster-x4-tent) for a lightweight setup.",
          context: [{ name: "TrailMaster X4 Tent", slug: "trailmaster-x4-tent" }],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    const result = await sendChatMessage(turn, "1");

    expect(result.message).toBe(
      "Try [TrailMaster X4 Tent](/products/trailmaster-x4-tent) for a lightweight setup."
    );
  });

  it("builds product links from context names when slug metadata is missing", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          answer: "TrailMaster X4 Tent has strong rain performance.",
          context: [{ name: "TrailMaster X4 Tent" }],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    const result = await sendChatMessage(turn, "1");

    expect(result.message).toContain("- [TrailMaster X4 Tent](/products/trailmaster-x4-tent)");
  });
});
