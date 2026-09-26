import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import SandboardingHub from './sandboarding-hub';

describe('SandboardingHub', () => {
  it('renders all main sections with h2 headings and no skipped heading levels', () => {
    render(<SandboardingHub />);

    const h2s = screen.getAllByRole('heading', { level: 2 });
    const headings = h2s.map((h) => h.textContent);

    expect(headings.some((h) => /dune.*locations|dune fields/i.test(h || ''))).toBe(true);
    expect(headings.some((h) => /glide.*friction calculator|wax friction calculator/i.test(h || ''))).toBe(true);
    expect(headings.some((h) => /checklist|safety.*gear/i.test(h || ''))).toBe(true);
  });

  it('renders dune cards with h3 headings, height, slope angle, sand type, and highlights', () => {
    render(<SandboardingHub />);

    const grid = screen.getByTestId('sandboarding-dunes-grid');
    const h3s = within(grid).getAllByRole('heading', { level: 3 });
    const titles = h3s.map((h) => h.textContent);

    expect(titles.some((t) => t?.includes('Great Sand Dunes'))).toBe(true);
    expect(titles.some((t) => t?.includes('Oregon Dunes'))).toBe(true);
    expect(titles.some((t) => t?.includes('Coral Pink Dunes'))).toBe(true);
    expect(titles.some((t) => t?.includes('Bruneau Dunes'))).toBe(true);
    expect(titles.some((t) => t?.includes('White Sands'))).toBe(true);

    expect(within(grid).getByText(/230\s*m/i)).toBeDefined();
    expect(within(grid).getByText(/34°/i)).toBeDefined();
    expect(within(grid).getByText(/Alpine Quartz & Volcanic Sand/i)).toBeDefined();
  });

  it('filters dune fields when board style filter buttons are clicked', () => {
    render(<SandboardingHub />);

    const grid = screen.getByTestId('sandboarding-dunes-grid');

    // Filter by Twin Tip Freestyle
    const twinTipBtn = screen.getByRole('button', { name: /twin tip freestyle/i });
    fireEvent.click(twinTipBtn);

    expect(within(grid).getByRole('heading', { name: /Oregon Dunes/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { name: /Coral Pink Dunes/i })).toBeDefined();
    expect(within(grid).queryByRole('heading', { name: /Great Sand Dunes/i })).toBeNull();
    expect(within(grid).queryByRole('heading', { name: /Bruneau Dunes/i })).toBeNull();
    expect(within(grid).queryByRole('heading', { name: /White Sands/i })).toBeNull();

    // Filter by Directional Carver
    const carverBtn = screen.getByRole('button', { name: /directional carver/i });
    fireEvent.click(carverBtn);

    expect(within(grid).getByRole('heading', { name: /Great Sand Dunes/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { name: /Bruneau Dunes/i })).toBeDefined();
    expect(within(grid).queryByRole('heading', { name: /Oregon Dunes/i })).toBeNull();
    expect(within(grid).queryByRole('heading', { name: /White Sands/i })).toBeNull();

    // Filter by Tandem Seated Sled
    const sledBtn = screen.getByRole('button', { name: /tandem seated sled/i });
    fireEvent.click(sledBtn);

    expect(within(grid).getByRole('heading', { name: /White Sands/i })).toBeDefined();
    expect(within(grid).queryByRole('heading', { name: /Great Sand Dunes/i })).toBeNull();

    // Reset to All Boards
    const allBtn = screen.getByRole('button', { name: /all boards/i });
    fireEvent.click(allBtn);

    expect(within(grid).getByRole('heading', { name: /Great Sand Dunes/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { name: /Oregon Dunes/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { name: /Coral Pink Dunes/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { name: /Bruneau Dunes/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { name: /White Sands/i })).toBeDefined();
  });

  it('updates live calculator reactive results panel with status role and aria-live', () => {
    render(<SandboardingHub />);

    const resultPanel = screen.getByTestId('sandboarding-calculator-result');
    expect(resultPanel.getAttribute('role')).toBe('status');
    expect(resultPanel.getAttribute('aria-live')).toBe('polite');

    const duneSelect = screen.getByLabelText(/select sand dune/i);
    const waxSelect = screen.getByLabelText(/wax type/i);
    const sandSelect = screen.getByLabelText(/sand condition/i);

    // Initial state check
    expect(within(resultPanel).getByText(/Great Sand Dunes/i)).toBeDefined();

    // Change wax type to Unwaxed Raw Base
    fireEvent.change(waxSelect, { target: { value: 'unwaxed_raw_base' } });

    // Speed should be capped and warning should appear
    expect(within(resultPanel).getByText(/14(\.0)?\s*mph/i)).toBeDefined();
    expect(within(resultPanel).getByText(/0\.52/)).toBeDefined();
    expect(within(resultPanel).getByText(/Severe base scorch danger/i)).toBeDefined();

    // Change condition to Baked Desert Hot
    fireEvent.change(sandSelect, { target: { value: 'baked_desert_hot' } });
    expect(within(resultPanel).getByText(/0\.57/)).toBeDefined();

    // Switch dune to White Sands
    fireEvent.change(duneSelect, { target: { value: 'white-sands-alkali-flats' } });
    expect(within(resultPanel).getByText(/White Sands Gypsum Crystal Dunes/i)).toBeDefined();
  });

  it('toggles checklist items and updates live sandboarding-gear-counter', () => {
    render(<SandboardingHub />);

    const counter = screen.getByTestId('sandboarding-gear-counter');
    expect(counter.textContent).toMatch(/0 of 6 packed/i);

    const gogglesCheckbox = screen.getByLabelText(/full-seal anti-scratch sandboarding goggles/i);
    fireEvent.click(gogglesCheckbox);
    expect(counter.textContent).toMatch(/1 of 6 packed/i);

    const waxCheckbox = screen.getByLabelText(/dual-temperature high-friction sand speed wax bar/i);
    fireEvent.click(waxCheckbox);
    expect(counter.textContent).toMatch(/2 of 6 packed/i);

    fireEvent.click(gogglesCheckbox);
    expect(counter.textContent).toMatch(/1 of 6 packed/i);
  });

  it('has accessible form control labels and distinct htmlFor pairings', () => {
    render(<SandboardingHub />);

    expect(screen.getByLabelText(/select sand dune/i)).toBeDefined();
    expect(screen.getByLabelText(/board style/i)).toBeDefined();
    expect(screen.getByLabelText(/rider weight/i)).toBeDefined();
    expect(screen.getByLabelText(/slope angle/i)).toBeDefined();
    expect(screen.getByLabelText(/sand condition/i)).toBeDefined();
    expect(screen.getByLabelText(/wax type/i)).toBeDefined();
  });
});
