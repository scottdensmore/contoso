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
import { ACTION_BOUNDARY, FIELD_BOUNDARY } from "@/lib/control-classes";

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
  const widgetRef = useRef<HTMLDivElement>(null);
  const greetingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Why the panel last closed, read by the focus-return effect below.
  const closedByFocusOut = useRef(false);
  // Whether the panel is open *now*, for callbacks that were created while it
  // was. A reply outlives the send that started it.
  const showChatRef = useRef(false);

  // Below `lg` the panel is a full-screen sheet, so it really does contain the
  // user and says so. At `lg` and up it occupies a corner, the rest of the page
  // is usable, and trapping focus would take the site navigation away.
  //
  // `false` until mounted, so the server and the first client render agree.
  // Only the semantics depend on this; the sheet itself is `max-lg:` CSS and is
  // right from first paint whether or not this has run.
  const [isCompact, setIsCompact] = useState(false);

  // What a reply announces when there is no panel to announce it in. See the
  // effect below.
  const [announcement, setAnnouncement] = useState("");

  // The exact complement of Tailwind's `lg:`, expressed as its own query rather
  // than a `max-width` with an epsilon, so a fractional viewport cannot land
  // between the two and satisfy neither. `tailwind.config.ts` sets no `screens`
  // override, so 1024px is Tailwind's default and these two must move together.
  //
  // `lg` rather than `sm`, which is where #129 first drew it, because a card is
  // only a card if the page is still there around it. Measured with the panel
  // open: it covers 72% of the viewport at 640, 75% at 768 and 70% at 834 —
  // against 40% at 1440. The three widths in that band were failing 2.4.11 the
  // same way 390 was, one breakpoint up. See #183.
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsCompact(!query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const isModal = showChat && isCompact;

  // The other three parts of being modal. All of them keyed on `isModal`, so a
  // resize past the breakpoint with the panel open moves it between the two
  // contracts rather than stranding it half-way — `aria-modal` without a trap
  // tells assistive technology something false, and a trap without `inert`
  // leaves the covered controls clickable.

  // Everything beside the widget, found through the DOM rather than by tag: the
  // widget's siblings are whatever the root layout puts next to it, and naming
  // `main` here would silently stop covering the page the day that changes.
  useEffect(() => {
    if (!isModal) return;
    const parent = widgetRef.current?.parentElement;
    if (!parent) return;
    const behind = Array.from(parent.children).filter(
      (child): child is HTMLElement =>
        child instanceof HTMLElement && child !== widgetRef.current
    );
    behind.forEach((element) => element.setAttribute("inert", ""));
    return () => behind.forEach((element) => element.removeAttribute("inert"));
  }, [isModal]);

  // `inert` blocks pointer and focus but not scrolling, so without this the
  // page slides around behind a sheet that covers all of it.
  useEffect(() => {
    if (!isModal) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isModal]);

  // The trap covers the widget, not the panel: the launcher sits outside the
  // dialog and is the close control, so a trap scoped to `panelRef` would make
  // the one thing that dismisses the sheet the one thing Tab cannot reach.
  //
  // What this is for is narrower than it looks. `inert` above is what keeps
  // focus off the obscured page — those elements leave the tab order entirely —
  // so containment is not this block's job and the e2e spec's "nothing escaped
  // the widget" assertion stays green without it. Measured, not assumed.
  //
  // What is covered: both wrap branches, by `wraps focus at both ends of the
  // sheet` in chat.test.tsx, and their absence at desktop by `does not trap
  // focus at lg and up`. Delete this effect and those go red.
  //
  // What is not covered by anything: the recovery branch below, for focus that
  // is already outside the widget — removing that alone leaves the whole suite
  // green. Nor is the case it exists for, Tab from the last control stepping
  // into the browser's own chrome rather than back to the top of the sheet,
  // which Playwright cannot see because it never leaves the page. Nor is
  // degradation where `inert` is unsupported, which is the only reason
  // containment does not rest on a single API.
  useEffect(() => {
    if (!isModal) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const widget = widgetRef.current;
      if (!widget) return;
      const focusable = Array.from(
        widget.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      // Focus already outside the widget — a click on inert content cannot put
      // it there, but the address bar can — so the next Tab returns rather than
      // continuing through the page.
      if (!widget.contains(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
        return;
      }
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isModal]);

  // At `lg` and up the panel stays non-modal, and non-modal is a claim that the
  // page behind is still usable. It is not quite: the card still covers 30-54%
  // of the viewport there, and at 1440 four product links sit entirely behind
  // it. Nothing can scroll them clear — they are ~400px tall and the panel
  // leaves 12px above it and 100px below, so there is nowhere to scroll them
  // to. Shrinking the panel does not fix it either: what is hidden depends on
  // where the grid puts links, not on the panel's area (1280 measures 0 hidden
  // and 1440 measures 4).
  //
  // So the panel gets out of the way instead of pretending it already has.
  // Keyboard only, and the criterion is too: 2.4.11 is about the *focused*
  // control, and focus is the thing this can observe. A mouse user still cannot
  // reach what the card covers — 6 of 22 product links at 1440 and 7 of 22 at
  // 1024, at some scroll position — because clicking bare page fires no
  // `focusin` and the panel stays up. That is #187, not this.
  //
  // Nothing focused can be obscured behind a panel that is gone, and the
  // conversation is not lost — the turns live in the reducer, so reopening
  // restores the thread rather than starting a new one. See #183.
  //
  // Only where it is not modal: below `lg` the surrounding page is `inert`, so
  // focus cannot land there in the first place, and this would be dead code
  // that closes the sheet on nothing.
  //
  // Backwards only, deliberately. The widget is last in the document, so Tab
  // forward off its final control leaves the page entirely: no `focusin` fires,
  // and the panel stays up until focus re-enters at the top, one keystroke
  // later. That stop is the browser's own chrome — the address bar — and
  // dismissing the panel while the user is up there would be closing it for
  // something that is not a page interaction at all.
  useEffect(() => {
    if (!showChat || isCompact) return;
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target as Node | null;
      if (target && widgetRef.current?.contains(target)) return;
      // Focus has already moved to where the user asked for it. Say so, or the
      // focus-return effect below reads this as an ordinary close and drags
      // focus back onto the launcher they were leaving.
      closedByFocusOut.current = true;
      setShowChat(false);
    };
    document.addEventListener("focusin", onFocusIn);
    return () => document.removeEventListener("focusin", onFocusIn);
  }, [showChat, isCompact]);

  useEffect(() => {
    showChatRef.current = showChat;
  }, [showChat]);

  // Cancel an unfired greeting whenever the panel closes, by whatever route.
  // The open branch of `toggleChat` guards on `turns.length`, but a pending
  // timer has not dispatched yet, so closing and reopening inside 400ms — an
  // ordinary impatient tap — schedules a second timer and both fire.
  //
  // Here rather than in `toggleChat`, which is where it used to live and only
  // ever covered the button. Escape has always had the same hole, and closing
  // on focus-out would have been a third way in. Measured, all three closed
  // within 400ms and reopened: button one greeting, Escape two, focus-out two.
  // One place, so a fourth close path cannot reintroduce it.
  useEffect(() => {
    if (showChat) return;
    if (greetingTimer.current) clearTimeout(greetingTimer.current);
  }, [showChat]);

  // Opening the panel left focus on the launcher, so the next Tab continued
  // into the page behind it rather than into the conversation.
  useEffect(() => {
    if (showChat) inputRef.current?.focus();
  }, [showChat]);

  // Focus return, after the close rather than during it. Below `lg` the
  // launcher is unmounted while the sheet is open, so a `focus()` inside the
  // close handler runs against an element that is not in the document yet and
  // silently drops focus to <body> — which is the bug moving focus in on open
  // was added to fix, in the other direction. One mechanism rather than two, so
  // both the Escape path and the button path go through here.
  // Returned on an explicit dismissal — Escape, or the close button — and only
  // then. A close caused by focus leaving the panel already has focus on the
  // control the user moved to, and pulling it back onto the launcher undoes
  // their keystroke: one Shift+Tab would close the panel, scroll to the link
  // they reached, and then take focus off it again, leaving them where they
  // started with the scroll position gone. That is WCAG 3.2.1 On Focus, and the
  // widget is last in the document, so Shift+Tab is the only way out.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (wasOpen.current && !showChat && !closedByFocusOut.current) {
      launcherRef.current?.focus();
    }
    closedByFocusOut.current = false;
    wasOpen.current = showChat;
  }, [showChat]);

  // Crossing the breakpoint unmounts whichever close control belonged to the
  // side being left — the sheet's header button on the way up, the launcher on
  // the way down. With focus parked on it, focus falls to <body> and the next
  // Tab restarts at the top of the document, which is the failure this
  // component has already fixed on open and on close, arriving by a third
  // route. Declared after the two effects above so it sees where they left
  // focus rather than racing them.
  useEffect(() => {
    if (!showChat) return;
    if (widgetRef.current?.contains(document.activeElement)) return;
    panelRef.current?.focus();
  }, [isCompact, showChat]);

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

      // The panel's `role="log"` is what tells a screen-reader user an answer
      // arrived, and closing on focus-out unmounts it mid-request. The turn
      // still lands — this line ran — but with the log gone nothing says so,
      // and asking a question then tabbing back into the page to keep browsing
      // is what a non-modal panel is for. This change made that reachable, so
      // it has to cover it.
      //
      // Here rather than in an effect watching `state.turns`: this is the
      // moment a reply arrives, so there is no "did it arrive while closed?"
      // to reconstruct, and no `setState` in an effect body to cascade from.
      if (!showChatRef.current) {
        setAnnouncement("Jane Doe replied. Open chat to read the answer.");
      }
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
      // open is only half the contract. Returned by the effect above, which
      // runs after the launcher is back in the document.
      return;
    }

    // Opening is reading: the announcement has served its purpose, and leaving
    // it in the live region means the next reply that repeats it is a text
    // change of nothing and may not be announced at all.
    setAnnouncement("");

    scrollChat();
    if (state.turns.length === 0) {
      greetingTimer.current = setTimeout(() => {
        dispatch({ type: "add", payload: greeting() });
      }, 400);
    }
  };

  return (
    <>
      <div
        ref={widgetRef}
        className="fixed bottom-0 right-0 mr-4 mb-4 sm:mr-12 sm:mb-12 z-10 flex flex-col items-end"
      >
        {showChat && (
          // Two shapes, not one shape with overrides. Below `lg` a sheet, at
          // `lg` and up a card, and the two sets of classes do not intersect —
          // a base radius that a max-width variant has to win against
          // depends on which variant Tailwind emits later, which is not
          // something this file should be betting on.
          //
          // Width was a flat w-[650px]. At 390px the panel rendered at
          // left:-308, clipping message text outside the viewport entirely.
          // dvh rather than vh so mobile browser chrome does not push the input
          // below the fold, and `top`/`height` rather than `inset-0` so the two
          // do not over-constrain each other.
          <div
            ref={panelRef}
            role="dialog"
            aria-label="Chat with Jane Doe"
            // Only where it is true. `role="dialog"` is not a claim of
            // containment; this is.
            aria-modal={isCompact ? true : undefined}
            tabIndex={-1}
            className="flex flex-col bg-white outline-none
                       max-lg:fixed max-lg:inset-x-0 max-lg:top-0
                       max-lg:h-[100dvh] max-lg:w-full
                       lg:mb-3 lg:shadow-md lg:rounded-lg
                       lg:w-[min(650px,calc(100vw-7rem))]
                       lg:h-[calc(100vh-7rem)]"
          >
            <div className="p-2 flex items-center gap-1 mx-auto w-full max-w-2xl max-lg:border-b max-lg:border-zinc-200">
              {/*
                A sheet has to introduce itself. A corner card can borrow
                identity from the page around it; this one has covered that
                page, and without a title the whole surface carried no heading
                at all while the document behind it had eight.
              */}
              {isCompact && (
                <h2 className="pl-2 grow text-base font-semibold text-zinc-900">
                  Chat with Jane Doe
                </h2>
              )}
              <button
                type="button"
                onClick={reset}
                aria-label="Clear conversation"
                className="ml-auto p-2 rounded-md hover:bg-zinc-100 hover:cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
              >
                <ArrowPathIcon className="w-5 stroke-zinc-500" aria-hidden="true" />
              </button>
              {/*
                Dismissal belongs in the header on a sheet, and rendered on
                `isCompact` rather than hidden with `sm:hidden` so that exactly
                one control is named "Close chat" at any width — two would be
                ambiguous to a screen reader and unaddressable by name in tests,
                and a CSS-hidden one is still present in jsdom, where no
                stylesheet runs.

                It also un-crowds the bottom right. The launcher used to float
                over the sheet 20px below the send button: two icon-only
                controls of near-identical size in one column, where a mis-tap
                discards the message being composed.
              */}
              {isCompact && (
                <button
                  type="button"
                  onClick={toggleChat}
                  aria-label="Close chat"
                  className="p-2 rounded-md hover:bg-zinc-100 hover:cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
                >
                  <XMarkIcon className="w-5 stroke-zinc-500" aria-hidden="true" />
                </button>
              )}
            </div>
            {/* chat section */}
            <div
              // Turns mutate with no announcement otherwise: a screen-reader
              // user gets no signal that the assistant is working or that an
              // answer arrived.
              role="log"
              aria-live="polite"
              aria-label="Conversation"
              // Capped and centred rather than stretched. The sheet is as wide
              // as the viewport up to 1023, and a conversation column that wide
              // leaves the reply on one side and the input spanning the whole
              // screen under it. No variant needed: the card is 650px, already
              // narrower than the cap, so this binds only on the sheet.
              className="grow p-2 overscroll-contain overflow-auto mx-auto w-full max-w-2xl"
              ref={chatDiv}
            >
              <div className="flex flex-col gap-4">
                {state.turns.map((turn, i) => (
                  <Turn key={i} turn={turn} />
                ))}
              </div>
            </div>
            {/* chat input section */}
            <div className="p-3 flex gap-3 mx-auto w-full max-w-2xl">
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
                //
                // zinc-500 rather than zinc-300, which measured 1.48:1 against
                // the panel — a declared boundary that was not one. zinc-400 is
                // 2.62:1 and also misses; zinc-500 is 4.83:1 and is the first
                // step on the scale that clears the 3:1 in WCAG 1.4.11.
                //
                // It matters more since the panel became a full-screen sheet:
                // on a corner card the panel's own edge and shadow gave the
                // input row some structure, and on the sheet this outline is
                // the only thing separating the field from the surface.
                //
                // The boundary and focus indicator come from the shared
                // constant, which is where the reasoning behind them now lives:
                // this input and the ten in #196 had drifted apart, and having
                // one definition is the point of that change.
                className={`block p-2 grow rounded-md text-zinc-700 placeholder:text-zinc-500 placeholder:opacity-100 shadow-xs focus:ring-sky-700 focus-visible:outline-sky-700 ${FIELD_BOUNDARY}`}
              />
              <button
                type="button"
                onClick={sendMessage}
                aria-label="Send message"
                // Filled, not outlined. Giving this the same zinc-500 stroke
                // the input got made the two identical — same weight, same
                // colour, same radius, same height — so the row read as one
                // wide box beside one small box rather than as a field and its
                // action. A fill satisfies 1.4.11 through its own contrast
                // against the panel (5.86:1) instead of a drawn line, and it
                // says which of the two is the thing you press.
                //
                // sky-700 is the widget's own accent — the shopper's bubbles
                // and the focus rings in here. It stays inside the panel; the
                // launcher took the page's indigo in #190 precisely because
                // that one sits on the page.
                //
                // `size-11` rather than `p-2`, because the border was load
                // bearing: `border-2` on a border-box element was contributing
                // 4px, so dropping it took the button from 44x44 to 40x40 and
                // the input followed it down the stretch row. 44 is the comfort
                // target in WCAG 2.5.5, Apple's HIG and Android's guidance, and
                // this is the primary action of a full-screen sheet at phone
                // width — a bad place to lose it to a side effect.
                className={`rounded-md size-11 flex items-center justify-center bg-sky-700 text-white hover:bg-sky-800 hover:cursor-pointer focus-visible:outline-sky-700 ${ACTION_BOUNDARY}`}
              >
                <PaperAirplaneIcon className="w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
        {/*
          `aria-live` without `role="status"`. The waiting turn inside the panel
          is the page's status region and a test addresses it by that role; a
          second one makes that query ambiguous, and this is a supplementary
          announcer rather than something to navigate to. The live region works
          on any element.
        */}
        <div aria-live="polite" className="sr-only">
          {announcement}
        </div>
        {/*
          Not rendered while the sheet is open, because the sheet's own header
          is the way out there. Left in place it would be a second control named
          "Close chat", and it would be behind the sheet in any case: the panel
          is positioned below `lg` and this button is not, so it loses the paint
          order regardless of where it sits in the source.

          Only the state changes with width, not the element, so the launcher at
          `lg` and up is exactly what it was.
        */}
        {!(isCompact && showChat) && (
          <button
            ref={launcherRef}
            // Two tones, because this button does not have a background — it is
            // `fixed`, so it has whatever the visitor has scrolled to. As a
            // white disc it measured 1.04:1 against the page at nearly every
            // viewport, which is why the hero copy underneath it disappeared
            // rather than merely being covered: white text, white disc, 1.1:1.
            //
            // No single fill fixes that. The accent reads 5.9:1 on the white
            // catalogue pages and 1.65:1 on the dark hero photograph.
            //
            // Hence three rings rather than two. Two tones have a hole that is
            // arithmetic, not taste: against a background halfway between them
            // in luminance both fail together, and for white and the accent that
            // worst case is 2.43:1. This site lands in it — the tent canvas in
            // the hero at 667x375 measures 2.76:1 and the mountain photograph
            // on the about page 2.57:1. So a near-black ring sits outside the
            // white one, and whatever is behind the control, one of the three
            // has 3:1 against it.
            //
            // That ring was written, deleted as unnecessary, then put back. The
            // check that cleared it was reading Tailwind's `lab()` colours
            // through a number regex, which drops the minus signs and measured
            // this fill as a near-black plum — so a dark tone was already in
            // the set and removing the real one changed nothing. Worth knowing
            // before deleting it again.
            //
            // Written as one `shadow` because these are stacked rings and
            // Tailwind's `ring` gives only one. The last layer is the wide half
            // of the `shadow-lg` this used to carry; its tight
            // `0 4px 6px -4px` layer is dropped, being invisible beside two
            // rings.
            //
            // indigo-600, which is what every call to action on the site is
            // already — the header's Sign In and Sign Up, the login and signup
            // submits, the contact form, the FAQ's link through to it. Not
            // sky-700, which is this widget's own accent: the shopper's bubbles
            // and the focus rings on the controls inside the panel. The
            // launcher is the one piece of the widget that lives on the page,
            // so it takes the page's accent and leaves sky to mean "inside the
            // chat". The two are 1.09:1 apart in luminance and different in
            // hue, which is close enough to look like a mistake rather than a
            // hierarchy — and at 390x844 on /contact they touch.
            //
            // Every other control in the widget styles its focus ring; this one
            // was left on the browser default, and the focus trap makes it a
            // stop that keyboard users land on every cycle.
            // The edge without `ACTION_FOCUS`'s offset: #190 gave this one
            // offset-4 so the ring clears the photography behind it. Its
            // three-ring `shadow-[...]` is a box-shadow, which forced colors
            // strips outright -- measured 1.00:1 there, a bare glyph with no
            // disc at all.
            className="bg-indigo-600 text-white rounded-full p-2 shadow-[0_0_0_2px_#ffffff,0_0_0_3px_#18181b,0_10px_15px_-3px_#0000001a] hover:bg-indigo-500 hover:cursor-pointer forced-colors:border-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600"
            onClick={toggleChat}
            aria-label={showChat ? "Close chat" : "Open chat"}
          >
            {showChat ? (
              <XMarkIcon className="w-6" />
            ) : (
              <ChatBubbleLeftRightIcon className="w-6" />
            )}
          </button>
        )}
      </div>
    </>
  );
};

export default Chat;
