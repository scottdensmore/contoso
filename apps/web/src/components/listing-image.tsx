import DeferredImage from "./deferred-image";

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
 * The home grid's product image: a reserved box, and an image fetched when the
 * box is nearly on screen.
 *
 * The deferral itself lives in `DeferredImage`, which the category grid uses
 * too. What is here is this surface's box, and the reasons it looks the way it
 * does.
 *
 * **The box is one element, and it is this one.** `next/image` renders with
 * `color: transparent` and no background of its own, so the tone has to sit on
 * something that survives the swap; hanging it on a placeholder that unmounts
 * leaves the state a scrolling visitor actually sees -- requested, not yet
 * decoded -- as a fully transparent gap.
 *
 * `bg-zinc-200` measures 1.22:1 against the `bg-inherit` bands and 1.15:1
 * against the `bg-zinc-100` ones, read back as painted sRGB rather than off the
 * computed value, which Tailwind serialises as `lab()`. That is deliberately
 * short of 1.4.11's 3:1: reaching it needs about `zinc-400`, and this box is a
 * transient state of a decorative image, so a tone dark enough to pass would
 * flash a heavy grey block on every ordinary load to serve a case that is
 * meant to be brief. It is the same tone the about page's image band uses; the
 * category grid's equivalent box is `bg-gray-200`, a shade off this one.
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
 */
export default function ListingImage({ src, alt, sizes, eager = false }: Props) {
  return (
    <div className="aspect-square w-full overflow-hidden rounded-3xl bg-zinc-200">
      <DeferredImage
        src={src}
        alt={alt}
        sizes={sizes}
        eager={eager}
        // w-full so the image scales into the box; h-auto because the source
        // is square, so it fills a square box exactly. See #262 for what a
        // non-square source would do here.
        className="w-full h-auto"
      />
    </div>
  );
}
