import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import DogsleddingHub from './dogsledding-hub';

describe('DogsleddingHub Component', () => {
  it('renders required h2 section headings and h3 trail card headings without skipping levels', () => {
    render(<DogsleddingHub />);

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Iconic Wilderness Dogsledding Routes/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Sled Team Pacing & Nutrition Calculator/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Mandatory Mushing & Dog Welfare Kit Checklist/i,
      })
    ).toBeDefined();

    // Verify h3 card headings for all 5 routes
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Iditarod National Historic Trail Mushing Traverse/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Boundary Waters Frozen Lakes Wilderness Circuit/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Yukon Quest Eagle Summit Alpine Crossing/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Denali Wilderness National Park Sled Patrol/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Allagash Wilderness Waterway Winter Trail/i,
      })
    ).toBeDefined();
  });

  it('filters trail cards by difficulty button pills', () => {
    render(<DogsleddingHub />);

    // Filter by Beginner
    const beginnerButton = screen.getByRole('button', { name: /^Beginner$/i });
    fireEvent.click(beginnerButton);

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Allagash Wilderness Waterway Winter Trail/i,
      })
    ).toBeDefined();
    expect(
      screen.queryByRole('heading', {
        level: 3,
        name: /Iditarod National Historic Trail Mushing Traverse/i,
      })
    ).toBeNull();
    expect(
      screen.queryByRole('heading', {
        level: 3,
        name: /Yukon Quest Eagle Summit Alpine Crossing/i,
      })
    ).toBeNull();

    // Filter by Expedition Extreme
    const extremeButton = screen.getByRole('button', { name: /^Expedition Extreme$/i });
    fireEvent.click(extremeButton);

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Iditarod National Historic Trail Mushing Traverse/i,
      })
    ).toBeDefined();
    expect(
      screen.queryByRole('heading', {
        level: 3,
        name: /Allagash Wilderness Waterway Winter Trail/i,
      })
    ).toBeNull();

    // Filter by Intermediate
    const intermediateButton = screen.getByRole('button', { name: /^Intermediate$/i });
    fireEvent.click(intermediateButton);

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Boundary Waters Frozen Lakes Wilderness Circuit/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Denali Wilderness National Park Sled Patrol/i,
      })
    ).toBeDefined();
    expect(
      screen.queryByRole('heading', {
        level: 3,
        name: /Yukon Quest Eagle Summit Alpine Crossing/i,
      })
    ).toBeNull();

    // Reset to All Trails
    const allButton = screen.getByRole('button', { name: /^All Trails$/i });
    fireEvent.click(allButton);
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Iditarod National Historic Trail Mushing Traverse/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Allagash Wilderness Waterway Winter Trail/i,
      })
    ).toBeDefined();
  });

  it('allows selecting a route from the trail card to populate the calculator', () => {
    render(<DogsleddingHub />);

    // Click "Select Route for Calculator" on Yukon Quest card
    const yukonCard = screen.getByTestId('route-card-yukon-quest-eagle-summit');
    const selectBtn = within(yukonCard).getByRole('button', {
      name: /Select Route for Calculator/i,
    });
    fireEvent.click(selectBtn);

    const trailSelect = screen.getByLabelText(/Select Expedition Route/i) as HTMLSelectElement;
    expect(trailSelect.value).toBe('yukon-quest-eagle-summit');

    const resultPanel = screen.getByTestId('dogsledding-calculator-result');
    expect(within(resultPanel).getByText(/Yukon Quest Eagle Summit Alpine Crossing/i)).toBeDefined();
  });

  it('updates live pacing, calories, hydration, and safety advisory in calculator status region', () => {
    render(<DogsleddingHub />);

    const trailSelect = screen.getByLabelText(/Select Expedition Route/i);
    const dogCountInput = screen.getByLabelText(/Team Dog Count/i);
    const tempInput = screen.getByLabelText(/Ambient Temperature/i);
    const cargoInput = screen.getByLabelText(/Cargo Weight/i);
    const hoursInput = screen.getByLabelText(/Daily Running Hours/i);
    const surfaceSelect = screen.getByLabelText(/Trail Surface/i);

    const status = screen.getByTestId('dogsledding-calculator-result');
    expect(status.getAttribute('role')).toBe('status');
    expect(status.getAttribute('aria-live')).toBe('polite');

    // Switch to Iditarod
    fireEvent.change(trailSelect, { target: { value: 'iditarod-historic-trail-traverse' } });
    fireEvent.change(dogCountInput, { target: { value: '14' } });
    fireEvent.change(tempInput, { target: { value: '-15' } });
    fireEvent.change(cargoInput, { target: { value: '80' } });
    fireEvent.change(hoursInput, { target: { value: '8' } });
    fireEvent.change(surfaceSelect, { target: { value: 'windblown_tundra_sea_ice' } });

    // 14 dogs: melt water = 14 * 4.0 = 56 L
    expect(within(status).getByText(/56 L/i)).toBeDefined();
    // 14 * 16 = 224 booties
    expect(within(status).getByText(/224 booties/i)).toBeDefined();

    // Trigger critical cold (< -45°F)
    fireEvent.change(tempInput, { target: { value: '-50' } });
    expect(within(status).getByTestId('dogsled-safety-status-badge').textContent).toBe('Critical Hazard');
    expect(within(status).getByText(/Extreme arctic deep freeze/i)).toBeDefined();

    // Trigger caution (e.g. -30°F)
    fireEvent.change(tempInput, { target: { value: '-30' } });
    expect(within(status).getByTestId('dogsled-safety-status-badge').textContent).toBe('Caution');

    // Return to optimal (-10°F)
    fireEvent.change(tempInput, { target: { value: '-10' } });
    expect(within(status).getByTestId('dogsled-safety-status-badge').textContent).toBe('Optimal');
  });

  it('updates gear checklist counter with data-testid="dogsled-gear-counter"', () => {
    render(<DogsleddingHub />);

    const counter = screen.getByTestId('dogsled-gear-counter');
    expect(counter.textContent).toBe('0 of 6 packed');

    const bootiesCheckbox = screen.getByLabelText(/Cordura \/ Polar Fleece Sled Dog Booties/i);
    const hookCheckbox = screen.getByLabelText(/Dual-Claw Welded Steel Snow Hook/i);
    const cableCheckbox = screen.getByLabelText(/Vinyl-Coated Aircraft Cable Gangline/i);

    fireEvent.click(bootiesCheckbox);
    expect(counter.textContent).toBe('1 of 6 packed');

    fireEvent.click(hookCheckbox);
    expect(counter.textContent).toBe('2 of 6 packed');

    fireEvent.click(cableCheckbox);
    expect(counter.textContent).toBe('3 of 6 packed');

    fireEvent.click(bootiesCheckbox);
    expect(counter.textContent).toBe('2 of 6 packed');
  });
});
