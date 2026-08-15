import ListingImage from "@/components/listing-image";
import Block from "@/components/block";
import { ProductGroup } from "@/lib/types";
import { promises as fs } from "fs";
import Header from "@/components/header";
import clsx from "clsx";

async function getData(): Promise<ProductGroup[]> {
  const file = await fs.readFile(
    process.cwd() + "/public/categories.json",
    "utf8"
  );
  const data: ProductGroup[] = JSON.parse(file);
  return data;
}

export default async function Home() {
  const categories = await getData();

  return (
    <>
      <Header />
      <Block
        // min-h-80, not h-80: the band keeps its full-bleed proportions on a
        // desktop while growing with its own text on narrower screens. At a
        // fixed height the copy wrapped past the bottom edge and painted over
        // the first category, at every width from 360 to 769.
        //
        // bg-cover bg-no-repeat because the default is `auto` and `repeat`,
        // so the 1024x450 image tiled: already visible as a vertical seam past
        // 1024px wide, and a horizontal one as soon as the band grows taller
        // than 450px, which min-h-80 lets it do.
        outerClassName="bg-blend-multiply bg-center bg-cover bg-no-repeat bg-hero-image min-h-80 bg-neutral-600"
        // One owner for the band's vertical rhythm. It used to be two: `pt-12`
        // on the h1 and `pb-8` out here on the full-bleed outer, which meant
        // restyling the heading could silently take the top padding with it.
        innerClassName="py-12"
      >
        {/*
          Fixed 72px type was the whole of #162. At 320 the word "Company"
          alone is wider than the 296px content box, so the document itself
          overflowed by 30px — and the band, growing to fit three lines of
          unscaled copy, stood 672px tall in a 568px viewport. In landscape it
          was 113% of the screen at 667x375: the entire first screen was hero
          before you reached anything to buy.

          Base is 5xl, not the 4xl that first fixed the overflow. 4xl is 36px
          and the category `h2` below it is `text-5xl` at every width, so the
          brand name rendered smaller than "Tents" — the page's own outline
          inverted. 48px fits the 296px box at 320 with 70px to spare (the
          widest word, "Company", inks 225.6px), and softens the step at the
          `sm` boundary from 36->60 to 48->60.

          7xl waits for `xl`, not `lg`. At 1024 the box is 1000px and 72px inks
          973px — 2.7% of slack, and which side of that a client lands on
          depends on the font it resolves from the stack: measured across
          candidates, Arial and Verdana fit but DejaVu Sans inks 1088px and
          wraps. At 1280 the box is 1256px, so the margin is 283px.
        */}
        <h1 className="text-zinc-100 text-5xl sm:text-6xl xl:text-7xl font-black subpixel-antialiased">
          Contoso Outdoor Company
        </h1>
        <div className="text-zinc-100 mt-4 text-lg sm:text-xl lg:text-2xl text-balance">
          Embrace Adventure with Contoso Outdoors - Your Ultimate Partner in
          Exploring the Unseen!
        </div>
        {/*
          `w-2/3` applied at every width, so on a 320px screen this paragraph
          was a 197px column — three words a line, and the tallest single
          contributor to the band. The two-thirds measure is there to stop the
          line running the full width of a desktop, which is not a problem a
          phone has.

          It comes back at `md` rather than `lg`. Held off to `lg`, the line
          ran 95 characters at 768 and 131 at 1023 — the fraction was doing no
          work exactly where the viewport had grown enough to need it. From
          768 two thirds is 496px, about 55 characters.
        */}
        <div className="text-zinc-100 mt-2 text-base lg:text-lg w-full md:w-2/3">
          Choose from a variety of products to help you explore the outdoors.
          From camping to hiking, we have you covered with the best gear and the
          best prices.
        </div>
      </Block>
      {/* Categories */}
      {categories.map((category, i) => (
        <Block
          key={i}
          innerClassName="p-8"
          outerClassName={clsx(i % 2 == 1 ? "bg-zinc-100" : "bg-inherit")}
        >
          <h2 className="text-5xl mb-3 font-semibold text-zinc-800">
            {category.name}
          </h2>
          <div
            className="text-zinc-500 text-2xl first-line:uppercase first-line:tracking-widest
                  first-letter:text-6xl first-letter:font-bold first-letter:text-zinc-500
                  first-letter:mr-1 first-letter:float-left"
          >
            {category.description}
          </div>
          <div
            className="grid grid-cols-2 gap-4 mt-4
                       sm:grid-cols-[repeat(3,minmax(0,350px))] sm:justify-between"
          >
            {category.products.map((product, j) => (
              <a
                key={j}
                href={`/products/${product.slug}`}
                className="w-full max-w-[350px]"
              >
                <div className="items-center">
                  <ListingImage
                    // The first two categories, not just the first. A deferred
                    // image cannot be requested until this component hydrates,
                    // and that wait grows with the device: measured at +237ms
                    // unthrottled but +2.0s at 6x CPU throttle. At 1440x2000
                    // nine cards are above the fold, so covering only the
                    // first category left six of them as empty boxes for that
                    // whole window before the request even started.
                    //
                    // Two categories covers the first screen at every viewport
                    // measured up to 1440x2000, for three extra server-rendered
                    // images. Everything below is one to four viewports down --
                    // see #230 for the measured positions.
                    eager={i <= 1}
                    src={product.images[0]}
                    // Decorative, because the link already says it. The card
                    // is one link whose text is the product's name, so
                    // `alt={product.name}` made its accessible name the name
                    // twice. See e2e/browse.spec.ts.
                    alt=""
                    // 350px is the cap, not the box. The `minmax(0, 350px)`
                    // tracks only reach it once the container can hold three of
                    // them plus the gaps — from 1106px of viewport. Below that
                    // the card tracks the viewport, and declaring 350 made a 2x
                    // screen fetch w=750 where w=640 covers it, everywhere from
                    // 640 to about 1016.
                    //
                    // So: the container less its gaps, over the column count,
                    // with the fixed value only where the cap engages.
                    //
                    // The last clause has to keep a literal `50vw`. Next reads
                    // the srcset's floor off the smallest `vw` token it can find
                    // with /(^|\s)(1?\d?\d)vw/ — it never sees the arithmetic
                    // around it. With `50vw` the floor is 320 and the ladder
                    // starts at 384; write it as `( 100vw - 40px ) / 2` and Next
                    // reads 100vw, drops every rung below 640, and a 175px phone
                    // card fetches w=640. The middle clause's `100vw` is
                    // harmless only because this one is here.
                    sizes="(min-width: 1106px) 350px, (min-width: 640px) calc( ( 100vw - 56px ) / 3 ), calc( 50vw - 20px )"
                  />
                  <div className="text-center mt-2 text-base sm:text-xl md:text-2xl font-semibold break-words">
                    {product.name}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </Block>
      ))}
    </>
  );
}
