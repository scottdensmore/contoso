"use client";

import { useState } from "react";
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
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
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
        const data = await response.json();
        setError(data.message || "Failed to send message. Please try again.");
      }
    } catch (err) {
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

      {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full flex justify-center rounded-lg bg-indigo-600 px-4 py-4 text-sm font-bold text-white shadow-lg hover:bg-indigo-500 focus-visible:outline-solid focus-visible:outline-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${ACTION_BOUNDARY}`}
      >
        {isSubmitting ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
