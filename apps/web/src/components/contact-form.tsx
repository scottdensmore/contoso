"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ACTION_BOUNDARY, FIELD_BOUNDARY } from "@/lib/control-classes";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    orderNumber: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const submitRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  // `isSubmitting` disables the submit button, and disabling the focused
  // element blurs it -- so after a click-submit the person is on `<body>` at
  // the top of the document when the failure lands. This puts them back.
  //
  // Guarded on the loss having happened, not on the failure. Only the button is
  // disabled, so submitting with Enter from a text field never loses focus, and
  // moving it there would take someone out of the field they were typing in --
  // a focus change racing an assertive announcement for no gain.
  useEffect(() => {
    if (error && !isSubmitting && document.activeElement === document.body) {
      submitRef.current?.focus();
    }
  }, [error, isSubmitting]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Load-bearing beyond clearing stale text: a live region only announces
    // a *change*, so two consecutive failures with the same message need the
    // empty state between them or the second one is silent. Removing this as
    // redundant would break re-announcement without failing anything obvious.
    setError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/contact/thanks");
      } else {
        // Before the parse: an error body that is not JSON -- an
        // infrastructure error page, the likeliest production 5xx -- makes
        // `response.json()` throw into the catch below, and the status is the
        // one thing an operator needs. Logging after the parse loses it for
        // exactly that case.
        console.error("Contact form submission failed", { status: response.status });
        const data = await response.json().catch(() => null);
        setError(data?.message || "Failed to send message. Please try again.");
      }
    } catch (err) {
      // Network failures, and any error whose body is unreadable. An HTTP
      // error response is reported by the `else` above, which now runs before
      // the parse, so a 502 serving HTML is logged with its status there and
      // arrives here only as the parse failure. The user-facing string is a
      // constant, so between them these two logs are the only record of which
      // failure actually happened.
      console.error("Contact form submission failed", err);
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/90 backdrop-blur-xs p-8 rounded-xl shadow-2xl space-y-6 max-w-lg w-full"
    >
      <div className="space-y-2">
        <label
          htmlFor="name"
          className="block text-sm font-semibold text-gray-900"
        >
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          autoComplete="name"
          required
          value={formData.name}
          onChange={handleChange}
          className={`block w-full rounded-lg border-0 px-4 py-3 text-gray-900 shadow-xs placeholder:text-gray-400 sm:text-sm focus:ring-indigo-600 focus-visible:outline-indigo-600 ${FIELD_BOUNDARY}`}
          placeholder="Your name"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block text-sm font-semibold text-gray-900"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          autoComplete="email"
          required
          value={formData.email}
          onChange={handleChange}
          className={`block w-full rounded-lg border-0 px-4 py-3 text-gray-900 shadow-xs placeholder:text-gray-400 sm:text-sm focus:ring-indigo-600 focus-visible:outline-indigo-600 ${FIELD_BOUNDARY}`}
          placeholder="you@example.com"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label
            htmlFor="subject"
            className="block text-sm font-semibold text-gray-900"
          >
            Subject
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            required
            value={formData.subject}
            onChange={handleChange}
            className={`block w-full rounded-lg border-0 px-4 py-3 text-gray-900 shadow-xs placeholder:text-gray-400 sm:text-sm focus:ring-indigo-600 focus-visible:outline-indigo-600 ${FIELD_BOUNDARY}`}
            placeholder="How can we help?"
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="orderNumber"
            className="block text-sm font-semibold text-gray-900"
          >
            Order Number
          </label>
          <input
            type="text"
            id="orderNumber"
            name="orderNumber"
            value={formData.orderNumber}
            onChange={handleChange}
            className={`block w-full rounded-lg border-0 px-4 py-3 text-gray-900 shadow-xs placeholder:text-gray-400 sm:text-sm focus:ring-indigo-600 focus-visible:outline-indigo-600 ${FIELD_BOUNDARY}`}
            placeholder="Optional"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="message"
          className="block text-sm font-semibold text-gray-900"
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          required
          value={formData.message}
          onChange={handleChange}
          className={`block w-full rounded-lg border-0 px-4 py-3 text-gray-900 shadow-xs placeholder:text-gray-400 sm:text-sm focus:ring-indigo-600 focus-visible:outline-indigo-600 ${FIELD_BOUNDARY}`}
          placeholder="Write your message here..."
        ></textarea>
      </div>

      {/*
        Always rendered, empty when idle. A live region that appears at the same
        moment as its content is not reliably announced -- the region has to be
        there first for the change to be a change, which is the same reasoning
        `avatar-upload.tsx` records for its status line.

        `role="alert"` rather than `aria-live` alone: a failed submission is the
        assertive case. It is not the only alert on the page, though -- Next
        renders a route announcer with `role="alert"` inside a shadow root, so
        `getByRole('alert')` finds two and tests have to scope to the form.
        `e2e/contact-error.spec.ts` records the measurement.

        Also referenced by the submit button's `aria-describedby`. Some screen
        readers flush the speech queue on a focus change, which can clip an
        assertive announcement -- and this component moves focus in the same
        tick. The description does not depend on the live region surviving
        that: whoever lands on the button hears why it failed either way.

        Costs no layout while empty, which matters because anything that grows
        here pushes the page's primary action further below the fold (#286,
        #339). That is margin collapsing rather than anything declared: the
        node is `display: block` with `height: 0`, so its margins collapse
        through it and with its neighbour's. Measured at 390x844, the submit
        button sits at y=796 whether this node is present or removed.

        `text-red-700`, not `red-600`. The card is `bg-white/90` over a
        photograph, so the effective background is about rgb(234,234,233)
        rather than white -- and red-600, which measures 4.77:1 on white,
        drops to 3.96-4.02:1 there and fails AA for 14px text. red-700
        measures 5.33:1 against the same sampled pixels.

        An earlier version carried `empty:mt-0` to force that. It was inert --
        Tailwind v4's `space-y-6` sets `margin-bottom` on non-last children,
        not `margin-top`, so the class targeted a margin nothing had ever set.
        Removing it changes no measurement. `e2e/contact-error.spec.ts` pins
        the invariance itself rather than the mechanism.
      */}
      <p id="contact-form-error" role="alert" className="text-red-700 text-sm font-medium">
        {error}
      </p>

      <button
        ref={submitRef}
        type="submit"
        disabled={isSubmitting}
        aria-describedby={error ? "contact-form-error" : undefined}
        className={`w-full flex justify-center rounded-lg bg-indigo-600 px-4 py-4 text-sm font-bold text-white shadow-lg hover:bg-indigo-500 focus-visible:outline-solid focus-visible:outline-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${ACTION_BOUNDARY}`}
      >
        {isSubmitting ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
