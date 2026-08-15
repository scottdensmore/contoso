"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Props = {
  src: string;
  alt: string;
  sizes: string;
  /**
   * Render the image straight away, server-side and in the HTML. For cards on
   * or near the first screen, where deferring costs more than it saves.
   */
  eager?: boolean;
};

/**
 * How far ahead of the viewport to start fetching.
 *
 * Chrome's own `loading="lazy"` threshold measured at roughly 3900px here,
 * which is what #230 is about: at 1440x900 that reaches 4.3 viewports down and
 * pulls in 18 of the home page's 20 cards.
 *
 * The margin buys `600 / v` seconds of lead at scroll speed `v`, so it hides a
 * fetch only while the fetch is faster than that. Measured against injected
 * optimiser latency at a 800px/s reading scroll: at 150ms nothing is ever
 * grey; at 1000ms, 14 of 20 cards are grey as they enter. 1200 rather than 600
 * doubles the lead for three extra requests a viewport -- 6 to 9 at desktop --
 * which is still under a half of what Chrome does unaided.
 *
 * No margin fixes a hard fling on a slow server; nothing short of ~7000px
 * does, and that is the behaviour this replaces. That case is handled by the
 * box below staying visible rather than by fetching earlier.
 */
const ROOT_MARGIN = "1200px";

/**
 * A product-card image that is fetched when it is nearly on screen.
 *
 * `loading="lazy"` is a hint about a threshold the browser picks, not a
 * viewport test, and the threshold it picks is far too generous for a page
 * carrying twenty separately-optimised images. This narrows it.
 *
 * **The box is one element, not two.** The tone has to sit on a wrapper that
 * survives the swap, because `next/image` renders with `color: transparent`
 * and no background of its own: hanging the tone on a placeholder that
 * unmounts means the state a scrolling visitor actually sees -- image
 * requested, not yet decoded -- is a fully transparent gap. Keeping one
 * element also removes an unmount/remount between the two states.
 *
 * `bg-zinc-200` measures 1.22:1 against the `bg-inherit` bands and 1.15:1
 * against the `bg-zinc-100` ones, read back as painted sRGB rather than off the
 * computed value, which Tailwind serialises as `lab()`. That is deliberately
 * short of 1.4.11's 3:1: reaching it needs about `zinc-400`, and this box is a
 * transient state of a decorative image, so a tone dark enough to pass would
 * flash a heavy grey block on every ordinary load to serve a case that is
 * meant to be brief. It is the same tone the about page's image band uses;
 * the category grid's equivalent box is `bg-gray-200`, a shade off this one.
 * Where that reasoning stops holding is when the box is *not* brief -- a
 * blocked script leaves it forever -- which is #261 rather than this file.
 *
 * **`aspect-square` is an observation about the catalogue, and nothing holds
 * it.** Every one of the 853 catalogue sources is 1024x1024 today, which is why
 * the reserved box is exactly the loaded box and this shifts nothing. But the
 * encoding contract in `config/catalogue_images.json` and the guard in
 * `tests/scripts/test_image_encoding.py` only bound the *long edge* --
 * `maxDimension` -- so a 1024x600 source passes every check in the repository
 * and would render letterboxed here, with a strip of the tone below it and
 * nothing turning red.
 *
 * This component is where that dependency starts: the markup it replaces took
 * its box from the source's own ratio via `width`/`height` and `h-auto`. The
 * category grid has the same unheld assumption and crops rather than
 * letterboxes. See #262.
 *
 * Without JavaScript the deferred images are never requested, so `<noscript>`
 * carries the unoptimised source. That is roughly 12x the bytes of the
 * optimiser's variant -- measured at 5.1 MB against about 400 KB across the
 * twenty cards -- and correct, which is the right way round for a case this
 * rare. It does not cover JavaScript that loads and then fails: a blocked
 * chunk leaves the deferred cards as empty boxes, which is the other reason
 * the tone below has to be visible.
 */
export default function ListingImage({
  src,
  alt,
  sizes,
  eager = false,
}: Props) {
  const [show, setShow] = useState(eager);
  const box = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (show) return;
    const node = box.current;
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

  return (
    <div
      ref={box}
      className="aspect-square w-full overflow-hidden rounded-3xl bg-zinc-200"
    >
      {show ? (
        <Image
          src={src}
          alt={alt}
          width={350}
          height={350}
          sizes={sizes}
          className="w-full h-auto"
        />
      ) : (
        <noscript>
          <img src={src} alt={alt} className="w-full h-auto" />
        </noscript>
      )}
    </div>
  );
}
