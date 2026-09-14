import { ChatTurn } from "./types";

interface ChatServiceResponse {
  answer?: string;
  response?: string;
  context?: unknown[];
}

interface ProductLink {
  name: string;
  href: string;
}

export interface StreamCallbacks {
  onChunk: (text: string) => void;
  onDone?: (finalMessage: string) => void;
  onError?: (err: Error) => void;
}

const PRODUCTS_PATH_PREFIX = "/products/";

const asRecord = (value: unknown): Record<string, unknown> | null => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
};

const getString = (
  record: Record<string, unknown> | null,
  key: string
): string | null => {
  if (!record) return null;
  const value = record[key];
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const normalizeProductHref = (
  slugOrUrl: string | null,
  fallbackName: string | null
): string | null => {
  if (slugOrUrl) {
    if (slugOrUrl.startsWith(PRODUCTS_PATH_PREFIX)) return slugOrUrl;
    if (slugOrUrl.startsWith("products/")) return `/${slugOrUrl}`;

    if (slugOrUrl.startsWith("http://") || slugOrUrl.startsWith("https://")) {
      try {
        const url = new URL(slugOrUrl);
        if (url.pathname.startsWith(PRODUCTS_PATH_PREFIX)) return url.pathname;
      } catch {
        // Ignore malformed URL and continue with fallback behavior.
      }
    }

    if (!slugOrUrl.includes("/") && !slugOrUrl.includes(" ")) {
      return `${PRODUCTS_PATH_PREFIX}${slugOrUrl}`;
    }
  }

  if (!fallbackName) return null;
  const slug = slugify(fallbackName);
  if (!slug) return null;
  return `${PRODUCTS_PATH_PREFIX}${slug}`;
};

const extractProductLinks = (context: unknown): ProductLink[] => {
  if (!Array.isArray(context)) return [];

  const links: ProductLink[] = [];
  const seen = new Set<string>();

  for (const item of context) {
    const record = asRecord(item);
    if (!record) continue;

    const structData =
      asRecord(record.structData) ??
      asRecord(record.struct_data) ??
      asRecord(record.derivedStructData) ??
      asRecord(record.derived_struct_data);

    const name =
      getString(record, "name") ??
      getString(structData, "name") ??
      getString(record, "title") ??
      getString(structData, "title");

    const slugOrUrl =
      getString(record, "slug") ??
      getString(structData, "slug") ??
      getString(record, "url") ??
      getString(structData, "url");

    const href = normalizeProductHref(slugOrUrl, name);
    if (!name || !href || seen.has(href)) continue;

    seen.add(href);
    links.push({ name, href });
  }

  return links;
};

const appendProductLinks = (answer: string, links: ProductLink[]): string => {
  if (links.length === 0) return answer;

  const existingLinks = new Set(
    Array.from(answer.matchAll(/\[[^\]]+\]\((\/products\/[^)\s]+)\)/g)).map(
      (match) => match[1]
    )
  );

  const missingLinks = links.filter((link) => !existingLinks.has(link.href));
  if (missingLinks.length === 0) return answer;

  const lines = missingLinks.map((link) => `- [${link.name}](${link.href})`);
  return `${answer}\n\n**Product links:**\n${lines.join("\n")}`;
};

export const sendChatMessage = async (
  turn: ChatTurn,
  customerId?: string
): Promise<ChatTurn> => {
  const body = {
    question: turn.message,
    customer_id: customerId ? customerId.toString() : null,
    chat_history: "[]",
  };

  try {
    const response = await fetch("/api/chat/service", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = (await response.json()) as ChatServiceResponse;
    const answer = data["answer"] || data["response"] || "I received an empty response from the server.";
    const links = extractProductLinks(data.context);
    const message = appendProductLinks(answer, links);

    return {
      name: "Jane Doe",
      message,
      status: "done",
      type: "assistant",
      avatar: "",
    };
  } catch (error) {
    console.error("Error sending chat message:", error);
    return {
      name: "Jane Doe",
      // Logged above for operators. Surfacing "HTTP error! status: 500" to a
      // shopper tells them nothing and exposes transport internals. Matches the
      // string the component uses when a request rejects.
      message: "Sorry, something went wrong. Please try again.",
      status: "done",
      type: "assistant",
      avatar: "",
    };
  }
};

export const streamChatMessage = async (
  turn: ChatTurn,
  callbacks: StreamCallbacks,
  customerId?: string
): Promise<ChatTurn> => {
  const body = {
    question: turn.message,
    customer_id: customerId ? customerId.toString() : null,
    chat_history: "[]",
  };

  try {
    const response = await fetch("/api/chat/service?stream=true", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
      throw new Error("No response body received from chat service");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    let accumulatedText = "";
    const accumulatedLinks: ProductLink[] = [];
    let buffer = "";

    const processEventData = (dataStr: string) => {
      const trimmed = dataStr.trim();
      if (trimmed === "[DONE]") {
        return;
      }

      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === "object") {
          if (parsed.error) {
            throw new Error(String(parsed.error));
          }

          if (parsed.context) {
            accumulatedLinks.push(...extractProductLinks(parsed.context));
          }
          if (parsed.citations) {
            accumulatedLinks.push(...extractProductLinks(parsed.citations));
          }
          if (parsed.products) {
            accumulatedLinks.push(...extractProductLinks(parsed.products));
          }

          const chunkText =
            typeof parsed.chunk === "string"
              ? parsed.chunk
              : typeof parsed.text === "string"
              ? parsed.text
              : typeof parsed.content === "string"
              ? parsed.content
              : typeof parsed.delta === "string"
              ? parsed.delta
              : typeof parsed.delta?.content === "string"
              ? parsed.delta.content
              : null;

          if (chunkText !== null) {
            accumulatedText += chunkText;
            callbacks.onChunk(accumulatedText);
          }
          return;
        }
      } catch (err) {
        if (
          err instanceof Error &&
          !err.message.includes("Unexpected token") &&
          !err.message.includes("is not valid JSON") &&
          !err.message.includes("JSON")
        ) {
          throw err;
        }
        if (trimmed.length > 0) {
          accumulatedText += trimmed;
          callbacks.onChunk(accumulatedText);
        }
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() || "";

      for (const part of parts) {
        const lines = part.split("\n");
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith("data:")) {
            const dataContent = trimmedLine.slice(5).trim();
            processEventData(dataContent);
          }
        }
      }
    }

    if (buffer.trim().length > 0) {
      const lines = buffer.split("\n");
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith("data:")) {
          const dataContent = trimmedLine.slice(5).trim();
          processEventData(dataContent);
        }
      }
    }

    const answer = accumulatedText || "I received an empty response from the server.";
    const message = appendProductLinks(answer, accumulatedLinks);

    callbacks.onDone?.(message);

    return {
      name: "Jane Doe",
      message,
      status: "done",
      type: "assistant",
      avatar: "",
    };
  } catch (error) {
    console.error("Error streaming chat message:", error);
    const err = error instanceof Error ? error : new Error(String(error));
    callbacks.onError?.(err);
    throw err;
  }
};
