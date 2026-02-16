import Link from "next/link";

export default function ContactThanks() {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
        Thank You!
      </h1>
      <p className="text-base leading-7 text-gray-600 mb-8">
        We&apos;ve received your message and our team of outdoor experts will get back to you as soon as possible. Your next adventure awaits!
      </p>
      <Link
        href="/"
        className="rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors w-full"
      >
        Return to Shop
      </Link>
    </div>
  );
}