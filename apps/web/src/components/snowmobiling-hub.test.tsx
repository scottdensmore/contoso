import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import SnowmobilingHub from './snowmobiling-hub';

describe('SnowmobilingHub Component', () => {
  it('renders required h2 section headings and h3 zone card headings without skipping levels', () => {
    render(<SnowmobilingHub />);

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Iconic Mountain Snowmobile Zones/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Mountain Sled & Elevation Performance Calculator/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Avalanche & Mountain Sled Safety Checklist/i,
      })
    ).toBeDefined();

    // Verify h3 card headings for all 5 zones
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Boulder Mountain & Frisby Ridge/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Daisy Pass & Henderson Mountain/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Togwotee Pass & Continental Divide/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Monts Chic-Chocs & Haute-Gaspésie/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Rabbit Ears Pass & Buffalo Pass/i,
      })
    ).toBeDefined();
  });

  it('filters zone cards by riding style buttons', () => {
    render(<SnowmobilingHub />);

    // Filter by Chute Climbing
    const chuteButton = screen.getByRole('button', { name: /^Chute Climbing$/i });
    fireEvent.click(chuteButton);

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Daisy Pass & Henderson Mountain/i,
      })
    ).toBeDefined();
    expect(
      screen.queryByRole('heading', {
        level: 3,
        name: /Boulder Mountain & Frisby Ridge/i,
      })
    ).toBeNull();
    expect(
      screen.queryByRole('heading', {
        level: 3,
        name: /Togwotee Pass & Continental Divide/i,
      })
    ).toBeNull();

    // Filter by Boondocking Meadows
    const boondockButton = screen.getByRole('button', { name: /^Boondocking Meadows$/i });
    fireEvent.click(boondockButton);

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Togwotee Pass & Continental Divide/i,
      })
    ).toBeDefined();
    expect(
      screen.queryByRole('heading', {
        level: 3,
        name: /Daisy Pass & Henderson Mountain/i,
      })
    ).toBeNull();

    // Filter by Steep Sidehilling
    const sidehillButton = screen.getByRole('button', { name: /^Steep Sidehilling$/i });
    fireEvent.click(sidehillButton);

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Rabbit Ears Pass & Buffalo Pass/i,
      })
    ).toBeDefined();

    // Reset to All Zones
    const allButton = screen.getByRole('button', { name: /^All Zones$/i });
    fireEvent.click(allButton);
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Boulder Mountain & Frisby Ridge/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Monts Chic-Chocs & Haute-Gaspésie/i,
      })
    ).toBeDefined();
  });

  it('updates live calculator status when changing zone, track, engine, snowpack, and weight', () => {
    render(<SnowmobilingHub />);

    const zoneSelect = screen.getByLabelText(/Select Mountain Zone/i);
    const trackSelect = screen.getByLabelText(/Track Length/i);
    const lugSelect = screen.getByLabelText(/Lug Height/i);
    const engineSelect = screen.getByLabelText(/Engine Type/i);
    const weightInput = screen.getByLabelText(/Rider & Gear Weight/i);
    const snowpackSelect = screen.getByLabelText(/Snowpack Condition/i);

    const status = screen.getByTestId('snowmobiling-calculator-result');
    expect(status.getAttribute('role')).toBe('status');
    expect(status.getAttribute('aria-live')).toBe('polite');

    // Switch to Cooke City with naturally aspirated engine
    fireEvent.change(zoneSelect, { target: { value: 'cooke-city-daisy-pass' } });
    fireEvent.change(engineSelect, { target: { value: 'naturally_aspirated_850' } });
    fireEvent.change(trackSelect, { target: { value: '165' } });
    fireEvent.change(lugSelect, { target: { value: '2.6' } });
    fireEvent.change(weightInput, { target: { value: '90' } });
    fireEvent.change(snowpackSelect, { target: { value: 'deep_powder' } });

    expect(within(status).getByText(/Daisy Pass & Henderson Mountain/i)).toBeDefined();
    expect(within(status).getByText(/107.3 HP/i)).toBeDefined();
    expect(within(status).getByText(/35% Loss/i)).toBeDefined();

    // Toggle to Factory Turbo
    fireEvent.change(engineSelect, { target: { value: 'factory_turbo_850' } });
    expect(within(status).getByText(/165 HP/i)).toBeDefined();
    expect(within(status).getByText(/0% Loss/i)).toBeDefined();

    // Test flotation and sidehilling stability with 146" track in sugary facets
    fireEvent.change(trackSelect, { target: { value: '146' } });
    fireEvent.change(lugSelect, { target: { value: '2.25' } });
    fireEvent.change(snowpackSelect, { target: { value: 'sugary_facets' } });
    fireEvent.change(weightInput, { target: { value: '120' } });

    expect(within(status).getByText(/Nimble & Responsive/i)).toBeDefined();
    expect(within(status).getByText(/High trenching hazard/i)).toBeDefined();
  });

  it('updates gear checklist counter with data-testid="snowmobiling-gear-counter"', () => {
    render(<SnowmobilingHub />);

    const counter = screen.getByTestId('snowmobiling-gear-counter');
    expect(counter.textContent).toBe('0 of 6 packed');

    const airbagCheckbox = screen.getByLabelText(/Electronic Fan-Drive Avalanche Airbag/i);
    const beaconCheckbox = screen.getByLabelText(/Digital 3-Antenna Avalanche Transceiver/i);
    const tetherCheckbox = screen.getByLabelText(/Magnetic Engine Safety Cutoff Tether/i);

    fireEvent.click(airbagCheckbox);
    expect(counter.textContent).toBe('1 of 6 packed');

    fireEvent.click(beaconCheckbox);
    expect(counter.textContent).toBe('2 of 6 packed');

    fireEvent.click(tetherCheckbox);
    expect(counter.textContent).toBe('3 of 6 packed');

    fireEvent.click(airbagCheckbox);
    expect(counter.textContent).toBe('2 of 6 packed');
  });
});
