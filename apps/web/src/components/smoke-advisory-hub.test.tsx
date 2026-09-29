import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import SmokeAdvisoryHub from './smoke-advisory-hub';

describe('SmokeAdvisoryHub Component', () => {
  it('renders section headings (h2) and card headings (h3) without skipping levels', () => {
    render(<SmokeAdvisoryHub />);

    // Section headings (h2)
    const h2s = screen.getAllByRole('heading', { level: 2 });
    expect(h2s.length).toBeGreaterThanOrEqual(3);
    const h2Texts = h2s.map((h) => h.textContent);
    expect(h2Texts).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/Smoke Monitoring Stations/i),
        expect.stringMatching(/Smoke Exposure & Respiration Risk Calculator/i),
        expect.stringMatching(/Particulate Safety & Filtration/i),
      ])
    );

    // Station card headings (h3)
    const h3s = screen.getAllByRole('heading', { level: 3 });
    expect(h3s.length).toBeGreaterThanOrEqual(5);
    const h3Texts = h3s.map((h) => h.textContent);
    expect(h3Texts).toEqual(
      expect.arrayContaining([
        'Pasayten Boundary Fire Telemetry',
        'Sawtooth Valley Inversion & Ridge Station',
        'Sierra Crest Granite Gap Smoke Corridor',
        'San Juan Wetterhorn Alpine Air Basin',
        'Bob Marshall Complex River Basin Drift',
      ])
    );
  });

  it('filters station cards by elevation layer buttons', () => {
    render(<SmokeAdvisoryHub />);
    const grid = screen.getByTestId('smoke-stations-grid');

    // Initially all 5 stations are rendered in the grid
    expect(within(grid).getByText('Pasayten Boundary Fire Telemetry')).toBeDefined();
    expect(within(grid).getByText('Sawtooth Valley Inversion & Ridge Station')).toBeDefined();
    expect(within(grid).getByText('San Juan Wetterhorn Alpine Air Basin')).toBeDefined();

    // Filter by Mid-Slope Thermal Belt
    const midSlopeBtn = screen.getByRole('button', { name: /^Mid-Slope Thermal Belt/i });
    fireEvent.click(midSlopeBtn);

    expect(within(grid).getByText('Sawtooth Valley Inversion & Ridge Station')).toBeDefined();
    expect(within(grid).queryByText('Pasayten Boundary Fire Telemetry')).toBeNull();
    expect(within(grid).queryByText('San Juan Wetterhorn Alpine Air Basin')).toBeNull();

    // Filter by Alpine Ridge Free Air
    const alpineBtn = screen.getByRole('button', { name: /^Alpine Ridge Free Air/i });
    fireEvent.click(alpineBtn);

    expect(within(grid).getByText('Sierra Crest Granite Gap Smoke Corridor')).toBeDefined();
    expect(within(grid).getByText('San Juan Wetterhorn Alpine Air Basin')).toBeDefined();
    expect(within(grid).queryByText('Sawtooth Valley Inversion & Ridge Station')).toBeNull();

    // Reset to All Layers
    const allBtn = screen.getByRole('button', { name: /^All Layers/i });
    fireEvent.click(allBtn);

    expect(within(grid).getByText('Pasayten Boundary Fire Telemetry')).toBeDefined();
    expect(within(grid).getByText('Sawtooth Valley Inversion & Ridge Station')).toBeDefined();
  });

  it('updates live calculator status and calculations dynamically', () => {
    render(<SmokeAdvisoryHub />);

    const stationSelect = screen.getByLabelText(/^monitoring station$/i);
    const layerSelect = screen.getByLabelText(/^elevation layer$/i);
    const activitySelect = screen.getByLabelText(/^activity intensity$/i);
    const hoursInput = screen.getByLabelText(/^exposure duration/i);
    const respiratorSelect = screen.getByLabelText(/^respiratory protection$/i);

    // Select Pasayten, Valley Basin Trapping, Strenuous Ascent, 6 hours, None
    fireEvent.change(stationSelect, { target: { value: 'pasayten-boundary-fire' } });
    fireEvent.change(layerSelect, { target: { value: 'valley_basin_trapping' } });
    fireEvent.change(activitySelect, { target: { value: 'strenuous_alpine_ascent' } });
    fireEvent.change(hoursInput, { target: { value: '6' } });
    fireEvent.change(respiratorSelect, { target: { value: 'none' } });

    const statusPanel = screen.getByRole('status');
    expect(within(statusPanel).getAllByText(/164(\.0)?\s*µg\/m³/i).length).toBeGreaterThanOrEqual(1);
    expect(within(statusPanel).getAllByText(/214\s*AQI/i).length).toBeGreaterThanOrEqual(1);
    expect(within(statusPanel).getAllByText(/3148\.8\s*µg/i).length).toBeGreaterThanOrEqual(1);
    expect(within(statusPanel).getByText(/Critical Hazard Cease Exertion/i)).toBeDefined();

    // Now equip P100 respirator
    fireEvent.change(respiratorSelect, { target: { value: 'p100_elastomeric_half_mask' } });

    expect(within(statusPanel).getAllByText(/3\.1\s*µg/i).length).toBeGreaterThanOrEqual(1);
  });

  it('interacts with gear checklist and updates live progress counter', () => {
    render(<SmokeAdvisoryHub />);

    const counter = screen.getByTestId('smoke-advisory-gear-counter');
    expect(counter.textContent).toBe('0 of 6 packed');

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(6);

    // Check first item
    fireEvent.click(checkboxes[0]);
    expect(counter.textContent).toBe('1 of 6 packed');

    // Check second item
    fireEvent.click(checkboxes[1]);
    expect(counter.textContent).toBe('2 of 6 packed');

    // Uncheck first item
    fireEvent.click(checkboxes[0]);
    expect(counter.textContent).toBe('1 of 6 packed');
  });
});
