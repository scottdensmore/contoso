import { afterEach, describe, expect, it, vi } from "vitest";
import { sendChatMessage, streamChatMessage } from "./messaging";
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

describe("streamChatMessage", () => {
  const turn: ChatTurn = {
    name: "Guest",
    avatar: "",
    message: "Recommend camping gear",
    status: "done",
    type: "user",
  };

  function createSseStream(chunks: string[]): ReadableStream<Uint8Array> {
    const encoder = new TextEncoder();
    return new ReadableStream({
      start(controller) {
        for (const chunk of chunks) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      },
    });
  }

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends POST /api/chat/service?stream=true and streams accumulated chunks to onChunk", async () => {
    const sseChunks = [
      'data: {"chunk": "Here are "}\n\n',
      'data: {"chunk": "some great "}\n\n',
      'data: {"chunk": "options."}\n\n',
      'data: [DONE]\n\n',
    ];

    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(createSseStream(sseChunks), {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
      }),
    );

    const onChunk = vi.fn();
    const onDone = vi.fn();

    const result = await streamChatMessage(
      turn,
      { onChunk, onDone },
      "42",
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/chat/service?stream=true",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: "Recommend camping gear",
          customer_id: "42",
          chat_history: "[]",
        }),
      }),
    );

    expect(onChunk).toHaveBeenCalledTimes(3);
    expect(onChunk).toHaveBeenNthCalledWith(1, "Here are ");
    expect(onChunk).toHaveBeenNthCalledWith(2, "Here are some great ");
    expect(onChunk).toHaveBeenNthCalledWith(3, "Here are some great options.");

    expect(onDone).toHaveBeenCalledWith("Here are some great options.");
    expect(result).toEqual({
      name: "Jane Doe",
      message: "Here are some great options.",
      status: "done",
      type: "assistant",
      avatar: "",
    });
  });

  it("handles metadata events and appends product links on [DONE]", async () => {
    const sseChunks = [
      'data: {"event": "citations", "citations": [{"name": "Alpine Explorer Tent", "slug": "alpine-explorer-tent"}]}\n\n',
      'data: {"chunk": "The Alpine Explorer is durable."}\n\n',
      'data: [DONE]\n\n',
    ];

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(createSseStream(sseChunks), {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
      }),
    );

    const onChunk = vi.fn();
    const result = await streamChatMessage(turn, { onChunk }, "42");

    expect(result.message).toContain("The Alpine Explorer is durable.");
    expect(result.message).toContain("**Product links:**");
    expect(result.message).toContain("- [Alpine Explorer Tent](/products/alpine-explorer-tent)");
  });

  it("extracts product links from context metadata in chunks", async () => {
    const sseChunks = [
      'data: {"context": [{"name": "TrailMaster X4", "url": "/products/trailmaster-x4"}]}\n\n',
      'data: {"chunk": "TrailMaster X4 is spacious."}\n\n',
      'data: [DONE]\n\n',
    ];

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(createSseStream(sseChunks), {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
      }),
    );

    const onChunk = vi.fn();
    const result = await streamChatMessage(turn, { onChunk });

    expect(result.message).toContain("TrailMaster X4 is spacious.");
    expect(result.message).toContain("- [TrailMaster X4](/products/trailmaster-x4)");
  });

  it("calls onError and rejects or handles upstream HTTP failure", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("Internal Server Error", { status: 500 }),
    );

    const onChunk = vi.fn();
    const onError = vi.fn();

    await expect(
      streamChatMessage(turn, { onChunk, onError }),
    ).rejects.toThrow();

    expect(onError).toHaveBeenCalled();
  });

  it("calls onError when stream contains error payload", async () => {
    const sseChunks = [
      'data: {"error": "LLM generation failed"}\n\n',
    ];

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(createSseStream(sseChunks), {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
      }),
    );

    const onChunk = vi.fn();
    const onError = vi.fn();

    await expect(
      streamChatMessage(turn, { onChunk, onError }),
    ).rejects.toThrow(/LLM generation failed/);

    expect(onError).toHaveBeenCalled();
  });
});
