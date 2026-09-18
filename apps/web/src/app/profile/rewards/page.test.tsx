import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import RewardsPage from './page';
import { useSession } from 'next-auth/react';

vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('@/components/header', () => ({
  __esModule: true,
  default: () => <div data-testid="header" />,
}));

describe('RewardsPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders loading state when session is loading', () => {
    vi.mocked(useSession).mockReturnValue({ status: 'loading' } as any);
    render(<RewardsPage />);

    const statusEl = screen.getByRole('status');
    expect(statusEl).toBeDefined();
    expect(screen.getByText(/loading rewards/i)).toBeDefined();
  });

  it('renders sign in prompt when unauthenticated matching profile/orders/[id] pattern', () => {
    vi.mocked(useSession).mockReturnValue({ status: 'unauthenticated' } as any);
    render(<RewardsPage />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toMatch(/sign in to view your rewards/i);

    const link = screen.getByRole('link', { name: /sign in to continue/i });
    expect(link.getAttribute('href')).toBe('/login');
  });

  it('renders required h1 and structured h2 headings when authenticated', () => {
    vi.mocked(useSession).mockReturnValue({
      status: 'authenticated',
      data: { user: { name: 'John Doe', email: 'john@example.com' } },
    } as any);

    render(<RewardsPage />);

    // 1. MUST declare exact h1
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Loyalty Rewards & Member Perks');

    // 2. Structured h2 headings
    const h2Elements = screen.getAllByRole('heading', { level: 2 });
    const h2Texts = h2Elements.map((h) => h.textContent?.trim());

    expect(h2Texts).toContain('Member Status & Points Balance');
    expect(h2Texts).toContain('Redeem Rewards & Promo Vouchers');
    expect(h2Texts).toContain('Member Tier Benefits');
  });
});
