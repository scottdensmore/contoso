import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LavaTubeBiospeleologyHub from './lava-tube-biospeleology-hub';

describe('LavaTubeBiospeleologyHub', () => {
  it('renders section headings and site cards with proper heading hierarchy', () => {
    render(<LavaTubeBiospeleologyHub />);

    const h2s = screen.getAllByRole('heading', { level: 2 });
    expect(h2s.map((h) => h.textContent)).toEqual([
      'Premier Subterranean Lava Tube Biospeleology Galleries',
      'Lava Tube Microclimate & Trophic Dynamics Calculator',
      'Mandatory Biospeleology & Clean-Caving Gear Checklist',
    ]);

    const h3s = screen.getAllByRole('heading', { level: 3 });
    expect(h3s.length).toBeGreaterThanOrEqual(6);
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Kazumura Cave Kilauea Metrosideros Root Curtain Galleries/i,
      })
    ).toBeDefined();
  });

  it('filters lava tube sites when ecological zone filter buttons are clicked', () => {
    render(<LavaTubeBiospeleologyHub />);

    // Filter to Subterranean Root Curtain Gallery
    const rootCurtainBtn = screen.getByRole('button', {
      name: /^Subterranean Root Curtain Gallery$/i,
    });
    expect(rootCurtainBtn.getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(rootCurtainBtn);
    expect(rootCurtainBtn.getAttribute('aria-pressed')).toBe('true');

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Kazumura Cave Kilauea Metrosideros Root Curtain Galleries/i,
      })
    ).toBeDefined();
    expect(
      screen.queryByRole('heading', {
        level: 3,
        name: /Ape Cave Mount St\. Helens Subterranean Basalt Tube/i,
      })
    ).toBeNull();

    // Filter to Deep Dark Stagnant Saturation
    const deepDarkBtn = screen.getByRole('button', {
      name: /^Deep Dark Stagnant Saturation$/i,
    });
    fireEvent.click(deepDarkBtn);

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Cueva de los Verdes & Monte Corona Subterranean Tube/i,
      })
    ).toBeDefined();
    expect(
      screen.queryByRole('heading', {
        level: 3,
        name: /Kazumura Cave Kilauea Metrosideros Root Curtain Galleries/i,
      })
    ).toBeNull();

    // Reset to All Ecological Zones
    const allBtn = screen.getByRole('button', {
      name: /^All Ecological Zones$/i,
    });
    fireEvent.click(allBtn);

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Kazumura Cave Kilauea Metrosideros Root Curtain Galleries/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Cueva de los Verdes & Monte Corona Subterranean Tube/i,
      })
    ).toBeDefined();
  });

  it('updates live calculator result when controls are adjusted', () => {
    render(<LavaTubeBiospeleologyHub />);

    const resultPanel = screen.getByTestId('lava-tube-calculator-result');
    expect(resultPanel.getAttribute('role')).toBe('status');
    expect(resultPanel.textContent).toContain(
      'Kazumura Cave Kilauea Metrosideros Root Curtain Galleries'
    );

    // Switch site to Ape Cave
    const siteSelect = screen.getByLabelText(/select lava tube system/i);
    fireEvent.change(siteSelect, {
      target: { value: 'ape-cave-mount-st-helens-basalt' },
    });

    expect(resultPanel.textContent).toContain(
      'Ape Cave Mount St. Helens Subterranean Basalt Tube'
    );

    // Adjust relative humidity and ambient CO2
    const humidityInput = screen.getByLabelText(/relative humidity/i);
    fireEvent.change(humidityInput, { target: { value: '78' } });

    const co2Input = screen.getByLabelText(/ambient co2/i);
    fireEvent.change(co2Input, { target: { value: '1850' } });

    expect(resultPanel.textContent).toContain('Non-Contact Traversal Protocol');
    expect(resultPanel.textContent).toContain(
      'Biocontamination & Decon Advisory'
    );
  });

  it('toggles gear checklist items and updates the packed gear counter', () => {
    render(<LavaTubeBiospeleologyHub />);

    const counter = screen.getByTestId('lava-tube-gear-counter');
    expect(counter.textContent).toBe('0 of 6 packed');

    const helmetCheckbox = screen.getByLabelText(
      /EN 12492 Low-Profile ABS\/EPP Basalt Speleology Helmet/i
    );
    fireEvent.click(helmetCheckbox);
    expect(counter.textContent).toBe('1 of 6 packed');

    const deconCheckbox = screen.getByLabelText(
      /Quaternary Ammonium & Virkon-S Biospeleology Boot Decon Kit/i
    );
    fireEvent.click(deconCheckbox);
    expect(counter.textContent).toBe('2 of 6 packed');

    fireEvent.click(helmetCheckbox);
    expect(counter.textContent).toBe('1 of 6 packed');
  });
});
