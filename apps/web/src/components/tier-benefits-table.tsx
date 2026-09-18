"use client";

import { TIER_BENEFITS, type MemberTier } from "@/lib/rewards";

interface TierBenefitsTableProps {
  currentTier?: MemberTier;
}

export default function TierBenefitsTable({ currentTier }: TierBenefitsTableProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th scope="col" className="px-6 py-4 font-semibold text-zinc-900">
                Tier Benefit
              </th>
              {TIER_BENEFITS.map((b) => {
                const isCurrent = currentTier === b.tier;
                return (
                  <th
                    key={b.tier}
                    scope="col"
                    className={`px-6 py-4 font-semibold text-zinc-900 ${
                      isCurrent ? "bg-indigo-50/70 border-b-2 border-indigo-600" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{b.tier}</span>
                      {isCurrent && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-600 text-white">
                          Current
                        </span>
                      )}
                    </div>
                    <span className="block text-xs font-normal text-zinc-500 mt-0.5">
                      {b.pointsRange}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            <tr>
              <th scope="row" className="px-6 py-4 font-medium text-zinc-900 bg-zinc-50/50">
                Points Multiplier
              </th>
              {TIER_BENEFITS.map((b) => (
                <td
                  key={b.tier}
                  className={`px-6 py-4 text-zinc-700 font-semibold ${
                    currentTier === b.tier ? "bg-indigo-50/30" : ""
                  }`}
                >
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800">
                    {b.multiplier}
                  </span>
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row" className="px-6 py-4 font-medium text-zinc-900 bg-zinc-50/50">
                Shipping Perks
              </th>
              {TIER_BENEFITS.map((b) => (
                <td
                  key={b.tier}
                  className={`px-6 py-4 text-zinc-700 ${
                    currentTier === b.tier ? "bg-indigo-50/30" : ""
                  }`}
                >
                  {b.shipping}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row" className="px-6 py-4 font-medium text-zinc-900 bg-zinc-50/50">
                Gear Access
              </th>
              {TIER_BENEFITS.map((b) => (
                <td
                  key={b.tier}
                  className={`px-6 py-4 text-zinc-700 ${
                    currentTier === b.tier ? "bg-indigo-50/30" : ""
                  }`}
                >
                  {b.gearAccess}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row" className="px-6 py-4 font-medium text-zinc-900 bg-zinc-50/50">
                Annual Bonus Perks
              </th>
              {TIER_BENEFITS.map((b) => (
                <td
                  key={b.tier}
                  className={`px-6 py-4 text-zinc-700 ${
                    currentTier === b.tier ? "bg-indigo-50/30" : ""
                  }`}
                >
                  {b.annualBonus}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
