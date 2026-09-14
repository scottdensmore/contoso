import type { Metadata } from "next";
import Link from "next/link";
import Block from "@/components/block";
import Header from "@/components/header";
import FaqSearch from "@/components/faq-search";
import { ACTION_BOUNDARY } from "@/lib/control-classes";

export const metadata: Metadata = {
  title: "Help Center & FAQ | Contoso Outdoors",
  description:
    "Find answers to common questions about your orders, shipping, returns, warranty, and gear care at Contoso Outdoors.",
};

export default function FAQPage() {
  return (
    <>
      <Header />

      {/* Hero Banner */}
      <Block outerClassName="bg-zinc-900 text-white" innerClassName="py-16 sm:py-20 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Help Center &amp; FAQ
        </h1>
        <p className="text-lg sm:text-xl text-zinc-300 max-w-2xl mx-auto">
          Find answers to common questions about your orders, shipping, returns, warranty, and gear care.
        </p>
      </Block>

      {/* Interactive FAQ Search Component */}
      <FaqSearch />

      {/* Bottom CTA Section */}
      <Block outerClassName="bg-zinc-50 border-t border-zinc-200" innerClassName="py-16 sm:py-20 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
          Still have questions?
        </h2>
        <p className="text-base sm:text-lg text-zinc-600 mb-8 max-w-xl mx-auto">
          Can&apos;t find what you&apos;re looking for? Reach out to our customer support team for personalized assistance.
        </p>
        <Link
          href="/contact"
          className={`inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-500 transition-[background-color] focus-visible:outline-indigo-600 ${ACTION_BOUNDARY}`}
        >
          Contact Support
        </Link>
      </Block>
    </>
  );
}
