"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import clsx from "clsx";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ChevronDownIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import {
  getAllFaqs,
  getFaqCategories,
  filterFaqs,
} from "@/lib/faq-data";
import {
  FIELD_BOUNDARY,
  ACTION_BOUNDARY,
  ACTION_FOCUS,
} from "@/lib/control-classes";

export default function FaqSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const allFaqs = useMemo(() => getAllFaqs(), []);
  const categories = useMemo(() => getFaqCategories(), []);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allFaqs.length };
    for (const cat of categories) {
      counts[cat] = allFaqs.filter((f) => f.category === cat).length;
    }
    return counts;
  }, [allFaqs, categories]);

  // Filtered FAQ items
  const filteredFaqs = useMemo(() => {
    return filterFaqs(searchQuery, selectedCategory);
  }, [searchQuery, selectedCategory]);

  // Check if all filtered are expanded
  const areAllExpanded =
    filteredFaqs.length > 0 &&
    filteredFaqs.every((item) => expandedIds.has(item.id));

  const toggleExpandAll = () => {
    if (areAllExpanded) {
      setExpandedIds(new Set());
    } else {
      setExpandedIds(new Set(filteredFaqs.map((f) => f.id)));
    }
  };

  const toggleItem = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSelectedCategory("all");
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Search Input Box */}
      <div className="relative mb-8">
        <label htmlFor="faq-search-input" className="sr-only">
          Search FAQ
        </label>
        <div className="relative flex items-center">
          <MagnifyingGlassIcon
            className="absolute left-4 size-5 text-zinc-400 pointer-events-none"
            aria-hidden="true"
          />
          <input
            id="faq-search-input"
            type="search"
            role="searchbox"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions, topics, or keywords..."
            className={clsx(
              "w-full pl-11 pr-11 py-3.5 text-base text-zinc-900 bg-white rounded-xl shadow-xs",
              "placeholder:text-zinc-400 border-0 focus:ring-2 focus:ring-indigo-600 focus-visible:outline-indigo-600",
              FIELD_BOUNDARY
            )}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search input"
              className={clsx(
                "absolute right-3 p-1.5 text-zinc-400 hover:text-zinc-600 rounded-lg",
                "focus-visible:outline-indigo-600",
                ACTION_FOCUS
              )}
            >
              <XMarkIcon className="size-5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Screen Reader Live Status Region */}
      <div role="status" aria-live="polite" className="sr-only">
        {`Showing ${filteredFaqs.length} ${
          filteredFaqs.length === 1 ? "question" : "questions"
        }`}
      </div>

      {/* Category Filter Chips & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-4 border-b border-zinc-200">
        <div
          className="flex flex-wrap items-center gap-2"
          role="group"
          aria-label="Filter FAQ by category"
        >
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            aria-pressed={selectedCategory === "all"}
            className={clsx(
              "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors",
              "focus-visible:outline-indigo-600",
              ACTION_FOCUS,
              selectedCategory === "all"
                ? "bg-zinc-900 text-white shadow-xs"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
            )}
          >
            <span>All</span>
            <span
              className={clsx(
                "text-xs px-1.5 py-0.5 rounded-full font-semibold",
                selectedCategory === "all"
                  ? "bg-zinc-800 text-zinc-200"
                  : "bg-zinc-200 text-zinc-600"
              )}
            >
              {categoryCounts.all}
            </span>
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                aria-pressed={isSelected}
                className={clsx(
                  "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors",
                  "focus-visible:outline-indigo-600",
                  ACTION_FOCUS,
                  isSelected
                    ? "bg-zinc-900 text-white shadow-xs"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                )}
              >
                <span>{cat}</span>
                <span
                  className={clsx(
                    "text-xs px-1.5 py-0.5 rounded-full font-semibold",
                    isSelected
                      ? "bg-zinc-800 text-zinc-200"
                      : "bg-zinc-200 text-zinc-600"
                  )}
                >
                  {categoryCounts[cat] ?? 0}
                </span>
              </button>
            );
          })}
        </div>

        {filteredFaqs.length > 0 && (
          <button
            type="button"
            onClick={toggleExpandAll}
            className={clsx(
              "self-start sm:self-auto text-sm font-medium text-zinc-600 hover:text-zinc-900 px-3 py-1.5 rounded-md hover:bg-zinc-100 transition-colors",
              "focus-visible:outline-indigo-600",
              ACTION_FOCUS
            )}
          >
            {areAllExpanded ? "Collapse All" : "Expand All"}
          </button>
        )}
      </div>

      {/* Accordion FAQ List */}
      <h2 className="sr-only">Frequently Asked Questions</h2>

      {filteredFaqs.length > 0 ? (
        <div className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white shadow-xs overflow-hidden">
          {filteredFaqs.map((item) => {
            const isOpen = expandedIds.has(item.id);
            const questionId = `faq-question-${item.id}`;
            const answerId = `faq-answer-${item.id}`;

            return (
              <div key={item.id} className="transition-colors">
                <h3 className="text-base font-semibold text-zinc-900 m-0">
                  <button
                    type="button"
                    id={questionId}
                    onClick={() => toggleItem(item.id)}
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                    className={clsx(
                      "w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left font-medium transition-colors",
                      "hover:bg-zinc-50 focus-visible:outline-indigo-600",
                      isOpen && "bg-zinc-50/50",
                      ACTION_FOCUS
                    )}
                  >
                    <span className="text-base sm:text-lg font-semibold text-zinc-900">
                      {item.question}
                    </span>
                    <ChevronDownIcon
                      className={clsx(
                        "size-5 shrink-0 text-zinc-500 transition-transform duration-200",
                        isOpen && "rotate-180 text-zinc-900"
                      )}
                      aria-hidden="true"
                    />
                  </button>
                </h3>
                {isOpen && (
                  <div
                    id={answerId}
                    role="region"
                    aria-labelledby={questionId}
                    className="px-5 pb-5 sm:px-6 sm:pb-6 text-zinc-600 text-sm sm:text-base leading-relaxed"
                  >
                    <p>{item.answer}</p>
                    {item.linkUrl && (
                      <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center">
                        <Link
                          href={item.linkUrl}
                          className={clsx(
                            "inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-500 rounded px-1 py-0.5",
                            "focus-visible:outline-indigo-600",
                            ACTION_FOCUS
                          )}
                        >
                          <span>{item.linkLabel || "Learn more"}</span>
                          <ArrowTopRightOnSquareIcon
                            className="size-4"
                            aria-hidden="true"
                          />
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12 px-4 rounded-xl border border-dashed border-zinc-300 bg-zinc-50/50">
          <p className="text-base sm:text-lg font-medium text-zinc-900 mb-2">
            No questions found matching &apos;{searchQuery}&apos;
          </p>
          <p className="text-sm text-zinc-600 mb-6 max-w-md mx-auto">
            Try checking for spelling errors, using different keywords, or clear your filters.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={handleClearSearch}
              className={clsx(
                "px-4 py-2 text-sm font-semibold text-zinc-700 bg-white border border-zinc-300 rounded-md hover:bg-zinc-50 transition-colors",
                "focus-visible:outline-indigo-600",
                ACTION_FOCUS
              )}
            >
              Clear search
            </button>
            <Link
              href="/contact"
              className={clsx(
                "px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-500 transition-colors",
                "focus-visible:outline-indigo-600",
                ACTION_BOUNDARY
              )}
            >
              Contact Support
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
