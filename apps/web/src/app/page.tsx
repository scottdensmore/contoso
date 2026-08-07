import Image from "next/image";
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
        outerClassName="bg-blend-multiply bg-center bg-cover bg-no-repeat bg-hero-image min-h-80 pb-8 bg-neutral-600"
        innerClassName=""
      >
        <h1 className="text-zinc-100 pt-12 text-7xl font-black subpixel-antialiased">
          Contoso Outdoor Company
        </h1>
        <div className="text-zinc-100 mt-4 text-2xl">
          Embrace Adventure with Contoso Outdoors - Your Ultimate Partner in
          Exploring the Unseen!
        </div>
        <div className="text-zinc-100 mt-2 text-lg w-2/3">
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
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    width={350}
                    height={350}
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
                    // w-full so the image scales into its column: at its
                    // intrinsic 350px it overflows one instead.
                    className="rounded-3xl w-full h-auto"
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
