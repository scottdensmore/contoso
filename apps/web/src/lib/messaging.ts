import { ChatTurn, GroundedMessage } from "./types";

interface ChatServiceResponse {
  answer?: string;
  response?: string;
  context?: unknown[];
}

interface ProductLink {
  name: string;
  href: string;
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

export const sendGroundedMessage = async (
  turn: ChatTurn
): Promise<ChatTurn> => {
  const message = [
    {
      role: turn.type === "user" ? "user" : "assistant",
      content: turn.message,
    },
  ];

  const response = await fetch("/api/chat/grounded", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });

  const data = (await response.json()) as GroundedMessage;

  const newTurn: ChatTurn = {
    name: "Jane Doe",
    message: data.message,
    status: "done",
    type: "assistant",
    avatar: "",
    image: null,
  };

  return newTurn;
};

export const sendChatMessage = async (
  turn: ChatTurn,
  customerId?: string
): Promise<ChatTurn> => {
  const body = {
    chat_history: "[]",
    question: turn.message,
    customer_id: customerId ? customerId.toString() : null,
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
      image: null,
    };
  } catch (error) {
    console.error("Error sending chat message:", error);
    return {
      name: "Jane Doe",
      message: `Sorry, I encountered an error: ${error instanceof Error ? error.message : String(error)}`,
      status: "done",
      type: "assistant",
      avatar: "",
      image: null,
    };
  }
};

export const sendVisualMessage = async (
  turn: ChatTurn,
  customerId?: string
): Promise<ChatTurn> => {
  let image_contents: any = {};

  if (turn.image) {
    const contents = turn.image.split(",");
    image_contents[contents[0]] = contents[1];
  } else {
    // send empty image - this is a single black pixel
    // which the prompt flow ignores given it's too small
    image_contents["data:image/png;base64"] =
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGD4DwABBAEAX+XDSwAAAABJRU5ErkJggg==";
  }

  const body = {
    chat_history: "[]",
    question: turn.message,
    customer_id: customerId ? customerId.toString() : null,
  };

  try {
    const response = await fetch("/api/chat/visual", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const answer = data["answer"] || data["response"] || "I received an empty response from the server.";

    return {
      name: "Jane Doe",
      message: answer,
      status: "done",
      type: "assistant",
      avatar: "",
      image: null,
    };
  } catch (error) {
    console.error("Error sending visual message:", error);
    return {
      name: "Jane Doe",
      message: `Sorry, I encountered an error: ${error instanceof Error ? error.message : String(error)}`,
      status: "done",
      type: "assistant",
      avatar: "",
      image: null,
    };
  }
};
