import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RewardsRedemption from './rewards-redemption';
import type { CustomerRewards } from '@/lib/rewards';

describe('RewardsRedemption', () => {
  const mockProfile: CustomerRewards = {
    customerId: 'cust-test',
    pointsBalance: 650,
    lifetimePoints: 850,
    tier: 'Pathfinder',
    pointsToNextTier: 650,
    nextTier: 'Summit Explorer',
    activeVouchers: [],
  };

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('renders all vouchers with title, cost, and description', () => {
    render(<RewardsRedemption profile={mockProfile} />);

    expect(screen.getByText('$10 Off Any Purchase')).toBeDefined();
    expect(screen.getByText(/200 pts/i)).toBeDefined();
    expect(screen.getByText('Save $10 on orders over $50.')).toBeDefined();

    expect(screen.getByText('$25 Off Gear & Apparel')).toBeDefined();
    expect(screen.getByText(/500 pts/i)).toBeDefined();

    expect(screen.getByText('$50 Off Premium Equipment')).toBeDefined();
    expect(screen.getByText(/1,000 pts|1000 pts/i)).toBeDefined();

    expect(screen.getByText('Free Expedited Shipping')).toBeDefined();
    expect(screen.getByText(/150 pts/i)).toBeDefined();
  });

  it('disables redeem button when points balance is less than voucher cost', () => {
    const lowBalanceProfile: CustomerRewards = {
      ...mockProfile,
      pointsBalance: 250,
    };

    render(<RewardsRedemption profile={lowBalanceProfile} />);

    // 200 pts cost ($10 Off) should be enabled
    const redeem10Btn = screen.getByRole('button', { name: /redeem.*\$10/i });
    expect(redeem10Btn.hasAttribute('disabled')).toBe(false);

    // 150 pts cost (Free Shipping) should be enabled
    const redeemShipBtn = screen.getByRole('button', { name: /redeem.*shipping/i });
    expect(redeemShipBtn.hasAttribute('disabled')).toBe(false);

    // 500 pts cost ($25 Off) should be disabled
    const redeem25Btn = screen.getByRole('button', { name: /redeem.*\$25/i });
    expect(redeem25Btn.hasAttribute('disabled')).toBe(true);

    // 1000 pts cost ($50 Off) should be disabled
    const redeem50Btn = screen.getByRole('button', { name: /redeem.*\$50/i });
    expect(redeem50Btn.hasAttribute('disabled')).toBe(true);
  });

  it('handles successful redemption, reveals promo code with copy button, and announces in live region', async () => {
    const onProfileUpdate = vi.fn();
    render(<RewardsRedemption profile={mockProfile} onProfileUpdate={onProfileUpdate} />);

    // Initial check: live region is present
    const liveRegion = screen.getByRole('status');
    expect(liveRegion.getAttribute('aria-live')).toBe('polite');

    // Click redeem on $10 voucher
    const redeem10Btn = screen.getByRole('button', { name: /redeem.*\$10/i });
    fireEvent.click(redeem10Btn);

    // Live region announces success
    await waitFor(() => {
      expect(liveRegion.textContent).toMatch(/successfully redeemed.*\$10/i);
    });

    // Promo code REWARD10 is displayed
    expect(screen.getByText('REWARD10')).toBeDefined();

    // Copy Code button appears and can be clicked
    const copyButton = screen.getByRole('button', { name: /copy code/i });
    expect(copyButton).toBeDefined();

    fireEvent.click(copyButton);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('REWARD10');

    // onProfileUpdate was called with updated balance (450)
    expect(onProfileUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        pointsBalance: 450,
        activeVouchers: expect.arrayContaining(['REWARD10']),
      })
    );
  });
});
