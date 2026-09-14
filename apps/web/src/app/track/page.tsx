import type { Metadata } from "next";
import Header from "@/components/header";
import Block from "@/components/block";
import OrderTracker from "@/components/order-tracker";

export const metadata: Metadata = {
  title: "Track Your Order | Contoso Outdoors",
  description:
    "Track the real-time shipping status and delivery milestones of your Contoso Outdoors order.",
};

export default function TrackPage() {
  return (
    <>
      <Header />
      <Block
        outerClassName="bg-zinc-900 text-white"
        innerClassName="py-12 sm:py-16 text-center"
      >
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">
          Track Your Order
        </h1>
        <p className="text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto">
          Enter your Order ID and billing or shipping Zip Code or Email address to view
          real-time milestone updates and carrier tracking information.
        </p>
      </Block>

      <Block innerClassName="py-8 sm:py-12">
        <OrderTracker />
      </Block>
    </>
  );
}
