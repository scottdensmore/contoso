"use client";

import { useEffect, useRef } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { NavSection } from "@/lib/navigation";

// Shared with `header.tsx`, whose trigger points `aria-controls` here. A
// constant rather than a prop because the id has to survive the trip through
// `SidebarWrapper`, which owns neither end of the relationship.
export const SIDEBAR_DIALOG_ID = "site-navigation-drawer";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sections: NavSection[];
}

export default function Sidebar({ isOpen, onClose, sections }: SidebarProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Opening left focus on the trigger, so the next Tab continued into the page
  // behind the drawer rather than into it. The panel takes focus rather than
  // its first control, so the dialog's name is announced before its contents.
  //
  // `preventScroll` for the same reason the trigger's focus return carries it,
  // pre-emptively rather than for a measured symptom: the panel is
  // `fixed inset-0` today, so focusing it scrolls nothing. That is a property
  // of the layout rather than of this call, and the layout is the part that can
  // change.
  useEffect(() => {
    if (isOpen) panelRef.current?.focus({ preventScroll: true });
  }, [isOpen]);

  // The drawer covers the page but sits *inside* it -- `Header` renders per
  // page, so this markup is a descendant of `<main>`. That rules out the
  // mechanism `chat.tsx` uses one layer over, where the widget is a sibling of
  // `<main>` and can mark everything beside it `inert`. Inerting an ancestor
  // here would inert the drawer with it.
  //
  // So containment rests on this trap for the keyboard, and on the backdrop for
  // the pointer: it covers the viewport at `z-50` and dismisses on click, so a
  // control behind it cannot be reached without the drawer closing first.
  // `aria-modal` is what carries the same claim to assistive technology.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      // Focus outside the panel entirely -- the address bar can put it there
      // even though a click on the backdrop cannot, because that closes.
      if (!panel.contains(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
        return;
      }
      // `active === panel` is the state the drawer opens in, and the panel is
      // not in `focusable` -- `tabindex="-1"` excludes it -- so without naming
      // it here it is neither `first` nor `last`, no branch fires, and the
      // browser's default backward navigation takes focus to the header's
      // Sign Up link underneath the backdrop. That is the defect this component
      // was rewritten to fix, in the direction a forward tab walk never
      // reaches. Reachable by Shift+Tab as the first keystroke after opening,
      // and by Shift+Tab after clicking any non-interactive part of the panel.
      //
      // Forward from the panel needs no branch: it is not `last`, so the
      // default lands on `first`, which is where it should go.
      if (event.shiftKey && (active === panel || active === first)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  // `aria-modal` says the page behind is unavailable, and a wheel gesture over
  // the backdrop made that false: measured on /faq at 390x844, the document
  // scrolled 0 -> 600 behind the open drawer and stayed there after it closed.
  // The backdrop stops clicks, not scrolling. `chat.tsx` carries the same
  // effect for the same reason.
  //
  // On `<html>` rather than `body`, and not because `body` would fail --
  // measured, both work, because with the root element's overflow `visible` the
  // viewport takes its used overflow from the body. `chat.tsx:124` locks the
  // same page through `body` and is correct to.
  //
  // The reason is that `chat.tsx` owns `body`'s inline overflow. Nothing today
  // can hold both locks at once -- chat's `inert` covers the header below `lg`,
  // the `z-50` backdrop covers the launcher, and chat's focus-out closes it at
  // `lg` and up -- so this is not fixing a live collision. It is that two owners
  // of one inline property would interleave their save and restore, and
  // separate elements mean a future path that lets them coexist cannot.
  //
  // `document.scrollingElement` names the same node in a browser and is the
  // more obviously correct expression, but it is `undefined` under jsdom, which
  // turned the guard below it into a silent no-op.
  useEffect(() => {
    if (!isOpen) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [isOpen]);

  // Scoped to events originating inside the drawer, for the reason `chat.tsx`
  // records from the other side: its Escape handler used to be unscoped, and
  // dismissed the chat underneath this drawer while leaving the drawer up.
  // Unscoped here would be the same mistake pointing the other way.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (!panelRef.current?.contains(event.target as Node)) return;
      onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop. Still a button so the click that dismisses the drawer keeps
          working, but out of the tab order and out of the accessibility tree:
          a screen-sized tab stop was one of the stops in the walk that produced
          #306, and Escape and the Close button already cover dismissal. */}
      <button
        className="fixed inset-0 bg-black/30 backdrop-blur-xs w-full h-full border-0 p-0"
        onClick={onClose}
        tabIndex={-1}
        aria-hidden="true"
      />

      {/* Sidebar Content */}
      <div
        ref={panelRef}
        id={SIDEBAR_DIALOG_ID}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        tabIndex={-1}
        // `focus:outline-none` on the panel only. `tabIndex={-1}` plus the
        // programmatic focus above makes Chromium match `:focus-visible` here,
        // which drew the UA default `outline: auto 1px` around the whole 320px
        // panel -- on the keyboard path only, and confirmed in rendered pixels
        // rather than computed styles. The panel is a focus target, not a
        // control, and every control inside keeps its own ring.
        className="relative flex w-full max-w-xs flex-col overflow-y-auto bg-white pb-12 shadow-xl animate-in slide-in-from-left duration-300 focus:outline-none"
      >
        <div className="flex px-4 pb-2 pt-5">
          <button
            type="button"
            className="-m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400"
            onClick={onClose}
            aria-label="Close"
          >
            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {/* Links */}
        <div className="space-y-6 px-4 py-6">
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                {section.title}
              </h3>
              <ul className="mt-4 space-y-4">
                {section.links.map((link) => (
                  <li key={link.title} className="flow-root">
                    <Link
                      href={link.href}
                      className="-m-2 block p-2 text-gray-500 hover:text-gray-900"
                      onClick={onClose}
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
