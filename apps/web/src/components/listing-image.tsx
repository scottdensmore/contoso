import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  sizes: string;
};

/**
 * The home grid's product image, in a box the browser is free to skip.
 *
 * `loading="lazy"` is not a viewport test. Chrome fetches lazy images within a
 * threshold measured at roughly 3900px, which at 1440x900 reaches 4.3
 * viewports down a 5038px document and pulled in 18 of this page's 20 images
 * before any scrolling. Each is a separate `sharp` decode-and-resize, and on a
 * two-core runner they measured a median of 2343ms each -- enough that an
 * unrelated navigation issued during them went from 78ms to 500ms, and enough
 * to abort one outright in CI. See #230.
 *
 * `content-visibility: auto` fixes that without JavaScript: the browser skips
 * rendering an off-screen subtree, and does not fetch images inside one.
 * Measured here, initial optimiser requests go 18 -> 9 at desktop, 16 -> 12 at
 * tablet and 7 -> 5 at phone, with the document height unchanged at every
 * width and CLS 0.0000 through a full scroll.
 *
 * **This replaced an IntersectionObserver doing the same job.** The observer
 * worked and matched these numbers, but a deferred image was not in the
 * server-rendered HTML -- so a blocked script chunk left permanent empty boxes
 * with no `<noscript>` recourse (#261), a card on the first screen had to wait
 * for hydration before it could be requested at all, and the scripting-off
 * fallback cost about 12x the optimised bytes. Each of those follows from
 * deciding in JavaScript what the browser decides for itself. Measured side by
 * side the two are indistinguishable on request counts and on blank cards
 * during a fast fling; they differ in that every image here is in the HTML.
 * See #273.
 *
 * No `contain-intrinsic-size`: the box is `aspect-square w-full`, so its size
 * comes from CSS rather than from its contents and holds while the subtree is
 * skipped. A size hint would only matter for a box that sizes to what is
 * inside it.
 *
 * `aspect-square` is an observation about the catalogue rather than something
 * held: every one of the 853 sources is 1024x1024 today, but the encoding
 * contract bounds only the long edge, so a 1024x600 would letterbox here with
 * nothing turning red. See #262.
 */
export default function ListingImage({ src, alt, sizes }: Props) {
  return (
    <div className="aspect-square w-full overflow-hidden rounded-3xl bg-zinc-200 [content-visibility:auto]">
      <Image
        src={src}
        alt={alt}
        width={350}
        height={350}
        sizes={sizes}
        // w-full so the image scales into the box; h-auto because the source is
        // square and so fills a square box exactly. See #262.
        className="w-full h-auto"
      />
    </div>
  );
}
