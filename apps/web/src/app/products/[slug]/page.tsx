import Block from "@/components/block";
import clsx from "clsx";
import Image from "next/image";
import { Product } from "@/lib/types";
import { promises as fs } from "fs";
import { marked } from "marked";
import Header from "@/components/header";
import { notFound } from "next/navigation";

// This function gets called at build time
export async function generateStaticParams() {
  const file = await fs.readFile(
    process.cwd() + "/public/products.json",
    "utf8"
  );

  // Parsing JSON data
  const products = JSON.parse(file) as Product[];
  // Generating paths from data
  const paths = products.map((product) => ({ slug: product.slug }));
  return paths;
}

async function getData(slug: string): Promise<Product | undefined> {
  const file = await fs.readFile(
    process.cwd() + "/public/products.json",
    "utf8"
  );
  const data: Product[] = JSON.parse(file);
  const product = data.find((p) => p.slug === slug);
  return product;
}

async function getManual(manual: string): Promise<string> {
  const file = await fs.readFile(process.cwd() + `/public/${manual}`, "utf8");
  return file;
}

function getRange(header1:string, header2:string, markdown: string[]): string {
  const start = markdown.findIndex((m) => m.startsWith(header1));
  const end = header2.length > 0 ? markdown.findIndex((m) => m.startsWith(header2)) : markdown.length - 1;
  const range = markdown.slice(start, end);
  // marked >=9 types parse as string | Promise<string>; async: false selects
  // the synchronous overload, which is what this synchronous helper returns.
  return marked.parse(range.join("\n"), { async: false });
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getData(slug);

  if (!product) {
    notFound();
  }

  const manual = await getManual(product.manual);
  const mitems = manual.split("\n");

  const sections = [
    {
      start: "## Features",
      end: "## Technical",
    },
    {
      start: "## Reviews",
      end: "## FAQ",
    },
    {
      start: "## FAQ",
      end: "",
    },
    {
      start: "## Return",
      end: "## Reviews",
    },
    {
      start: "## Caution",
      end: "## Warranty",
    },
    {
      start: "## Technical",
      end: "## User Guide",
    },

    {
      start: "## Warranty",
      end: "## Return",
    },
    {
      start: "## User Guide",
      end: "## Caution",
    },
  ];

  const getSection = (idx: number) => {
    const section = sections[idx];
    const range = getRange(section.start, section.end, mitems);
    return range;
  };

  const extraclasses =
    "[&_li]:ml-8 [&_ol]:list-decimal [&_ul]:list-disc [&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:pt-3 [&_h2]:pb-3" +
    "[&_h3]:text-xl [&_h3]:font-bold [&_h3]:pt-3 [&_h3]:pb-3" +
    "[&_h4]:text-lg [&_h4]:font-semibold [&_h4]:pt-3 [&_h4]:pb-3" +
    "[&_ol]:list-decimal [&_ol]:list-outside [&_ul]:list-outside";
  return (
    <>
      <Header />
      <Block innerClassName="pt-6 pb-6">
        <h1 className="text-6xl pb-5 pt-8 subpixel-antialiased font-serif ">
          {product.name}
        </h1>
        <div
          className="first-line:uppercase first-line:tracking-widest
                  first-letter:text-8xl first-letter:font-bold first-letter:text-slate-900
                  first-letter:mr-3 first-letter:float-left"
        >
          {product.description}
        </div>
      </Block>
      {product.images.map((image, i) => (
        <Block
          key={i}
          outerClassName={clsx(i % 2 == 0 ? "bg-zinc-100" : "bg-inherit")}
          // Stacked below md. The row never wrapped and the image kept its
          // intrinsic 550px, so the section overflowed by 202px on every phone
          // width and the page scrolled sideways.
          innerClassName={clsx(
            "p-6 flex items-start flex-col lg:items-start",
            i % 2 == 1 ? "lg:flex-row-reverse" : "lg:flex-row"
          )}
        >
          <Image
            src={image}
            alt={product.name}
            width={550}
            height={550}
            // `max-w-[550px]` caps the box, so it stops growing once the
            // container can hold 550 — from 574px of viewport, not from the
            // lg breakpoint the old value keyed on. Between the two it claimed
            // the whole viewport for a 550px box and pulled w=1080.
            //
            // Spaces inside the parens: next/image finds the viewport
            // percentage with /(^|\s)(1?\d?\d)vw/ to trim the srcset, and
            // `calc(100vw` hides it behind a paren.
            sizes="(min-width: 574px) 550px, calc( 100vw - 24px )"
            // The first gallery image is what largest-contentful-paint reports
            // from 834px up, worth 616ms there. At 390 the description fills
            // the viewport and this image starts exactly at the fold, so the
            // preload is entirely off-screen and buys nothing -- about 20ms of
            // FCP for no return, which `next/image` gives no way to avoid at
            // one width only.
            //
            // Only the first. The rest of the gallery is well below the fold on
            // every viewport, and eager requests there would compete with this
            // one on equal terms: react-dom preloads any image that is not
            // `loading="lazy"`, and next/image sets no fetchpriority to break
            // the tie.
            priority={i === 0}
            className="rounded-3xl w-full h-auto max-w-[550px] lg:mr-6"
          />
          <div
            className={clsx(
              // min-w-0: without it a flex child refuses to shrink below its
              // content, so long words push the row past the viewport.
              "text-left mt-2 grow min-w-0 text-lg",
              extraclasses,
              i % 2 == 1 ? "lg:mr-8" : "lg:ml-8"
            )}
            dangerouslySetInnerHTML={{ __html: getSection(i) }}
          />
        </Block>
      ))}
      <Block innerClassName={clsx("p-4 flex items-start")}>
        <div
          className={clsx("text-left mt-2 grow min-w-0", extraclasses)}
          dangerouslySetInnerHTML={{ __html: getSection(7) }}
        />
      </Block>
      <Block
        outerClassName="bg-zinc-100"
        innerClassName={clsx("p-6 flex items-start flex-col lg:flex-row")}
      >
        <div
          className={clsx("text-left mt-2 grow min-w-0 lg:pr-6", extraclasses)}
          dangerouslySetInnerHTML={{ __html: getSection(6) }}
        />
        <div
          className={clsx("text-left mt-2 grow min-w-0 lg:pl-6", extraclasses)}
          dangerouslySetInnerHTML={{ __html: getSection(5) }}
        />
      </Block>
    </>
  );
}