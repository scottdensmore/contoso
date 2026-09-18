"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Header from "@/components/header";
import RewardsDashboard from "@/components/rewards-dashboard";
import RewardsRedemption from "@/components/rewards-redemption";
import TierBenefitsTable from "@/components/tier-benefits-table";
import { getRewardsProfile, type CustomerRewards } from "@/lib/rewards";
import { ACTION_BOUNDARY } from "@/lib/control-classes";

export default function RewardsPage() {
  const { data: session, status } = useSession();
  const userKey = session?.user?.email || session?.user?.name || "cust-default";
  const [activeUserKey, setActiveUserKey] = useState(userKey);
  const [profile, setProfile] = useState<CustomerRewards>(() => getRewardsProfile(userKey));

  if (status === "authenticated" && activeUserKey !== userKey) {
    setActiveUserKey(userKey);
    setProfile(getRewardsProfile(userKey));
  }

  if (status === "loading") {
    return (
      <div role="status" className="flex justify-center items-center h-screen">
        <p>Loading rewards...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <>
        <Header />
        <div className="flex flex-col items-center justify-center gap-4 px-4 py-24 text-center">
          <h1 className="text-4xl font-semibold text-zinc-800">
            Sign in to view your rewards
          </h1>
          <p className="max-w-prose text-lg text-zinc-600">
            Loyalty rewards and member perks are only visible while you are signed in.
          </p>
          <Link
            href="/login"
            className={`rounded-md bg-zinc-800 px-6 py-2 text-lg text-zinc-100 hover:bg-zinc-700 focus-visible:outline-indigo-600 ${ACTION_BOUNDARY}`}
          >
            Sign in to continue
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-10">
        <div>
          <div className="mb-4">
            <Link
              href="/profile"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 inline-flex items-center gap-1"
            >
              &larr; Back to Profile
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Loyalty Rewards & Member Perks
          </h1>
          <p className="mt-2 text-base text-gray-600">
            Track your points, unlock exclusive membership perks, and redeem vouchers for your next outdoor adventure.
          </p>
        </div>

        <section aria-labelledby="heading-member-status" className="space-y-4">
          <h2 id="heading-member-status" className="text-xl font-bold text-gray-900">
            Member Status & Points Balance
          </h2>
          <RewardsDashboard profile={profile} />
        </section>

        <section aria-labelledby="heading-redeem-rewards" className="space-y-4">
          <h2 id="heading-redeem-rewards" className="text-xl font-bold text-gray-900">
            Redeem Rewards & Promo Vouchers
          </h2>
          <RewardsRedemption profile={profile} onProfileUpdate={setProfile} />
        </section>

        <section aria-labelledby="heading-tier-benefits" className="space-y-4">
          <h2 id="heading-tier-benefits" className="text-xl font-bold text-gray-900">
            Member Tier Benefits
          </h2>
          <TierBenefitsTable currentTier={profile.tier} />
        </section>
      </div>
    </>
  );
}
