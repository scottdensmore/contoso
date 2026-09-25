import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MountainWeatherHub from './mountain-weather-hub';

describe('MountainWeatherHub', () => {
  it('renders all required section headings with correct h2 hierarchy and card headings as h3', () => {
    render(<MountainWeatherHub />);

    const h2Headings = screen.getAllByRole('heading', { level: 2 });
    expect(h2Headings.length).toBeGreaterThanOrEqual(3);

    const h3Headings = screen.getAllByRole('heading', { level: 3 });
    expect(h3Headings.length).toBe(5);
  });

  it('filters weather sector cards using synoptic level filter buttons', () => {
    render(<MountainWeatherHub />);

    expect(screen.getByText('Denali Upper Kahiltna & South Buttress')).toBeDefined();
    expect(screen.getByText('Mount Washington Presidential Range Summit')).toBeDefined();
    expect(screen.getByText('Mount Everest South Col & Geneva Spur Sector')).toBeDefined();

    // Filter by 500mb Polar Synoptic
    const filter500 = screen.getByRole('button', { name: /500mb Polar Synoptic/i });
    fireEvent.click(filter500);

    expect(screen.getByText('Denali Upper Kahiltna & South Buttress')).toBeDefined();
    expect(screen.queryByText('Mount Washington Presidential Range Summit')).toBeNull();
    expect(screen.queryByText('Mount Everest South Col & Geneva Spur Sector')).toBeNull();

    // Reset to All Sectors
    const filterAll = screen.getByRole('button', { name: /All Sectors/i });
    fireEvent.click(filterAll);

    expect(screen.getByText('Mount Washington Presidential Range Summit')).toBeDefined();
    expect(screen.getByText('Mount Everest South Col & Geneva Spur Sector')).toBeDefined();
  });

  it('updates calculator when a sector quick select button is clicked', () => {
    render(<MountainWeatherHub />);

    // Click quick select for Mount Washington (second sector)
    const selectButtons = screen.getAllByRole('button', { name: /for calculator/i });
    expect(selectButtons.length).toBe(5);
    fireEvent.click(selectButtons[1]);

    const sectorSelect = screen.getByLabelText('Select Mountain Weather Sector') as HTMLSelectElement;
    expect(sectorSelect.value).toBe('mount-washington-ridge');
  });

  it('calculates summit wind, wind chill, barometric trend, and summit window reactively', () => {
    render(<MountainWeatherHub />);

    const sectorSelect = screen.getByLabelText('Select Mountain Weather Sector');
    const windInput = screen.getByLabelText('Baseline Wind (mph)');
    const baroInput = screen.getByLabelText('3-Hour Barometric Drop (hPa)');
    const jetInput = screen.getByLabelText('Jet Stream Core Offset (km)');

    // Select Denali
    fireEvent.change(sectorSelect, { target: { value: 'denali-south-buttress' } });
    fireEvent.change(windInput, { target: { value: '35' } });
    fireEvent.change(baroInput, { target: { value: '3.5' } });

    // Live status should reflect Abort & Rapid Storm Warning
    const statusPanel = screen.getByRole('status');
    expect(statusPanel.textContent).toContain('Abort: Severe Storm & Whiteout');
    expect(statusPanel.textContent).toContain('Rapid Storm Warning');

    // Now set calm conditions: baseline wind 10, barometric drop 0.5, jet offset 200
    fireEvent.change(windInput, { target: { value: '10' } });
    fireEvent.change(baroInput, { target: { value: '0.5' } });
    fireEvent.change(jetInput, { target: { value: '200' } });

    expect(statusPanel.textContent).toContain('Go: Summit Window Clear');
    expect(statusPanel.textContent).toContain('Steady / Fair');
  });

  it('tracks gear checklist progress with live counter and checkboxes', () => {
    render(<MountainWeatherHub />);

    const counter = screen.getByTestId('weather-gear-counter');
    expect(counter.textContent).toBe('0 of 6 packed');

    const firstCheckbox = screen.getByLabelText(
      /Triple-Sensor Barometric Pressure Altimeter Watch with Storm Alarm/i
    );
    fireEvent.click(firstCheckbox);
    expect(counter.textContent).toBe('1 of 6 packed');

    fireEvent.click(firstCheckbox);
    expect(counter.textContent).toBe('0 of 6 packed');
  });
});
