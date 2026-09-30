import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BogShoeingHub from './bog-shoeing-hub';

describe('BogShoeingHub component', () => {
  it('renders required h2 section headings and h3 card headings without skipped levels', () => {
    render(<BogShoeingHub />);

    const h2s = screen.getAllByRole('heading', { level: 2 });
    expect(h2s.length).toBeGreaterThanOrEqual(3);

    const h3s = screen.getAllByRole('heading', { level: 3 });
    expect(h3s.length).toBe(5); // 5 iconic peatland routes

    const h2Texts = h2s.map((h) => h.textContent);
    expect(
      h2Texts.some((t) => t?.includes('Wilderness Peatland Routes'))
    ).toBe(true);
    expect(
      h2Texts.some((t) => t?.includes('Peat Flotation & Sinkage Calculator'))
    ).toBe(true);
    expect(
      h2Texts.some((t) => t?.includes('Mandatory Peatland Navigation & Self-Rescue Gear'))
    ).toBe(true);
  });

  it('filters routes when terrain filter buttons are clicked', () => {
    render(<BogShoeingHub />);

    // Initially all 5 routes present
    expect(screen.getByRole('heading', { level: 3, name: /Great Dismal Sphagnum Quake Corridor/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Boundary Waters Black Spruce Muskeg Traverse/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Kenai Peninsula Patterned Fen & Flark System/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Adirondack High Peaks Spring Mire Basin/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Algonquin Highland Floating Tussock Fen/i })).toBeDefined();

    // Click "Quaking Sphagnum Mat" filter button
    const quakingBtn = screen.getByRole('button', { name: /^Quaking Sphagnum Mat$/i });
    fireEvent.click(quakingBtn);

    expect(screen.getByRole('heading', { level: 3, name: /Great Dismal Sphagnum Quake Corridor/i })).toBeDefined();
    expect(screen.queryByRole('heading', { level: 3, name: /Boundary Waters Black Spruce Muskeg Traverse/i })).toBeNull();
    expect(screen.queryByRole('heading', { level: 3, name: /Kenai Peninsula Patterned Fen & Flark System/i })).toBeNull();
    expect(screen.queryByRole('heading', { level: 3, name: /Adirondack High Peaks Spring Mire Basin/i })).toBeNull();
    expect(screen.queryByRole('heading', { level: 3, name: /Algonquin Highland Floating Tussock Fen/i })).toBeNull();

    // Click "Boreal Black Spruce Muskeg" filter button
    const muskegBtn = screen.getByRole('button', { name: /^Boreal Black Spruce Muskeg$/i });
    fireEvent.click(muskegBtn);

    expect(screen.getByRole('heading', { level: 3, name: /Boundary Waters Black Spruce Muskeg Traverse/i })).toBeDefined();
    expect(screen.queryByRole('heading', { level: 3, name: /Great Dismal Sphagnum Quake Corridor/i })).toBeNull();

    // Click "All Terrains" filter button
    const allBtn = screen.getByRole('button', { name: /^All Terrains$/i });
    fireEvent.click(allBtn);

    expect(screen.getByRole('heading', { level: 3, name: /Great Dismal Sphagnum Quake Corridor/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Kenai Peninsula Patterned Fen & Flark System/i })).toBeDefined();
  });

  it('updates flotation, sinkage, and hazard calculation reactively in accessible live region', () => {
    render(<BogShoeingHub />);

    const liveStatus = screen.getByRole('status');
    expect(liveStatus).toBeDefined();
    expect(liveStatus.getAttribute('aria-live')).toBe('polite');

    const siteSelect = screen.getByLabelText(/select peatland route/i);
    const shoeSelect = screen.getByLabelText(/select bog-shoe model/i);
    const hikerWeightInput = screen.getByLabelText(/hiker body weight/i);
    const backpackWeightInput = screen.getByLabelText(/backpack load weight/i);
    const waterTableInput = screen.getByLabelText(/water table depth/i);

    // Initial default check (Great Dismal Swamp, 75kg hiker + 15kg pack = 90kg, 432 sq in -> 0.46 psi, threshold 0.38 psi)
    expect(liveStatus.textContent).toContain('0.46 psi');
    expect(liveStatus.textContent).toContain('0.38 psi');
    expect(liveStatus.textContent).toContain('Moderate Saturated Slump');

    // Change site to Kenai Peninsula Fen
    fireEvent.change(siteSelect, { target: { value: 'kenai-peninsula-patterned-fen' } });
    fireEvent.change(shoeSelect, { target: { value: 'composite_mud_flotation_deck' } });
    fireEvent.change(hikerWeightInput, { target: { value: '85' } });
    fireEvent.change(backpackWeightInput, { target: { value: '20' } });
    fireEvent.change(waterTableInput, { target: { value: '10' } });

    expect(liveStatus.textContent).toContain('0.77 psi');
    expect(liveStatus.textContent).toContain('0.26 psi');
    expect(liveStatus.textContent).toContain('Critical Quaking Mire Submersion');
    expect(liveStatus.textContent).toContain('CRITICAL SUBMERSION HAZARD');
  });

  it('toggles gear checklist items and updates progress counter', () => {
    render(<BogShoeingHub />);

    const counter = screen.getByTestId('bog-shoeing-gear-counter');
    expect(counter.textContent).toBe('0 of 6 packed');

    const bogShoesCheckbox = screen.getByLabelText(/36x12-Inch High-Flotation Webbed Sphagnum Bog-Shoes/i);
    fireEvent.click(bogShoesCheckbox);
    expect(counter.textContent).toBe('1 of 6 packed');

    const probingPoleCheckbox = screen.getByLabelText(/3.5-Meter Segmented Carbon Peat Sounding & Probing Pole/i);
    fireEvent.click(probingPoleCheckbox);
    expect(counter.textContent).toBe('2 of 6 packed');

    fireEvent.click(bogShoesCheckbox);
    expect(counter.textContent).toBe('1 of 6 packed');
  });
});
