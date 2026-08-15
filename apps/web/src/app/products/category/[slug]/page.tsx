import Block from "@/components/block";
import Header from "@/components/header";
import { getProductsByCategory } from "@/lib/products";
import { notFound } from "next/navigation";
import DeferredImage from "@/components/deferred-image";

type CategoryProductCard = {
  id: string;
  slug: string;
  image: string | null;
  name: string;
  price: number;
};

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getProductsByCategory(slug);

  if (!category) {
    notFound();
  }

  return (
    <>
      <Header />
      <Block innerClassName="pt-12 pb-6">
        <h1 className="text-6xl pb-5 pt-8 subpixel-antialiased font-serif ">
          {category.name}
        </h1>
        <div className="text-xl text-gray-600">
          {category.description}
        </div>
      </Block>

      <Block innerClassName="p-8">
        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
          {category.products.map((product: CategoryProductCard, i: number) => (
            <a
              key={product.id}
              href={`/products/${product.slug}`}
              className="group"
            >
              <div className="aspect-square w-full overflow-hidden rounded-3xl bg-gray-200">
                {product.image ? (
                  <DeferredImage
                    src={product.image}
                    // Decorative, because the link already says it. The card
                    // is one link whose heading is the product's name, so
                    // `alt={product.name}` made its accessible name the name
                    // twice. See e2e/browse.spec.ts.
                    alt=""
                    // The card is the container split by the column count, less
                    // the gaps and the container's own padding — so it tracks
                    // the viewport between each breakpoint and only settles
                    // once the container stops growing at xl.
                    //
                    // The previous value was a single 400px measured at 1440.
                    // That is the top of the three-column range; at 1024 the
                    // same card is 317px, so it pulled w=640 where w=384 covers
                    // it. Deriving a `sizes` from one sampled width is the
                    // mistake this replaces.
                    //
                    // Written as `100vw / 3` rather than `33.33vw` so that
                    // next/image's /(^|\s)(1?\d?\d)vw/ can still find the
                    // percentage and trim the srcset.
                    sizes="(min-width: 1280px) 398px, (min-width: 1024px) calc( 100vw / 3 - 24px ), (min-width: 640px) calc( 50vw - 24px ), calc( 100vw - 24px )"
                    // The whole first row, and not because any particular card
                    // is the one that matters. At 1440 three cards share the
                    // row at 397.328, 397.328 and 397.344px -- the third is
                    // strictly the largest, and the second is what
                    // largest-contentful-paint reported in 35 of 35 runs. Which
                    // one wins falls out of paint and decode ordering, not out
                    // of anything readable here, so betting on one is a bet.
                    //
                    // Betting wrong is not a no-op: react-dom preloads any card
                    // that is not `loading="lazy"`, and `next/image` sets no
                    // fetchpriority, so the preloaded card competes with the
                    // reported one on equal terms.
                    // Preloading only the first measured *worse* than doing
                    // nothing at 1440 -- 4036ms against 3888. The row gives
                    // 1788. Cutoffs of 2 and 3 are within noise of each other
                    // and 6 is worse at every width; 3 is the widest the grid
                    // gets, so it has no exposure to a fourth card winning.
                    //
                    // At 390 the row is one card, so two of the three preloads
                    // are off-screen -- the thing `[slug]/page.tsx` declines to
                    // do a few files over. They are not free: cutoff 1 measures
                    // 1912ms there against 2008 for cutoff 3. That is the whole
                    // cost, 96ms, and it buys 1156ms at 1440 (2892 against
                    // 4048), so the wide viewport decides it. Medians of 7,
                    // throttled 1.6Mbps / 150ms RTT / 4x CPU. `priority` is not
                    // responsive, so trading one for the other is not on offer.
                    //
                    // The other cost is at 834, where the row is two cards:
                    // card 3 is eager and card 4 is lazy, both 251px above the
                    // fold, and the second arrives about 2.7s later. See #180.
                    priority={i < 3}
                    // Everything below the fold waits until it is nearly on
                    // screen. Before this the grid fetched every card at once
                    // -- 21 of 21 on `tents`, measured at 1440x900 on a 3965px
                    // document, because Chrome's lazy threshold (~3900px)
                    // covers the whole page. See #263.
                    //
                    // Six, not three. `priority` implies eager inside the
                    // component -- a preloaded image that is also deferred is a
                    // contradiction -- so leaving this off would have made the
                    // preload cutoff the only thing rendering server-side, and
                    // that cutoff is three because three is the widest the grid
                    // gets. It is not the widest the *fold* gets: at `sm` the
                    // grid is two columns, so card 3 opens the second row and
                    // sits 251px on screen at 834x1112 -- the same 251px the
                    // note above records for #180.
                    //
                    // A deferred card cannot be requested until this component
                    // hydrates, and measured at 834x1112 that wait is 245ms
                    // unthrottled, 1155ms at 4x CPU and 2385ms at 6x. So three
                    // would have traded a request the browser used to start at
                    // parse for a grey box a tablet visitor watches for over
                    // two seconds.
                    //
                    // Six rather than four, and 1440x900 is the wrong reason.
                    // There the second row is a 63px sliver and four would look
                    // sufficient. It is the taller desktops that decide it: the
                    // same row measures 243px at 1440x1080, 145px at 1512x982
                    // and 363px at 1920x1200 -- most of a card. Four would fill
                    // card 3 and leave 4 and 5 grey beside it, ragged within a
                    // single row, which reads worse than a row that is
                    // uniformly not there yet.
                    //
                    // The price is two requests on a phone, where the grid is
                    // one column and cards 4 and 5 are about 2.2 and 2.7
                    // viewports down: that surface goes 7 unaided, 4 with
                    // deferral alone, 6 with this. Desktop and tablet pay
                    // nothing, because those cards already sit inside the
                    // 1200px margin and this only moves them out of the
                    // post-hydration path and into the HTML.
                    //
                    // `eager` and `priority` are separate on purpose. Preload
                    // is a bet on which card paints last and is measured
                    // against LCP; eager is about which cards a visitor is
                    // already looking at. Widening the first to cover the
                    // second would preload six cards and lose that measurement.
                    eager={i < 6}
                    className="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity"
                  />
                ) : (
                  // An empty state rather than a placeholder image: it costs no
                  // request, and it makes the missing data visible instead of
                  // papering over it.
                  //
                  // No `role="img"` and no `aria-label`. Removing them is not
                  // neutral -- it is the fix on this branch. The label read
                  // `No image available for ${product.name}`, and an
                  // `aria-label` replaces the subtree it labels, so the words
                  // reaching the link's name came from the label rather than
                  // from the text node below. Measured on the card's markup:
                  //
                  //   with the pair:    No image available for X X $price
                  //   without the pair: No image available X $price
                  //
                  // The text survives verbatim; what goes is the `for X`,
                  // which repeated the heading two lines down. `role="img"`
                  // named a region holding no image and bought nothing.
                  // `page.test.tsx` pins the shorter name, and fails on the
                  // longer one.
                  <div
                    className="flex h-full w-full items-center justify-center text-sm text-gray-500"
                  >
                    No image available
                  </div>
                )}
              </div>
              <div className="mt-4 text-center">
                <h2 className="text-2xl font-semibold text-gray-900">
                  {product.name}
                </h2>
                <p className="mt-1 text-lg font-medium text-gray-500">
                  ${product.price.toFixed(2)}
                </p>
              </div>
            </a>
          ))}
        </div>
      </Block>
    </>
  );
}
