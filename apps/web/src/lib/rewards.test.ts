import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getAvailableRewardVouchers,
  getRewardsProfile,
  redeemRewardVoucher,
  saveRewardsProfile,
  resetRewardsProfile,
  calculateTier,
  REWARDS_STORAGE_KEY,
  type CustomerRewards,
} from './rewards';

describe('rewards lib', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('getAvailableRewardVouchers', () => {
    it('returns the standard catalog of vouchers', () => {
      const vouchers = getAvailableRewardVouchers();
      expect(vouchers).toHaveLength(4);

      const v10 = vouchers.find((v) => v.id === 'voucher-10');
      expect(v10).toEqual({
        id: 'voucher-10',
        title: '$10 Off Any Purchase',
        pointsCost: 200,
        discountAmount: 10,
        discountCode: 'REWARD10',
        minSpend: 50,
        description: 'Save $10 on orders over $50.',
      });

      const v25 = vouchers.find((v) => v.id === 'voucher-25');
      expect(v25).toEqual({
        id: 'voucher-25',
        title: '$25 Off Gear & Apparel',
        pointsCost: 500,
        discountAmount: 25,
        discountCode: 'REWARD25',
        minSpend: 100,
        description: 'Save $25 on orders over $100.',
      });

      const v50 = vouchers.find((v) => v.id === 'voucher-50');
      expect(v50).toEqual({
        id: 'voucher-50',
        title: '$50 Off Premium Equipment',
        pointsCost: 1000,
        discountAmount: 50,
        discountCode: 'REWARD50',
        minSpend: 150,
        description: 'Save $50 on orders over $150.',
      });

      const vShip = vouchers.find((v) => v.id === 'voucher-ship');
      expect(vShip).toEqual({
        id: 'voucher-ship',
        title: 'Free Expedited Shipping',
        pointsCost: 150,
        discountAmount: 15,
        discountCode: 'REWARDSHIP',
        description: 'Free 2-day expedited shipping on your next order.',
      });
    });
  });

  describe('calculateTier', () => {
    it('calculates Trailblazer tier for points < 500', () => {
      const result = calculateTier(300);
      expect(result.tier).toBe('Trailblazer');
      expect(result.nextTier).toBe('Pathfinder');
      expect(result.pointsToNextTier).toBe(200);
    });

    it('calculates Pathfinder tier for points between 500 and 1499', () => {
      const result = calculateTier(850);
      expect(result.tier).toBe('Pathfinder');
      expect(result.nextTier).toBe('Summit Explorer');
      expect(result.pointsToNextTier).toBe(650);
    });

    it('calculates Summit Explorer tier for points >= 1500', () => {
      const result = calculateTier(1600);
      expect(result.tier).toBe('Summit Explorer');
      expect(result.nextTier).toBeUndefined();
      expect(result.pointsToNextTier).toBe(0);
    });
  });

  describe('getRewardsProfile', () => {
    it('returns the default profile when storage is empty', () => {
      const profile = getRewardsProfile();
      expect(profile).toEqual({
        customerId: 'cust-default',
        pointsBalance: 650,
        lifetimePoints: 850,
        tier: 'Pathfinder',
        pointsToNextTier: 650,
        nextTier: 'Summit Explorer',
        activeVouchers: [],
      });
    });

    it('returns custom customer ID if supplied when storage is empty', () => {
      const profile = getRewardsProfile('cust-user-123');
      expect(profile.customerId).toBe('cust-user-123');
      expect(profile.pointsBalance).toBe(650);
    });

    it('loads stored profile from localStorage', () => {
      const customProfile: CustomerRewards = {
        customerId: 'cust-custom',
        pointsBalance: 400,
        lifetimePoints: 1200,
        tier: 'Pathfinder',
        pointsToNextTier: 300,
        nextTier: 'Summit Explorer',
        activeVouchers: ['REWARD10'],
      };
      localStorage.setItem(REWARDS_STORAGE_KEY, JSON.stringify(customProfile));

      const profile = getRewardsProfile();
      expect(profile).toEqual(customProfile);
    });
  });

  describe('redeemRewardVoucher', () => {
    it('deducts points, appends discount code, and persists profile on success', () => {
      const initialProfile = getRewardsProfile();
      expect(initialProfile.pointsBalance).toBe(650);
      expect(initialProfile.activeVouchers).toEqual([]);

      const result = redeemRewardVoucher('voucher-10');
      expect(result.success).toBe(true);
      expect(result.message).toBe('Successfully redeemed $10 Off Any Purchase!');
      expect(result.voucher?.discountCode).toBe('REWARD10');
      expect(result.updatedProfile.pointsBalance).toBe(450);
      expect(result.updatedProfile.activeVouchers).toContain('REWARD10');

      // Check persistence
      const stored = getRewardsProfile();
      expect(stored.pointsBalance).toBe(450);
      expect(stored.activeVouchers).toContain('REWARD10');
    });

    it('rejects redemption when points balance is insufficient', () => {
      // voucher-50 costs 1000 pts, profile starts with 650 pts
      const result = redeemRewardVoucher('voucher-50');
      expect(result.success).toBe(false);
      expect(result.message).toBe('Insufficient points balance.');
      expect(result.updatedProfile.pointsBalance).toBe(650);
      expect(result.updatedProfile.activeVouchers).toEqual([]);
    });

    it('returns error when voucher ID is invalid', () => {
      const result = redeemRewardVoucher('voucher-invalid');
      expect(result.success).toBe(false);
      expect(result.message).toBe('Reward voucher not found.');
      expect(result.updatedProfile.pointsBalance).toBe(650);
    });

    it('does not duplicate active voucher code if already redeemed', () => {
      redeemRewardVoucher('voucher-ship'); // 150 pts -> 500 pts remaining
      const second = redeemRewardVoucher('voucher-ship'); // 150 pts -> 350 pts remaining
      expect(second.success).toBe(true);
      expect(second.updatedProfile.pointsBalance).toBe(350);
      expect(second.updatedProfile.activeVouchers.filter((c) => c === 'REWARDSHIP')).toHaveLength(1);
    });
  });

  describe('resetRewardsProfile and saveRewardsProfile', () => {
    it('saves and resets profile correctly', () => {
      const testProfile: CustomerRewards = {
        customerId: 'cust-reset',
        pointsBalance: 100,
        lifetimePoints: 200,
        tier: 'Trailblazer',
        pointsToNextTier: 300,
        nextTier: 'Pathfinder',
        activeVouchers: ['TEST'],
      };
      saveRewardsProfile(testProfile);
      expect(getRewardsProfile().customerId).toBe('cust-reset');

      resetRewardsProfile();
      expect(getRewardsProfile().customerId).toBe('cust-default');
      expect(getRewardsProfile().pointsBalance).toBe(650);
    });
  });
});
