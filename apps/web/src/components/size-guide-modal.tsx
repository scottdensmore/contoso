"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ACTION_BOUNDARY, ACTION_FOCUS, FIELD_BOUNDARY } from "@/lib/control-classes";
import {
  getSizeChart,
  calculateRecommendedSize,
  normalizeCategory,
  type SizeUnit,
  type RecommendedFit,
} from "@/lib/size-guide";

interface SizeGuideModalProps {
  category?: string | null;
  productName?: string;
}

export default function SizeGuideModal({
  category,
  productName,
}: SizeGuideModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"chart" | "calculator">("chart");
  const [unit, setUnit] = useState<SizeUnit>("in");
  const [measurement, setMeasurement] = useState<string>("");
  const [recommendation, setRecommendation] = useState<RecommendedFit | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const chartTabRef = useRef<HTMLButtonElement>(null);
  const calcTabRef = useRef<HTMLButtonElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(false);

  const chart = getSizeChart(category, unit);
  const normalizedCat = normalizeCategory(category);

  // Focus restoration and dialog initial focus
  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      lastFocusedRef.current = (document.activeElement as HTMLElement) || triggerRef.current;
      dialogRef.current?.focus({ preventScroll: true });
    } else if (!isOpen && wasOpenRef.current) {
      const el = lastFocusedRef.current || triggerRef.current;
      el?.focus({ preventScroll: true });
    }
    wasOpenRef.current = isOpen;
  }, [isOpen]);

  // Clean up focus on unmount
  useEffect(() => {
    return () => {
      if (wasOpenRef.current) {
        lastFocusedRef.current?.focus({ preventScroll: true });
      }
    };
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  // Escape key and focus trap handler
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
        return;
      }

      if (event.key !== "Tab") return;

      const panel = dialogRef.current;
      if (!panel) return;

      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );

      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (!panel.contains(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
        return;
      }

      if (event.shiftKey && (active === panel || active === first)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, closeModal]);

  const handleTabKeyDown = (event: React.KeyboardEvent, currentTab: "chart" | "calculator") => {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      if (currentTab === "chart") {
        setActiveTab("calculator");
        calcTabRef.current?.focus();
      } else {
        setActiveTab("chart");
        chartTabRef.current?.focus();
      }
    }
  };

  const handleToggleUnit = () => {
    setUnit((prev) => (prev === "in" ? "cm" : "in"));
  };

  const handleCalculateFit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(measurement);
    const rec = calculateRecommendedSize(category ?? undefined, val, unit);
    setRecommendation(rec);
  };

  const getMeasurementLabel = () => {
    switch (normalizedCat) {
      case "tents":
        return "Number of Campers / Occupants";
      case "footwear":
        return `Foot Length (${unit === "in" ? "inches" : "cm"})`;
      case "backpacks":
        return `Torso Length (${unit === "in" ? "inches" : "cm"})`;
      case "apparel":
      default:
        return `Chest Circumference (${unit === "in" ? "inches" : "cm"})`;
    }
  };

  const getMeasurementPlaceholder = () => {
    switch (normalizedCat) {
      case "tents":
        return "e.g., 4";
      case "footwear":
        return unit === "in" ? "e.g., 10.5" : "e.g., 26.7";
      case "backpacks":
        return unit === "in" ? "e.g., 19" : "e.g., 48";
      case "apparel":
      default:
        return unit === "in" ? "e.g., 42" : "e.g., 107";
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={openModal}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={`inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-sm font-semibold text-zinc-800 shadow-xs hover:bg-zinc-50 hover:text-zinc-900 transition-colors ${ACTION_BOUNDARY} ${ACTION_FOCUS}`}
      >
        <svg
          className="h-4 w-4 text-zinc-600 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21.3 15.3l-6.6 6.6c-.4.4-1 .4-1.4 0l-11-11c-.4-.4-.4-1 0-1.4l6.6-6.6c.4-.4 1-.4 1.4 0l11 11c.4.4.4 1 0 1.4z" />
          <path d="M13 3l2 2" />
          <path d="M10.5 5.5l2 2" />
          <path d="M8 8l2 2" />
          <path d="M5.5 10.5l2 2" />
        </svg>
        <span>Size Guide</span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="size-guide-modal-title"
          className="fixed inset-0 z-50 overflow-y-auto"
        >
          {/* Backdrop */}
          <div
            data-testid="size-guide-backdrop"
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={closeModal}
            aria-hidden="true"
          />

          <div className="flex min-h-full items-center justify-center p-3 sm:p-6">
            <div
              ref={dialogRef}
              tabIndex={-1}
              className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 focus:outline-none overflow-hidden my-6 z-10"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
                <div>
                  <h2
                    id="size-guide-modal-title"
                    className="text-xl font-bold text-zinc-900"
                  >
                    {chart.title}
                  </h2>
                  {productName && (
                    <p className="text-xs text-zinc-500 mt-0.5">{productName}</p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Unit toggle switch */}
                  <button
                    type="button"
                    onClick={handleToggleUnit}
                    aria-pressed={unit === "cm"}
                    className={`inline-flex items-center rounded-full border border-zinc-300 bg-zinc-100 p-0.5 text-xs font-medium text-zinc-700 hover:bg-zinc-200 transition-colors ${ACTION_FOCUS}`}
                  >
                    <span
                      className={`rounded-full px-2.5 py-1 ${
                        unit === "in"
                          ? "bg-white text-zinc-900 shadow-xs font-semibold"
                          : "text-zinc-500"
                      }`}
                    >
                      Inches
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 ${
                        unit === "cm"
                          ? "bg-white text-zinc-900 shadow-xs font-semibold"
                          : "text-zinc-500"
                      }`}
                    >
                      Centimeters
                    </span>
                  </button>

                  {/* Close button */}
                  <button
                    type="button"
                    onClick={closeModal}
                    aria-label="Close size guide"
                    className={`rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors ${ACTION_FOCUS}`}
                  >
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="border-b border-zinc-200 px-6">
                <div
                  role="tablist"
                  aria-label="Size guide options"
                  className="flex space-x-6 -mb-px"
                >
                  <button
                    ref={chartTabRef}
                    id="size-chart-tab"
                    role="tab"
                    type="button"
                    aria-selected={activeTab === "chart"}
                    aria-controls="size-chart-panel"
                    tabIndex={activeTab === "chart" ? 0 : -1}
                    onClick={() => setActiveTab("chart")}
                    onKeyDown={(e) => handleTabKeyDown(e, "chart")}
                    className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === "chart"
                        ? "border-indigo-600 text-indigo-600 font-semibold"
                        : "border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300"
                    } ${ACTION_FOCUS}`}
                  >
                    Size Chart
                  </button>
                  <button
                    ref={calcTabRef}
                    id="fit-calculator-tab"
                    role="tab"
                    type="button"
                    aria-selected={activeTab === "calculator"}
                    aria-controls="fit-calculator-panel"
                    tabIndex={activeTab === "calculator" ? 0 : -1}
                    onClick={() => setActiveTab("calculator")}
                    onKeyDown={(e) => handleTabKeyDown(e, "calculator")}
                    className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === "calculator"
                        ? "border-indigo-600 text-indigo-600 font-semibold"
                        : "border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300"
                    } ${ACTION_FOCUS}`}
                  >
                    Fit Calculator
                  </button>
                </div>
              </div>

              {/* Tab Panels */}
              <div className="p-6">
                {activeTab === "chart" && (
                  <div
                    id="size-chart-panel"
                    role="tabpanel"
                    aria-labelledby="size-chart-tab"
                    className="space-y-6"
                  >
                    <div className="overflow-x-auto rounded-lg border border-zinc-200">
                      <table
                        role="table"
                        className="min-w-full divide-y divide-zinc-200 text-left text-sm"
                      >
                        <thead className="bg-zinc-50 text-zinc-700">
                          <tr>
                            {chart.headers.map((header, idx) => (
                              <th
                                key={idx}
                                scope="col"
                                className="px-4 py-3 font-semibold"
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 bg-white text-zinc-800">
                          {chart.rows.map((row, rIdx) => (
                            <tr
                              key={rIdx}
                              className={rIdx % 2 === 0 ? "bg-white" : "bg-zinc-50/50"}
                            >
                              <td className="px-4 py-3 font-medium text-zinc-900">
                                {row.size}
                              </td>
                              {row.chest !== undefined && (
                                <td className="px-4 py-3">{row.chest}</td>
                              )}
                              {row.waist !== undefined && (
                                <td className="px-4 py-3">{row.waist}</td>
                              )}
                              {row.sleeve !== undefined && (
                                <td className="px-4 py-3">{row.sleeve}</td>
                              )}
                              {row.usMen !== undefined && (
                                <td className="px-4 py-3">{row.usMen}</td>
                              )}
                              {row.usWomen !== undefined && (
                                <td className="px-4 py-3">{row.usWomen}</td>
                              )}
                              {row.euSize !== undefined && (
                                <td className="px-4 py-3">{row.euSize}</td>
                              )}
                              {row.footLength !== undefined && (
                                <td className="px-4 py-3">{row.footLength}</td>
                              )}
                              {row.capacity !== undefined && (
                                <td className="px-4 py-3">{row.capacity}</td>
                              )}
                              {row.floorDimensions !== undefined && (
                                <td className="px-4 py-3">{row.floorDimensions}</td>
                              )}
                              {row.peakHeight !== undefined && (
                                <td className="px-4 py-3">{row.peakHeight}</td>
                              )}
                              {row.torsoLength !== undefined && (
                                <td className="px-4 py-3">{row.torsoLength}</td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Sizing Measurement Guide / Tips */}
                    <div className="rounded-xl bg-zinc-50 p-4 border border-zinc-200/80">
                      <h3 className="text-sm font-bold text-zinc-900 mb-2">
                        How to Measure & Sizing Tips
                      </h3>
                      <ul className="list-disc list-inside text-xs text-zinc-600 space-y-1">
                        {chart.tips.map((tip, tIdx) => (
                          <li key={tIdx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === "calculator" && (
                  <div
                    id="fit-calculator-panel"
                    role="tabpanel"
                    aria-labelledby="fit-calculator-tab"
                    className="space-y-6"
                  >
                    <form onSubmit={handleCalculateFit} className="space-y-4">
                      <div>
                        <label
                          htmlFor="measurement-input"
                          className="block text-sm font-medium text-zinc-700 mb-1"
                        >
                          {getMeasurementLabel()}
                        </label>
                        <div className="flex gap-3">
                          <input
                            id="measurement-input"
                            type="number"
                            step="any"
                            value={measurement}
                            onChange={(e) => setMeasurement(e.target.value)}
                            placeholder={getMeasurementPlaceholder()}
                            className={`block w-full rounded-md px-3 py-2 text-sm text-zinc-900 bg-white placeholder:text-zinc-400 ${FIELD_BOUNDARY}`}
                          />
                          <button
                            type="submit"
                            className={`shrink-0 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors ${ACTION_BOUNDARY} ${ACTION_FOCUS}`}
                          >
                            Find My Size
                          </button>
                        </div>
                      </div>
                    </form>

                    {/* Live Announcement & Recommendation Card */}
                    <div
                      data-testid="size-recommendation-live"
                      aria-live="polite"
                      className="min-h-[80px]"
                    >
                      {recommendation && (
                        <div className="rounded-xl bg-indigo-50/80 border border-indigo-200 p-4">
                          <div className="flex items-center gap-3">
                            <span className="rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white">
                              {recommendation.recommendedSize}
                            </span>
                            <span className="text-sm font-semibold text-zinc-900">
                              Recommended Fit
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-zinc-700">
                            {recommendation.advice}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
