import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import ZiplineHub from './zipline-hub';

describe('ZiplineHub Component', () => {
  it('renders all main sections with h2 headings', () => {
    render(<ZiplineHub />);

    const h2s = screen.getAllByRole('heading', { level: 2 });
    const headings = h2s.map((h) => h.textContent);

    expect(headings.some((h) => /courses|zipline/i.test(h || ''))).toBe(true);
    expect(headings.some((h) => /calculator|dynamics|deceleration/i.test(h || ''))).toBe(true);
    expect(headings.some((h) => /checklist|safety kit|gear/i.test(h || ''))).toBe(true);
  });

  it('renders course cards with h3 headings and key metrics', () => {
    render(<ZiplineHub />);

    const grid = screen.getByTestId('zipline-courses-grid');
    const h3s = within(grid).getAllByRole('heading', { level: 3 });
    const titles = h3s.map((h) => h.textContent);

    expect(titles.some((t) => t?.includes('Royal Gorge'))).toBe(true);
    expect(titles.some((t) => t?.includes('Snake River'))).toBe(true);
    expect(titles.some((t) => t?.includes('Haleakala'))).toBe(true);
    expect(titles.some((t) => t?.includes('Red River Gorge'))).toBe(true);
    expect(titles.some((t) => t?.includes('New River Gorge'))).toBe(true);

    // Verify metrics in cards
    expect(within(grid).getByText(/2,400\s*ft|2400\s*ft/i)).toBeDefined();
    expect(within(grid).getByText(/360\s*ft/i)).toBeDefined();
    expect(within(grid).getByText(/55\s*mph/i)).toBeDefined();
  });

  it('filters courses when course type filter buttons are clicked', () => {
    render(<ZiplineHub />);

    const grid = screen.getByTestId('zipline-courses-grid');

    // Filter by Extreme Gravity Zipline
    const extremeBtn = screen.getByRole('button', { name: /extreme gravity zipline/i });
    fireEvent.click(extremeBtn);

    expect(within(grid).getByRole('heading', { level: 3, name: /Royal Gorge/i })).toBeDefined();
    expect(within(grid).queryByRole('heading', { level: 3, name: /Haleakala/i })).toBeNull();
    expect(within(grid).queryByRole('heading', { level: 3, name: /Snake River/i })).toBeNull();

    // Filter by Canopy Tour
    const canopyBtn = screen.getByRole('button', { name: /canopy tour/i });
    fireEvent.click(canopyBtn);

    expect(within(grid).getByRole('heading', { level: 3, name: /Haleakala/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /Red River Gorge/i })).toBeDefined();
    expect(within(grid).queryByRole('heading', { level: 3, name: /Royal Gorge/i })).toBeNull();

    // Reset filter to All Courses
    const allBtn = screen.getByRole('button', { name: /all courses/i });
    fireEvent.click(allBtn);

    expect(within(grid).getByRole('heading', { level: 3, name: /Royal Gorge/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /Snake River/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /Haleakala/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /Red River Gorge/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /New River Gorge/i })).toBeDefined();
  });

  it('quick select button loads course into calculator', () => {
    render(<ZiplineHub />);

    const resultPanel = screen.getByTestId('zipline-calculator-result');
    const snakeRiverQuickBtn = screen.getByTestId('select-course-snake-river-canyon-highline');
    fireEvent.click(snakeRiverQuickBtn);

    expect(within(resultPanel).getByRole('heading', { level: 3, name: /Snake River Canyon Highline/i })).toBeDefined();
  });

  it('updates live calculator reactive results panel with role="status" and aria-live="polite"', () => {
    render(<ZiplineHub />);

    const resultPanel = screen.getByTestId('zipline-calculator-result');
    expect(resultPanel.getAttribute('role')).toBe('status');
    expect(resultPanel.getAttribute('aria-live')).toBe('polite');

    const courseSelect = screen.getByLabelText(/select.*course/i);
    const payloadInput = screen.getByLabelText(/rider payload/i);
    const lineLengthInput = screen.getByLabelText(/line length/i);
    const slopeInput = screen.getByLabelText(/slope grade/i);
    const bearingSelect = screen.getByLabelText(/trolley bearing/i);

    // Select Royal Gorge
    fireEvent.change(courseSelect, { target: { value: 'royal-gorge-canyon-extreme' } });
    fireEvent.change(payloadInput, { target: { value: '175' } });
    fireEvent.change(lineLengthInput, { target: { value: '2400' } });
    fireEvent.change(slopeInput, { target: { value: '15' } });
    fireEvent.change(bearingSelect, { target: { value: 'dual_steel_high_speed' } });

    expect(within(resultPanel).getAllByText(/40\s*mph/i).length).toBeGreaterThan(0);
    expect(within(resultPanel).getAllByText(/64\s*ft/i).length).toBeGreaterThan(0);
    expect(within(resultPanel).getAllByText(/23\.4\s*kN/i).length).toBeGreaterThan(0);
    expect(within(resultPanel).getAllByText(/optimal descent dynamics/i).length).toBeGreaterThan(0);

    // Set excessive slope
    fireEvent.change(slopeInput, { target: { value: '24' } });
    fireEvent.change(payloadInput, { target: { value: '250' } });

    expect(within(resultPanel).getAllByText(/excessive velocity hazard/i).length).toBeGreaterThan(0);
  });

  it('toggles checklist items and updates live zipline-gear-counter', () => {
    render(<ZiplineHub />);

    const counter = screen.getByTestId('zipline-gear-counter');
    expect(counter.textContent).toMatch(/0 of 6 packed/i);

    const harnessCheckbox = screen.getByLabelText(/full-body canyon aerial suspension harness/i);
    fireEvent.click(harnessCheckbox);
    expect(counter.textContent).toMatch(/1 of 6 packed/i);

    const helmetCheckbox = screen.getByLabelText(/impact-resistant ce en 12492/i);
    fireEvent.click(helmetCheckbox);
    expect(counter.textContent).toMatch(/2 of 6 packed/i);

    fireEvent.click(harnessCheckbox);
    expect(counter.textContent).toMatch(/1 of 6 packed/i);
  });

  it('has accessible form control labels and distinct htmlFor pairings', () => {
    render(<ZiplineHub />);

    expect(screen.getByLabelText(/select.*course/i)).toBeDefined();
    expect(screen.getByLabelText(/rider payload/i)).toBeDefined();
    expect(screen.getByLabelText(/line length/i)).toBeDefined();
    expect(screen.getByLabelText(/slope grade/i)).toBeDefined();
    expect(screen.getByLabelText(/trolley bearing/i)).toBeDefined();

    const gearItem = screen.getByLabelText(/full-body canyon aerial suspension harness/i);
    expect(gearItem.getAttribute('id')).toMatch(/^zipline-gear-/);
  });
});
