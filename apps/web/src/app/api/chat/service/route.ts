import { type NextRequest } from "next/server";
const api_endpoint = process.env.CHAT_ENDPOINT!;
const api_key = process.env.CHAT_API_KEY!;

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const streamQuery = url.searchParams.get("stream") === "true";
    const request_body = await req.json();
    const isStreaming = streamQuery || Boolean(request_body.stream);

    console.log(`[API] Received chat request for customer ${request_body.customer_id}${isStreaming ? " (streaming)" : ""}`);

    const baseEndpoint = process.env.CHAT_ENDPOINT || api_endpoint;
    const apiKey = process.env.CHAT_API_KEY || api_key;

    const targetEndpoint = isStreaming
      ? (baseEndpoint.endsWith("/stream") ? baseEndpoint : `${baseEndpoint}/stream`)
      : baseEndpoint;

    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + apiKey,
    };

    console.log(`[API] Forwarding request to ${targetEndpoint}`);
    const response = await fetch(targetEndpoint, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(request_body),
    });

    if (!response.ok) {
      console.error(`[API] Chat service responded with status ${response.status}`);
      const errorText = await response.text();
      console.error(`[API] Error details: ${errorText}`);
      return Response.json({ error: "Chat service error", status: response.status }, { status: response.status });
    }

    if (isStreaming) {
      return new Response(response.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
        },
      });
    }

    const data = await response.json();
    console.log(`[API] Successfully received response from chat service`);

    return Response.json(data);
  } catch (error) {
    console.error(`[API] Unexpected error in chat route:`, error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
