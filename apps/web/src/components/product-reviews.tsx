"use client";

import { useState, useEffect } from "react";
import clsx from "clsx";
import { StarIcon as SolidStarIcon, MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { StarIcon as OutlineStarIcon } from "@heroicons/react/24/outline";
import {
  type Review,
  type ReviewSortOption,
  calculateReviewStats,
  filterAndSortReviews,
} from "@/lib/reviews";
import {
  ACTION_BOUNDARY,
  ACTION_FOCUS,
  FIELD_BOUNDARY,
} from "@/lib/control-classes";

interface ProductReviewsProps {
  slug: string;
  productName: string;
  initialReviews?: Review[];
}

export default function ProductReviews({
  slug,
  productName,
  initialReviews = [],
}: ProductReviewsProps) {
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<ReviewSortOption>("recent");
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [author, setAuthor] = useState("");
  const [comment, setComment] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Hydrate user-submitted reviews from localStorage
  useEffect(() => {
    try {
      const storageKey = `contoso_reviews_${slug}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setUserReviews(parsed);
        }
      }
    } catch {
      // Ignore localStorage access errors
    }
  }, [slug]);

  // Merge user reviews at the top
  const allReviews: Review[] = [...userReviews, ...initialReviews];
  const stats = calculateReviewStats(allReviews);

  const filteredReviews = filterAndSortReviews(allReviews, {
    searchQuery,
    starRating: selectedRating,
    verifiedOnly,
    sortBy,
  });

  const hasActiveFilters = Boolean(
    searchQuery.trim() || selectedRating !== null || verifiedOnly
  );

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedRating(null);
    setVerifiedOnly(false);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();

    if (rating < 1 || rating > 5) {
      setFormError("Please select a rating from 1 to 5 stars.");
      return;
    }

    if (!comment.trim()) {
      setFormError("Please enter a review comment.");
      return;
    }

    const newReview: Review = {
      id: `${slug}-user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      rating,
      comment: comment.trim(),
      author: author.trim() || "Verified Buyer",
      date: new Date().toISOString().split("T")[0],
    };

    const updatedUserReviews = [newReview, ...userReviews];
    setUserReviews(updatedUserReviews);

    try {
      localStorage.setItem(
        `contoso_reviews_${slug}`,
        JSON.stringify(updatedUserReviews)
      );
    } catch {
      // Ignore localStorage write errors
    }

    // Reset form
    setRating(0);
    setHoverRating(0);
    setAuthor("");
    setComment("");
    setFormError(null);
    setSuccessMessage("Thank you! Your review has been submitted successfully.");
  };

  return (
    <section aria-labelledby="reviews-heading" id="reviews" className="w-full">
      {/* Header & Rating Summary */}
      <div className="border-b border-zinc-200 pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="reviews-heading"
              className="text-2xl font-bold tracking-tight text-zinc-900"
            >
              Reviews for {productName}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span className="text-3xl font-extrabold text-zinc-900">
                {stats.averageRating.toFixed(1)}
              </span>
              <div
                className="flex items-center"
                aria-label={`${stats.averageRating.toFixed(1)} out of 5 stars`}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <SolidStarIcon
                    key={star}
                    className={clsx(
                      "size-5",
                      star <= Math.round(stats.averageRating)
                        ? "text-amber-400"
                        : "text-zinc-200"
                    )}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <span className="text-sm text-zinc-600">
                Based on {stats.totalReviews} customer reviews
              </span>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={() => {
                setIsFormOpen((prev) => !prev);
                setSuccessMessage(null);
              }}
              aria-expanded={isFormOpen}
              className={`rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-indigo-600 ${ACTION_BOUNDARY}`}
            >
              Write a Review
            </button>
          </div>
        </div>

        {/* Status announcement */}
        <div role="status" aria-live="polite" className="mt-4">
          {successMessage && (
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
              {successMessage}
            </div>
          )}
        </div>

        {/* Rating Breakdown */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-zinc-900">
            Rating Breakdown
          </h3>
          <div className="mt-3 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.ratingCounts[star as 1 | 2 | 3 | 4 | 5] || 0;
              const percentage =
                stats.ratingPercentages[star as 1 | 2 | 3 | 4 | 5] || 0;
              const isSelected = selectedRating === star;

              return (
                <div key={star} className="flex items-center gap-3 text-sm">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedRating(isSelected ? null : star)
                    }
                    className={clsx(
                      "flex min-w-[70px] items-center gap-1 text-left rounded px-1.5 py-0.5 text-zinc-700 hover:text-indigo-600 focus-visible:outline-indigo-600",
                      ACTION_FOCUS,
                      isSelected && "font-bold text-indigo-600 ring-1 ring-indigo-600"
                    )}
                    aria-label={`${star} star reviews (${count})`}
                  >
                    <span>{star} star</span>
                  </button>

                  <div
                    role="progressbar"
                    aria-label={`${star} star reviews: ${percentage}%`}
                    aria-valuenow={percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="relative h-3 w-full max-w-xs overflow-hidden rounded-full bg-zinc-200"
                  >
                    <div
                      className="h-full bg-amber-400 transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <span className="w-12 text-right text-xs text-zinc-500">
                    {percentage}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Submission Form */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmitReview}
          className="mt-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-xs"
        >
          <h3 className="text-lg font-bold text-zinc-900">
            Write a Review for {productName}
          </h3>

          {formError && (
            <div
              role="alert"
              className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-700"
            >
              {formError}
            </div>
          )}

          {/* Rating selector */}
          <div className="mt-4">
            <span id="review-rating-label" className="block text-sm font-medium text-zinc-700 mb-1">
              Rating
            </span>
            <div role="group" aria-labelledby="review-rating-label" className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= (hoverRating || rating);
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      setRating(star);
                      setFormError(null);
                    }}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                    className={`rounded p-1 text-zinc-400 hover:text-amber-400 focus-visible:outline-indigo-600 ${ACTION_FOCUS}`}
                  >
                    {isFilled ? (
                      <SolidStarIcon className="size-7 text-amber-400" />
                    ) : (
                      <OutlineStarIcon className="size-7 text-zinc-300" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Author field */}
          <div className="mt-4">
            <label
              htmlFor="review-author"
              className="block text-sm font-medium text-zinc-700"
            >
              Your Name
            </label>
            <input
              type="text"
              id="review-author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g. Jane Doe (optional)"
              className={`mt-1 block w-full rounded-md px-3 py-2 text-sm text-zinc-900 shadow-xs focus-visible:outline-indigo-600 ${FIELD_BOUNDARY}`}
            />
          </div>

          {/* Comment field */}
          <div className="mt-4">
            <label
              htmlFor="review-comment"
              className="block text-sm font-medium text-zinc-700"
            >
              Your Review
            </label>
            <textarea
              id="review-comment"
              rows={4}
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                setFormError(null);
              }}
              placeholder="What did you like or dislike about this product?"
              className={`mt-1 block w-full rounded-md px-3 py-2 text-sm text-zinc-900 shadow-xs focus-visible:outline-indigo-600 ${FIELD_BOUNDARY}`}
            />
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex items-center gap-3">
            <button
              type="submit"
              className={`rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-indigo-600 ${ACTION_BOUNDARY}`}
            >
              Submit Review
            </button>
            <button
              type="button"
              onClick={() => {
                setIsFormOpen(false);
                setFormError(null);
              }}
              className={`rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 focus-visible:outline-indigo-600 ${ACTION_FOCUS}`}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Review Filter Controls Bar */}
      <div className="mt-6 flex flex-col gap-4 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <label htmlFor="review-search-input" className="sr-only">
              Search reviews
            </label>
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="size-4 text-zinc-400" aria-hidden="true" />
            </div>
            <input
              type="search"
              id="review-search-input"
              aria-label="Search reviews"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search review text..."
              className={`w-full rounded-md border-0 bg-white py-2 pl-9 pr-8 text-sm text-zinc-900 shadow-xs placeholder:text-zinc-400 focus:ring-2 focus:ring-indigo-600 focus-visible:outline-indigo-600 ${FIELD_BOUNDARY}`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear review search"
                className={`absolute inset-y-0 right-0 flex items-center pr-2.5 text-zinc-400 hover:text-zinc-600 focus-visible:outline-indigo-600 rounded ${ACTION_FOCUS}`}
              >
                <span aria-hidden="true" className="text-base font-bold leading-none">&times;</span>
              </button>
            )}
          </div>

          {/* Verified Buyers Only Checkbox */}
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              aria-label="Verified buyers only"
              className={`size-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600 focus-visible:outline-indigo-600 ${ACTION_FOCUS}`}
            />
            <span>Verified buyers only</span>
          </label>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="review-sort-select" className="sr-only">
              Sort reviews by
            </label>
            <select
              id="review-sort-select"
              aria-label="Sort reviews by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as ReviewSortOption)}
              className={`rounded-md border-0 bg-white py-2 pl-3 pr-8 text-sm text-zinc-900 shadow-xs focus:ring-2 focus:ring-indigo-600 focus-visible:outline-indigo-600 ${FIELD_BOUNDARY}`}
            >
              <option value="recent">Most Recent</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className={`text-sm font-semibold text-indigo-600 hover:text-indigo-500 underline rounded whitespace-nowrap focus-visible:outline-indigo-600 ${ACTION_FOCUS}`}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Result count live announcement */}
      <div
        id="reviews-count"
        aria-live="polite"
        className="mt-4 flex flex-wrap items-center justify-between text-sm text-zinc-600"
      >
        <span>
          Showing {filteredReviews.length} of {allReviews.length} reviews
          {hasActiveFilters ? " (filtered)" : ""}
        </span>
      </div>

      {/* Reviews List */}
      <div className="mt-4 space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500">
            {allReviews.length === 0 ? (
              "No reviews yet. Be the first to write a review!"
            ) : (
              <div className="flex flex-col items-center gap-3">
                <p className="text-zinc-600 font-medium">No reviews match your filters</p>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className={`rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-indigo-600 ${ACTION_BOUNDARY}`}
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <article
              key={rev.id}
              data-testid="review-card"
              className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className="flex items-center"
                    aria-label={`${rev.rating} out of 5 stars`}
                  >
                    {[1, 2, 3, 4, 5].map((s) => (
                      <SolidStarIcon
                        key={s}
                        className={clsx(
                          "size-4",
                          s <= rev.rating ? "text-amber-400" : "text-zinc-200"
                        )}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-zinc-900">
                    {rev.author}
                  </span>
                </div>
                <time
                  dateTime={rev.date}
                  className="text-xs text-zinc-500"
                >
                  {rev.date}
                </time>
              </div>

              {rev.title && (
                <h4 className="mt-2 text-base font-semibold text-zinc-900">
                  {rev.title}
                </h4>
              )}

              <p className="mt-2 text-sm text-zinc-700 leading-relaxed">
                {rev.comment}
              </p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
