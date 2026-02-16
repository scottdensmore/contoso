
import { type NextRequest } from "next/server";
const api_endpoint = process.env.CHAT_ENDPOINT!;
const api_key = process.env.CHAT_API_KEY!;

export async function POST(req: NextRequest) {
  try {
    const request_body = await req.json();
    console.log(`[API] Received chat request for customer ${request_body.customer_id}`);

    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + api_key,
    };

    console.log(`[API] Forwarding request to ${api_endpoint}`);
    const response = await fetch(api_endpoint, {
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

    const data = await response.json();
    console.log(`[API] Successfully received response from chat service`);

    return Response.json(data);
  } catch (error) {
    console.error(`[API] Unexpected error in chat route:`, error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
