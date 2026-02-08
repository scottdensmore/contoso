import { ChatTurn, GroundedMessage } from "./types";

export const sendGroundedMessage = async (
  turn: ChatTurn
): Promise<ChatTurn> => {
  const message = [
    {
      role: turn.type === "user" ? "user" : "assistant",
      content: turn.message,
    },
  ];

  console.log(message);

  const response = await fetch("/api/chat/grounded", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });

  const data = (await response.json()) as GroundedMessage;
  console.log(data);

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
