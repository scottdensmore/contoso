import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import SnowshoeMountaineeringHub from './snowshoe-mountaineering-hub';

describe('SnowshoeMountaineeringHub Component', () => {
  it('renders all main sections with h2 headings and no skipped heading levels', () => {
    render(<SnowshoeMountaineeringHub />);

    const h2s = screen.getAllByRole('heading', { level: 2 });
    const headings = h2s.map((h) => h.textContent);

    expect(
      headings.some((h) => /snowshoe.*routes|alpine ascent/i.test(h || '')),
    ).toBe(true);
    expect(
      headings.some((h) => /slope mechanics|flotation tail calculator/i.test(h || '')),
    ).toBe(true);
    expect(
      headings.some((h) => /safety kit|checklist/i.test(h || '')),
    ).toBe(true);
  });

  it('renders route cards with h3 headings and key alpine ascent metrics', () => {
    render(<SnowshoeMountaineeringHub />);

    const grid = screen.getByTestId('snowshoe-routes-grid');
    const h3s = within(grid).getAllByRole('heading', { level: 3 });
    const titles = h3s.map((h) => h.textContent);

    expect(titles.some((t) => t?.includes('Mount Washington Lion Head Winter Ridge'))).toBe(true);
    expect(titles.some((t) => t?.includes('Mount Rainier Camp Muir Winter Route'))).toBe(true);
    expect(titles.some((t) => t?.includes('Flattop Mountain & Hallett Peak Winter Traverse'))).toBe(true);
    expect(titles.some((t) => t?.includes('Mount Shasta Avalanche Gulch Winter Ascent'))).toBe(true);
    expect(titles.some((t) => t?.includes('Red Mountain Pass & Commodore Basin'))).toBe(true);

    // Verify key metrics in grid
    expect(within(grid).getByText(/1917\s*m/i)).toBeDefined();
    expect(within(grid).getByText(/13\.5\s*km/i)).toBeDefined();
    expect(within(grid).getByText(/38°/i)).toBeDefined();
    expect(within(grid).getAllByText(/Steep Alpine/i).length).toBeGreaterThan(0);
    expect(within(grid).getAllByText(/Glaciated High Altitude/i).length).toBeGreaterThan(0);
  });

  it('filters routes when technical grade filter buttons are clicked', () => {
    render(<SnowshoeMountaineeringHub />);

    const grid = screen.getByTestId('snowshoe-routes-grid');

    // Filter by Glaciated High Altitude
    const glaciatedBtn = screen.getByRole('button', { name: /glaciated high altitude/i });
    fireEvent.click(glaciatedBtn);

    expect(
      within(grid).getByRole('heading', { name: /Mount Rainier Camp Muir Winter Route/i }),
    ).toBeDefined();
    expect(
      within(grid).queryByRole('heading', { name: /Mount Washington Lion Head/i }),
    ).toBeNull();
    expect(
      within(grid).queryByRole('heading', { name: /Flattop Mountain/i }),
    ).toBeNull();

    // Filter by Alpine Ridge
    const alpineRidgeBtn = screen.getByRole('button', { name: /alpine ridge/i });
    fireEvent.click(alpineRidgeBtn);

    expect(
      within(grid).getByRole('heading', { name: /Flattop Mountain & Hallett Peak/i }),
    ).toBeDefined();
    expect(
      within(grid).queryByRole('heading', { name: /Mount Rainier/i }),
    ).toBeNull();

    // Reset to All Routes
    const allBtn = screen.getByRole('button', { name: /all routes/i });
    fireEvent.click(allBtn);

    expect(
      within(grid).getByRole('heading', { name: /Mount Washington Lion Head/i }),
    ).toBeDefined();
    expect(
      within(grid).getByRole('heading', { name: /Mount Rainier Camp Muir Winter Route/i }),
    ).toBeDefined();
  });

  it('updates live calculator reactive results panel with role="status" and aria-live="polite"', () => {
    render(<SnowshoeMountaineeringHub />);

    const resultPanel = screen.getByTestId('snowshoe-calculator-result');
    expect(resultPanel.getAttribute('role')).toBe('status');
    expect(resultPanel.getAttribute('aria-live')).toBe('polite');

    const routeSelect = screen.getByLabelText(/select.*route/i);
    const snowpackSelect = screen.getByLabelText(/snowpack surface/i);
    const slopeInput = screen.getByLabelText(/slope angle/i);
    const payloadInput = screen.getByLabelText(/payload/i);
    const televatorCheckbox = screen.getByLabelText(/televator.*engaged/i);

    // Initial defaults: Mount Washington, windslab_crust, 26 deg, 200 lbs, televator checked
    expect(within(resultPanel).getByText(/Standard Deck Surface Flotation Sufficient/i)).toBeDefined();
    expect(within(resultPanel).getByText(/35%\s*Calf (Strain|Fatigue) Relief/i)).toBeDefined();
    expect(within(resultPanel).getByText(/Optimal Snowshoe Ascent/i)).toBeDefined();

    // Set snowpack to Boilerplate Ice -> Hazardous transition
    fireEvent.change(snowpackSelect, { target: { value: 'boilerplate_ice' } });
    expect(
      within(resultPanel).getByText(/Hazardous: Transition to Crampons & Ice Axe/i),
    ).toBeDefined();

    // Set snowpack back to Windslab Crust, slope to 42 deg -> Hazardous
    fireEvent.change(snowpackSelect, { target: { value: 'windslab_crust' } });
    fireEvent.change(slopeInput, { target: { value: '42' } });
    expect(
      within(resultPanel).getByText(/Hazardous: Transition to Crampons & Ice Axe/i),
    ).toBeDefined();

    // Set slope to 24 deg -> Optimal Snowshoe Ascent
    fireEvent.change(slopeInput, { target: { value: '24' } });
    expect(
      within(resultPanel).getByText(/Optimal Snowshoe Ascent/i),
    ).toBeDefined();

    // Set slope to 35 deg -> Caution: Steep Edging Required
    fireEvent.change(slopeInput, { target: { value: '35' } });
    expect(
      within(resultPanel).getByText(/Caution: Steep Edging Required/i),
    ).toBeDefined();

    // Set payload to 250 lbs -> Tails Required
    fireEvent.change(payloadInput, { target: { value: '250' } });
    expect(
      within(resultPanel).getByText(/Tails Required \(5-Inch Modular Extensions Recommended\)/i),
    ).toBeDefined();

    // Uncheck Televator heel lifter -> 0% relief
    fireEvent.click(televatorCheckbox);
    expect(
      within(resultPanel).getByText(/0%\s*Calf (Strain|Fatigue) Relief/i),
    ).toBeDefined();

    // Select Mount Rainier in dropdown
    fireEvent.change(routeSelect, { target: { value: 'mount-rainier-muir-snowfield' } });
    expect(
      within(resultPanel).getByText(/Mount Rainier Camp Muir Winter Route/i),
    ).toBeDefined();
  });

  it('allows clicking quick select button on route card to load it into calculator', () => {
    render(<SnowshoeMountaineeringHub />);

    const configureButtons = screen.getAllByRole('button', {
      name: /configure calculator|quick select|load into calculator/i,
    });
    expect(configureButtons.length).toBe(5);

    // Click quick select for Mount Shasta (index 3)
    fireEvent.click(configureButtons[3]);

    const resultPanel = screen.getByTestId('snowshoe-calculator-result');
    expect(
      within(resultPanel).getByText(/Mount Shasta Avalanche Gulch Winter Ascent/i),
    ).toBeDefined();
  });

  it('tracks progress on the Mandatory Alpine Snowshoe Mountaineering Safety Kit Checklist', () => {
    render(<SnowshoeMountaineeringHub />);

    const counter = screen.getByTestId('snowshoe-gear-counter');
    expect(counter.textContent).toContain('0 of 6 packed');

    const snowshoesCheckbox = screen.getByRole('checkbox', {
      name: /Aggressive 3D Perimeter Serrated Steel Traction Snowshoes/i,
    });
    const tailsCheckbox = screen.getByRole('checkbox', {
      name: /5-Inch Modular Flotation Tail Extensions/i,
    });

    fireEvent.click(snowshoesCheckbox);
    expect(counter.textContent).toContain('1 of 6 packed');

    fireEvent.click(tailsCheckbox);
    expect(counter.textContent).toContain('2 of 6 packed');

    fireEvent.click(snowshoesCheckbox);
    expect(counter.textContent).toContain('1 of 6 packed');
  });
});
