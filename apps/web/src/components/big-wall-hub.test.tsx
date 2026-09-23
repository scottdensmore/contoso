import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import BigWallHub from './big-wall-hub';

describe('BigWallHub Component', () => {
  it('renders all main sections with h2 headings', () => {
    render(<BigWallHub />);

    const h2s = screen.getAllByRole('heading', { level: 2 });
    const headings = h2s.map((h) => h.textContent);

    expect(headings.some((h) => /routes|big wall/i.test(h || ''))).toBe(true);
    expect(headings.some((h) => /haul effort|calculator/i.test(h || ''))).toBe(true);
    expect(headings.some((h) => /safety kit|checklist/i.test(h || ''))).toBe(true);
  });

  it('renders route cards with h3 headings and key big wall metrics', () => {
    render(<BigWallHub />);

    const grid = screen.getByTestId('big-wall-routes-grid');
    const h3s = within(grid).getAllByRole('heading', { level: 3 });
    const titles = h3s.map((h) => h.textContent);

    expect(titles.some((t) => t?.includes('The Nose'))).toBe(true);
    expect(titles.some((t) => t?.includes('Regular Northwest Face'))).toBe(true);
    expect(titles.some((t) => t?.includes('The Titan'))).toBe(true);
    expect(titles.some((t) => t?.includes('Prodigal Son'))).toBe(true);
    expect(titles.some((t) => t?.includes('West Face — Leaning Tower'))).toBe(true);

    // Verify metrics in cards
    expect(within(grid).getByText(/31 pitches/i)).toBeDefined();
    expect(within(grid).getByText(/1000m/i)).toBeDefined();
    expect(within(grid).getByText(/85 kg/i)).toBeDefined();
  });

  it('filters routes when aid rating filter buttons are clicked', () => {
    render(<BigWallHub />);

    const grid = screen.getByTestId('big-wall-routes-grid');

    // Filter by C1
    const c1Btn = screen.getByRole('button', { name: /^C1$/i });
    fireEvent.click(c1Btn);

    expect(within(grid).getByRole('heading', { level: 3, name: /Regular Northwest Face/i })).toBeDefined();
    expect(within(grid).queryByRole('heading', { level: 3, name: /The Nose/i })).toBeNull();
    expect(within(grid).queryByRole('heading', { level: 3, name: /The Titan/i })).toBeNull();

    // Filter by C2
    const c2Btn = screen.getByRole('button', { name: /^C2$/i });
    fireEvent.click(c2Btn);

    expect(within(grid).getByRole('heading', { level: 3, name: /The Nose/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /Prodigal Son/i })).toBeDefined();
    expect(within(grid).queryByRole('heading', { level: 3, name: /Regular Northwest Face/i })).toBeNull();

    // Filter by A2+
    const a2Btn = screen.getByRole('button', { name: /^A2\+$/i });
    fireEvent.click(a2Btn);

    expect(within(grid).getByRole('heading', { level: 3, name: /The Titan/i })).toBeDefined();
    expect(within(grid).queryByRole('heading', { level: 3, name: /The Nose/i })).toBeNull();

    // Reset filter to All Routes
    const allBtn = screen.getByRole('button', { name: /all routes/i });
    fireEvent.click(allBtn);

    expect(within(grid).getByRole('heading', { level: 3, name: /The Nose/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /Regular Northwest Face/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /The Titan/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /Prodigal Son/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /West Face — Leaning Tower/i })).toBeDefined();
  });

  it('updates live calculator reactive results panel with role="status" and aria-live="polite"', () => {
    render(<BigWallHub />);

    const resultPanel = screen.getByTestId('big-wall-calculator-result');
    expect(resultPanel.getAttribute('role')).toBe('status');
    expect(resultPanel.getAttribute('aria-live')).toBe('polite');

    const routeSelect = screen.getByLabelText(/select.*route/i);
    const pigWeightInput = screen.getByLabelText(/pig weight/i);
    const haulSystemSelect = screen.getByLabelText(/haul system/i);
    const wallAngleSelect = screen.getByLabelText(/wall angle/i);
    const climberWeightInput = screen.getByLabelText(/climber weight/i);

    // Initial default: El Capitan Nose, 85kg pig, 1:1 direct, vertical wall, 75kg climber
    // (85 * 1.15) / 0.9 = 108.6 kg. 75kg climber < 108.6kg -> Insufficient
    fireEvent.change(routeSelect, { target: { value: 'el-capitan-nose' } });
    fireEvent.change(pigWeightInput, { target: { value: '85' } });
    fireEvent.change(haulSystemSelect, { target: { value: '1:1_direct' } });
    fireEvent.change(wallAngleSelect, { target: { value: 'vertical' } });
    fireEvent.change(climberWeightInput, { target: { value: '75' } });

    expect(within(resultPanel).getAllByText(/108\.6\s*kg/i).length).toBeGreaterThan(0);
    expect(within(resultPanel).getByText(/insufficient/i)).toBeDefined();
    expect(within(resultPanel).getByText(/extreme/i)).toBeDefined();

    // Switch to 3:1 Z-rig: (85 * 1.15) / 2.40 = 40.7 kg. 75kg climber >= 40.7kg -> Sufficient
    fireEvent.change(haulSystemSelect, { target: { value: '3:1_z_rig' } });
    expect(within(resultPanel).getAllByText(/40\.7\s*kg/i).length).toBeGreaterThan(0);
    expect(within(resultPanel).getByText(/sufficient/i)).toBeDefined();

    // Test slab wall angle shows abrasion warning
    fireEvent.change(wallAngleSelect, { target: { value: 'slab' } });
    expect(within(resultPanel).getByText(/abrasion/i)).toBeDefined();
  });

  it('toggles checklist items and updates live big-wall-gear-counter', () => {
    render(<BigWallHub />);

    const counter = screen.getByTestId('big-wall-gear-counter');
    expect(counter.textContent).toMatch(/0 of 6 packed/i);

    const portaledgeCheckbox = screen.getByLabelText(/expedition portaledge/i);
    fireEvent.click(portaledgeCheckbox);
    expect(counter.textContent).toMatch(/1 of 6 packed/i);

    const pulleyCheckbox = screen.getByLabelText(/progress-capture hauling pulley/i);
    fireEvent.click(pulleyCheckbox);
    expect(counter.textContent).toMatch(/2 of 6 packed/i);

    fireEvent.click(portaledgeCheckbox);
    expect(counter.textContent).toMatch(/1 of 6 packed/i);
  });

  it('has accessible form control labels and distinct htmlFor pairings', () => {
    render(<BigWallHub />);

    expect(screen.getByLabelText(/select.*route/i)).toBeDefined();
    expect(screen.getByLabelText(/pig weight/i)).toBeDefined();
    expect(screen.getByLabelText(/haul system/i)).toBeDefined();
    expect(screen.getByLabelText(/wall angle/i)).toBeDefined();
    expect(screen.getByLabelText(/climber weight/i)).toBeDefined();

    const gearItem = screen.getByLabelText(/expedition portaledge/i);
    expect(gearItem.getAttribute('id')).toMatch(/^gear-/);
  });
});
