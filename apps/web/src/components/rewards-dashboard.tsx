"use client";

import type { CustomerRewards } from "@/lib/rewards";

interface RewardsDashboardProps {
  profile: CustomerRewards;
}

export default function RewardsDashboard({ profile }: RewardsDashboardProps) {
  // Calculate tier progression percentage
  let progressPercentage = 0;
  if (profile.tier === "Trailblazer") {
    progressPercentage = Math.min(100, Math.round((profile.lifetimePoints / 500) * 100));
  } else if (profile.tier === "Pathfinder") {
    const pointsInTier = Math.max(0, profile.lifetimePoints - 500);
    progressPercentage = Math.min(100, Math.round((pointsInTier / 1000) * 100));
  } else {
    progressPercentage = 100;
  }

  const tierBadgeColors: Record<string, { bg: string; text: string; border: string }> = {
    Trailblazer: { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200" },
    Pathfinder: { bg: "bg-indigo-50", text: "text-indigo-800", border: "border-indigo-200" },
    "Summit Explorer": { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
  };

  const badgeStyle = tierBadgeColors[profile.tier] || tierBadgeColors.Trailblazer;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
              data-testid="tier-badge"
            >
              <svg
                className="w-3.5 h-3.5 mr-1.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              {profile.tier}
            </span>
            <span className="text-xs text-gray-500">Tier Status</span>
          </div>
          <p className="text-sm text-gray-600">
            Enjoy member-only gear discounts, expedited shipping perks, and seasonal bonus rewards.
          </p>
        </div>

        <div className="flex items-baseline gap-2 bg-zinc-50 px-4 py-3 rounded-lg border border-zinc-100 sm:text-right">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Current Balance
            </div>
            <div className="text-3xl font-bold text-zinc-900" data-testid="points-balance">
              {profile.pointsBalance.toLocaleString()}{" "}
              <span className="text-base font-medium text-zinc-600">pts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-zinc-50/70 p-4 rounded-lg border border-zinc-100">
          <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
            Lifetime Points Earned
          </span>
          <p className="text-xl font-semibold text-zinc-900 mt-1">
            {profile.lifetimePoints.toLocaleString()} pts
          </p>
          <p className="text-xs text-zinc-500 mt-0.5">
            Total rewards accumulated since joining
          </p>
        </div>

        <div className="bg-zinc-50/70 p-4 rounded-lg border border-zinc-100">
          <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
            Next Tier Requirement
          </span>
          <p className="text-xl font-semibold text-zinc-900 mt-1">
            {profile.nextTier
              ? `${profile.pointsToNextTier.toLocaleString()} pts to ${profile.nextTier}`
              : "Top Tier Achieved!"}
          </p>
          <p className="text-xs text-zinc-500 mt-0.5">
            {profile.nextTier
              ? `Earn ${profile.pointsToNextTier} more lifetime points to level up`
              : "You have unlocked the highest membership benefits"}
          </p>
        </div>
      </div>

      {/* Tier Progress Bar */}
      <div className="space-y-2 pt-2">
        <div className="flex justify-between text-xs font-medium text-zinc-700">
          <span>{profile.tier}</span>
          <span>
            {profile.nextTier ? `${progressPercentage}% towards ${profile.nextTier}` : "100% (Summit Explorer)"}
          </span>
        </div>
        <div className="w-full bg-zinc-200 rounded-full h-3 overflow-hidden">
          <div
            role="progressbar"
            aria-valuenow={progressPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Progress towards ${profile.nextTier || "Summit Explorer"}`}
            className="bg-indigo-600 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
