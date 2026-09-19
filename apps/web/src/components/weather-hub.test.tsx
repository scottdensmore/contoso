import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import WeatherHub from './weather-hub';

describe('WeatherHub Component', () => {
  it('renders all required section headings with correct level 2 hierarchy', () => {
    render(<WeatherHub />);

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Mountain Regional Weather Synopsis & Freezing Levels/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Alpine Microclimate & Temperature Lapse Calculator/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Wilderness Severe Weather Protocols/i,
      })
    ).toBeDefined();
  });

  it('updates forecast zone selection and displays freezing levels, storm warnings, and synopsis', () => {
    render(<WeatherHub />);

    const zoneSelect = screen.getByLabelText(/Select Mountain Forecast Zone/i);
    expect(zoneSelect).toBeDefined();

    // Select Mount Rainier
    fireEvent.change(zoneSelect, { target: { value: 'mount-rainier' } });

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Mount Rainier \(Paradise to Summit\)/i,
      })
    ).toBeDefined();

    // Rainier has stormWarning = true
    expect(screen.getByText(/Storm Warning Active/i)).toBeDefined();
    expect(screen.getByText(/7,500 ft/i)).toBeDefined();
    expect(screen.getByText(/Approaching Pacific cold front/i)).toBeDefined();

    // Select Mount Baker
    fireEvent.change(zoneSelect, { target: { value: 'mount-baker' } });
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Mount Baker \(Heather Meadows to Summit\)/i,
      })
    ).toBeDefined();
    expect(screen.getByText(/6,200 ft/i)).toBeDefined();
    expect(screen.getByText(/Substantial orographic snowfall/i)).toBeDefined();
    // Baker has stormWarning = false
    expect(screen.queryByText(/Storm Warning Active/i)).toBeNull();
  });

  it('evaluates microclimate lapse rates and wind chills when changing target elevation and exposure', () => {
    render(<WeatherHub />);

    const zoneSelect = screen.getByLabelText(/Select Mountain Forecast Zone/i);
    fireEvent.change(zoneSelect, { target: { value: 'mount-rainier' } });

    const elevationInput = screen.getByLabelText(/Target Elevation Number/i);
    const exposureSelect = screen.getByLabelText(/Terrain Exposure Level/i);

    // Set to 10,000 ft on Exposed Ridge
    fireEvent.change(elevationInput, { target: { value: '10000' } });
    fireEvent.change(exposureSelect, { target: { value: 'exposed_ridge' } });

    const statusRegion = screen.getByRole('status');
    expect(statusRegion).toBeDefined();
    expect(within(statusRegion).getByText(/BELOW FREEZING/i)).toBeDefined();
    expect(within(statusRegion).getByText(/^CRITICAL HYPOTHERMIA RISK$/)).toBeDefined();
    expect(within(statusRegion).getByText(/28°F/i)).toBeDefined();
    expect(within(statusRegion).getByText(/10°F/i)).toBeDefined();
  });

  it('updates microclimate results when using terrain exposure buttons', () => {
    render(<WeatherHub />);

    const zoneSelect = screen.getByLabelText(/Select Mountain Forecast Zone/i);
    fireEvent.change(zoneSelect, { target: { value: 'snoqualmie-alpental' } });

    const elevationInput = screen.getByLabelText(/Target Elevation Number/i);
    fireEvent.change(elevationInput, { target: { value: '3000' } });

    // Click Sheltered Valley button
    const shelteredBtn = screen.getByRole('button', { name: /Sheltered Valley/i });
    fireEvent.click(shelteredBtn);

    const statusRegion = screen.getByRole('status');
    expect(within(statusRegion).getByText(/ABOVE FREEZING/i)).toBeDefined();
    expect(within(statusRegion).getByText(/^MODERATE HYPOTHERMIA RISK$/)).toBeDefined();
  });

  it('renders 3-layer mountain clothing recommendations', () => {
    render(<WeatherHub />);

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /3-Layer Mountain Clothing Recommendation/i,
      })
    ).toBeDefined();

    expect(screen.getByText(/Merino wool or synthetic moisture-wicking next-to-skin/i)).toBeDefined();
    expect(screen.getByText(/Active breathable fleece or 800-fill down\/synthetic puffy/i)).toBeDefined();
    expect(screen.getByText(/3-layer Gore-Tex \/ hardshell windproof and waterproof jacket & pants/i)).toBeDefined();
  });

  it('renders wilderness severe weather protocols for lightning and whiteout', () => {
    render(<WeatherHub />);

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Lightning Safety Guidelines/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Whiteout Navigation & High Winds Protocol/i,
      })
    ).toBeDefined();

    expect(screen.getByText(/Adhere to the 30\/30 Rule/i)).toBeDefined();
    expect(screen.getByText(/Ditch metal trekking poles/i)).toBeDefined();
    expect(screen.getByText(/Halt travel immediately upon loss of horizon/i)).toBeDefined();
  });
});
