import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import SnowkitingHub from './snowkiting-hub';

describe('SnowkitingHub Component', () => {
  it('renders all main sections with h2 headings and no skipped heading levels', () => {
    render(<SnowkitingHub />);

    const h2s = screen.getAllByRole('heading', { level: 2 });
    const headings = h2s.map((h) => h.textContent);

    expect(
      headings.some((h) => /snowkiting.*spots|polar.*expedition/i.test(h || ''))
    ).toBe(true);
    expect(
      headings.some((h) => /kite sizing|pulk hauling calculator/i.test(h || ''))
    ).toBe(true);
    expect(
      headings.some((h) => /checklist|safety kit/i.test(h || ''))
    ).toBe(true);
  });

  it('renders spot cards with h3 headings and key expedition metrics', () => {
    render(<SnowkitingHub />);

    const grid = screen.getByTestId('snowkiting-spots-grid');
    const h3s = within(grid).getAllByRole('heading', { level: 3 });
    const titles = h3s.map((h) => h.textContent);

    expect(titles.some((t) => t?.includes('Hardangervidda Polar Plateau'))).toBe(true);
    expect(titles.some((t) => t?.includes('Camas Prairie High Basin'))).toBe(true);
    expect(titles.some((t) => t?.includes('Col du Lautaret Alpine Basin'))).toBe(true);
    expect(titles.some((t) => t?.includes('Lake Mille Lacs Frozen Expanse'))).toBe(true);
    expect(titles.some((t) => t?.includes('Greenland Ice Sheet South-to-North Route'))).toBe(true);

    // Verify key metrics in grid
    expect(within(grid).getByText(/1250\s*m/i)).toBeDefined();
    expect(within(grid).getByText(/2500\s*m/i)).toBeDefined();
    expect(within(grid).getAllByText(/Norway/i).length).toBeGreaterThan(0);
    expect(within(grid).getAllByText(/Greenland/i).length).toBeGreaterThan(0);
    expect(within(grid).getAllByText(/Expedition Pulk Friendly/i).length).toBeGreaterThan(0);
  });

  it('filters spots when terrain filter buttons are clicked', () => {
    render(<SnowkitingHub />);

    const grid = screen.getByTestId('snowkiting-spots-grid');

    // Filter by Polar Plateau
    const plateauBtn = screen.getByRole('button', { name: /polar plateau/i });
    fireEvent.click(plateauBtn);

    expect(
      within(grid).getByRole('heading', { name: /Hardangervidda Polar Plateau/i })
    ).toBeDefined();
    expect(within(grid).queryByRole('heading', { name: /Camas Prairie/i })).toBeNull();
    expect(within(grid).queryByRole('heading', { name: /Greenland Ice Sheet/i })).toBeNull();

    // Filter by Ice Sheet
    const iceSheetBtn = screen.getByRole('button', { name: /ice sheet/i });
    fireEvent.click(iceSheetBtn);

    expect(
      within(grid).getByRole('heading', { name: /Greenland Ice Sheet South-to-North Route/i })
    ).toBeDefined();
    expect(within(grid).queryByRole('heading', { name: /Hardangervidda/i })).toBeNull();

    // Reset to All Spots
    const allBtn = screen.getByRole('button', { name: /all spots/i });
    fireEvent.click(allBtn);

    expect(
      within(grid).getByRole('heading', { name: /Hardangervidda Polar Plateau/i })
    ).toBeDefined();
    expect(
      within(grid).getByRole('heading', { name: /Camas Prairie High Basin/i })
    ).toBeDefined();
    expect(
      within(grid).getByRole('heading', { name: /Greenland Ice Sheet South-to-North Route/i })
    ).toBeDefined();
  });

  it('updates live calculator reactive results panel with role="status" and aria-live="polite"', () => {
    render(<SnowkitingHub />);

    const resultPanel = screen.getByTestId('snowkiting-calculator-result');
    expect(resultPanel.getAttribute('role')).toBe('status');
    expect(resultPanel.getAttribute('aria-live')).toBe('polite');

    const spotSelect = screen.getByLabelText(/select.*snowkiting spot/i);
    const riderWeightInput = screen.getByLabelText(/rider weight/i);
    const pulkWeightInput = screen.getByLabelText(/pulk weight/i);
    const windSpeedInput = screen.getByLabelText(/wind speed/i);
    const snowSurfaceSelect = screen.getByLabelText(/snow surface/i);
    const kiteTypeSelect = screen.getByLabelText(/kite type/i);

    // Initial default: Hardangervidda, 75kg rider, 20kg pulk, 16kt wind, hardpack_crust, closed_cell
    expect(within(resultPanel).getByText(/11\.2\s*m²/i)).toBeDefined();
    expect(within(resultPanel).getByText(/83%/i)).toBeDefined();
    expect(within(resultPanel).getByText(/^Approved$/i)).toBeDefined();
    expect(within(resultPanel).getByText(/OPTIMAL POWER/i)).toBeDefined();

    // Adjust wind speed to 35 knots -> triggers hazardous storm force
    fireEvent.change(windSpeedInput, { target: { value: '35' } });
    expect(within(resultPanel).getByText(/Hazardous: Storm Force/i)).toBeDefined();
    expect(within(resultPanel).getByText(/STORM FORCE HAZARD/i)).toBeDefined();

    // Reset wind to 16, set pulk to 70kg -> triggers caution_high_load
    fireEvent.change(windSpeedInput, { target: { value: '16' } });
    fireEvent.change(pulkWeightInput, { target: { value: '70' } });
    expect(within(resultPanel).getByText(/Caution: High Load/i)).toBeDefined();
    expect(within(resultPanel).getByText(/HIGH LOAD CAUTION/i)).toBeDefined();

    // Adjust rider weight
    fireEvent.change(riderWeightInput, { target: { value: '85' } });
    expect(within(resultPanel).getByText(/Payload:\s*155\s*kg/i)).toBeDefined();

    // Adjust snow surface to sastrugi_drift (friction 0.22, glide 27%)
    fireEvent.change(snowSurfaceSelect, { target: { value: 'sastrugi_drift' } });
    expect(within(resultPanel).getByText(/27%/i)).toBeDefined();
    expect(within(resultPanel).getByText(/0\.22/i)).toBeDefined();

    // Change kite type to tube kite at 26 knots wind -> triggers hazardous storm force
    fireEvent.change(windSpeedInput, { target: { value: '26' } });
    fireEvent.change(kiteTypeSelect, {
      target: { value: 'inflatable_leading_edge_tubekite' },
    });
    expect(within(resultPanel).getByText(/Hazardous: Storm Force/i)).toBeDefined();
    expect(within(resultPanel).getByText(/Inflatable tube kites/i)).toBeDefined();

    // Change spot to Greenland
    fireEvent.change(spotSelect, { target: { value: 'greenland-icecap-traverse' } });
    expect(
      within(resultPanel).getByText(/Greenland Ice Sheet South-to-North Route/i)
    ).toBeDefined();

    // Set low wind (8 knots) -> UNDERPOWERED
    fireEvent.change(windSpeedInput, { target: { value: '8' } });
    expect(within(resultPanel).getByText(/UNDERPOWERED/i)).toBeDefined();
  });

  it('allows clicking "Configure Calculator for this Spot" button on a card to select it', () => {
    render(<SnowkitingHub />);

    const configureButtons = screen.getAllByRole('button', {
      name: /configure calculator/i,
    });
    expect(configureButtons.length).toBe(5);

    // Click the button for Greenland (index 4)
    fireEvent.click(configureButtons[4]);

    const resultPanel = screen.getByTestId('snowkiting-calculator-result');
    expect(
      within(resultPanel).getByText(/Greenland Ice Sheet South-to-North Route/i)
    ).toBeDefined();
  });

  it('tracks progress on the Mandatory Polar Snowkiting Safety Kit Checklist', () => {
    render(<SnowkitingHub />);

    const counter = screen.getByTestId('snowkiting-gear-counter');
    expect(counter.textContent).toContain('0 of 6 packed');

    const kiteCheckbox = screen.getByRole('checkbox', {
      name: /Closed-Cell High-Depower Ultralight Foil Kite/i,
    });
    const harnessCheckbox = screen.getByRole('checkbox', {
      name: /CE Certified Mountaineering\/Snowkite Seat Harness/i,
    });

    fireEvent.click(kiteCheckbox);
    expect(counter.textContent).toContain('1 of 6 packed');

    fireEvent.click(harnessCheckbox);
    expect(counter.textContent).toContain('2 of 6 packed');

    fireEvent.click(kiteCheckbox);
    expect(counter.textContent).toContain('1 of 6 packed');
  });
});
