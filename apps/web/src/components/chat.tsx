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
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const greetingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Opening the panel left focus on the launcher, so the next Tab continued
  // into the page behind it rather than into the conversation.
  useEffect(() => {
    if (showChat) inputRef.current?.focus();
  }, [showChat]);

  // Bound to the document so Escape works wherever focus sits inside the
  // panel, but scoped to events originating within it. Unscoped, Escape while
  // the site's nav drawer was open dismissed the chat underneath it and left
  // the drawer up — closing the layer the user was not interacting with.
  useEffect(() => {
    if (!showChat) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const target = event.target as Node;
      const inPanel = panelRef.current?.contains(target);
      const onLauncher = launcherRef.current === target;
      if (!inPanel && !onLauncher) return;
      setShowChat(false);
      launcherRef.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [showChat]);

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

  const greeting = (): ChatTurn => ({
    name: "Jane Doe",
    message: `Hi ${session?.user?.name || "there"}, how can I be helpful today?`,
    status: "done",
    type: "assistant",
    avatar: "",
  });

  const reset = () => {
    setMessage("");
    pendingIds.current.clear();
    dispatch({ type: "clear" });
    // Cancel the timer toggleChat queued. Resetting within 400ms of opening
    // otherwise seeds the greeting here and again when that timer fires.
    if (greetingTimer.current) clearTimeout(greetingTimer.current);
    // Re-seed rather than leaving the panel blank. The greeting only rendered
    // on open, so a cleared thread stayed empty for the rest of the session —
    // a state that was unreachable while the reset control was not a control.
    dispatch({ type: "add", payload: greeting() });
    inputRef.current?.focus();
  };

  const sendMessage = () => {
    // Trimmed: the guard was `message === ""`, so three spaces and Enter fired
    // a real request and rendered an empty bubble. Before anything is minted —
    // registering a pending id for a send that never happens leaves an entry
    // nothing can remove, so the set stops meaning "replies still wanted".
    const question = message.trim();
    if (question === "") return;

    const userName = session?.user?.name || "Guest";
    const userAvatar = (session?.user as any)?.image || "";
    const customerId = (session?.user as any)?.id;

    const newTurn: ChatTurn = {
      name: userName,
      message: question,
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

    if (showChat) {
      // Closing dropped focus to <body>, so the next Tab restarted at the top
      // of the document — 24 stops back to this launcher. Moving focus in on
      // open is only half the contract.
      launcherRef.current?.focus();
      // Cancel an unfired greeting. The open branch below guards on
      // turns.length, but a pending timer has not dispatched yet, so closing
      // and reopening inside 400ms — an ordinary impatient tap — schedules a
      // second timer and both fire.
      if (greetingTimer.current) clearTimeout(greetingTimer.current);
      return;
    }

    scrollChat();
    if (state.turns.length === 0) {
      greetingTimer.current = setTimeout(() => {
        dispatch({ type: "add", payload: greeting() });
      }, 400);
    }
  };

  return (
    <>
      <div className="fixed bottom-0 right-0 mr-4 mb-4 sm:mr-12 sm:mb-12 z-10 flex flex-col items-end">
        {showChat && (
          // Width was a flat w-[650px]. At 390px the panel rendered at
          // left:-308, clipping message text outside the viewport entirely.
          // dvh rather than vh so mobile browser chrome does not push the input
          // below the fold.
          <div
            ref={panelRef}
            role="dialog"
            aria-label="Chat with Jane Doe"
            tabIndex={-1}
            className="mb-3 flex flex-col shadow-md bg-white rounded-lg outline-none
                       w-[min(650px,calc(100vw-2rem))]
                       sm:w-[min(650px,calc(100vw-7rem))]
                       h-[calc(100dvh-6rem)] sm:h-[calc(100vh-7rem)]"
          >
            <div className="p-2 flex justify-end">
              <button
                type="button"
                onClick={reset}
                aria-label="Clear conversation"
                className="p-2 rounded-md hover:bg-zinc-100 hover:cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
              >
                <ArrowPathIcon className="w-5 stroke-zinc-500" aria-hidden="true" />
              </button>
            </div>
            {/* chat section */}
            <div
              // Turns mutate with no announcement otherwise: a screen-reader
              // user gets no signal that the assistant is working or that an
              // answer arrived.
              role="log"
              aria-live="polite"
              aria-label="Conversation"
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
                ref={inputRef}
                aria-label="Message"
                placeholder="Ask about a product..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyUp={(e) => {
                  if (e.code === "Enter") sendMessage();
                }}
                // Resting ring was zinc-300 and the focus ring was the same
                // colour, so focus was indicated by the browser default alone.
                className="block p-2 grow rounded-md text-zinc-700 placeholder:text-zinc-500 placeholder:opacity-100 shadow-xs ring-2 ring-inset ring-zinc-300 focus:ring-sky-700 focus:outline-none"
              />
              <button
                type="button"
                onClick={sendMessage}
                aria-label="Send message"
                className="rounded-md p-2 border-solid border-2 border-zinc-300 hover:cursor-pointer hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
              >
                <PaperAirplaneIcon className="w-6 stroke-zinc-500" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
        <button
          ref={launcherRef}
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
