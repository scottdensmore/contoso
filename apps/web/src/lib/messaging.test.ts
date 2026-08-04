import { afterEach, describe, expect, it, vi } from "vitest";
import { sendChatMessage } from "./messaging";
import { ChatTurn } from "./types";

describe("sendChatMessage", () => {
  const turn: ChatTurn = {
    name: "Guest",
    avatar: "",
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

  it("does not leak transport detail into the user-facing error", async () => {
    // The failure is logged for operators. "HTTP error! status: 500" tells a
    // shopper nothing and exposes internals; the component's own error path
    // already used a generic string, so the two diverged.
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("upstream exploded", { status: 500 }),
    );

    const result = await sendChatMessage(turn);

    expect(result.message).not.toMatch(/\b500\b/);
    expect(result.message).not.toMatch(/HTTP error/i);
    expect(result.message).toBe("Sorry, something went wrong. Please try again.");
    expect(result.status).toBe("done");
    expect(result.type).toBe("assistant");

    // The detail still has to reach the logs.
    expect(consoleError).toHaveBeenCalled();
  });

  it("returns the same generic message when the network itself fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("ECONNREFUSED"));

    const result = await sendChatMessage(turn);

    expect(result.message).not.toMatch(/ECONNREFUSED/);
    expect(result.message).toBe("Sorry, something went wrong. Please try again.");
  });
});
