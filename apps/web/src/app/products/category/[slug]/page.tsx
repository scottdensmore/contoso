import Block from "@/components/block";
import Header from "@/components/header";
import { getProductsByCategory } from "@/lib/products";
import { notFound } from "next/navigation";
import Image from "next/image";

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
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={350}
                    height={350}
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
                    className="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity"
                  />
                ) : (
                  // An empty state rather than a placeholder image: it costs no
                  // request, and it makes the missing data visible instead of
                  // papering over it.
                  <div
                    role="img"
                    aria-label={`No image available for ${product.name}`}
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
