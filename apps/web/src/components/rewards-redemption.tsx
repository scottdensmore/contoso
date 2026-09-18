"use client";

import { useState } from "react";
import {
  getAvailableRewardVouchers,
  redeemRewardVoucher,
  type CustomerRewards,
  type RewardVoucher,
} from "@/lib/rewards";
import { ACTION_BOUNDARY } from "@/lib/control-classes";

interface RewardsRedemptionProps {
  profile: CustomerRewards;
  onProfileUpdate?: (profile: CustomerRewards) => void;
}

export default function RewardsRedemption({
  profile,
  onProfileUpdate,
}: RewardsRedemptionProps) {
  const vouchers = getAvailableRewardVouchers();
  const [liveAnnouncement, setLiveAnnouncement] = useState<string>("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [redeemedVoucherCodes, setRedeemedVoucherCodes] = useState<string[]>(
    profile.activeVouchers || []
  );

  const handleRedeem = (voucher: RewardVoucher) => {
    const result = redeemRewardVoucher(voucher.id, profile.customerId);
    if (result.success && result.voucher) {
      setLiveAnnouncement(result.message);
      if (!redeemedVoucherCodes.includes(result.voucher.discountCode)) {
        setRedeemedVoucherCodes((prev) => [...prev, result.voucher!.discountCode]);
      }
      if (onProfileUpdate) {
        onProfileUpdate(result.updatedProfile);
      }
    } else {
      setLiveAnnouncement(result.message);
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 3000);
      }
    } catch (err) {
      console.error("Failed to copy code to clipboard", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Live Region for Screen Reader Announcements */}
      <div
        role="status"
        aria-live="polite"
        className={
          liveAnnouncement
            ? "p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2"
            : "sr-only"
        }
      >
        {liveAnnouncement && (
          <>
            <svg
              className="w-5 h-5 text-emerald-600 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>{liveAnnouncement}</span>
          </>
        )}
      </div>

      {/* Grid of Voucher Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {vouchers.map((voucher) => {
          const canAfford = profile.pointsBalance >= voucher.pointsCost;
          const isRedeemed = redeemedVoucherCodes.includes(voucher.discountCode);

          return (
            <div
              key={voucher.id}
              className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{voucher.title}</h3>
                    <p className="text-xs text-indigo-600 font-semibold mt-0.5">
                      {voucher.pointsCost.toLocaleString()} pts
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 border border-zinc-200">
                    {voucher.id === "voucher-ship" ? "Free Ship" : `$${voucher.discountAmount} Off`}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-4">{voucher.description}</p>

                {voucher.minSpend && (
                  <div className="text-xs text-gray-500 mb-4">
                    Minimum order spend:{" "}
                    <span className="font-medium text-gray-700">${voucher.minSpend}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100 space-y-3">
                {isRedeemed && (
                  <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-3 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-xs text-emerald-800 uppercase tracking-wider font-semibold block">
                        Promo Code
                      </span>
                      <code className="text-sm font-mono font-bold text-emerald-950">
                        {voucher.discountCode}
                      </code>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(voucher.discountCode)}
                      aria-label={`Copy code ${voucher.discountCode}`}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors focus-visible:outline-indigo-600 ${ACTION_BOUNDARY}`}
                    >
                      {copiedCode === voucher.discountCode ? (
                        <>
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                          </svg>
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  disabled={!canAfford}
                  onClick={() => handleRedeem(voucher)}
                  aria-label={
                    canAfford
                      ? `Redeem ${voucher.title} for ${voucher.pointsCost} points`
                      : `Insufficient points to redeem ${voucher.title}`
                  }
                  className={`w-full inline-flex justify-center items-center px-4 py-2.5 rounded-md text-sm font-semibold transition-all ${
                    canAfford
                      ? `bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm focus-visible:outline-indigo-600 ${ACTION_BOUNDARY}`
                      : "bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200"
                  }`}
                >
                  {canAfford ? "Redeem Voucher" : "Insufficient Points"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
