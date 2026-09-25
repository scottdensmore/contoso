import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import WildIceHub from './wild-ice-hub';

describe('WildIceHub Component', () => {
  it('renders all main sections with h2 headings and no skipped heading levels', () => {
    render(<WildIceHub />);

    const h2s = screen.getAllByRole('heading', { level: 2 });
    const headings = h2s.map((h) => h.textContent);

    expect(
      headings.some((h) => /wild ice.*venues|touring venues/i.test(h || ''))
    ).toBe(true);
    expect(
      headings.some((h) => /acoustic ice thickness|bearing capacity calculator/i.test(h || ''))
    ).toBe(true);
    expect(
      headings.some((h) => /safety kit|checklist/i.test(h || ''))
    ).toBe(true);
  });

  it('renders venue cards with h3 headings and key touring metrics', () => {
    render(<WildIceHub />);

    const grid = screen.getByTestId('wild-ice-venues-grid');
    const h3s = within(grid).getAllByRole('heading', { level: 3 });
    const titles = h3s.map((h) => h.textContent);

    expect(titles.some((t) => t?.includes('Lake Mälaren & Stockholm Archipelago'))).toBe(true);
    expect(titles.some((t) => t?.includes('Lake Siljan & Orsa Wild Ice Circuit'))).toBe(true);
    expect(titles.some((t) => t?.includes('Lake Baikal & Olkhon Island Strait'))).toBe(true);
    expect(titles.some((t) => t?.includes('Lake Moraine & Bow Valley Alpine Tarns'))).toBe(true);
    expect(titles.some((t) => t?.includes('Chequamegon Bay & Apostle Islands Wild Ice'))).toBe(true);

    // Verify key metrics in grid
    expect(within(grid).getByText(/^1\s*m$/i)).toBeDefined();
    expect(within(grid).getByText(/1884\s*m/i)).toBeDefined();
    expect(within(grid).getByText(/35\s*km/i)).toBeDefined();
    expect(within(grid).getByText(/9\.0\s*cm|9\s*cm/i)).toBeDefined();
    expect(within(grid).getAllByText(/Black Ice/i).length).toBeGreaterThan(0);
    expect(within(grid).getAllByText(/White Snow Ice/i).length).toBeGreaterThan(0);
  });

  it('filters venues when ice type filter buttons are clicked', () => {
    render(<WildIceHub />);

    const grid = screen.getByTestId('wild-ice-venues-grid');

    // Filter by White Snow Ice
    const snowIceBtn = screen.getByRole('button', { name: /white snow ice/i });
    fireEvent.click(snowIceBtn);

    expect(
      within(grid).getByRole('heading', { name: /Lake Moraine & Bow Valley Alpine Tarns/i })
    ).toBeDefined();
    expect(
      within(grid).queryByRole('heading', { name: /Lake Mälaren/i })
    ).toBeNull();
    expect(
      within(grid).queryByRole('heading', { name: /Lake Baikal/i })
    ).toBeNull();

    // Filter by Black Ice
    const blackIceBtn = screen.getByRole('button', { name: /black ice/i });
    fireEvent.click(blackIceBtn);

    expect(
      within(grid).getByRole('heading', { name: /Lake Mälaren & Stockholm Archipelago/i })
    ).toBeDefined();
    expect(
      within(grid).queryByRole('heading', { name: /Lake Moraine/i })
    ).toBeNull();

    // Reset to All Venues
    const allBtn = screen.getByRole('button', { name: /all venues/i });
    fireEvent.click(allBtn);

    expect(
      within(grid).getByRole('heading', { name: /Lake Mälaren & Stockholm Archipelago/i })
    ).toBeDefined();
    expect(
      within(grid).getByRole('heading', { name: /Lake Moraine & Bow Valley Alpine Tarns/i })
    ).toBeDefined();
  });

  it('updates live calculator reactive results panel with role="status" and aria-live="polite"', () => {
    render(<WildIceHub />);

    const resultPanel = screen.getByTestId('wild-ice-calculator-result');
    expect(resultPanel.getAttribute('role')).toBe('status');
    expect(resultPanel.getAttribute('aria-live')).toBe('polite');

    const venueSelect = screen.getByLabelText(/select.*venue/i);
    const iceTypeSelect = screen.getByLabelText(/^Ice Type$/i);
    const thicknessInput = screen.getByLabelText(/measured.*thickness/i);
    const skaterWeightInput = screen.getByLabelText(/skater weight/i);
    const ambientTempInput = screen.getByLabelText(/ambient.*temp/i);

    // Initial default: Lake Mälaren, black_ice, 8.0 cm, 180 lbs, 22 F
    expect(within(resultPanel).getByText(/8(\.0)?\s*cm/i)).toBeDefined();
    expect(within(resultPanel).getByText(/3200\s*lbs/i)).toBeDefined();
    expect(within(resultPanel).getAllByText(/424\s*Hz/i).length).toBeGreaterThan(0);
    expect(within(resultPanel).getByText(/^Safe Touring Window$/i)).toBeDefined();

    // Set thickness to 3.0 cm -> Submersion hazard
    fireEvent.change(thicknessInput, { target: { value: '3.0' } });
    expect(within(resultPanel).getByText(/^Unsafe: Submersion Hazard$/i)).toBeDefined();

    // Adjust skater weight
    fireEvent.change(skaterWeightInput, { target: { value: '200' } });

    // Raise thickness to 10.0 cm -> Safe Touring Window
    fireEvent.change(thicknessInput, { target: { value: '10.0' } });
    expect(within(resultPanel).getByText(/^Safe Touring Window$/i)).toBeDefined();
    expect(within(resultPanel).getByText(/5000\s*lbs/i)).toBeDefined();

    // Select White Snow Ice -> 10.0 cm * 0.5 = 5.0 cm -> Marginal caution
    fireEvent.change(iceTypeSelect, { target: { value: 'white_snow_ice' } });
    expect(within(resultPanel).getByText(/5(\.0)?\s*cm/i)).toBeDefined();
    expect(within(resultPanel).getByText(/^Marginal: Caution & Pike Probing$/i)).toBeDefined();

    // Select Candled Ice -> 0 cm -> Unsafe
    fireEvent.change(iceTypeSelect, { target: { value: 'candled_ice' } });
    expect(within(resultPanel).getByText(/0(\.0)?\s*cm/i)).toBeDefined();
    expect(within(resultPanel).getByText(/Unsafe: Submersion Hazard/i)).toBeDefined();
    expect(within(resultPanel).getByText(/Muffled Decay/i)).toBeDefined();

    // Reset to black ice, 8 cm, set ambient temp to 38 F -> Unsafe
    fireEvent.change(iceTypeSelect, { target: { value: 'black_ice' } });
    fireEvent.change(thicknessInput, { target: { value: '8.0' } });
    fireEvent.change(ambientTempInput, { target: { value: '38' } });
    expect(within(resultPanel).getByText(/Unsafe: Submersion Hazard/i)).toBeDefined();

    // Set temp to 34 F -> Marginal
    fireEvent.change(ambientTempInput, { target: { value: '34' } });
    expect(within(resultPanel).getByText(/^Marginal: Caution & Pike Probing$/i)).toBeDefined();

    // Select another venue
    fireEvent.change(venueSelect, { target: { value: 'lake-baikal-olkhon' } });
    expect(within(resultPanel).getByText(/Lake Baikal & Olkhon Island Strait/i)).toBeDefined();
  });

  it('allows clicking "Configure Calculator for this Venue" button on a card to select it', () => {
    render(<WildIceHub />);

    const configureButtons = screen.getAllByRole('button', {
      name: /configure calculator|load into calculator/i,
    });
    expect(configureButtons.length).toBe(5);

    // Click button for Lake Moraine (index 3)
    fireEvent.click(configureButtons[3]);

    const resultPanel = screen.getByTestId('wild-ice-calculator-result');
    expect(
      within(resultPanel).getByText(/Lake Moraine & Bow Valley Alpine Tarns/i)
    ).toBeDefined();
  });

  it('tracks progress on the Mandatory Nordic Wild Ice Safety Kit Checklist', () => {
    render(<WildIceHub />);

    const counter = screen.getByTestId('wild-ice-gear-counter');
    expect(counter.textContent).toContain('0 of 6 packed');

    const clawsCheckbox = screen.getByRole('checkbox', {
      name: /Dual Hand Ice Claws/i,
    });
    const pikeCheckbox = screen.getByRole('checkbox', {
      name: /Hardened Chisel-Tip Ice Probing Pole/i,
    });

    fireEvent.click(clawsCheckbox);
    expect(counter.textContent).toContain('1 of 6 packed');

    fireEvent.click(pikeCheckbox);
    expect(counter.textContent).toContain('2 of 6 packed');

    fireEvent.click(clawsCheckbox);
    expect(counter.textContent).toContain('1 of 6 packed');
  });
});
