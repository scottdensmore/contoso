import Link from "next/link";

export default function ContactThanks() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-4">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-6">
        Thank You!
      </h1>
      <p className="text-lg leading-8 text-gray-600 mb-10 max-w-md">
        We've received your message and our team of outdoor experts will get back to you as soon as possible. Your next adventure awaits!
      </p>
      <Link
        href="/"
        className="rounded-md bg-indigo-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
      >
        Return to Shop
      </Link>
    </div>
  );
}
