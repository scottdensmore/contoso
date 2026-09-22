import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import HighlineHub from './highline-hub';

describe('HighlineHub Component', () => {
  it('renders all main sections with h2 headings', () => {
    render(<HighlineHub />);

    const h2s = screen.getAllByRole('heading', { level: 2 });
    const headings = h2s.map((h) => h.textContent);

    expect(headings.some((h) => /spans|highline/i.test(h || ''))).toBe(true);
    expect(headings.some((h) => /sag & tension|calculator/i.test(h || ''))).toBe(true);
    expect(headings.some((h) => /rigging kit|checklist/i.test(h || ''))).toBe(true);
  });

  it('renders span cards with h3 headings and key highline metrics', () => {
    render(<HighlineHub />);

    const grid = screen.getByTestId('highline-spans-grid');
    const h3s = within(grid).getAllByRole('heading', { level: 3 });
    const titles = h3s.map((h) => h.textContent);

    expect(titles.some((t) => t?.includes('Taft Point'))).toBe(true);
    expect(titles.some((t) => t?.includes('Moab Fruit Bowl'))).toBe(true);
    expect(titles.some((t) => t?.includes('Monkey Face'))).toBe(true);
    expect(titles.some((t) => t?.includes('Priest-to-Rectory'))).toBe(true);
    expect(titles.some((t) => t?.includes('Lower Town Wall'))).toBe(true);

    // Verify metrics in cards
    expect(within(grid).getByText(/65\s*m/)).toBeDefined();
    expect(within(grid).getByText(/850\s*m void/i)).toBeDefined();
    expect(within(grid).getByText(/3\.5\s*kN/i)).toBeDefined();
  });

  it('filters spans when difficulty filter buttons are clicked', () => {
    render(<HighlineHub />);

    const grid = screen.getByTestId('highline-spans-grid');

    // Filter by Beginner
    const beginnerBtn = screen.getByRole('button', { name: /beginner/i });
    fireEvent.click(beginnerBtn);

    expect(within(grid).getByRole('heading', { level: 3, name: /Lower Town Wall/i })).toBeDefined();
    expect(within(grid).queryByRole('heading', { level: 3, name: /Taft Point/i })).toBeNull();
    expect(within(grid).queryByRole('heading', { level: 3, name: /Moab Fruit Bowl/i })).toBeNull();

    // Filter by Expert
    const expertBtn = screen.getByRole('button', { name: /expert/i });
    fireEvent.click(expertBtn);

    expect(within(grid).getByRole('heading', { level: 3, name: /Moab Fruit Bowl/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /Priest-to-Rectory/i })).toBeDefined();
    expect(within(grid).queryByRole('heading', { level: 3, name: /Lower Town Wall/i })).toBeNull();
    expect(within(grid).queryByRole('heading', { level: 3, name: /Taft Point/i })).toBeNull();

    // Reset filter to All Spans
    const allBtn = screen.getByRole('button', { name: /all spans/i });
    fireEvent.click(allBtn);

    expect(within(grid).getByRole('heading', { level: 3, name: /Taft Point/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /Moab Fruit Bowl/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /Monkey Face/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /Priest-to-Rectory/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /Lower Town Wall/i })).toBeDefined();
  });

  it('updates live calculator reactive results panel with role="status" and aria-live="polite"', () => {
    render(<HighlineHub />);

    const resultPanel = screen.getByTestId('highline-calculator-result');
    expect(resultPanel.getAttribute('role')).toBe('status');
    expect(resultPanel.getAttribute('aria-live')).toBe('polite');

    const spanSelect = screen.getByLabelText(/select.*span/i);
    const weightInput = screen.getByLabelText(/walker weight/i);
    const sagInput = screen.getByLabelText(/standing sag/i);
    const dynamicFactorSelect = screen.getByLabelText(/dynamic load factor/i);
    const angleInput = screen.getByLabelText(/anchor.*angle/i);

    // Select Taft Point
    fireEvent.change(spanSelect, { target: { value: 'yosemite-taft-point-highline' } });
    expect(within(resultPanel).getByRole('heading', { level: 3, name: /Taft Point/i })).toBeDefined();

    // Adjust sag and walker weight
    fireEvent.change(sagInput, { target: { value: '6' } });
    fireEvent.change(weightInput, { target: { value: '75' } });
    fireEvent.change(dynamicFactorSelect, { target: { value: '1.2' } });
    fireEvent.change(angleInput, { target: { value: '45' } });

    expect(within(resultPanel).getAllByText(/3\.9\s*m/i).length).toBeGreaterThan(0);
    expect(within(resultPanel).getAllByText(/1\.9\s*kN/i).length).toBeGreaterThan(0);
    expect(within(resultPanel).getAllByText(/1\s*kN|1\.0\s*kN/i).length).toBeGreaterThan(0);
    expect(within(resultPanel).getAllByText(/15\.8/i).length).toBeGreaterThan(0);
    expect(within(resultPanel).getAllByText(/safe/i).length).toBeGreaterThan(0);

    // Critical anchor angle (>90°)
    fireEvent.change(angleInput, { target: { value: '100' } });
    expect(within(resultPanel).getAllByText(/critical/i).length).toBeGreaterThan(0);
    expect(within(resultPanel).getAllByText(/anchor angle.*exceeds 90°/i).length).toBeGreaterThan(0);
  });

  it('toggles checklist items and updates live highline-gear-counter', () => {
    render(<HighlineHub />);

    const counter = screen.getByTestId('highline-gear-counter');
    expect(counter.textContent).toMatch(/0 of 6 packed/i);

    const leashCheckbox = screen.getByLabelText(/highline dynamic leash with dual steel rings/i);
    fireEvent.click(leashCheckbox);
    expect(counter.textContent).toMatch(/1 of 6 packed/i);

    const weblockCheckbox = screen.getByLabelText(/friction weblocks/i);
    fireEvent.click(weblockCheckbox);
    expect(counter.textContent).toMatch(/2 of 6 packed/i);

    fireEvent.click(leashCheckbox);
    expect(counter.textContent).toMatch(/1 of 6 packed/i);
  });

  it('has accessible form control labels and distinct htmlFor pairings', () => {
    render(<HighlineHub />);

    expect(screen.getByLabelText(/select.*span/i)).toBeDefined();
    expect(screen.getByLabelText(/walker weight/i)).toBeDefined();
    expect(screen.getByLabelText(/standing sag/i)).toBeDefined();
    expect(screen.getByLabelText(/dynamic load factor/i)).toBeDefined();
    expect(screen.getByLabelText(/anchor.*angle/i)).toBeDefined();

    const gearItem = screen.getByLabelText(/highline dynamic leash with dual steel rings/i);
    expect(gearItem.getAttribute('id')).toMatch(/^highline-gear-/);
  });
});
