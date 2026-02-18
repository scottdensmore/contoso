import { beforeEach, describe, expect, it, vi } from "vitest";

describe("Chat Service Route Contract", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
    process.env.CHAT_ENDPOINT = "http://chat.local/api/create_response";
    process.env.CHAT_API_KEY = "contract-test-key";
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("forwards web payload contract to chat service and returns answer payload", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          answer: "A valid contract response",
          context: [],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const { POST } = await import("./route");
    const payload = {
      question: "Recommend a tent",
      customer_id: "1",
      chat_history: "[]",
    };

    const response = await POST(
      new Request("http://localhost/api/chat/service", {
        method: "POST",
        body: JSON.stringify(payload),
      }) as any,
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "http://chat.local/api/create_response",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: "Bearer contract-test-key",
        }),
        body: JSON.stringify(payload),
      }),
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      answer: "A valid contract response",
      context: [],
    });
  });

  it("returns chat service error contract when upstream response is non-2xx", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("chat unavailable", {
        status: 503,
        headers: { "Content-Type": "text/plain" },
      }),
    );

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/chat/service", {
        method: "POST",
        body: JSON.stringify({ question: "Hello", customer_id: "1", chat_history: "[]" }),
      }) as any,
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: "Chat service error",
      status: 503,
    });
  });
});
