import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GlacierSkiTraverseHub from './glacier-ski-traverse-hub';

describe('GlacierSkiTraverseHub', () => {
  it('renders section headings and site cards with proper heading levels', () => {
    render(<GlacierSkiTraverseHub />);

    const h2s = screen.getAllByRole('heading', { level: 2 });
    expect(h2s.map((h) => h.textContent)).toEqual([
      'Iconic Alpine Crevasse Glacier Ski-Traverse Expeditions',
      'Glacier Ski-Traverse & Serac Zone Dynamics Calculator',
      'Mandatory Glacier Crevasse & Skimo Rescue Gear Checklist',
    ]);

    const h3s = screen.getAllByRole('heading', { level: 3 });
    expect(h3s.length).toBeGreaterThanOrEqual(6);
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Classic Haute Route Glacier Ski-Traverse/i,
      })
    ).toBeDefined();
  });

  it('filters traverse sites when terrain zone filter buttons are clicked', () => {
    render(<GlacierSkiTraverseHub />);

    // Filter to Bergschrund Headwall Chute
    const bergschrundBtn = screen.getByRole('button', { name: /^Bergschrund Headwall Chute$/i });
    fireEvent.click(bergschrundBtn);

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Spearhead Horseshoe Glacier Ski-Traverse/i,
      })
    ).toBeDefined();
    expect(
      screen.queryByRole('heading', {
        level: 3,
        name: /Classic Haute Route Glacier Ski-Traverse/i,
      })
    ).toBeNull();

    // Filter to Compressed Icefall Serac Corridor
    const seracBtn = screen.getByRole('button', { name: /^Compressed Icefall Serac Corridor$/i });
    fireEvent.click(seracBtn);

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Bernese Oberland Jungfrau-Aletsch Glacier Ski-Traverse/i,
      })
    ).toBeDefined();
    expect(
      screen.queryByRole('heading', {
        level: 3,
        name: /Spearhead Horseshoe Glacier Ski-Traverse/i,
      })
    ).toBeNull();

    // Reset to All Terrain Zones
    const allBtn = screen.getByRole('button', { name: /^All Terrain Zones$/i });
    fireEvent.click(allBtn);

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Classic Haute Route Glacier Ski-Traverse/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Spearhead Horseshoe Glacier Ski-Traverse/i,
      })
    ).toBeDefined();
  });

  it('updates live calculator result when controls are changed', () => {
    render(<GlacierSkiTraverseHub />);

    const resultPanel = screen.getByTestId('glacier-ski-calculator-result');
    expect(resultPanel.getAttribute('role')).toBe('status');
    expect(resultPanel.textContent).toContain('Classic Haute Route Glacier Ski-Traverse');

    // Change site to Berner Oberland
    const siteSelect = screen.getByLabelText(/select traverse route/i);
    fireEvent.change(siteSelect, { target: { value: 'berner-oberland-ski-traverse' } });

    expect(resultPanel.textContent).toContain('Bernese Oberland Jungfrau-Aletsch Glacier Ski-Traverse');

    // Change pack weight to 30 kg
    const packInput = screen.getByLabelText(/pack weight/i);
    fireEvent.change(packInput, { target: { value: '30' } });

    // Change ambient temp to 4 °C
    const tempInput = screen.getByLabelText(/ambient temperature/i);
    fireEvent.change(tempInput, { target: { value: '4' } });

    // Result should reflect higher hazard or failure risk
    expect(resultPanel.textContent).toMatch(/Extreme Dynamic Icefall Collapse|Severe Serac Toppling Exposure|Moderate Seasonal Bridge Softening/);
  });

  it('toggles checklist items and updates the gear counter', () => {
    render(<GlacierSkiTraverseHub />);

    const counter = screen.getByTestId('glacier-ski-gear-counter');
    expect(counter.textContent).toBe('0 of 6 packed');

    const harnessCheckbox = screen.getByLabelText(
      /Ultralight Glacier Skimo Harness with Clip-In Ski Slots/i
    );
    fireEvent.click(harnessCheckbox);
    expect(counter.textContent).toBe('1 of 6 packed');

    const rescueCordCheckbox = screen.getByLabelText(
      /Lightweight Hyperstatic Crevasse Rescue Cord/i
    );
    fireEvent.click(rescueCordCheckbox);
    expect(counter.textContent).toBe('2 of 6 packed');

    fireEvent.click(harnessCheckbox);
    expect(counter.textContent).toBe('1 of 6 packed');
  });
});
