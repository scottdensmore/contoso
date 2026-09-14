import { beforeEach, describe, expect, it, vi } from "vitest";

describe("Chat Service Route", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
    process.env.CHAT_ENDPOINT = "http://chat.local/api/create_response";
    process.env.CHAT_API_KEY = "test-api-key";
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("proxies to streaming endpoint and returns text/event-stream when ?stream=true", async () => {
    const streamBody = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("data: {\"chunk\":\"hello\"}\n\n"));
        controller.close();
      },
    });

    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(streamBody, {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
      }),
    );

    const { POST } = await import("./route");
    const payload = {
      question: "Recommend a tent",
      customer_id: "1",
      chat_history: "[]",
    };

    const response = await POST(
      new Request("http://localhost/api/chat/service?stream=true", {
        method: "POST",
        body: JSON.stringify(payload),
      }) as any,
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "http://chat.local/api/create_response/stream",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: "Bearer test-api-key",
        }),
        body: JSON.stringify(payload),
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("text/event-stream");
    expect(response.headers.get("Cache-Control")).toBe("no-cache");
    expect(response.body).toBeDefined();
  });

  it("proxies to streaming endpoint when body contains stream: true", async () => {
    const streamBody = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
        controller.close();
      },
    });

    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(streamBody, {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
      }),
    );

    const { POST } = await import("./route");
    const payload = {
      question: "Recommend boots",
      stream: true,
    };

    const response = await POST(
      new Request("http://localhost/api/chat/service", {
        method: "POST",
        body: JSON.stringify(payload),
      }) as any,
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "http://chat.local/api/create_response/stream",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(payload),
      }),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("text/event-stream");
  });

  it("uses api_endpoint as-is if it already ends with /stream", async () => {
    process.env.CHAT_ENDPOINT = "http://chat.local/api/create_response/stream";

    const streamBody = new ReadableStream({
      start(controller) {
        controller.close();
      },
    });

    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(streamBody, {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
      }),
    );

    const { POST } = await import("./route");
    const payload = { question: "Hello" };

    await POST(
      new Request("http://localhost/api/chat/service?stream=true", {
        method: "POST",
        body: JSON.stringify(payload),
      }) as any,
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "http://chat.local/api/create_response/stream",
      expect.anything(),
    );
  });

  it("returns error status when streaming upstream response is not ok", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("upstream unavailable", {
        status: 502,
        headers: { "Content-Type": "text/plain" },
      }),
    );

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/chat/service?stream=true", {
        method: "POST",
        body: JSON.stringify({ question: "Hello" }),
      }) as any,
    );

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: "Chat service error",
      status: 502,
    });
  });

  it("preserves non-streaming behavior when stream is not requested", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          answer: "Non-streaming answer",
          context: [],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const { POST } = await import("./route");
    const payload = { question: "Hello non-streaming" };

    const response = await POST(
      new Request("http://localhost/api/chat/service", {
        method: "POST",
        body: JSON.stringify(payload),
      }) as any,
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "http://chat.local/api/create_response",
      expect.anything(),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("application/json");
    await expect(response.json()).resolves.toEqual({
      answer: "Non-streaming answer",
      context: [],
    });
  });
});
