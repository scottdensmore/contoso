import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RewardsDashboard from './rewards-dashboard';
import type { CustomerRewards } from '@/lib/rewards';

describe('RewardsDashboard', () => {
  const mockPathfinder: CustomerRewards = {
    customerId: 'cust-default',
    pointsBalance: 650,
    lifetimePoints: 850,
    tier: 'Pathfinder',
    pointsToNextTier: 650,
    nextTier: 'Summit Explorer',
    activeVouchers: [],
  };

  it('renders member tier badge, points balance, lifetime points, and next tier requirement', () => {
    render(<RewardsDashboard profile={mockPathfinder} />);

    expect(screen.getByTestId('tier-badge').textContent).toContain('Pathfinder');
    expect(screen.getByTestId('points-balance').textContent).toContain('650');
    expect(screen.getByText(/850 pts/i)).toBeDefined();
    expect(screen.getByText(/650 pts to Summit Explorer/i)).toBeDefined();
  });

  it('renders accessible progress bar with correct ARIA attributes', () => {
    render(<RewardsDashboard profile={mockPathfinder} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeDefined();
    expect(progressBar.getAttribute('aria-valuemin')).toBe('0');
    expect(progressBar.getAttribute('aria-valuemax')).toBe('100');

    // Pathfinder with 850 lifetime pts: (850 - 500) / 1000 = 35%
    expect(progressBar.getAttribute('aria-valuenow')).toBe('35');
    expect(screen.getByText(/35% towards Summit Explorer/i)).toBeDefined();
  });

  it('renders 100% progress for Summit Explorer top tier', () => {
    const summitProfile: CustomerRewards = {
      customerId: 'cust-summit',
      pointsBalance: 2000,
      lifetimePoints: 2500,
      tier: 'Summit Explorer',
      pointsToNextTier: 0,
      nextTier: undefined,
      activeVouchers: [],
    };

    render(<RewardsDashboard profile={summitProfile} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar.getAttribute('aria-valuenow')).toBe('100');
    expect(screen.getByText(/Top Tier Achieved!/i)).toBeDefined();
  });
});
