import Block from "@/components/block";
import Header from "@/components/header";
import Link from "next/link";

export default function FAQPage() {
  return (
    <>
      <Header />
      {/* Hero Banner */}
      <Block outerClassName="bg-zinc-900" innerClassName="py-20 text-center">
        <h1 className="text-5xl font-bold text-white mb-6">Frequently Asked Questions</h1>
        <p className="text-xl text-zinc-300 max-w-2xl mx-auto">
          Find answers to common questions about your order, shipping, and more.
        </p>
      </Block>

      {/* Ordering & Shipping Section */}
      <Block innerClassName="py-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-8 border-b pb-4">Ordering & Shipping</h2>
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-semibold text-zinc-800 mb-2">How long will it take to receive my order?</h3>
            <p className="text-zinc-600">
              Standard shipping typically takes 3-5 business days. Expedited shipping options are available at checkout and usually arrive within 1-2 business days.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-zinc-800 mb-2">How can I track my order?</h3>
            <p className="text-zinc-600">
              Once your order ships, you will receive an email with a tracking number. You can also view the status of your order in your account profile.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-zinc-800 mb-2">Do you ship internationally?</h3>
            <p className="text-zinc-600">
              Currently, we only ship within the United States. We are working on expanding our shipping options to international customers in the near future.
            </p>
          </div>
        </div>
      </Block>

      {/* Returns & Refunds Section */}
      <Block outerClassName="bg-zinc-50" innerClassName="py-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-8 border-b pb-4">Returns & Refunds</h2>
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-semibold text-zinc-800 mb-2">What is your return policy?</h3>
            <p className="text-zinc-600">
              We offer a 30-day return policy for all unused items in their original packaging. Simply contact our support team to initiate a return.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-zinc-800 mb-2">How do I return an item?</h3>
            <p className="text-zinc-600">
              To return an item, please visit your order history and select "Return Item" or contact our customer support team for a return shipping label.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-zinc-800 mb-2">When will I get my refund?</h3>
            <p className="text-zinc-600">
              Refunds are processed within 5-7 business days after we receive your returned item. The funds will be returned to your original payment method.
            </p>
          </div>
        </div>
      </Block>

      {/* CTA Section */}
      <Block innerClassName="py-20 text-center">
        <h2 className="text-2xl font-bold text-zinc-900 mb-4">Still have questions?</h2>
        <p className="text-lg text-zinc-600 mb-8">
          We're here to help. Reach out to our support team for assistance.
        </p>
        <Link href="/contact" className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-500 transition-colors">
          Contact Support
        </Link>
      </Block>
    </>
  );
}
