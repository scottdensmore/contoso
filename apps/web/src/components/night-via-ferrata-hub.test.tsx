import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import NightViaFerrataHub from './night-via-ferrata-hub';

describe('NightViaFerrataHub Component', () => {
  it('renders all main sections with h2 headings', () => {
    render(<NightViaFerrataHub />);

    const h2s = screen.getAllByRole('heading', { level: 2 });
    const headings = h2s.map((h) => h.textContent);

    expect(headings.some((h) => /routes|via ferrata/i.test(h || ''))).toBe(true);
    expect(headings.some((h) => /visibility|bridge sway|calculator/i.test(h || ''))).toBe(true);
    expect(headings.some((h) => /safety kit|checklist/i.test(h || ''))).toBe(true);
  });

  it('renders route cards with h3 headings and key via ferrata metrics', () => {
    render(<NightViaFerrataHub />);

    const grid = screen.getByTestId('night-via-ferrata-routes-grid');
    const h3s = within(grid).getAllByRole('heading', { level: 3 });
    const titles = h3s.map((h) => h.textContent);

    expect(titles.some((t) => t?.includes('Dolomites Ivano Dibona'))).toBe(true);
    expect(titles.some((t) => t?.includes('Ouray Uncompahgre'))).toBe(true);
    expect(titles.some((t) => t?.includes('Telluride Krogerata'))).toBe(true);
    expect(titles.some((t) => t?.includes('Mammoth Pass'))).toBe(true);
    expect(titles.some((t) => t?.includes('Chamonix Aiguilles Rouges'))).toBe(true);

    // Verify metrics in cards
    expect(within(grid).getAllByText(/2950\s*m/).length).toBeGreaterThan(0);
    expect(within(grid).getAllByText(/30\s*m/).length).toBeGreaterThan(0);
    expect(within(grid).getAllByText(/450\s*m/).length).toBeGreaterThan(0);
    expect(within(grid).getAllByText(/C\/D/).length).toBeGreaterThan(0);
  });

  it('filters routes when nocturnal style filter buttons are clicked', () => {
    render(<NightViaFerrataHub />);

    const grid = screen.getByTestId('night-via-ferrata-routes-grid');

    // Filter by Vertical Granite Face
    const graniteBtn = screen.getByRole('button', { name: /vertical granite face/i });
    fireEvent.click(graniteBtn);

    expect(within(grid).getByRole('heading', { level: 3, name: /Ouray Uncompahgre/i })).toBeDefined();
    expect(within(grid).queryByRole('heading', { level: 3, name: /Dolomites/i })).toBeNull();
    expect(within(grid).queryByRole('heading', { level: 3, name: /Telluride/i })).toBeNull();
    expect(within(grid).queryByRole('heading', { level: 3, name: /Mammoth Pass/i })).toBeNull();

    // Filter by Knife Edge Arete
    const areteBtn = screen.getByRole('button', { name: /knife edge arete/i });
    fireEvent.click(areteBtn);

    expect(within(grid).getByRole('heading', { level: 3, name: /Telluride Krogerata/i })).toBeDefined();
    expect(within(grid).queryByRole('heading', { level: 3, name: /Ouray/i })).toBeNull();
    expect(within(grid).queryByRole('heading', { level: 3, name: /Dolomites/i })).toBeNull();

    // Reset filter to All Routes
    const allBtn = screen.getByRole('button', { name: /all routes/i });
    fireEvent.click(allBtn);

    expect(within(grid).getByRole('heading', { level: 3, name: /Dolomites/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /Ouray/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /Telluride/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /Mammoth Pass/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /Chamonix/i })).toBeDefined();
  });

  it('updates live calculator reactive results panel with role="status" and aria-live="polite"', () => {
    render(<NightViaFerrataHub />);

    const resultPanel = screen.getByTestId('night-via-ferrata-calculator-result');
    expect(resultPanel.getAttribute('role')).toBe('status');
    expect(resultPanel.getAttribute('aria-live')).toBe('polite');

    const routeSelect = screen.getByLabelText(/select.*route/i);
    const moonSelect = screen.getByLabelText(/moonlight/i);
    const lumensInput = screen.getByLabelText(/headlamp lumens/i);
    const windInput = screen.getByLabelText(/wind gusts/i);
    const tempInput = screen.getByLabelText(/temperature/i);

    // Select Dolomites
    fireEvent.change(routeSelect, { target: { value: 'dolomites-kellner-night-traverse' } });
    expect(within(resultPanel).getByRole('heading', { level: 3, name: /Dolomites Ivano Dibona/i })).toBeDefined();

    // Set hazardous conditions
    fireEvent.change(moonSelect, { target: { value: 'new_moon_pitch_black' } });
    fireEvent.change(lumensInput, { target: { value: '250' } });
    fireEvent.change(windInput, { target: { value: '65' } });

    expect(within(resultPanel).getAllByText(/hazardous.*abort/i).length).toBeGreaterThan(0);
    expect(within(resultPanel).getAllByText(/8\s*m/i).length).toBeGreaterThan(0);
    expect(within(resultPanel).getAllByText(/39\s*cm/i).length).toBeGreaterThan(0);

    // Set optimal conditions
    fireEvent.change(moonSelect, { target: { value: 'full_moon_glare' } });
    fireEvent.change(lumensInput, { target: { value: '1400' } });
    fireEvent.change(windInput, { target: { value: '15' } });
    fireEvent.change(tempInput, { target: { value: '5' } });

    expect(within(resultPanel).getAllByText(/optimal.*ascent/i).length).toBeGreaterThan(0);
    expect(within(resultPanel).getAllByText(/120\s*m/i).length).toBeGreaterThan(0);
    expect(within(resultPanel).getAllByText(/9\s*cm/i).length).toBeGreaterThan(0);
  });

  it('toggles checklist items and updates live night-via-ferrata-gear-counter', () => {
    render(<NightViaFerrataHub />);

    const counter = screen.getByTestId('night-via-ferrata-gear-counter');
    expect(counter.textContent).toMatch(/0 of 6 packed/i);

    const headlampCheckbox = screen.getByLabelText(/high-output dual-beam 1200-lumen/i);
    fireEvent.click(headlampCheckbox);
    expect(counter.textContent).toMatch(/1 of 6 packed/i);

    const helmetCheckbox = screen.getByLabelText(/photoluminescent high-impact mountaineering helmet/i);
    fireEvent.click(helmetCheckbox);
    expect(counter.textContent).toMatch(/2 of 6 packed/i);

    fireEvent.click(headlampCheckbox);
    expect(counter.textContent).toMatch(/1 of 6 packed/i);
  });

  it('has accessible form control labels and distinct htmlFor pairings', () => {
    render(<NightViaFerrataHub />);

    expect(screen.getByLabelText(/select.*route/i)).toBeDefined();
    expect(screen.getByLabelText(/moonlight/i)).toBeDefined();
    expect(screen.getByLabelText(/headlamp lumens/i)).toBeDefined();
    expect(screen.getByLabelText(/wind gusts/i)).toBeDefined();
    expect(screen.getByLabelText(/temperature/i)).toBeDefined();

    const gearItem = screen.getByLabelText(/high-output dual-beam 1200-lumen/i);
    expect(gearItem.getAttribute('id')).toMatch(/^night-via-ferrata-gear-/);
  });
});
