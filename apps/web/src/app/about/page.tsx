import Block from "@/components/block";
import Header from "@/components/header";
import Image from "next/image";

export default function AboutPage() {
  return (
    <>
      <Header />
      {/* Hero Banner */}
      <Block outerClassName="bg-zinc-900" innerClassName="py-20 text-center">
        <h1 className="text-5xl font-bold text-white mb-6">About Contoso Outdoors</h1>
        <p className="text-xl text-zinc-300 max-w-2xl mx-auto">
          Equipping you for every adventure, from the backyard to the backcountry.
        </p>
      </Block>

      {/* Mission Section */}
      <Block innerClassName="py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-zinc-900 mb-6">Our Mission</h2>
            <p className="text-lg text-zinc-600 mb-4">
              At Contoso Outdoors, our mission is simple: to inspire and enable people to explore the natural world. We believe that the outdoors is for everyone, and having the right gear is the first step towards a great adventure.
            </p>
            <p className="text-lg text-zinc-600">
              We are committed to providing high-quality, durable, and sustainable products that you can rely on, season after season.
            </p>
          </div>
          <div className="relative h-80 rounded-2xl overflow-hidden bg-zinc-200">
             <Image
                src="/images/about/mission.png"
                alt="Our Mission"
                fill
                // A `fill` image has no width prop, so without `sizes` Next
                // assumes 100vw and the browser fetches for the whole viewport
                // — w=1080 for a 604px box, and w=1080 for a 381px one.
                //
                // The box is one column of a two-column grid inside the
                // container: half of it, less half the 48px gap and half the
                // 24px padding, so `50vw - 36px`. The container stops growing
                // at the xl breakpoint, which fixes the column at 604px. Below
                // md the grid is one column and the box is the container.
                // The spaces inside the parens are load-bearing. Next finds the
                // viewport percentages with /(^|\s)(1?\d?\d)vw/ to trim the
                // srcset to the rungs a percentage of the viewport can reach;
                // `calc(50vw` puts a paren before the `vw`, nothing matches,
                // and it emits all eleven rungs instead of five. Selection is
                // unaffected either way — this is 780 bytes of dead candidates
                // per response, listed twice because `priority` preloads them.
                sizes="(min-width: 1280px) 604px, (min-width: 768px) calc( 50vw - 36px ), calc( 100vw - 24px )"
                // Largest-contentful-paint reports this image at every width
                // above 390. It was lazy, so the request that decides LCP was
                // the one deferred longest: on a throttled desktop load this
                // buys 300-500ms of LCP for 70-140ms of FCP, because the
                // preload goes ahead of the stylesheet.
                //
                // At 390 that trade is a small loss — the LCP element there is
                // a paragraph, so the FCP cost buys nothing. Kept anyway:
                // next/image has no way to make this conditional on width, and
                // the widths that gain outnumber the one that pays.
                priority
                className="object-cover"
             />
          </div>
        </div>
      </Block>

      {/* Story Section */}
      <Block outerClassName="bg-zinc-50" innerClassName="py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-zinc-900 mb-6">Our Story</h2>
          <p className="text-lg text-zinc-600 mb-6">
            Founded in 2024, Contoso Outdoors started as a small project by a group of friends who were passionate about hiking but frustrated with the lack of affordable, high-performance gear. What began in a garage has grown into a trusted brand for outdoor enthusiasts worldwide.
          </p>
          <p className="text-lg text-zinc-600">
            We test every product ourselves, ensuring that what you buy meets the rigorous standards of the wild. From our lightweight tents to our rugged backpacks, every item is designed with your journey in mind.
          </p>
        </div>
      </Block>
    </>
  );
}
