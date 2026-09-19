import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ReportsPage from './page';
import { resetFieldReports } from '@/lib/field-reports-data';

vi.mock('@/components/header', () => ({
  __esModule: true,
  default: () => <div data-testid="header" />,
}));

describe('ReportsPage', () => {
  beforeEach(() => {
    resetFieldReports();
  });

  it('renders header, required h1, and valid heading hierarchy', () => {
    render(<ReportsPage />);

    expect(screen.getByTestId('header')).toBeDefined();

    // Required h1 directly declared on page
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Community Trail Reports & Live Field Conditions');

    // Strict heading hierarchy: h2 for main sections
    const h2Elements = screen.getAllByRole('heading', { level: 2 });
    const h2Texts = h2Elements.map((h) => h.textContent?.trim());
    expect(h2Texts).toContain('Active Hazard Alerts');
    expect(h2Texts).toContain('Recent Field Reports');
    expect(h2Texts).toContain('Submit Field Report');

    // Cards/modules must be h3
    const h3Elements = screen.getAllByRole('heading', { level: 3 });
    expect(h3Elements.length).toBeGreaterThanOrEqual(5);
  });

  it('renders active hazard alerts with severity badges and safety advisories', () => {
    render(<ReportsPage />);

    expect(screen.getByText(/The Enchantments Core/i)).toBeDefined();
    expect(screen.getAllByText(/Snow Bridge Collapse/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Severe').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Avoid crossing weakened snow bridges/i)).toBeDefined();

    expect(screen.getAllByText(/Angel's Landing/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Warning')).toBeDefined();
    expect(screen.getByText(/Do not hike the chain section/i)).toBeDefined();

    expect(screen.getByText(/Mount Rainier Paradise/i)).toBeDefined();
    expect(screen.getByText('Caution')).toBeDefined();
    expect(screen.getByText(/Carry beacon, probe, and shovel/i)).toBeDefined();
  });

  it('renders search input with role="searchbox" and screen reader status region', () => {
    render(<ReportsPage />);

    const searchInput = screen.getByRole('searchbox', { name: /search reports/i });
    expect(searchInput).toBeDefined();

    const statusRegion = screen.getByRole('status');
    expect(statusRegion).toBeDefined();
    expect(statusRegion.getAttribute('aria-live')).toBe('polite');
  });

  it('filters reports when searching for a trail keyword', () => {
    render(<ReportsPage />);

    expect(screen.getByText('Mount Si')).toBeDefined();
    expect(screen.getByText('Lake 22')).toBeDefined();

    const searchInput = screen.getByRole('searchbox', { name: /search reports/i });
    fireEvent.change(searchInput, { target: { value: 'Mount Si' } });

    expect(screen.getByText('Mount Si')).toBeDefined();
    expect(screen.queryByText('Lake 22')).toBeNull();
  });

  it('filters reports using condition filter buttons', () => {
    render(<ReportsPage />);

    const snowBtn = screen.getByRole('button', { name: /^snow & ice$/i });
    fireEvent.click(snowBtn);

    expect(screen.getByText('Skyline Trail (Mount Rainier)')).toBeDefined();
    expect(screen.queryByText('Mount Si')).toBeNull();

    const hazardsBtn = screen.getByRole('button', { name: /^hazards only$/i });
    fireEvent.click(hazardsBtn);

    expect(screen.getByText('Enchantments Core Zone')).toBeDefined();
    expect(screen.queryByText('Lake 22')).toBeNull();

    const allBtn = screen.getByRole('button', { name: /^all$/i });
    fireEvent.click(allBtn);

    expect(screen.getByText('Mount Si')).toBeDefined();
    expect(screen.getByText('Lake 22')).toBeDefined();
  });

  it('displays report cards with details (snow depth, bug rating, parking status, notes)', () => {
    render(<ReportsPage />);

    // Check Mount Si and other card details
    expect(screen.getAllByText('0" snow').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/cascade_hiker/i)).toBeDefined();
    expect(screen.getAllByText(/Full by 8:00 AM/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Clear tread all the way/i)).toBeDefined();
  });

  it('submits a new field report, shows reference confirmation banner, and updates the feed', () => {
    render(<ReportsPage />);

    const trailNameInput = screen.getByLabelText(/trail name/i);
    const hikeDateInput = screen.getByLabelText(/hike date/i);
    const reporterInput = screen.getByLabelText(/reporter username/i);
    const conditionSelect = screen.getByLabelText(/trail condition/i);
    const snowDepthInput = screen.getByLabelText(/snow depth/i);
    const parkingSelect = screen.getByLabelText(/parking status/i);
    const bugRatingSelect = screen.getByLabelText(/bug rating/i);
    const notesInput = screen.getByLabelText(/trip notes/i);
    const submitBtn = screen.getByRole('button', { name: /submit report/i });

    fireEvent.change(trailNameInput, { target: { value: 'Twin Falls Trail' } });
    fireEvent.change(hikeDateInput, { target: { value: '2026-09-18' } });
    fireEvent.change(reporterInput, { target: { value: 'waterfall_lover' } });
    fireEvent.change(conditionSelect, { target: { value: 'Muddy / Wet' } });
    fireEvent.change(snowDepthInput, { target: { value: '0' } });
    fireEvent.change(parkingSelect, { target: { value: 'Ample Parking' } });
    fireEvent.change(bugRatingSelect, { target: { value: 'Low' } });
    fireEvent.change(notesInput, { target: { value: 'River running high, beautiful roaring waterfall!' } });

    fireEvent.click(submitBtn);

    // Confirmation banner with reference #TRP-
    const confirmation = screen.getByRole('alert');
    expect(confirmation).toBeDefined();
    expect(confirmation.textContent).toMatch(/#TRP-[A-Z0-9]+/);

    // New report card appears in the feed
    expect(screen.getByText('Twin Falls Trail')).toBeDefined();
    expect(screen.getByText(/waterfall_lover/i)).toBeDefined();
    expect(screen.getByText(/River running high, beautiful roaring waterfall!/i)).toBeDefined();
  });
});
