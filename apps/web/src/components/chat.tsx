"use client";

import { useEffect, useRef, useState, useReducer } from "react";
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  CameraIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import Turn from "./turn";
import { ChatTurn, ChatType } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Video from "./video";
import {
  sendGroundedMessage,
  sendChatMessage,
  sendVisualMessage,
} from "@/lib/messaging";

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
  const [showVideo, setShowVideo] = useState(false);
  const [message, setMessage] = useState("");
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  const [state, dispatch] = useReducer(chatReducer, { turns: [] });

  const searchParams = useSearchParams();

  // Derived from the URL rather than synced into state via an effect. These
  // were only ever assigned here, so the effect just mirrored searchParams.
  const typeParams = searchParams.getAll("type");
  const chatType: ChatType = typeParams.includes("grounded")
    ? ChatType.Grounded
    : typeParams.includes("video")
      ? ChatType.Video
      : typeParams.includes("visual")
        ? ChatType.Visual
        : ChatType.Standard;
  const showCamera = chatType === ChatType.Video || chatType === ChatType.Visual;
  const video = chatType === ChatType.Video;

  const chatDiv = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

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
  }, [state.turns.length, currentImage]);

  const activateFileInput = () => {
    if (fileInput.current) {
      fileInput.current.click();
    }
  };

  const getImage = () => {
    if (video) {
      // ask for camera access
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((_stream) => {
          // show camera
          setShowVideo(true);
        })
        .catch((err) => {
          console.error(err);
          if (
            err.name == "NotAllowedError" ||
            err.name == "PermissionDeniedError"
          ) {
            alert("Please allow camera access to use this feature.");
          } else {
            setShowVideo(true);
          }
        });
    } else {
      activateFileInput();
    }
  };

  const readFile = (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (!e.target) return resolve(null);
        if (typeof e.target?.result === "string")
          return resolve(e.target?.result);
        else return resolve(null);
      };
      reader.readAsDataURL(file);
    });
  };

  const reset = () => {
    setCurrentImage(null);
    setMessage("");
    dispatch({ type: "clear" });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    readFile(file!).then((data) => {
      if (!data) return;
      setCurrentImage(data);
      e.target.value = "";
    });
  };

  const sendMessage = () => {
    const userName = session?.user?.name || "Guest";
    const userAvatar = (session?.user as any)?.image || "";
    const customerId = (session?.user as any)?.id;

    const newTurn: ChatTurn = {
      name: userName,
      message: message,
      status: "done",
      type: "user",
      avatar: userAvatar,
      image: currentImage,
    };

    // Each send owns a placeholder identified by id. Positional replacement
    // breaks as soon as two sends overlap, because "the last turn" may belong
    // to the other request — the reply then overwrites a turn it does not own
    // and the other placeholder spins forever.
    const pendingId = `pending-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    let settled = false;

    const showPlaceholder = () =>
      setTimeout(() => {
        if (settled) return;
        dispatch({
          type: "add",
          payload: {
            id: pendingId,
            name: "Jane Doe",
            message: "Let me see what I can find...",
            status: "waiting",
            type: "assistant",
            avatar: "",
            image: null,
          },
        });
      }, 400);

    const settle = (timer: ReturnType<typeof setTimeout>) => (responseTurn: ChatTurn) => {
      settled = true;
      clearTimeout(timer);
      dispatch({ type: "resolve", id: pendingId, payload: responseTurn });
    };

    // Only sendChatMessage and sendVisualMessage resolve with an error turn.
    // sendGroundedMessage can reject, which would otherwise leave the
    // placeholder spinning with no message and an unhandled rejection.
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
          image: null,
        });
      };

    const send = (request: Promise<ChatTurn>) => {
      const timer = showPlaceholder();
      request.then(settle(timer)).catch(settleWithError(timer));
    };

    if (chatType === ChatType.Grounded) {
      // using "Add Your Data"
      if (message === "") return;
      dispatch({ type: "add", payload: newTurn });
      send(sendGroundedMessage(newTurn));
    } else if (chatType === ChatType.Visual || chatType === ChatType.Video) {
      // visual prompt flow
      if (message === "" && !currentImage) return;
      dispatch({ type: "add", payload: newTurn });
      send(sendVisualMessage(newTurn, customerId));
    } else {
      // standard prompt flow
      if (message === "") return;
      dispatch({ type: "add", payload: newTurn });
      send(sendChatMessage(newTurn, customerId));
    }

    setMessage("");
    setCurrentImage(null);
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
              image: null,
            },
          });
        }, 400);
      }
    }
  };

  const onVideoClick = (dataUrl: string): void => {
    setCurrentImage(dataUrl);
    setShowVideo(false);
  };

  const onVideoClose = (): void => {
    setShowVideo(false);
  };

  return (
    <>
      <div className="fixed bottom-0 right-0 mr-12 mb-12 z-10 flex flex-col items-end ">
        {showChat && (
          <div className="mb-3 h-[calc(100vh-7rem)] shadow-md bg-white rounded-lg w-[650px]  flex flex-col">
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
                  <Turn key={i} turn={turn} type={chatType} />
                ))}
              </div>
            </div>
            {/* image section */}
            {currentImage && (
              <div className="pt-3 pl-3 pr-3">
                <button
                  className="w-full h-full p-0 border-0 bg-transparent hover:cursor-pointer"
                  onClick={() => setCurrentImage(null)}
                  aria-label="Remove current image"
                >
                  <img
                    src={currentImage}
                    className="object-contain w-full h-full rounded-xl"
                    alt="Current upload preview"
                  />
                </button>
              </div>
            )}
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
              {showCamera && (
                <>
                  <button
                    className="rounded-md p-2 border-solid border-2 border-zinc-300 hover:cursor-pointer hover:bg-zinc-100"
                    onClick={getImage}
                  >
                    <CameraIcon className="w-6 stroke-zinc-500" />
                  </button>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    ref={fileInput}
                    onChange={handleFileChange}
                  />
                </>
              )}
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
      {showVideo && (
        <Video onVideoClick={onVideoClick} onClose={onVideoClose} />
      )}
    </>
  );
};

export default Chat;
