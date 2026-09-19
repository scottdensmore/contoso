import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TripPlannerPage from './page';

vi.mock('@/components/header', () => ({
  __esModule: true,
  default: () => <div data-testid="header" />,
}));

describe('TripPlannerPage', () => {
  it('renders header, required H1, and strictly hierarchical H2 sections', () => {
    render(<TripPlannerPage />);

    expect(screen.getByTestId('header')).toBeDefined();

    // Required H1 directly declared in page
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Wilderness Trip Planner & Packing Checklist');

    // Required H2 sections
    const h2Elements = screen.getAllByRole('heading', { level: 2 });
    const h2Texts = h2Elements.map((h) => h.textContent);
    expect(h2Texts).toContain('Trip Configuration');
    expect(h2Texts).toContain('Calculated Trip Nutrition & Hydration');
    expect(h2Texts).toContain('Customized Packing Checklist');
    expect(h2Texts).toContain('Leave No Trace & Wilderness Prep');
  });

  it('allows selecting trip presets which update configuration and metrics', () => {
    render(<TripPlannerPage />);

    // Click "Weekend Backpacking" preset
    const weekendBtn = screen.getByRole('button', { name: /weekend backpacking/i });
    fireEvent.click(weekendBtn);

    // Initial days: 3, groupSize: 2 => 18,000 kcal, 6.0 L
    expect(screen.getByText(/18,000/)).toBeDefined();
    expect(screen.getByText(/6\.0\s*L/i)).toBeDefined();

    // Click "Alpine Day Summit" preset
    const alpineBtn = screen.getByRole('button', { name: /alpine day summit/i });
    fireEvent.click(alpineBtn);

    // 1 day, 1 person, cold/alpine => 3,400 kcal, 4.5 L
    expect(screen.getAllByText(/3,400/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/4\.5\s*L/i).length).toBeGreaterThanOrEqual(1);
  });

  it('updates nutrition and hydration metrics when sliders/inputs change', () => {
    render(<TripPlannerPage />);

    const daysInput = screen.getByLabelText(/trip duration \(1-14 days\)/i);
    fireEvent.change(daysInput, { target: { value: '4' } });

    const groupInput = screen.getByLabelText(/group size \(1-10 persons\)/i);
    fireEvent.change(groupInput, { target: { value: '3' } });

    // 4 days * 3 people * 3000 kcal = 36,000 kcal
    expect(screen.getByText(/36,000/)).toBeDefined();
  });

  it('filters items by category tab', () => {
    render(<TripPlannerPage />);

    // Filter by Ten Essentials
    const essentialsTab = screen.getByRole('button', { name: /^ten essentials$/i });
    fireEvent.click(essentialsTab);

    expect(screen.getByText('Topographic Map & Magnetic Compass')).toBeDefined();
    expect(screen.queryByText('3-Season Lightweight Backpacking Tent')).toBeNull();

    // Filter by Shelter
    const shelterTab = screen.getByRole('button', { name: /^shelter$/i });
    fireEvent.click(shelterTab);

    expect(screen.getByText('3-Season Lightweight Backpacking Tent')).toBeDefined();
    expect(screen.queryByText('Topographic Map & Magnetic Compass')).toBeNull();
  });

  it('tracks live packing completion count and supports check all essentials and reset', () => {
    render(<TripPlannerPage />);

    // Initial completion is 0 items packed
    expect(screen.getByText(/0 of \d+ items packed/i)).toBeDefined();

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    expect(screen.getByText(/1 of \d+ items packed/i)).toBeDefined();

    // Check All Essentials button
    const checkAllBtn = screen.getByRole('button', { name: /check all essentials/i });
    fireEvent.click(checkAllBtn);
    expect(screen.queryByText(/0 of \d+ items packed/i)).toBeNull();

    // Reset button
    const resetBtn = screen.getByRole('button', { name: /reset checklist/i });
    fireEvent.click(resetBtn);
    expect(screen.getByText(/0 of \d+ items packed/i)).toBeDefined();
  });

  it('dynamically displays cold-weather items when climate is changed to Cold & Freezing', () => {
    render(<TripPlannerPage />);

    // Moderate climate initially does not show 4-season tent or microspikes
    expect(screen.queryByText('4-Season Mountaineering Geodesic Tent')).toBeNull();
    expect(screen.queryByText('Traction Microspikes / Crampons')).toBeNull();

    // Select "Cold & Freezing" radio button
    const coldRadio = screen.getByLabelText(/cold & freezing/i);
    fireEvent.click(coldRadio);

    // Now 4-season tent and microspikes appear
    expect(screen.getByText('4-Season Mountaineering Geodesic Tent')).toBeDefined();
    expect(screen.getByText('Traction Microspikes / Crampons')).toBeDefined();
  });

  it('renders Leave No Trace planning principles', () => {
    render(<TripPlannerPage />);

    expect(screen.getByText(/Plan Ahead and Prepare/i)).toBeDefined();
    expect(screen.getByText(/Dispose of Waste Properly/i)).toBeDefined();
  });
});
