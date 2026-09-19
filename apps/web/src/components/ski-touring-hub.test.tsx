import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import SkiTouringHub from './ski-touring-hub';

describe('SkiTouringHub Component', () => {
  it('renders all required section headings with correct h2 hierarchy', () => {
    render(<SkiTouringHub />);

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Backcountry Ski Touring & Splitboard Routes/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Skinning Pace & Tour Duration Calculator/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Skin Track Etiquette & Uphill Travel Policies/i,
      })
    ).toBeDefined();
  });

  it('filters route catalog cards by difficulty pills', () => {
    render(<SkiTouringHub />);

    // Initially all 5 routes should be visible
    expect(screen.getByRole('heading', { level: 3, name: /Camp Muir Snowfield/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Kendall Lakes Peak & Knob/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Artist Point to Table Mountain/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Silver Basin & Three Way Peak/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Diamond Head via Blewett Pass/i })).toBeDefined();

    // Filter by Intermediate
    const intermediateButton = screen.getByRole('button', { name: /^Intermediate$/i });
    fireEvent.click(intermediateButton);

    expect(screen.getByRole('heading', { level: 3, name: /Kendall Lakes Peak & Knob/i })).toBeDefined();
    expect(screen.queryByRole('heading', { level: 3, name: /Camp Muir Snowfield/i })).toBeNull();
    expect(screen.queryByRole('heading', { level: 3, name: /Artist Point to Table Mountain/i })).toBeNull();

    // Filter by Beginner Friendly
    const beginnerButton = screen.getByRole('button', { name: /^Beginner Friendly$/i });
    fireEvent.click(beginnerButton);

    expect(screen.getByRole('heading', { level: 3, name: /Artist Point to Table Mountain/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Diamond Head via Blewett Pass/i })).toBeDefined();
    expect(screen.queryByRole('heading', { level: 3, name: /Kendall Lakes Peak & Knob/i })).toBeNull();

    // Reset to All
    const allButton = screen.getByRole('button', { name: /^All Routes$/i });
    fireEvent.click(allButton);
    expect(screen.getByRole('heading', { level: 3, name: /Camp Muir Snowfield/i })).toBeDefined();
  });

  it('updates live pace calculator when selecting route, fitness, snow condition, and party size', () => {
    render(<SkiTouringHub />);

    const routeSelect = screen.getByLabelText(/Select Backcountry Route/i);
    const fitnessSelect = screen.getByLabelText(/Touring Fitness Level/i);
    const snowSelect = screen.getByLabelText(/Snow Condition & Skin Track/i);
    const partyInput = screen.getByLabelText(/Party Size/i);

    // Select Camp Muir Snowfield
    fireEvent.change(routeSelect, { target: { value: 'muir-snowfield' } });
    // Select Athletic fitness
    fireEvent.change(fitnessSelect, { target: { value: 'athletic' } });
    // Select Firm Skin Track
    fireEvent.change(snowSelect, { target: { value: 'firm_skin_track' } });
    // Party size 1
    fireEvent.change(partyInput, { target: { value: '1' } });

    const statusRegion = screen.getByRole('status');
    expect(statusRegion).toBeDefined();

    // Athletic (1500) * firm (1.05) * party 1 (1.0) = 1575 ft/hr
    expect(within(statusRegion).getByText(/1575 ft\/hr/i)).toBeDefined();
    expect(within(statusRegion).getByText(/175 min/i)).toBeDefined();
    expect(within(statusRegion).getByText(/267 min/i)).toBeDefined();
    expect(within(statusRegion).getByText(/3.1 L/i)).toBeDefined();
    expect(within(statusRegion).getByText(/2100 kcal/i)).toBeDefined();
    expect(within(statusRegion).getAllByText(/9:55 AM/i).length).toBeGreaterThan(0);
  });

  it('displays skin track etiquette guidelines and toggles touring gear checklist items', () => {
    render(<SkiTouringHub />);

    // Etiquette guidelines verification
    expect(screen.getByText(/Never bootpack in established skin tracks/i)).toBeDefined();
    expect(screen.getByText(/Yield to downhill traffic/i)).toBeDefined();
    expect(screen.getByText(/Set efficient kick turns on mellow gradients/i)).toBeDefined();

    // Checklist toggles
    const skinsCheck = screen.getByLabelText(/Climbing Skins/i);
    const skiCramponsCheck = screen.getByLabelText(/Ski Crampons/i);
    const beaconCheck = screen.getByLabelText(/Beacon \/ Probe \/ Shovel/i);

    expect(skinsCheck).not.toBeChecked();
    fireEvent.click(skinsCheck);
    expect(skinsCheck).toBeChecked();

    expect(skiCramponsCheck).not.toBeChecked();
    fireEvent.click(skiCramponsCheck);
    expect(skiCramponsCheck).toBeChecked();

    expect(beaconCheck).not.toBeChecked();
    fireEvent.click(beaconCheck);
    expect(beaconCheck).toBeChecked();

    expect(screen.getByText(/3 of 7 Essential Items Checked/i)).toBeDefined();
  });
});
