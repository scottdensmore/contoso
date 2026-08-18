"use client";

import { useEffect, useRef, useState } from "react";
import Block from "@/components/block";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import SidebarWrapper from "./sidebar-wrapper";
import { SIDEBAR_DIALOG_ID } from "./sidebar";
import { Suspense } from "react";
import { ACTION_BOUNDARY, ACTION_FOCUS } from "@/lib/control-classes";

export const Header = () => {
  const { data: session, status } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Focus return, after the close rather than during it, because the drawer
  // moves focus into itself on open and closing would otherwise drop it on
  // <body> -- where the next Tab restarts at the top of the document.
  // `chat.tsx` fixes the same thing for its launcher.
  //
  // Three of the four close routes, not four. Following a link ends on <body>
  // instead: this effect focuses the trigger and Next's route-change reset then
  // moves focus off it. Left to the router, which announces the new route.
  //
  // `preventScroll` because the header is in normal flow rather than sticky, so
  // a plain `focus()` scrolls the off-screen trigger into view and takes the
  // reader's place with it. The reachable jump is small -- the trigger's rect
  // is [4, 44], so the drawer cannot be opened past scrollY=44 -- and this is
  // kept for when the header goes sticky, which would widen that to the page.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (wasOpen.current && !isSidebarOpen) {
      triggerRef.current?.focus({ preventScroll: true });
    }
    wasOpen.current = isSidebarOpen;
  }, [isSidebarOpen]);

  return (
    <>
      <Block
        outerClassName=""
        innerClassName="h-12 flex flex-row center items-center"
      >
        <div className="text-slate-800">
          {/* Before #306 this said nothing: `aria-expanded` absent in both
              states, and the label stuck at "Open menu" while the menu was
              open. Both track the state now.

              `aria-expanded="true"` is rarely perceived, since `aria-modal` on
              the panel confines assistive technology to the dialog while it is
              open -- so in practice a user hears the collapsed state and the
              dialog. It is still the conventional pairing with
              `aria-controls`, and the label is what actually reports the open
              state. */}
          <button
            ref={triggerRef}
            type="button"
            className={`-mx-2 inline-flex items-center justify-center rounded-md p-2 text-gray-700 focus-visible:outline-indigo-600 ${ACTION_FOCUS}`}
            onClick={() => setIsSidebarOpen((open) => !open)}
            aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
            aria-expanded={isSidebarOpen}
            aria-controls={SIDEBAR_DIALOG_ID}
          >
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="grow">&nbsp;</div>
        <div className="flex flex-row items-center gap-3">
          {status === "authenticated" ? (
            <>
              <Link href="/profile" className="flex flex-row items-center gap-3 hover:bg-gray-50 p-1 rounded-md transition-colors" title="Profile Settings">
                <div>
                  <div className="text-right font-semibold text-zinc-600">
                    {session.user?.name || session.user?.email}
                  </div>
                  <div className="text-right text-xs text-zinc-400">
                    {session.user?.email}
                  </div>
                </div>
                <div className="">
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      width={32}
                      height={32}
                      alt={session.user.name || "User"}
                      className="rounded-full h-8 w-8 object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                      {session.user?.name?.[0] || session.user?.email?.[0]}
                    </div>
                  )}
                </div>
              </Link>
              <button
                onClick={() => signOut()}
                className={`ml-4 px-3 py-1.5 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-500 focus-visible:outline-indigo-600 ${ACTION_BOUNDARY}`}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={`px-3 py-1.5 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-500 focus-visible:outline-indigo-600 ${ACTION_BOUNDARY}`}>
                Sign In
              </Link>
              <Link href="/signup" // `ACTION_FOCUS`, not `ACTION_BOUNDARY`: outlined rather than
                // filled, so it already has an edge forced colors keeps, and
                // the constant's `border-2` would render it identically to the
                // filled Sign In beside it.
                className={`ml-2 px-3 py-1.5 text-sm font-semibold text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-indigo-600 ${ACTION_FOCUS}`}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </Block>

      <Suspense fallback={null}>
        <SidebarWrapper 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
      </Suspense>
    </>
  );
};

export default Header;
