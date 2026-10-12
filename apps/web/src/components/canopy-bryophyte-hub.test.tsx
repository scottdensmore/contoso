import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CanopyBryophyteHub from './canopy-bryophyte-hub';

describe('CanopyBryophyteHub', () => {
  it('renders section headings and site cards with proper heading levels', () => {
    render(<CanopyBryophyteHub />);

    const h2s = screen.getAllByRole('heading', { level: 2 });
    expect(h2s.map((h) => h.textContent)).toEqual([
      'Iconic Temperate Rainforest Canopy & Tree-Fern Study Sites',
      'Canopy Epiphyte Hydration & Microclimate Dynamics Calculator',
      'Mandatory Rainforest Canopy Epiphyte Research Gear Checklist',
    ]);

    const h3s = screen.getAllByRole('heading', { level: 3 });
    expect(h3s.length).toBeGreaterThanOrEqual(6);
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Hoh River Hall of Mosses Temperate Rain Forest/i,
      })
    ).toBeDefined();
  });

  it('filters study sites when stratum filter buttons are clicked', () => {
    render(<CanopyBryophyteHub />);

    // Filter to Tree-Fern Caudex Skirt
    const treeFernBtn = screen.getByRole('button', { name: /^Tree-Fern Caudex Skirt$/i });
    fireEvent.click(treeFernBtn);

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Tarkine \/ takayna Ancient Cool Temperate Rainforest/i,
      })
    ).toBeDefined();
    expect(
      screen.queryByRole('heading', {
        level: 3,
        name: /Hoh River Hall of Mosses Temperate Rain Forest/i,
      })
    ).toBeNull();

    // Filter to Emergent Outer Canopy
    const emergentBtn = screen.getByRole('button', { name: /^Emergent Outer Canopy$/i });
    fireEvent.click(emergentBtn);

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Great Bear Rainforest Emergent Canopy Estuary/i,
      })
    ).toBeDefined();
    expect(
      screen.queryByRole('heading', {
        level: 3,
        name: /Tarkine \/ takayna Ancient Cool Temperate Rainforest/i,
      })
    ).toBeNull();

    // Reset to All Strata
    const allBtn = screen.getByRole('button', { name: /^All Strata$/i });
    fireEvent.click(allBtn);

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Hoh River Hall of Mosses Temperate Rain Forest/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Tarkine \/ takayna Ancient Cool Temperate Rainforest/i,
      })
    ).toBeDefined();
  });

  it('updates live calculator result when controls are changed', () => {
    render(<CanopyBryophyteHub />);

    const resultPanel = screen.getByTestId('canopy-bryophyte-calculator-result');
    expect(resultPanel.getAttribute('role')).toBe('status');
    expect(resultPanel.textContent).toContain('Hoh River Hall of Mosses Temperate Rain Forest');
    expect(resultPanel.textContent).toContain('Pristine Climax Bryosphere');

    // Change site to Tarkine
    const siteSelect = screen.getByLabelText(/select study site/i);
    fireEvent.change(siteSelect, { target: { value: 'tarkine-takayna-rainforest' } });

    expect(resultPanel.textContent).toContain('Tarkine / takayna Ancient Cool Temperate Rainforest');

    // Change ambient humidity to 50%
    const humidityInput = screen.getByLabelText(/ambient relative humidity/i);
    fireEvent.change(humidityInput, { target: { value: '50' } });

    expect(resultPanel.textContent).toContain('Microclimate Desiccation Warning');
  });

  it('toggles checklist items and updates the gear counter', () => {
    render(<CanopyBryophyteHub />);

    const counter = screen.getByTestId('canopy-bryophyte-gear-counter');
    expect(counter.textContent).toBe('0 of 6 packed');

    const cambiumSaverCheckbox = screen.getByLabelText(
      /Arborist Non-Invasive Friction Cambium Saver/i
    );
    fireEvent.click(cambiumSaverCheckbox);
    expect(counter.textContent).toBe('1 of 6 packed');

    const srtKitCheckbox = screen.getByLabelText(
      /Lightweight SRT Canopy Ascent System/i
    );
    fireEvent.click(srtKitCheckbox);
    expect(counter.textContent).toBe('2 of 6 packed');

    fireEvent.click(cambiumSaverCheckbox);
    expect(counter.textContent).toBe('1 of 6 packed');
  });
});
