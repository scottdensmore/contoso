import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WeatherStationHub from './weather-station-hub';

describe('WeatherStationHub component', () => {
  it('renders required h2 section headings and h3 card headings without skipped levels', () => {
    render(<WeatherStationHub />);

    const h2s = screen.getAllByRole('heading', { level: 2 });
    expect(h2s.length).toBeGreaterThanOrEqual(3);

    const h3s = screen.getAllByRole('heading', { level: 3 });
    expect(h3s.length).toBe(5); // 5 iconic weather station cards

    const h2Texts = h2s.map((h) => h.textContent);
    expect(h2Texts.some((t) => t?.includes('Alpine Weather Stations') || t?.includes('Iconic Alpine Weather Stations'))).toBe(true);
    expect(h2Texts.some((t) => t?.includes('Alpine Weather Station Telemetry & Anemometry Calculator'))).toBe(true);
    expect(h2Texts.some((t) => t?.includes('Weather Station Rigging & Maintenance Gear Checklist'))).toBe(true);
  });

  it('filters weather stations when zone buttons are clicked', () => {
    render(<WeatherStationHub />);

    // Initially all 5 stations are rendered
    expect(screen.getByRole('heading', { level: 3, name: /Everest South Col/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Denali Football Field/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Mount Washington Summit/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Matterhorn Solvay/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Aconcagua Camp Colera/i })).toBeDefined();

    // Click "Glacier Basin Camp"
    const glacierBtn = screen.getByRole('button', { name: /Glacier Basin Camp/i });
    fireEvent.click(glacierBtn);

    expect(screen.getByRole('heading', { level: 3, name: /Denali Football Field/i })).toBeDefined();
    expect(screen.queryByRole('heading', { level: 3, name: /Everest South Col/i })).toBeNull();
    expect(screen.queryByRole('heading', { level: 3, name: /Mount Washington Summit/i })).toBeNull();
    expect(screen.queryByRole('heading', { level: 3, name: /Matterhorn Solvay/i })).toBeNull();
    expect(screen.queryByRole('heading', { level: 3, name: /Aconcagua Camp Colera/i })).toBeNull();

    // Click "High Altitude Col"
    const colBtn = screen.getByRole('button', { name: /High Altitude Col/i });
    fireEvent.click(colBtn);

    expect(screen.getByRole('heading', { level: 3, name: /Everest South Col/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Aconcagua Camp Colera/i })).toBeDefined();
    expect(screen.queryByRole('heading', { level: 3, name: /Denali Football Field/i })).toBeNull();

    // Click "All Stations"
    const allBtn = screen.getByRole('button', { name: /All Stations/i });
    fireEvent.click(allBtn);

    expect(screen.getByRole('heading', { level: 3, name: /Everest South Col/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Denali Football Field/i })).toBeDefined();
  });

  it('updates telemetry and anemometry calculations reactively with accessible live region', () => {
    render(<WeatherStationHub />);

    const liveStatus = screen.getByRole('status');
    expect(liveStatus).toBeDefined();
    expect(liveStatus.getAttribute('aria-live')).toBe('polite');

    const stationSelect = screen.getByLabelText(/select alpine weather station/i);
    const tempInput = screen.getByLabelText(/ambient temperature/i);
    const windInput = screen.getByLabelText(/wind speed/i);
    const rimeInput = screen.getByLabelText(/rime icing probability/i);

    // Select Denali
    fireEvent.change(stationSelect, { target: { value: 'denali-football-field-station' } });

    // Set extreme conditions: -45°C temp, 175 kph wind, 85% rime
    fireEvent.change(tempInput, { target: { value: '-45' } });
    fireEvent.change(windInput, { target: { value: '175' } });
    fireEvent.change(rimeInput, { target: { value: '85' } });

    expect(liveStatus.textContent).toContain('Denali Football Field High Camp Station');
    expect(liveStatus.textContent?.toLowerCase()).toContain('critical');

    // Set mild conditions: -5°C temp, 25 kph wind, 10% rime
    fireEvent.change(tempInput, { target: { value: '-5' } });
    fireEvent.change(windInput, { target: { value: '25' } });
    fireEvent.change(rimeInput, { target: { value: '10' } });

    expect(liveStatus.textContent?.toLowerCase()).toContain('nominal');
  });

  it('supports quick-selecting station from card into calculator', () => {
    render(<WeatherStationHub />);

    const liveStatus = screen.getByRole('status');
    const denaliCardQuickSelect = screen.getByRole('button', { name: /load denali football field high camp station into calculator/i });
    fireEvent.click(denaliCardQuickSelect);

    expect(liveStatus.textContent).toContain('Denali Football Field High Camp Station');
  });

  it('toggles gear checklist items and updates live gear counter', () => {
    render(<WeatherStationHub />);

    const counter = screen.getByTestId('weather-station-gear-counter');
    expect(counter.textContent).toBe('0 of 6 packed');

    const anemometerCheckbox = screen.getByLabelText(/heated ultrasonic solid-state alpine anemometer/i);
    fireEvent.click(anemometerCheckbox);
    expect(counter.textContent).toBe('1 of 6 packed');

    const batteryCheckbox = screen.getByLabelText(/cold-temperature insulated lifepo4/i);
    fireEvent.click(batteryCheckbox);
    expect(counter.textContent).toBe('2 of 6 packed');

    // Uncheck first item
    fireEvent.click(anemometerCheckbox);
    expect(counter.textContent).toBe('1 of 6 packed');
  });
});
