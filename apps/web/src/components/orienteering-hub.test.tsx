import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import OrienteeringHub from './orienteering-hub';

describe('OrienteeringHub', () => {
  it('renders all main sections with h2 headings and no skipped heading levels', () => {
    render(<OrienteeringHub />);

    const h2s = screen.getAllByRole('heading', { level: 2 });
    const headings = h2s.map((h) => h.textContent);

    expect(headings.some((h) => /courses|terrain/i.test(h || ''))).toBe(true);
    expect(headings.some((h) => /calculator|pace/i.test(h || ''))).toBe(true);
    expect(headings.some((h) => /checklist|kit/i.test(h || ''))).toBe(true);
  });

  it('renders course cards with h3 headings and key orienteering metrics', () => {
    render(<OrienteeringHub />);

    const grid = screen.getByTestId('orienteering-courses-grid');
    const h3s = within(grid).getAllByRole('heading', { level: 3 });
    const titles = h3s.map((h) => h.textContent);

    expect(titles.some((t) => t?.includes('Harriman Silvermine'))).toBe(true);
    expect(titles.some((t) => t?.includes("Devil's Lake Quartzite"))).toBe(true);
    expect(titles.some((t) => t?.includes('Mount Rainier Paradise'))).toBe(true);
    expect(titles.some((t) => t?.includes('Linville Gorge Wilderness'))).toBe(true);
    expect(titles.some((t) => t?.includes('Chautauqua Open Mesa'))).toBe(true);

    // Verify distance, control points, off-trail percentage, declination
    expect(within(grid).getByText(/6.8 km/)).toBeDefined();
    expect(within(grid).getByText(/12 controls/)).toBeDefined();
    expect(within(grid).getByText(/45% Off-Trail/)).toBeDefined();
    expect(within(grid).getByText(/-12.5°/)).toBeDefined();
    expect(within(grid).getByText(/64 paces\/100m/)).toBeDefined();
  });

  it('filters courses when difficulty filter buttons are clicked', () => {
    render(<OrienteeringHub />);

    const grid = screen.getByTestId('orienteering-courses-grid');

    // Filter Beginner
    const beginnerBtn = screen.getByRole('button', { name: /beginner/i });
    fireEvent.click(beginnerBtn);

    expect(within(grid).getByText(/Chautauqua Open Mesa/i)).toBeDefined();
    expect(within(grid).queryByText(/Harriman Silvermine/i)).toBeNull();
    expect(within(grid).queryByText(/Mount Rainier Paradise/i)).toBeNull();

    // Filter Expert
    const expertBtn = screen.getByRole('button', { name: /expert/i });
    fireEvent.click(expertBtn);

    expect(within(grid).getByText(/Mount Rainier Paradise/i)).toBeDefined();
    expect(within(grid).getByText(/Linville Gorge/i)).toBeDefined();
    expect(within(grid).queryByText(/Chautauqua Open Mesa/i)).toBeNull();
    expect(within(grid).queryByText(/Harriman Silvermine/i)).toBeNull();

    // Reset to All Courses
    const allBtn = screen.getByRole('button', { name: /all courses/i });
    fireEvent.click(allBtn);

    expect(within(grid).getByText(/Harriman Silvermine/i)).toBeDefined();
    expect(within(grid).getByText(/Chautauqua Open Mesa/i)).toBeDefined();
  });

  it('updates live calculator reactive results panel with status role and aria-live', () => {
    render(<OrienteeringHub />);

    const resultPanel = screen.getByTestId('orienteering-calculator-result');
    expect(resultPanel.getAttribute('role')).toBe('status');
    expect(resultPanel.getAttribute('aria-live')).toBe('polite');

    const courseSelect = screen.getByLabelText(/select.*course/i);
    const distanceInput = screen.getByLabelText(/leg distance/i);
    const bearingInput = screen.getByLabelText(/map bearing/i);
    const terrainSelect = screen.getByLabelText(/terrain type/i);
    const visibilitySelect = screen.getByLabelText(/visibility condition/i);

    // Initial default: Harriman Silvermine (-12.5°), 350m, 45°, open_forest, clear
    // 45 - (-12.5) = 57.5°
    expect(within(resultPanel).getByText(/57.5°/)).toBeDefined();
    expect(within(resultPanel).getByText(/225°/)).toBeDefined(); // back bearing
    expect(within(resultPanel).getByText(/49°/)).toBeDefined(); // aim off
    expect(within(resultPanel).getByText(/245/)).toBeDefined(); // total double paces
    expect(within(resultPanel).getByText(/70 paces\/100m/)).toBeDefined();

    // Change course to Rainier (+14.8°), distance 500m, bearing 10°, snowfield, night_whiteout
    fireEvent.change(courseSelect, { target: { value: 'rainier-paradise-glacier-traverse' } });
    fireEvent.change(distanceInput, { target: { value: '500' } });
    fireEvent.change(bearingInput, { target: { value: '10' } });
    fireEvent.change(terrainSelect, { target: { value: 'snowfield' } });
    fireEvent.change(visibilitySelect, { target: { value: 'night_whiteout' } });

    // 10 - 14.8 = 355.2°
    expect(within(resultPanel).getByText(/355.2°/)).toBeDefined();
    expect(within(resultPanel).getByText(/190°/)).toBeDefined(); // back bearing
    expect(within(resultPanel).getByText(/14°/)).toBeDefined(); // aim off
    expect(within(resultPanel).getByText(/460/)).toBeDefined(); // total double paces
    expect(within(resultPanel).getByText(/92 paces\/100m/)).toBeDefined();
    expect(within(resultPanel).getByText(/Leap-frog pacing/i)).toBeDefined();
    expect(within(resultPanel).getByText(/Extreme disorientation hazard/i)).toBeDefined();
  });

  it('selects course for calculation when clicking card action button', () => {
    render(<OrienteeringHub />);

    const grid = screen.getByTestId('orienteering-courses-grid');
    const linvilleHeading = within(grid).getByRole('heading', {
      name: /Linville Gorge Wilderness/i,
    });
    const linvilleCard = linvilleHeading.closest('article')!;
    const selectBtn = within(linvilleCard).getByRole('button', {
      name: /select for leg calculation/i,
    });
    fireEvent.click(selectBtn);

    const resultPanel = screen.getByTestId('orienteering-calculator-result');
    expect(within(resultPanel).getByText(/Linville Gorge/i)).toBeDefined();
  });

  it('tracks checked items and updates the gear counter', () => {
    render(<OrienteeringHub />);

    const counter = screen.getByTestId('orienteering-gear-counter');
    expect(counter.textContent).toBe('0 of 6 packed');

    const compassCheckbox = screen.getByLabelText(/adjustable declination mirrored sighting compass/i);
    expect(compassCheckbox).not.toBeChecked();

    fireEvent.click(compassCheckbox);
    expect(compassCheckbox).toBeChecked();
    expect(counter.textContent).toBe('1 of 6 packed');

    const mapCheckbox = screen.getByLabelText(/waterproof 1:24,000 usgs topographic map/i);
    fireEvent.click(mapCheckbox);
    expect(counter.textContent).toBe('2 of 6 packed');

    fireEvent.click(compassCheckbox);
    expect(counter.textContent).toBe('1 of 6 packed');
  });
});
