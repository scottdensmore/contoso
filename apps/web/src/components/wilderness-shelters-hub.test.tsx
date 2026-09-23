import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import WildernessSheltersHub from './wilderness-shelters-hub';

describe('WildernessSheltersHub Component', () => {
  it('renders required h2 section headings and h3 shelter card headings without skipping levels', () => {
    render(<WildernessSheltersHub />);

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Survival Shelter Designs & Field Architectures/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Shelter Thermodynamics & Air-Well Calculator/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Mandatory Survival Shelter & Snow Bivy Kit Checklist/i,
      })
    ).toBeDefined();

    // Verify h3 card headings for all 5 shelters
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Deep Drift Alpine Snow Cave with Cold-Air Well/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Sintered Subarctic Quinzhee Snow Mound/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Emergency Hypothermia Snow Trench with Ski Roof/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Boreal Forest Heavy Debris Thermal Cocoon/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Conifer Tree-Well Natural Snow Shelter/i,
      })
    ).toBeDefined();
  });

  it('filters shelter cards by difficulty buttons', () => {
    render(<WildernessSheltersHub />);

    // Initial state: all 5 visible
    expect(screen.getByRole('heading', { level: 3, name: /Deep Drift Alpine Snow Cave/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Emergency Hypothermia Snow Trench/i })).toBeDefined();

    // Filter by Beginner
    const beginnerBtn = screen.getByRole('button', { name: /^Beginner$/i });
    fireEvent.click(beginnerBtn);

    expect(screen.getByRole('heading', { level: 3, name: /Emergency Hypothermia Snow Trench/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Conifer Tree-Well Natural Snow Shelter/i })).toBeDefined();
    expect(screen.queryByRole('heading', { level: 3, name: /Deep Drift Alpine Snow Cave/i })).toBeNull();
    expect(screen.queryByRole('heading', { level: 3, name: /Sintered Subarctic Quinzhee/i })).toBeNull();
    expect(screen.queryByRole('heading', { level: 3, name: /Boreal Forest Heavy Debris/i })).toBeNull();

    // Filter by Intermediate
    const intermediateBtn = screen.getByRole('button', { name: /^Intermediate$/i });
    fireEvent.click(intermediateBtn);

    expect(screen.getByRole('heading', { level: 3, name: /Sintered Subarctic Quinzhee/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Boreal Forest Heavy Debris/i })).toBeDefined();
    expect(screen.queryByRole('heading', { level: 3, name: /Emergency Hypothermia Snow Trench/i })).toBeNull();

    // Filter by Advanced
    const advancedBtn = screen.getByRole('button', { name: /^Advanced$/i });
    fireEvent.click(advancedBtn);

    expect(screen.getByRole('heading', { level: 3, name: /Deep Drift Alpine Snow Cave/i })).toBeDefined();
    expect(screen.queryByRole('heading', { level: 3, name: /Sintered Subarctic Quinzhee/i })).toBeNull();

    // Reset to All Shelters
    const allBtn = screen.getByRole('button', { name: /^All Shelters$/i });
    fireEvent.click(allBtn);

    expect(screen.getByRole('heading', { level: 3, name: /Deep Drift Alpine Snow Cave/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Emergency Hypothermia Snow Trench/i })).toBeDefined();
  });

  it('displays card metrics, descriptions, and highlights', () => {
    render(<WildernessSheltersHub />);

    expect(screen.getByText(/3.5 hrs/i)).toBeDefined();
    expect(screen.getAllByText(/2 persons/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/\+32°F/i)).toBeDefined();
    expect(screen.getAllByText(/30 cm/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/2.0 m/i)).toBeDefined();
    expect(screen.getByText(/Raised sleeping platform above cold trap/i)).toBeDefined();
    expect(screen.getByText(/Angled ski-pole ventilation chimney/i)).toBeDefined();
  });

  it('allows selecting a shelter directly from a card into the calculator', () => {
    render(<WildernessSheltersHub />);

    const selectButtons = screen.getAllByRole('button', { name: /Select for Calculator/i });
    expect(selectButtons.length).toBe(5);

    // Click on 2nd card (Quinzhee)
    fireEvent.click(selectButtons[1]);

    const resultPanel = screen.getByTestId('shelter-calculator-result');
    expect(within(resultPanel).getByText(/Sintered Subarctic Quinzhee Snow Mound/i)).toBeDefined();
  });

  it('updates live calculator results panel when inputs are modified', () => {
    render(<WildernessSheltersHub />);

    const resultPanel = screen.getByTestId('shelter-calculator-result');
    expect(resultPanel).toBeDefined();

    // Initial default state
    expect(within(resultPanel).getByText(/32°F/i)).toBeDefined();
    expect(within(resultPanel).getByText(/18°F/i)).toBeDefined();
    expect(within(resultPanel).getByText(/R-11.8/i)).toBeDefined();
    expect(within(resultPanel).getByText(/\+14°F/i)).toBeDefined();
    expect(within(resultPanel).getByText(/200%/i)).toBeDefined();
    expect(within(resultPanel).getByText(/Safe/i)).toBeDefined();

    // Change ambient temp
    const ambientInput = screen.getByLabelText(/Ambient Air Temperature/i);
    fireEvent.change(ambientInput, { target: { value: '-20' } });

    // Change wall thickness
    const wallInput = screen.getByLabelText(/Snow Wall \/ Roof Thickness/i);
    fireEvent.change(wallInput, { target: { value: '50' } });

    // R-value should update to 50 / 2.54 = 19.7
    expect(within(resultPanel).getByText(/R-19.7/i)).toBeDefined();

    // Change platform height
    const platformInput = screen.getByLabelText(/Sleeping Shelf Height Above Floor/i);
    fireEvent.change(platformInput, { target: { value: '45' } });

    // Differential becomes Math.min(18, Math.round((45/30)*12)) = 18
    expect(within(resultPanel).getByText(/\+18°F/i)).toBeDefined();

    // Toggle candle lantern
    const candleCheckbox = screen.getByLabelText(/Light Survival Candle Lantern/i);
    fireEvent.click(candleCheckbox);

    // Hazard test: decrease vent hole to 5 cm
    const ventInput = screen.getByLabelText(/Ventilation Hole Diameter/i);
    fireEvent.change(ventInput, { target: { value: '5' } });

    expect(within(resultPanel).getByText(/^Critical Hazard$/i)).toBeDefined();
    expect(within(resultPanel).getByText(/Ventilation chimney diameter/i)).toBeDefined();

    // Caution test: set vent hole to 7 cm, platform to 15 cm
    fireEvent.change(ventInput, { target: { value: '7' } });
    expect(within(resultPanel).getByText(/^Caution$/i)).toBeDefined();
  });

  it('updates gear checklist counter with data-testid="shelter-gear-counter"', () => {
    render(<WildernessSheltersHub />);

    const counter = screen.getByTestId('shelter-gear-counter');
    expect(counter.textContent).toBe('0 of 6 packed');

    const shovelCheckbox = screen.getByLabelText(/Tempered Aluminum Extendable D-Grip Snow Shovel/i);
    const sawCheckbox = screen.getByLabelText(/35cm Stainless Steel Aggressive Tooth Snow & Wood Saw/i);
    const bivyCheckbox = screen.getByLabelText(/Waterproof Breathable Reflective Thermal Survival Bivy Sack/i);

    fireEvent.click(shovelCheckbox);
    expect(counter.textContent).toBe('1 of 6 packed');

    fireEvent.click(sawCheckbox);
    expect(counter.textContent).toBe('2 of 6 packed');

    fireEvent.click(bivyCheckbox);
    expect(counter.textContent).toBe('3 of 6 packed');

    // Uncheck shovel
    fireEvent.click(shovelCheckbox);
    expect(counter.textContent).toBe('2 of 6 packed');
  });
});
