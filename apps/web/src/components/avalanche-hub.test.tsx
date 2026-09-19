import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import AvalancheHub from './avalanche-hub';

describe('AvalancheHub Component', () => {
  it('renders all required section headings and subheadings with correct hierarchy', () => {
    render(<AvalancheHub />);

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /North American Public Avalanche Danger Scale & Zone Advisories/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Slope Angle Safety & Terrain Evaluator/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Companion Rescue Essential Gear & Trailhead Check/i,
      })
    ).toBeDefined();
  });

  it('updates forecast zone selection and displays elevation danger ratings and active problems', () => {
    render(<AvalancheHub />);

    const zoneSelect = screen.getByLabelText(/Select Avalanche Forecast Zone/i);
    expect(zoneSelect).toBeDefined();

    // Select Mount Baker
    fireEvent.change(zoneSelect, { target: { value: 'mount-baker' } });

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Mount Baker / West Slopes North',
      })
    ).toBeDefined();
    expect(screen.getByText(/High avalanche danger above treeline/i)).toBeDefined();

    // Check problems for Mount Baker
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Storm Slab',
      })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Cornice Fall',
      })
    ).toBeDefined();

    // Select Stevens Pass
    fireEvent.change(zoneSelect, { target: { value: 'stevens-pass' } });
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Stevens Pass / Cascade Crest',
      })
    ).toBeDefined();
    expect(screen.getByText(/Considerable danger above and near treeline/i)).toBeDefined();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Wind Slab',
      })
    ).toBeDefined();
  });

  it('evaluates slope angles with dynamic live feedback', () => {
    render(<AvalancheHub />);

    const statusRegion = screen.getByRole('status');

    // Default angle is 36 deg (prime terrain)
    expect(within(statusRegion).getByText('PRIME AVALANCHE TERRAIN (30°-45°)')).toBeDefined();

    const slider = screen.getByLabelText(/Slope Angle \(/i);
    expect(slider).toBeDefined();

    // Change to 24 deg (low angle safe)
    fireEvent.change(slider, { target: { value: '24' } });
    expect(within(statusRegion).getByText('LOW-ANGLE TERRAIN (<30°)')).toBeDefined();
    expect(within(statusRegion).getByText(/Slopes under 30° generally do not produce avalanches/i)).toBeDefined();

    // Change to 37 deg (prime avalanche terrain)
    fireEvent.change(slider, { target: { value: '37' } });
    expect(within(statusRegion).getByText('PRIME AVALANCHE TERRAIN (30°-45°)')).toBeDefined();
    expect(within(statusRegion).getByText(/Travel one at a time across avalanche paths/i)).toBeDefined();

    // Change to 50 deg (extreme steep terrain)
    fireEvent.change(slider, { target: { value: '50' } });
    expect(within(statusRegion).getByText('EXTREME STEEP TERRAIN (>45°)')).toBeDefined();
    expect(within(statusRegion).getByText('AVOID ALL AVALANCHE TERRAIN')).toBeDefined();
  });

  it('allows changing elevation band and aspect in the terrain evaluator', () => {
    render(<AvalancheHub />);

    const elevationSelect = screen.getByLabelText(/Elevation Band/i);
    fireEvent.change(elevationSelect, { target: { value: 'below_treeline' } });

    const aspectSelect = screen.getByLabelText(/Aspect \/ Slope Orientation/i);
    fireEvent.change(aspectSelect, { target: { value: 'NW' } });

    expect(elevationSelect).toHaveValue('below_treeline');
    expect(aspectSelect).toHaveValue('NW');
  });

  it('displays companion rescue gear checklist and allows toggling checklist items', () => {
    render(<AvalancheHub />);

    expect(screen.getByText(/Trailhead Transceiver Check Protocol/i)).toBeDefined();

    const beaconCheckbox = screen.getByLabelText(/Avalanche Transceiver/i) as HTMLInputElement;
    expect(beaconCheckbox).toBeDefined();
    expect(beaconCheckbox.checked).toBe(false);

    fireEvent.click(beaconCheckbox);
    expect(beaconCheckbox.checked).toBe(true);

    const probeCheckbox = screen.getByLabelText(/Collapsible Avalanche Probe/i) as HTMLInputElement;
    fireEvent.click(probeCheckbox);
    expect(probeCheckbox.checked).toBe(true);

    const shovelCheckbox = screen.getByLabelText(/Extendable Metal Snow Shovel/i) as HTMLInputElement;
    fireEvent.click(shovelCheckbox);
    expect(shovelCheckbox.checked).toBe(true);

    // Assert progress counter updates
    expect(screen.getByText(/3 of 5 Essential Items Verified/i)).toBeDefined();
  });
});
