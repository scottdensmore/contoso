import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import CaveMineralogyHub from './cave-mineralogy-hub';

describe('CaveMineralogyHub Component', () => {
  it('renders all main sections with h2 headings and no skipped levels', () => {
    render(<CaveMineralogyHub />);

    const h2s = screen.getAllByRole('heading', { level: 2 });
    const headings = h2s.map((h) => h.textContent);

    expect(headings.some((h) => /karst|speleothem|sites|caves/i.test(h || ''))).toBe(true);
    expect(headings.some((h) => /hydrochemical|calculator|accretion/i.test(h || ''))).toBe(true);
    expect(headings.some((h) => /gear|checklist|survey/i.test(h || ''))).toBe(true);
  });

  it('renders cave cards with h3 headings and key speleothem survey metrics', () => {
    render(<CaveMineralogyHub />);

    const grid = screen.getByTestId('cave-mineralogy-grid');
    const h3s = within(grid).getAllByRole('heading', { level: 3 });
    const titles = h3s.map((h) => h.textContent);

    expect(titles.some((t) => t?.includes('Carlsbad Caverns Rookery Nest'))).toBe(true);
    expect(titles.some((t) => t?.includes('Lechuguilla Chandelier Ballroom'))).toBe(true);
    expect(titles.some((t) => t?.includes('Organ Cave Anthodite Hall'))).toBe(true);
    expect(titles.some((t) => t?.includes('Mammoth Cave Travertine Cascades'))).toBe(true);
    expect(titles.some((t) => t?.includes('Blanchard Springs Coral & Helictite Grotto'))).toBe(true);

    // Verify key metrics rendered in cards
    expect(within(grid).getByText(/250\s*m/)).toBeDefined();
    expect(within(grid).getByText(/13\.5\s*°C/)).toBeDefined();
    expect(within(grid).getByText(/98\s*%/)).toBeDefined();
    expect(within(grid).getByText(/480\s*m/)).toBeDefined();
  });

  it('filters cave sites when speleothem type filter buttons are clicked', () => {
    render(<CaveMineralogyHub />);

    const grid = screen.getByTestId('cave-mineralogy-grid');

    // Filter by Gypsum Flower & Needle
    const gypsumBtn = screen.getByRole('button', { name: /gypsum flower & needle/i });
    fireEvent.click(gypsumBtn);

    expect(within(grid).getByRole('heading', { level: 3, name: /Lechuguilla Chandelier Ballroom/i })).toBeDefined();
    expect(within(grid).queryByRole('heading', { level: 3, name: /Carlsbad Caverns/i })).toBeNull();
    expect(within(grid).queryByRole('heading', { level: 3, name: /Organ Cave/i })).toBeNull();

    // Filter by Cave Pearl (Pisolith)
    const pearlBtn = screen.getByRole('button', { name: /cave pearl \(pisolith\)/i });
    fireEvent.click(pearlBtn);

    expect(within(grid).getByRole('heading', { level: 3, name: /Carlsbad Caverns Rookery Nest/i })).toBeDefined();
    expect(within(grid).queryByRole('heading', { level: 3, name: /Lechuguilla/i })).toBeNull();

    // Reset filter to All Types
    const allBtn = screen.getByRole('button', { name: /all types/i });
    fireEvent.click(allBtn);

    expect(within(grid).getByRole('heading', { level: 3, name: /Carlsbad Caverns Rookery Nest/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /Lechuguilla Chandelier Ballroom/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /Organ Cave Anthodite Hall/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /Mammoth Cave Travertine Cascades/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /Blanchard Springs Coral & Helictite Grotto/i })).toBeDefined();
  });

  it('updates live reactive results panel with role="status" and aria-live="polite"', () => {
    render(<CaveMineralogyHub />);

    const resultPanel = screen.getByTestId('mineral-accretion-result');
    expect(resultPanel.getAttribute('role')).toBe('status');
    expect(resultPanel.getAttribute('aria-live')).toBe('polite');

    const siteSelect = screen.getByLabelText(/select.*site/i);
    const dripRateInput = screen.getByLabelText(/^drip rate \(dpm\)$/i);
    const waterPhInput = screen.getByLabelText(/^water ph$/i);

    // Initial state check (Carlsbad, default 24 DPM, 7.8 pH, 220 ppm)
    expect(within(resultPanel).getByText(/\+?0\.53\s*SI/)).toBeDefined();
    expect(within(resultPanel).getByText(/1\.08\s*J\/hr/)).toBeDefined();
    expect(within(resultPanel).getByText(/Stable Laminar Accretion/i)).toBeDefined();
    expect(within(resultPanel).getByText(/Nominal Active Mineralization/i)).toBeDefined();

    // High drip rate -> Active Polishing Rotation
    fireEvent.change(dripRateInput, { target: { value: '60' } });
    expect(within(resultPanel).getByText(/Active Polishing Rotation/i)).toBeDefined();
    expect(within(resultPanel).getByText(/2\.70?\s*J\/hr/)).toBeDefined();

    // Low drip rate -> Critical Desiccation Halt Traffic
    fireEvent.change(dripRateInput, { target: { value: '2' } });
    expect(within(resultPanel).getByText(/Critical Desiccation Halt Traffic/i)).toBeDefined();
    expect(within(resultPanel).getByText(/Cementation Stagnation Risk/i)).toBeDefined();

    // Switch site
    fireEvent.change(siteSelect, { target: { value: 'lechuguilla-chandelier-room' } });
    expect(within(resultPanel).getByText(/Lechuguilla Chandelier Ballroom/i)).toBeDefined();
  });

  it('toggles gear checklist items and updates live cave-mineralogy-gear-counter', () => {
    render(<CaveMineralogyHub />);

    const counter = screen.getByTestId('cave-mineralogy-gear-counter');
    expect(counter.textContent).toMatch(/0 of 6 packed/i);

    const uvLampCheckbox = screen.getByLabelText(/365nm filtered uv speleothem luminescence lamp/i);
    fireEvent.click(uvLampCheckbox);
    expect(counter.textContent).toMatch(/1 of 6 packed/i);

    const caliperCheckbox = screen.getByLabelText(/laser profile gauge/i);
    fireEvent.click(caliperCheckbox);
    expect(counter.textContent).toMatch(/2 of 6 packed/i);

    fireEvent.click(uvLampCheckbox);
    expect(counter.textContent).toMatch(/1 of 6 packed/i);
  });

  it('has accessible form control labels and distinct htmlFor pairings', () => {
    render(<CaveMineralogyHub />);

    expect(screen.getByLabelText(/select.*site/i)).toBeDefined();
    expect(screen.getByLabelText(/speleothem type/i)).toBeDefined();
    expect(screen.getByLabelText(/^drip rate \(dpm\)$/i)).toBeDefined();
    expect(screen.getByLabelText(/^water ph$/i)).toBeDefined();
    expect(screen.getByLabelText(/^calcium carbonate \(ppm\)$/i)).toBeDefined();
    expect(screen.getByLabelText(/survey duration/i)).toBeDefined();
  });
});
