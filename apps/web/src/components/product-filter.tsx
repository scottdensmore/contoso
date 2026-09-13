'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import clsx from 'clsx'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { ACTION_BOUNDARY, ACTION_FOCUS, FIELD_BOUNDARY } from '@/lib/control-classes'

export type CategoryProductCard = {
  id: string
  slug: string
  image: string | null
  name: string
  price: number
}

export type SortOption =
  | 'featured'
  | 'price-asc'
  | 'price-desc'
  | 'name-asc'
  | 'name-desc'

export interface ProductFilterProps {
  products: CategoryProductCard[]
  categoryName: string
}

export default function ProductFilter({
  products,
  categoryName,
}: ProductFilterProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('featured')

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) {
      return products
    }
    return products.filter((product) =>
      product.name.toLowerCase().includes(query)
    )
  }, [products, searchQuery])

  const sortedProducts = useMemo(() => {
    const items = [...filteredProducts]
    switch (sortBy) {
      case 'price-asc':
        return items.sort((a, b) => a.price - b.price)
      case 'price-desc':
        return items.sort((a, b) => b.price - a.price)
      case 'name-asc':
        return items.sort((a, b) => a.name.localeCompare(b.name))
      case 'name-desc':
        return items.sort((a, b) => b.name.localeCompare(a.name))
      case 'featured':
      default:
        return items
    }
  }, [filteredProducts, sortBy])

  const handleReset = () => {
    setSearchQuery('')
    setSortBy('featured')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Keyword Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <label htmlFor="product-search" className="sr-only">
            Search {categoryName}
          </label>
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            id="product-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search products in ${categoryName}...`}
            className={`block w-full rounded-md border-0 py-2 pl-10 pr-10 text-gray-900 shadow-xs placeholder:text-gray-400 sm:text-sm sm:leading-6 focus:ring-indigo-600 focus-visible:outline-indigo-600 ${FIELD_BOUNDARY}`}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className={`absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus-visible:outline-indigo-600 rounded-sm ${ACTION_FOCUS}`}
            >
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="product-sort"
            className="text-sm font-medium text-gray-700 whitespace-nowrap"
          >
            Sort by:
          </label>
          <select
            id="product-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className={`block rounded-md border-0 py-2 pl-3 pr-8 text-gray-900 shadow-xs sm:text-sm sm:leading-6 focus:ring-indigo-600 focus-visible:outline-indigo-600 ${FIELD_BOUNDARY}`}
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </select>
        </div>
      </div>

      {/* Live Result Counter */}
      <div aria-live="polite" className="text-sm text-gray-600">
        Showing {sortedProducts.length} of {products.length} products
      </div>

      {/* Empty State or Product Grid */}
      {sortedProducts.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-lg text-gray-600">No products match your search.</p>
          <div className="mt-6">
            <button
              type="button"
              onClick={handleReset}
              className={`inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-indigo-600 ${ACTION_BOUNDARY}`}
            >
              Reset filters
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
          {sortedProducts.map((product: CategoryProductCard, i: number) => (
            <a
              key={product.id}
              href={`/products/${product.slug}`}
              className="group"
            >
              <div // `content-visibility: auto` is the deferral: the browser skips
                // rendering this box while it is off screen, and does not fetch
                // the image inside a skipped subtree. That took initial
                // optimiser requests on this page from 21 of 21 to 12 at
                // desktop, on a 3965px document that Chrome's ~3900px lazy
                // threshold otherwise swallows whole. See #263 and #273.
                //
                // No `contain-intrinsic-size`: `aspect-square w-full` sizes
                // this box from CSS rather than from its contents, so it holds
                // while the subtree is skipped. Measured, CLS is 0.0000.
                className={clsx(
                  'aspect-square w-full overflow-hidden rounded-3xl bg-gray-200',
                  // Skippable only when it holds an image. Both branches of the
                  // ternary below live in this box, and they are not alike: the
                  // image is `alt=""` and contributes nothing to the
                  // accessibility tree, so skipping it costs nothing, while the
                  // empty state is *text*. Content in a skipped subtree is
                  // absent from the accessibility tree until it renders --
                  // measured, with an on-screen control -- so marking this box
                  // unconditionally would leave a screen reader nothing at all
                  // for a card whose image is missing, which is precisely the
                  // card that has something to say. Find-in-page still reaches
                  // it either way; the accessibility tree does not.
                  product.image && '[content-visibility:auto]'
                )}
              >
                {product.image ? (
                  <Image
                    src={product.image}
                    // Decorative, because the link already says it. The card
                    // is one link whose heading is the product's name, so
                    // `alt={product.name}` made its accessible name the name
                    // twice. See e2e/browse.spec.ts.
                    alt=""
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
                    //
                    // 100vw includes the classic ~15px scrollbar on desktop OSes,
                    // so the arithmetic slightly over-declares by ~5px (which safely
                    // selects the correct or next rung without causing image softness).
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
                    aria-hidden="true"
                    className="flex h-full w-full items-center justify-center text-sm text-gray-600"
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
      )}
    </div>
  )
}
