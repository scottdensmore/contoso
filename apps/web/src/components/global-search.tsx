"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { ACTION_FOCUS, FIELD_BOUNDARY } from "@/lib/control-classes";

interface ProductResult {
  id: string;
  name: string;
  slug: string;
  price: number;
  image?: string | null;
  category?: {
    name: string;
  };
  brand?: {
    name: string;
  };
}

interface GlobalSearchProps {
  className?: string;
}

export default function GlobalSearch({ className = "" }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (!val.trim()) {
      setResults([]);
      setIsOpen(false);
      setIsLoading(false);
      setSelectedIndex(-1);
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    setIsLoading(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/products?search=${encodeURIComponent(trimmed)}&limit=6`
        );
        if (response.ok) {
          const data = await response.json();
          setResults(data);
          setIsOpen(true);
          setSelectedIndex(-1);
        } else {
          setResults([]);
          setIsOpen(true);
        }
      } catch (err) {
        console.error("Error searching products:", err);
        setResults([]);
        setIsOpen(true);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (product: ProductResult) => {
    setIsOpen(false);
    setSelectedIndex(-1);
    router.push(`/products/${product.slug}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setSelectedIndex(-1);
      return;
    }

    if (!isOpen || results.length === 0) {
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelect(results[selectedIndex]);
      }
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full max-w-sm sm:max-w-md ${className}`}>
      <div className="relative flex items-center">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
          aria-hidden="true"
        >
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => {
            if (query.trim()) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search products..."
          aria-label="Search products"
          aria-expanded={isOpen}
          aria-controls="global-search-results"
          aria-autocomplete="list"
          aria-activedescendant={
            selectedIndex >= 0 && results[selectedIndex]
              ? `search-result-${results[selectedIndex].id}`
              : undefined
          }
          className={`block w-full rounded-md border-0 py-1.5 pl-10 pr-9 text-gray-900 shadow-xs placeholder:text-gray-400 sm:text-sm sm:leading-6 focus:ring-indigo-600 focus-visible:outline-indigo-600 ${FIELD_BOUNDARY}`}
        />
        {query && !isLoading && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className={`absolute inset-y-0 right-0 flex items-center pr-2.5 text-gray-400 hover:text-gray-600 rounded-sm ${ACTION_FOCUS}`}
          >
            <XMarkIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
        {isLoading && (
          <div
            className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-gray-400"
            aria-hidden="true"
          >
            <svg
              className="h-4 w-4 animate-spin text-indigo-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
          </div>
        )}
      </div>

      {isOpen && (
        <ul
          id="global-search-results"
          role="listbox"
          aria-label="Search results"
          className="absolute left-0 right-0 top-full mt-1 max-h-80 overflow-y-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 z-50"
        >
          {isLoading && results.length === 0 ? (
            <li className="p-4 text-center text-sm text-gray-500 list-none">
              Searching...
            </li>
          ) : results.length > 0 ? (
            results.map((product, index) => {
              const isSelected = selectedIndex === index;
              return (
                <li
                  key={product.id}
                  id={`search-result-${product.id}`}
                  role="option"
                  tabIndex={-1}
                  aria-selected={isSelected}
                  onClick={() => handleSelect(product)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSelect(product);
                    }
                  }}
                  className={`flex items-center px-3 py-2 cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-indigo-50 text-indigo-900"
                      : "text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {product.image ? (
                    <img
                      src={product.image}
                      alt=""
                      aria-hidden="true"
                      className="h-10 w-10 rounded-md object-cover flex-shrink-0 bg-gray-100"
                    />
                  ) : (
                    <div
                      aria-hidden="true"
                      className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0"
                    >
                      <MagnifyingGlassIcon className="h-5 w-5" />
                    </div>
                  )}
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {product.name}
                    </div>
                    {product.category?.name && (
                      <div className="text-xs text-gray-500 truncate">
                        {product.category.name}
                      </div>
                    )}
                  </div>
                  <div className="ml-2 text-sm font-semibold text-gray-900 whitespace-nowrap">
                    ${product.price.toFixed(2)}
                  </div>
                </li>
              );
            })
          ) : (
            <li className="p-4 text-center text-sm text-gray-500 list-none">
              No products found for &apos;{query}&apos;
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
