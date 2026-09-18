export type MemberTier = 'Trailblazer' | 'Pathfinder' | 'Summit Explorer';

export interface RewardVoucher {
  id: string;
  title: string;
  pointsCost: number;
  discountAmount: number;
  discountCode: string;
  description: string;
  minSpend?: number;
}

export interface CustomerRewards {
  customerId: string;
  pointsBalance: number;
  lifetimePoints: number;
  tier: MemberTier;
  pointsToNextTier: number;
  nextTier?: MemberTier;
  activeVouchers: string[];
}

export interface TierBenefit {
  tier: MemberTier;
  pointsRange: string;
  multiplier: string;
  shipping: string;
  gearAccess: string;
  annualBonus: string;
}

export const REWARDS_STORAGE_KEY = 'contoso_rewards_profile';

export const REWARD_VOUCHERS: RewardVoucher[] = [
  {
    id: 'voucher-10',
    title: '$10 Off Any Purchase',
    pointsCost: 200,
    discountAmount: 10,
    discountCode: 'REWARD10',
    minSpend: 50,
    description: 'Save $10 on orders over $50.',
  },
  {
    id: 'voucher-25',
    title: '$25 Off Gear & Apparel',
    pointsCost: 500,
    discountAmount: 25,
    discountCode: 'REWARD25',
    minSpend: 100,
    description: 'Save $25 on orders over $100.',
  },
  {
    id: 'voucher-50',
    title: '$50 Off Premium Equipment',
    pointsCost: 1000,
    discountAmount: 50,
    discountCode: 'REWARD50',
    minSpend: 150,
    description: 'Save $50 on orders over $150.',
  },
  {
    id: 'voucher-ship',
    title: 'Free Expedited Shipping',
    pointsCost: 150,
    discountAmount: 15,
    discountCode: 'REWARDSHIP',
    description: 'Free 2-day expedited shipping on your next order.',
  },
];

export const TIER_BENEFITS: TierBenefit[] = [
  {
    tier: 'Trailblazer',
    pointsRange: '0 - 499 pts',
    multiplier: '1x Points',
    shipping: 'Standard Rates ($0 min spend)',
    gearAccess: 'Standard Access',
    annualBonus: 'Member Welcome Gift',
  },
  {
    tier: 'Pathfinder',
    pointsRange: '500 - 1,499 pts',
    multiplier: '1.25x Points',
    shipping: 'Free Standard Shipping',
    gearAccess: 'Early Gear Access',
    annualBonus: 'Exclusive Seasonal Offers',
  },
  {
    tier: 'Summit Explorer',
    pointsRange: '1,500+ pts',
    multiplier: '1.5x Points',
    shipping: 'Free Expedited Shipping',
    gearAccess: 'VIP Gear Access',
    annualBonus: 'Free Annual Tune-up & Inspection',
  },
];

export function calculateTier(lifetimePoints: number): {
  tier: MemberTier;
  pointsToNextTier: number;
  nextTier?: MemberTier;
} {
  if (lifetimePoints < 500) {
    return {
      tier: 'Trailblazer',
      pointsToNextTier: 500 - lifetimePoints,
      nextTier: 'Pathfinder',
    };
  }

  if (lifetimePoints < 1500) {
    return {
      tier: 'Pathfinder',
      pointsToNextTier: 1500 - lifetimePoints,
      nextTier: 'Summit Explorer',
    };
  }

  return {
    tier: 'Summit Explorer',
    pointsToNextTier: 0,
    nextTier: undefined,
  };
}

export function getDefaultRewardsProfile(customerId: string = 'cust-default'): CustomerRewards {
  const lifetimePoints = 850;
  const tierInfo = calculateTier(lifetimePoints);

  return {
    customerId,
    pointsBalance: 650,
    lifetimePoints,
    tier: tierInfo.tier,
    pointsToNextTier: tierInfo.pointsToNextTier,
    nextTier: tierInfo.nextTier,
    activeVouchers: [],
  };
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function getRewardsProfile(customerId?: string): CustomerRewards {
  const effectiveId = customerId || 'cust-default';

  if (!isBrowser()) {
    return getDefaultRewardsProfile(effectiveId);
  }

  try {
    const raw = window.localStorage.getItem(REWARDS_STORAGE_KEY);
    if (!raw) {
      return getDefaultRewardsProfile(effectiveId);
    }

    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && typeof parsed.pointsBalance === 'number') {
      return parsed as CustomerRewards;
    }
  } catch {
    // If corrupted or inaccessible, return default
  }

  return getDefaultRewardsProfile(effectiveId);
}

export function saveRewardsProfile(profile: CustomerRewards): void {
  if (!isBrowser()) return;

  try {
    window.localStorage.setItem(REWARDS_STORAGE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save rewards profile to localStorage', err);
  }
}

export function resetRewardsProfile(customerId: string = 'cust-default'): CustomerRewards {
  const fresh = getDefaultRewardsProfile(customerId);
  saveRewardsProfile(fresh);
  return fresh;
}

export function getAvailableRewardVouchers(): RewardVoucher[] {
  return [...REWARD_VOUCHERS];
}

export function redeemRewardVoucher(
  voucherId: string,
  customerId?: string
): {
  success: boolean;
  message: string;
  voucher?: RewardVoucher;
  updatedProfile: CustomerRewards;
} {
  const currentProfile = getRewardsProfile(customerId);
  const voucher = REWARD_VOUCHERS.find((v) => v.id === voucherId);

  if (!voucher) {
    return {
      success: false,
      message: 'Reward voucher not found.',
      updatedProfile: currentProfile,
    };
  }

  if (currentProfile.pointsBalance < voucher.pointsCost) {
    return {
      success: false,
      message: 'Insufficient points balance.',
      updatedProfile: currentProfile,
    };
  }

  const updatedVouchers = currentProfile.activeVouchers.includes(voucher.discountCode)
    ? currentProfile.activeVouchers
    : [...currentProfile.activeVouchers, voucher.discountCode];

  const updatedProfile: CustomerRewards = {
    ...currentProfile,
    pointsBalance: currentProfile.pointsBalance - voucher.pointsCost,
    activeVouchers: updatedVouchers,
  };

  saveRewardsProfile(updatedProfile);

  return {
    success: true,
    message: `Successfully redeemed ${voucher.title}!`,
    voucher,
    updatedProfile,
  };
}
