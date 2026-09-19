import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PermitsPage from './page';

vi.mock('@/components/header', () => ({
  __esModule: true,
  default: () => <div data-testid="header" />,
}));

vi.mock('@/components/block', () => ({
  __esModule: true,
  default: ({
    children,
    innerClassName,
  }: {
    children: React.ReactNode;
    innerClassName?: string;
  }) => (
    <div data-testid="block" className={innerClassName}>
      {children}
    </div>
  ),
}));

describe('PermitsPage', () => {
  it('renders the permits page with required h1 and structured h2 headings', () => {
    render(<PermitsPage />);

    expect(screen.getByTestId('header')).toBeDefined();

    // Required h1 directly declared on page
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Wilderness Permits & National Parks Passes');

    // Required section h2s
    const h2Elements = screen.getAllByRole('heading', { level: 2 });
    const h2Texts = h2Elements.map((h) => h.textContent);
    expect(h2Texts).toContain('National Park & Federal Passes');
    expect(h2Texts).toContain('Backcountry Permit Lotteries');
    expect(h2Texts).toContain('Wilderness Regulations & Safety');
    expect(h2Texts).toContain('Backcountry Readiness Checklist');
  });

  it('filters content by category tabs', () => {
    render(<PermitsPage />);

    // Click "Passes" tab
    const passesTab = screen.getByRole('button', { name: /^passes$/i });
    fireEvent.click(passesTab);

    expect(screen.getByText('America the Beautiful Annual Pass')).toBeDefined();
    expect(screen.queryByText('The Enchantments (Core Zone)')).toBeNull();
    expect(screen.queryByText('Wilderness Regulations & Safety')).toBeNull();

    // Click "Lotteries" tab
    const lotteriesTab = screen.getByRole('button', { name: /^lotteries$/i });
    fireEvent.click(lotteriesTab);

    expect(screen.getByText('The Enchantments (Core Zone)')).toBeDefined();
    expect(screen.queryByText('America the Beautiful Annual Pass')).toBeNull();

    // Click "Regulations" tab
    const regulationsTab = screen.getByRole('button', { name: /^regulations$/i });
    fireEvent.click(regulationsTab);

    expect(screen.getByText('Bear-Resistant Food Canisters (Certified IGBC)')).toBeDefined();
    expect(screen.queryByText('The Enchantments (Core Zone)')).toBeNull();

    // Click "Trip Checklist" tab
    const checklistTab = screen.getByRole('button', { name: /trip checklist/i });
    fireEvent.click(checklistTab);

    expect(screen.getByText(/Backcountry Readiness Checklist/i)).toBeDefined();

    // Click "All" tab restores all sections
    const allTab = screen.getByRole('button', { name: /^all$/i });
    fireEvent.click(allTab);

    expect(screen.getByText('America the Beautiful Annual Pass')).toBeDefined();
    expect(screen.getByText('The Enchantments (Core Zone)')).toBeDefined();
    expect(screen.getByText('Wilderness Regulations & Safety')).toBeDefined();
  });

  it('filters lotteries and passes via search input and announces result count in aria-live region', () => {
    render(<PermitsPage />);

    const searchInput = screen.getByRole('searchbox', { name: /search/i });
    expect(searchInput).toBeDefined();

    // Search for "Whitney"
    fireEvent.change(searchInput, { target: { value: 'Whitney' } });

    expect(screen.getByText('Mount Whitney (Main Trail)')).toBeDefined();
    expect(screen.queryByText('The Enchantments (Core Zone)')).toBeNull();

    // Check live region
    const liveRegion = screen.getByTestId('search-status');
    expect(liveRegion.textContent).toMatch(/1 result/i);
  });

  it('tracks checklist item checks and updates live counter', () => {
    render(<PermitsPage />);

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThanOrEqual(5);

    // Initial counter: "0 of 5 items completed"
    expect(screen.getByText(/0 of 5 items completed/i)).toBeDefined();

    // Check first two items
    fireEvent.click(checkboxes[0]);
    expect(screen.getByText(/1 of 5 items completed/i)).toBeDefined();

    fireEvent.click(checkboxes[1]);
    expect(screen.getByText(/2 of 5 items completed/i)).toBeDefined();

    // Uncheck first item
    fireEvent.click(checkboxes[0]);
    expect(screen.getByText(/1 of 5 items completed/i)).toBeDefined();
  });

  it('displays pricing badges, recreation.gov links, and bear canister badges on lotteries', () => {
    render(<PermitsPage />);

    expect(screen.getAllByText('$80').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Free').length).toBeGreaterThanOrEqual(1);

    const bearBadges = screen.getAllByText('Bear Canister Required');
    expect(bearBadges.length).toBeGreaterThanOrEqual(3);

    const recLinks = screen.getAllByRole('link', { name: /apply on recreation\.gov/i });
    expect(recLinks.length).toBeGreaterThanOrEqual(5);
  });
});
