"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Props = {
  src: string;
  alt: string;
  sizes: string;
  /** Classes for the rendered image. The caller owns the box around it. */
  className: string;
  /**
   * Render the image straight away, server-side and in the HTML. For cards on
   * or near the first screen, where deferring costs more than it saves.
   */
  eager?: boolean;
  /**
   * Preload the image. Implies `eager` -- a preloaded image that is also
   * deferred is a contradiction, since the point of preloading is to start the
   * request before layout says the element is near.
   */
  priority?: boolean;
};

/**
 * How far ahead of the viewport to start fetching.
 *
 * Chrome's own `loading="lazy"` threshold measured at roughly 3900px, which is
 * what #230 and #263 are about: at 1440x900 that reaches four viewports down
 * and pulls in almost every card on a listing page.
 *
 * The margin buys `1200 / v` seconds of lead at scroll speed `v`, so it hides a
 * fetch only while the fetch is faster than that. Measured against injected
 * optimiser latency at a 800px/s reading scroll: at 150ms nothing is ever grey;
 * at 1000ms, 14 of 20 cards are grey as they enter. 1200 rather than 600
 * doubles the lead for three extra requests a viewport, which is still under
 * half of what Chrome does unaided.
 *
 * No margin fixes a hard fling on a slow server; nothing short of ~7000px
 * does, and that is the behaviour this replaces. That case is handled by the
 * caller's box staying visible rather than by fetching earlier.
 */
const ROOT_MARGIN = "1200px";

/**
 * An image that is fetched when it is nearly on screen.
 *
 * `loading="lazy"` is a hint about a threshold the browser picks, not a
 * viewport test, and the threshold it picks is far too generous for a page
 * carrying twenty or more separately-optimised images.
 *
 * **The caller owns the box.** Both listing surfaces already have one --
 * `ListingImage` supplies it for the home grid, and the category card's own
 * wrapper is shared with the empty state it falls back to -- so this renders
 * into that box rather than bringing another. What matters is that the box
 * survives the swap: `next/image` renders with `color: transparent` and no
 * background, so a tone on something that unmounts leaves the state a
 * scrolling visitor actually sees -- requested, not yet decoded -- as a fully
 * transparent gap.
 *
 * Without JavaScript the deferred images are never requested, so `<noscript>`
 * carries the unoptimised source. That is roughly 12x the bytes of the
 * optimiser's variant -- measured at 5.1 MB against about 400 KB across the
 * home page's twenty cards -- and correct, which is the right way round for a
 * case this rare. It does not cover JavaScript that loads and then fails: a
 * blocked chunk leaves the deferred cards as empty boxes, which is why the
 * caller's tone has to be visible. See #261.
 */
export default function DeferredImage({
  src,
  alt,
  sizes,
  className,
  eager = false,
  priority = false,
}: Props) {
  const [show, setShow] = useState(eager || priority);
  const placeholder = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (show) return;
    const node = placeholder.current;
    if (!node) return;

    // No feature test for IntersectionObserver. The obvious one --
    // `typeof IntersectionObserver === "undefined"` -- is also true on the
    // server, so it would render every image eagerly during SSR and undo the
    // whole change while looking like a safety net. A correct test would have
    // to run only on the client and then set state from inside this effect,
    // which `react-hooks/set-state-in-effect` rejects. The observer has been
    // in every browser Next supports since 2019, and the case that genuinely
    // has none -- scripting off -- is served by the `<noscript>` below.
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setShow(true);
        observer.disconnect();
      },
      { rootMargin: ROOT_MARGIN },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [show]);

  if (show) {
    return (
      <Image
        src={src}
        alt={alt}
        width={350}
        height={350}
        sizes={sizes}
        priority={priority}
        className={className}
      />
    );
  }

  // Fills the caller's box so the observer measures the geometry the card
  // actually occupies, rather than a zero-height element that would sit at the
  // top of it and trigger early on a tall card.
  return (
    <div ref={placeholder} className="h-full w-full">
      <noscript>
        <img src={src} alt={alt} className={className} />
      </noscript>
    </div>
  );
}
