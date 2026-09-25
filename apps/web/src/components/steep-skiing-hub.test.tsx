import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import SteepSkiingHub from './steep-skiing-hub';

describe('SteepSkiingHub Component', () => {
  it('renders all main sections with h2 headings and no skipped heading levels', () => {
    render(<SteepSkiingHub />);

    const h2s = screen.getAllByRole('heading', { level: 2 });
    const headings = h2s.map((h) => h.textContent);

    expect(
      headings.some((h) => /couloir descents|iconic steep couloir/i.test(h || '')),
    ).toBe(true);
    expect(
      headings.some((h) => /steep couloir.*calculator|sluff dynamics/i.test(h || '')),
    ).toBe(true);
    expect(
      headings.some((h) => /checklist|ski mountaineering.*gear/i.test(h || '')),
    ).toBe(true);
  });

  it('renders couloir cards with h3 headings and key descent metrics', () => {
    render(<SteepSkiingHub />);

    const grid = screen.getByTestId('steep-skiing-couloirs-grid');
    const h3s = within(grid).getAllByRole('heading', { level: 3 });
    const titles = h3s.map((h) => h.textContent);

    expect(titles.some((t) => t?.includes("Corbet's Couloir & S&S Chute"))).toBe(true);
    expect(titles.some((t) => t?.includes('Tuckerman Ravine — The Lip & Center Headwall'))).toBe(true);
    expect(titles.some((t) => t?.includes('Silver Couloir — Buffalo Mountain'))).toBe(true);
    expect(titles.some((t) => t?.includes('Terminal Cancer Couloir'))).toBe(true);
    expect(titles.some((t) => t?.includes('Mount Superior — South Face & Suicide Chute'))).toBe(true);

    // Verify key metrics in grid
    expect(within(grid).getAllByText(/Teton Range, WY/i).length).toBeGreaterThan(0);
    expect(within(grid).getAllByText(/180\s*m/i).length).toBeGreaterThan(0);
    expect(within(grid).getAllByText(/3\.5\s*m/i).length).toBeGreaterThan(0);
    expect(within(grid).getAllByText(/Mandatory cornice entry air/i).length).toBeGreaterThan(0);
  });

  it('filters couloirs when grade filter buttons are clicked', () => {
    render(<SteepSkiingHub />);

    const grid = screen.getByTestId('steep-skiing-couloirs-grid');

    // Filter by Class 3 (50-55°)
    const class3Btn = screen.getByRole('button', { name: /class 3/i });
    fireEvent.click(class3Btn);

    expect(
      within(grid).getByRole('heading', { name: /Tuckerman Ravine/i }),
    ).toBeDefined();
    expect(
      within(grid).getByRole('heading', { name: /Mount Superior/i }),
    ).toBeDefined();
    expect(within(grid).queryByRole('heading', { name: /Corbet's Couloir/i })).toBeNull();
    expect(within(grid).queryByRole('heading', { name: /Terminal Cancer/i })).toBeNull();

    // Filter by Class 2 (45-50°)
    const class2Btn = screen.getByRole('button', { name: /class 2/i });
    fireEvent.click(class2Btn);

    expect(
      within(grid).getByRole('heading', { name: /Corbet's Couloir/i }),
    ).toBeDefined();
    expect(
      within(grid).getByRole('heading', { name: /Silver Couloir/i }),
    ).toBeDefined();
    expect(
      within(grid).getByRole('heading', { name: /Terminal Cancer/i }),
    ).toBeDefined();
    expect(within(grid).queryByRole('heading', { name: /Tuckerman Ravine/i })).toBeNull();

    // Reset to All Grades
    const allBtn = screen.getByRole('button', { name: /all grades/i });
    fireEvent.click(allBtn);

    expect(within(grid).getAllByRole('heading', { level: 3 }).length).toBe(5);
  });

  it('updates live calculator reactive results panel with role="status" and aria-live="polite"', () => {
    render(<SteepSkiingHub />);

    const resultPanel = screen.getByTestId('steep-skiing-calculator-result');
    expect(resultPanel.getAttribute('role')).toBe('status');
    expect(resultPanel.getAttribute('aria-live')).toBe('polite');

    const couloirSelect = screen.getByLabelText(/select.*couloir/i);
    const slopeAngleInput = screen.getByLabelText(/slope angle/i);
    const snowSurfaceSelect = screen.getByLabelText(/snow surface/i);
    const skierWeightInput = screen.getByLabelText(/skier weight/i);
    const sluffDistanceInput = screen.getByLabelText(/sluff release distance/i);

    // Initial default: Corbet's Couloir, 48 deg, packed_powder, 78 kg, 20 m
    expect(within(resultPanel).getByText(/53\.2\s*km\/h/i)).toBeDefined();
    expect(within(resultPanel).getByText(/1469\s*N/i)).toBeDefined();
    expect(within(resultPanel).getByText(/Severe Injury Risk/i)).toBeDefined();
    expect(within(resultPanel).getByText(/Hop Turns/i)).toBeDefined();

    // Adjust slope angle to 52 deg
    fireEvent.change(slopeAngleInput, { target: { value: '52' } });

    // Slope >= 52 triggers ski_belay_rappel
    expect(within(resultPanel).getByText(/Ski Belay \/ Rappel/i)).toBeDefined();

    // Change snow surface to corn_ice_firm
    fireEvent.change(snowSurfaceSelect, { target: { value: 'corn_ice_firm' } });
    // Slope >= 48 with corn_ice_firm -> catastrophic_unmitigated
    expect(within(resultPanel).getByText(/Catastrophic Unmitigated/i)).toBeDefined();

    // Change couloir to Terminal Cancer (choke 2.0m) with 44 deg
    fireEvent.change(couloirSelect, { target: { value: 'terminal-cancer-couloir' } });
    fireEvent.change(slopeAngleInput, { target: { value: '44' } });
    fireEvent.change(snowSurfaceSelect, { target: { value: 'packed_powder' } });

    // Choke <= 2.2m should recommend side_slipping_choke
    expect(within(resultPanel).getByText(/Side Slipping Choke/i)).toBeDefined();
    // Choke warning should appear for <= 2.5m
    expect(within(resultPanel).getByText(/Extreme choke restriction/i)).toBeDefined();

    // Adjust skier weight and sluff distance
    fireEvent.change(skierWeightInput, { target: { value: '90' } });
    fireEvent.change(sluffDistanceInput, { target: { value: '30' } });
    expect(within(resultPanel).getByText(/Skier weight: 90 kg/i)).toBeDefined();
    expect(within(resultPanel).getByText(/Release runout: 30 m/i)).toBeDefined();
  });

  it('allows clicking "Configure Calculator" button on a card to select it in the calculator', () => {
    render(<SteepSkiingHub />);

    const couloirSelect = screen.getByLabelText(/select.*couloir/i) as HTMLSelectElement;
    expect(couloirSelect.value).toBe('corbets-couloir-jackson');

    // Click configure on Mount Superior card
    const superiorBtn = screen.getByRole('button', {
      name: /configure.*mount superior/i,
    });
    fireEvent.click(superiorBtn);

    expect(couloirSelect.value).toBe('mount-superior-south-face');
  });

  it('tracks progress on the Mandatory Steep Skiing & Ski Mountaineering Checklist', () => {
    render(<SteepSkiingHub />);

    const counter = screen.getByTestId('steep-skiing-gear-counter');
    expect(counter.textContent).toBe('0 of 6 packed');

    const axesCheckbox = screen.getByLabelText(/Curved Ski Mountaineering Ice Axes/i);
    const cramponsCheckbox = screen.getByLabelText(/CNC Machined High-Angle Ski Crampons/i);

    fireEvent.click(axesCheckbox);
    expect(counter.textContent).toBe('1 of 6 packed');

    fireEvent.click(cramponsCheckbox);
    expect(counter.textContent).toBe('2 of 6 packed');

    fireEvent.click(axesCheckbox);
    expect(counter.textContent).toBe('1 of 6 packed');
  });
});
