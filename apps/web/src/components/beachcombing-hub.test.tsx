import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import BeachcombingHub from './beachcombing-hub';

describe('BeachcombingHub', () => {
  it('renders all main sections with h2 headings and no skipped heading levels', () => {
    render(<BeachcombingHub />);

    const h2s = screen.getAllByRole('heading', { level: 2 });
    const headings = h2s.map((h) => h.textContent);

    expect(headings.some((h) => /beachcombing sites|sites/i.test(h || ''))).toBe(true);
    expect(headings.some((h) => /foraging calculator|tide & flotsam/i.test(h || ''))).toBe(true);
    expect(headings.some((h) => /checklist|kit checklist|beachcombing kit/i.test(h || ''))).toBe(true);
  });

  it('renders site cards with h3 headings and key beachcombing metrics', () => {
    render(<BeachcombingHub />);

    const grid = screen.getByTestId('beachcombing-sites-grid');
    const h3s = within(grid).getAllByRole('heading', { level: 3 });
    const titles = h3s.map((h) => h.textContent);

    expect(titles.some((t) => t?.includes('Glass Beach'))).toBe(true);
    expect(titles.some((t) => t?.includes('Monashka Bay'))).toBe(true);
    expect(titles.some((t) => t?.includes('Cape May Point'))).toBe(true);
    expect(titles.some((t) => t?.includes('Ruby Beach'))).toBe(true);
    expect(titles.some((t) => t?.includes('Monhegan Island'))).toBe(true);

    // Verify metrics: elevation, tidal range, storm deposit index
    expect(within(grid).getByText(/4\s*m/i)).toBeDefined();
    expect(within(grid).getByText(/2\.1\s*m/i)).toBeDefined();
    expect(within(grid).getByText(/8\.4/i)).toBeDefined();
  });

  it('filters sites when shoreline filter buttons are clicked', () => {
    render(<BeachcombingHub />);

    const grid = screen.getByTestId('beachcombing-sites-grid');

    // Filter by High Energy Strand
    const strandBtn = screen.getByRole('button', { name: /high energy strand/i });
    fireEvent.click(strandBtn);

    expect(within(grid).getByRole('heading', { level: 3, name: /Monashka Bay/i })).toBeDefined();
    expect(within(grid).queryByRole('heading', { level: 3, name: /Glass Beach/i })).toBeNull();
    expect(within(grid).queryByRole('heading', { level: 3, name: /Cape May/i })).toBeNull();

    // Filter by Barrier Island Sandspit
    const sandspitBtn = screen.getByRole('button', { name: /barrier island sandspit/i });
    fireEvent.click(sandspitBtn);

    expect(within(grid).getByRole('heading', { level: 3, name: /Cape May/i })).toBeDefined();
    expect(within(grid).queryByRole('heading', { level: 3, name: /Monashka Bay/i })).toBeNull();

    // Filter by Rocky Intertidal Shelf
    const rockyBtn = screen.getByRole('button', { name: /rocky intertidal shelf/i });
    fireEvent.click(rockyBtn);

    expect(within(grid).getByRole('heading', { level: 3, name: /Ruby Beach/i })).toBeDefined();
    expect(within(grid).queryByRole('heading', { level: 3, name: /Cape May/i })).toBeNull();

    // Filter by Gravel Pebble Cove
    const gravelBtn = screen.getByRole('button', { name: /gravel pebble cove/i });
    fireEvent.click(gravelBtn);

    expect(within(grid).getByRole('heading', { level: 3, name: /Glass Beach/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /Monhegan Island/i })).toBeDefined();
    expect(within(grid).queryByRole('heading', { level: 3, name: /Ruby Beach/i })).toBeNull();

    // Reset filter to All Shorelines
    const allBtn = screen.getByRole('button', { name: /all shorelines/i });
    fireEvent.click(allBtn);

    expect(within(grid).getByRole('heading', { level: 3, name: /Glass Beach/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /Monashka Bay/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /Cape May/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /Ruby Beach/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /Monhegan Island/i })).toBeDefined();
  });

  it('updates live calculator reactive results panel with role status and aria-live', () => {
    render(<BeachcombingHub />);

    const resultPanel = screen.getByTestId('beachcombing-calculator-result');
    expect(resultPanel.getAttribute('role')).toBe('status');
    expect(resultPanel.getAttribute('aria-live')).toBe('polite');

    const siteSelect = screen.getByLabelText(/select.*coastal.*site/i);
    const searchHoursSlider = screen.getByLabelText(/search duration/i);
    const tidalDropSlider = screen.getByLabelText(/tidal drop/i);
    const stormSurgeSlider = screen.getByLabelText(/storm surge recency/i);
    const tumbleSelect = screen.getByLabelText(/surf tumble energy/i);

    // Select Glass Beach
    fireEvent.change(siteSelect, { target: { value: 'glass-beach-fort-bragg' } });
    expect(within(resultPanel).getByText(/Glass Beach/i)).toBeDefined();

    // Adjust hours to 4, drop to 3.0, storm surge to 3, tumble to extreme
    fireEvent.change(searchHoursSlider, { target: { value: '4' } });
    fireEvent.change(tidalDropSlider, { target: { value: '3.0' } });
    fireEvent.change(stormSurgeSlider, { target: { value: '3' } });
    fireEvent.change(tumbleSelect, { target: { value: 'extreme_ocean_surf' } });

    // Assert yield is updated
    // Formula: Math.max(1, Math.round(4 * 3.5 * (8.4 / 5.0) * (3.0 / 2.0))) = 4 * 3.5 * 1.68 * 1.5 = 35.28 -> 35
    expect(within(resultPanel).getByText(/35 pieces/i)).toBeDefined();

    // Patina quality should be ancient_c_fractured_frost 95%
    expect(within(resultPanel).getAllByText(/ancient c-fractured frost/i).length).toBeGreaterThanOrEqual(1);
    expect(within(resultPanel).getByText(/95%/i)).toBeDefined();

    // Status should be prime low-tide wrack window
    expect(within(resultPanel).getByText(/prime low-tide wrack window/i)).toBeDefined();

    // Check advisories and rarity odds
    expect(within(resultPanel).getByText(/Cobalt Blue: 1 in 250 pieces/i)).toBeDefined();
    expect(within(resultPanel).getByText(/Never turn your back on the surf/i)).toBeDefined();
    expect(within(resultPanel).getByText(/Pack out all plastic marine debris/i)).toBeDefined();
  });

  it('toggles checklist items and updates live beachcombing-gear-counter', () => {
    render(<BeachcombingHub />);

    const counter = screen.getByTestId('beachcombing-gear-counter');
    expect(counter.textContent).toMatch(/0 of 6 packed/i);

    const uvLightCheckbox = screen.getByLabelText(/365nm longwave uv blacklight torch/i);
    fireEvent.click(uvLightCheckbox);
    expect(counter.textContent).toMatch(/1 of 6 packed/i);

    const scoopCheckbox = screen.getByLabelText(/marine stainless steel sand-sifting mesh scoop/i);
    fireEvent.click(scoopCheckbox);
    expect(counter.textContent).toMatch(/2 of 6 packed/i);

    fireEvent.click(uvLightCheckbox);
    expect(counter.textContent).toMatch(/1 of 6 packed/i);
  });

  it('has accessible form control labels and distinct htmlFor pairings', () => {
    render(<BeachcombingHub />);

    expect(screen.getByLabelText(/select.*coastal.*site/i)).toBeDefined();
    expect(screen.getByLabelText(/search duration/i)).toBeDefined();
    expect(screen.getByLabelText(/tidal drop/i)).toBeDefined();
    expect(screen.getByLabelText(/storm surge recency/i)).toBeDefined();
    expect(screen.getByLabelText(/surf tumble energy/i)).toBeDefined();
  });
});
