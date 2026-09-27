import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import TelemarkSkiingHub from './telemark-skiing-hub';

describe('TelemarkSkiingHub', () => {
  it('renders all main sections with h2 headings and zero skipped heading levels', () => {
    render(<TelemarkSkiingHub />);

    const h2s = screen.getAllByRole('heading', { level: 2 });
    const headings = h2s.map((h) => h.textContent);

    expect(headings.some((h) => /telemark.*zones|backcountry.*terrain/i.test(h || ''))).toBe(true);
    expect(headings.some((h) => /binding activity|physics calculator/i.test(h || ''))).toBe(true);
    expect(headings.some((h) => /checklist|safety.*gear/i.test(h || ''))).toBe(true);
  });

  it('renders zone cards with h3 headings and key telemark metrics', () => {
    render(<TelemarkSkiingHub />);

    const grid = screen.getByTestId('telemark-zones-grid');
    const h3s = within(grid).getAllByRole('heading', { level: 3 });
    const titles = h3s.map((h) => h.textContent);

    expect(titles.some((t) => t?.includes('Silverton Mountain'))).toBe(true);
    expect(titles.some((t) => t?.includes('Mad River Glen'))).toBe(true);
    expect(titles.some((t) => t?.includes('Alta Backcountry'))).toBe(true);
    expect(titles.some((t) => t?.includes('Rogers Pass'))).toBe(true);
    expect(titles.some((t) => t?.includes('Tuckerman Ravine'))).toBe(true);

    // Verify elevations, steepness, snow types
    expect(within(grid).getByText(/4100\s*m/i)).toBeDefined();
    expect(within(grid).getByText(/45°/i)).toBeDefined();
    expect(within(grid).getAllByText(/Deep Ungrooved Dry San Juan Powder/i).length).toBeGreaterThan(0);

    // Verify binding badges
    expect(within(grid).getAllByText(/Modern NTN/i).length).toBeGreaterThan(0);
    expect(within(grid).getAllByText(/75mm Duckbill Cable/i).length).toBeGreaterThan(0);
    expect(within(grid).getAllByText(/Hybrid Tele-Tech/i).length).toBeGreaterThan(0);
  });

  it('filters zones when binding system filter buttons are clicked', () => {
    render(<TelemarkSkiingHub />);

    const grid = screen.getByTestId('telemark-zones-grid');

    // Filter by 75mm Duckbill Cable
    const duckbillBtn = screen.getByRole('button', { name: /75mm duckbill cable/i });
    fireEvent.click(duckbillBtn);

    expect(within(grid).getByRole('heading', { name: /Mad River Glen Gen Stark Ridge Telemark Glades/i })).toBeDefined();
    expect(within(grid).queryByRole('heading', { name: /Silverton Mountain/i })).toBeNull();
    expect(within(grid).queryByRole('heading', { name: /Rogers Pass/i })).toBeNull();

    // Filter by Hybrid Tele-Tech
    const hybridBtn = screen.getByRole('button', { name: /hybrid tele-tech/i });
    fireEvent.click(hybridBtn);

    expect(within(grid).getByRole('heading', { name: /Rogers Pass Asulkan Valley Glaciated Telemark Tours/i })).toBeDefined();
    expect(within(grid).queryByRole('heading', { name: /Mad River Glen/i })).toBeNull();
    expect(within(grid).queryByRole('heading', { name: /Silverton Mountain/i })).toBeNull();

    // Reset to All Systems
    const allBtn = screen.getByRole('button', { name: /all systems/i });
    fireEvent.click(allBtn);

    expect(within(grid).getByRole('heading', { name: /Silverton Mountain/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { name: /Mad River Glen/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { name: /Alta Backcountry/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { name: /Rogers Pass/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { name: /Tuckerman Ravine/i })).toBeDefined();
  });

  it('updates live calculator reactive results panel with role="status" and aria-live="polite"', () => {
    render(<TelemarkSkiingHub />);

    const resultPanel = screen.getByTestId('telemark-calculator-result');
    expect(resultPanel.getAttribute('role')).toBe('status');
    expect(resultPanel.getAttribute('aria-live')).toBe('polite');

    const zoneSelect = screen.getByLabelText(/select.*telemark zone/i);
    const bindingSelect = screen.getByLabelText(/binding system architecture/i);
    const weightInput = screen.getByLabelText(/skier weight/i);
    const tensionInput = screen.getByLabelText(/cartridge spring tension level/i);

    // Initial default state: Silverton Mountain, ntn_modern, 170 lbs, tension 3
    expect(within(resultPanel).getByText(/45(?:\.0)?\s*Nm/i)).toBeDefined();
    expect(within(resultPanel).getByText(/0\.56/i)).toBeDefined();
    expect(within(resultPanel).getByText(/Balanced All Mountain/i)).toBeDefined();

    // Change zone and binding
    fireEvent.change(zoneSelect, { target: { value: 'alta-catherine-pass' } });
    expect(within(resultPanel).getByText(/Alta Backcountry Catherine's Pass/i)).toBeDefined();

    fireEvent.change(bindingSelect, { target: { value: 'duckbill_75mm_cable' } });
    expect(within(resultPanel).getByText(/35(?:\.0)?\s*Nm/i)).toBeDefined();

    // Reset back to ntn_modern for tension/weight test
    fireEvent.change(bindingSelect, { target: { value: 'ntn_modern' } });

    // Increase tension to 5
    fireEvent.change(tensionInput, { target: { value: '5' } });
    expect(within(resultPanel).getByText(/57(?:\.0)?\s*Nm/i)).toBeDefined();
    expect(within(resultPanel).getByText(/0\.71/i)).toBeDefined();
    expect(within(resultPanel).getByText(/Active Carving Power/i)).toBeDefined();

    // Increase skier weight to 220 lbs -> 73.8 Nm -> Stiff Race Lockout
    fireEvent.change(weightInput, { target: { value: '220' } });
    expect(within(resultPanel).getByText(/73\.8\s*Nm/i)).toBeDefined();
    expect(within(resultPanel).getByText(/Stiff Race Lockout/i)).toBeDefined();
    expect(within(resultPanel).getByText(/High bellows fatigue risk/i)).toBeDefined();
  });

  it('configures calculator when zone card quick-action button is clicked', () => {
    render(<TelemarkSkiingHub />);

    const configureBtn = screen.getByRole('button', {
      name: /configure calculator for mad river glen/i,
    });
    fireEvent.click(configureBtn);

    const resultPanel = screen.getByTestId('telemark-calculator-result');
    expect(within(resultPanel).getByText(/Mad River Glen Gen Stark Ridge Telemark Glades/i)).toBeDefined();
    expect(within(resultPanel).getAllByText(/75mm duckbill cable/i).length).toBeGreaterThan(0);
  });

  it('tracks gear checklist progress and updates counter', () => {
    render(<TelemarkSkiingHub />);

    const counter = screen.getByTestId('telemark-gear-counter');
    expect(counter.textContent).toContain('0 of 6 packed');

    const bootsCheckbox = screen.getByLabelText(/Triple-Injection Pebax Bellows Telemark Boots/i);
    fireEvent.click(bootsCheckbox);
    expect(counter.textContent).toContain('1 of 6 packed');

    const skinsCheckbox = screen.getByLabelText(/High-Traction Mohair-Nylon Blend/i);
    fireEvent.click(skinsCheckbox);
    expect(counter.textContent).toContain('2 of 6 packed');

    // Uncheck boots
    fireEvent.click(bootsCheckbox);
    expect(counter.textContent).toContain('1 of 6 packed');
  });
});
