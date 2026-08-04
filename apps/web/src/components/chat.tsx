"use client";

import { useEffect, useRef, useState, useReducer } from "react";
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import Turn from "./turn";
import { ChatTurn } from "@/lib/types";
import { useSession } from "next-auth/react";
import { sendChatMessage } from "@/lib/messaging";

interface ChatAction {
  type: "add" | "clear" | "resolve";
  payload?: ChatTurn;
  id?: string;
}

interface ChatState {
  turns: ChatTurn[];
}

function chatReducer(state: ChatState, action: ChatAction) {
  switch (action.type) {
    case "add":
      return { turns: [...state.turns, action.payload!] };
    case "clear":
      return { turns: [] };
    case "resolve": {
      // Replace the placeholder this reply owns. If it is not present — the
      // thread was reset, or it never appeared because the reply was fast —
      // append instead, so no other turn is overwritten.
      const index = state.turns.findIndex((turn) => turn.id === action.id);
      if (index === -1) return { turns: [...state.turns, action.payload!] };
      const turns = [...state.turns];
      turns[index] = action.payload!;
      return { turns };
    }
    default:
      throw new Error();
  }
}

export const Chat = () => {
  const { data: session } = useSession();
  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState("");

  const [state, dispatch] = useReducer(chatReducer, { turns: [] });

  const chatDiv = useRef<HTMLDivElement>(null);

  const scrollChat = () => {
    setTimeout(() => {
      if (chatDiv.current) {
        chatDiv.current.scrollTo({
          top: chatDiv.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 10);
  };

  useEffect(() => {
    scrollChat();
  }, [state.turns.length]);

  // Ids of sends whose replies this thread still wants. A reset empties it, so
  // anything already in flight is abandoned rather than landing in a
  // conversation the user cleared.
  const pendingIds = useRef<Set<string>>(new Set());

  const reset = () => {
    setMessage("");
    pendingIds.current.clear();
    dispatch({ type: "clear" });
  };

  const sendMessage = () => {
    // Before anything is minted. Registering a pending id for a send that never
    // happens leaves an entry nothing can remove, so the set stops meaning
    // "replies this thread is still waiting for".
    if (message === "") return;

    const userName = session?.user?.name || "Guest";
    const userAvatar = (session?.user as any)?.image || "";
    const customerId = (session?.user as any)?.id;

    const newTurn: ChatTurn = {
      name: userName,
      message: message,
      status: "done",
      type: "user",
      avatar: userAvatar,
    };

    // Each send owns a placeholder identified by id. Positional replacement
    // breaks as soon as two sends overlap, because "the last turn" may belong
    // to the other request — the reply then overwrites a turn it does not own
    // and the other placeholder spins forever.
    const pendingId = `pending-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    pendingIds.current.add(pendingId);

    const showPlaceholder = () =>
      setTimeout(() => {
        // Membership covers both cases: the reply already settled, or the
        // thread was reset. Either way this placeholder has no owner.
        if (!pendingIds.current.has(pendingId)) return;
        dispatch({
          type: "add",
          payload: {
            id: pendingId,
            name: "Jane Doe",
            message: "Let me see what I can find...",
            status: "waiting",
            type: "assistant",
            avatar: "",
          },
        });
      }, 400);

    const settle = (timer: ReturnType<typeof setTimeout>) => (responseTurn: ChatTurn) => {
      clearTimeout(timer);
      // Two jobs in one call. The return value is the guard: a reset between
      // the request and its reply removed the id, so the reply is dropped
      // rather than appended into the cleared thread as an answer to nothing.
      // The removal itself is hygiene — ids are unique, so a settled one left
      // behind changes no behaviour, it just accumulates for the lifetime of
      // the panel, which is mounted once in the root layout.
      if (!pendingIds.current.delete(pendingId)) return;
      dispatch({ type: "resolve", id: pendingId, payload: responseTurn });
    };

    // sendChatMessage resolves with an error turn rather than rejecting, but a
    // rejection would otherwise leave the placeholder spinning with no message.
    const settleWithError =
      (timer: ReturnType<typeof setTimeout>) => (error: unknown) => {
        console.error("Chat request failed:", error);
        settle(timer)({
          id: pendingId,
          name: "Jane Doe",
          message: "Sorry, something went wrong. Please try again.",
          status: "done",
          type: "assistant",
          avatar: "",
        });
      };

    const send = (request: Promise<ChatTurn>) => {
      const timer = showPlaceholder();
      request.then(settle(timer)).catch(settleWithError(timer));
    };

    dispatch({ type: "add", payload: newTurn });
    send(sendChatMessage(newTurn, customerId));

    setMessage("");
  };

  const toggleChat = () => {
    setShowChat(!showChat);
    if (!showChat) {
      scrollChat();
      if (state.turns.length === 0) {
        setTimeout(() => {
          const userName = session?.user?.name || "there";
          dispatch({
            type: "add",
            payload: {
              name: "Jane Doe",
              message: `Hi ${userName}, how can I be helpful today?`,
              status: "done",
              type: "assistant",
              avatar: "",
            },
          });
        }, 400);
      }
    }
  };

  return (
    <>
      <div className="fixed bottom-0 right-0 mr-12 mb-12 z-10 flex flex-col items-end ">
        {showChat && (
          <div className="mb-3 h-[calc(100vh-7rem)] shadow-md bg-white rounded-lg w-[650px] flex flex-col">
            <div className="text-right p-2 flex flex-col">
              <ArrowPathIcon className="w-5 stroke-zinc-500" onClick={reset} />
            </div>
            {/* chat section */}
            <div
              className="grow p-2 overscroll-contain overflow-auto"
              ref={chatDiv}
            >
              <div className="flex flex-col gap-4">
                {state.turns.map((turn, i) => (
                  <Turn key={i} turn={turn} />
                ))}
              </div>
            </div>
            {/* chat input section */}
            <div className="p-3 flex gap-3">
              <input
                id="chat"
                name="chat"
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyUp={(e) => {
                  if (e.code === "Enter") sendMessage();
                }}
                className="block p-2 grow rounded-md text-zinc-700 shadow-xs ring-2 ring-inset ring-zinc-300 focus:ring-zinc-300 focus:border-zinc-300"
              />
              <button
                className="rounded-md p-2 border-solid border-2 border-zinc-300 hover:cursor-pointer hover:bg-zinc-100"
                onClick={sendMessage}
              >
                <PaperAirplaneIcon className="w-6 stroke-zinc-500" />
              </button>
            </div>
          </div>
        )}
        <button
          className="bg-white rounded-full p-2 shadow-lg hover:cursor-pointer"
          onClick={toggleChat}
          aria-label={showChat ? "Close chat" : "Open chat"}
        >
          {showChat ? (
            <XMarkIcon className="w-6" />
          ) : (
            <ChatBubbleLeftRightIcon className="w-6" />
          )}
        </button>
      </div>
    </>
  );
};

export default Chat;
