"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ACTION_BOUNDARY, FIELD_BOUNDARY } from "@/lib/control-classes";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/login"); // Redirect to login page on successful signup
      } else {
        setError(data.message || "Something went wrong during signup.");
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <Link
          href="/"
          className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 focus-visible:outline-indigo-600"
        >
          ← Back to store
        </Link>
        <h1 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Create a new account
        </h1>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Name
            </label>
            <div className="mt-2">
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                disabled={isSubmitting}
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? "auth-error" : undefined}
                className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-xs placeholder:text-gray-400 sm:text-sm sm:leading-6 focus:ring-indigo-600 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed ${FIELD_BOUNDARY}`}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Email address
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={isSubmitting}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? "auth-error" : undefined}
                className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-xs placeholder:text-gray-400 sm:text-sm sm:leading-6 focus:ring-indigo-600 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed ${FIELD_BOUNDARY}`}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Password
              </label>
            </div>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                disabled={isSubmitting}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? "auth-error" : undefined}
                className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-xs placeholder:text-gray-400 sm:text-sm sm:leading-6 focus:ring-indigo-600 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed ${FIELD_BOUNDARY}`}
              />
            </div>
          </div>

          {error && (
            <p id="auth-error" role="alert" className="text-red-500 text-sm">
              {error}
            </p>
          )}

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-solid focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed ${ACTION_BOUNDARY}`}
            >
              {isSubmitting ? "Creating account..." : "Sign up"}
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500 focus-visible:outline-indigo-600"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
