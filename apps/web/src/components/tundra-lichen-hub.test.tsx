import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TundraLichenHub from './tundra-lichen-hub';

describe('TundraLichenHub', () => {
  it('renders section headings and site cards with proper heading levels', () => {
    render(<TundraLichenHub />);

    const h2s = screen.getAllByRole('heading', { level: 2 });
    expect(h2s.map((h) => h.textContent)).toEqual([
      'Iconic Subarctic & Alpine Lichenology Study Sites',
      'Lichen Growth, Lichenometry & Bioindication Dynamics Calculator',
      'Mandatory Subarctic Field Lichenology Checklist',
    ]);

    const h3s = screen.getAllByRole('heading', { level: 3 });
    // Should include the 5 sites plus the calculator result card
    expect(h3s.length).toBeGreaterThanOrEqual(6);
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Polychrome Pass Permafrost Tundra & Saxicolous Fellfield/i,
      })
    ).toBeDefined();
  });

  it('filters study sites when morphology filter buttons are clicked', () => {
    render(<TundraLichenHub />);

    // Click Crustose Saxicolous
    const crustoseBtn = screen.getByRole('button', { name: /^Crustose Saxicolous$/i });
    fireEvent.click(crustoseBtn);

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Polychrome Pass Permafrost Tundra/i,
      })
    ).toBeDefined();
    expect(
      screen.queryByRole('heading', {
        level: 3,
        name: /Torngat Mountains Arctic Fjord Lichen Barrens/i,
      })
    ).toBeNull();

    // Click Foliose Macrolichen
    const folioseBtn = screen.getByRole('button', { name: /^Foliose Macrolichen$/i });
    fireEvent.click(folioseBtn);

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Root Glacier Lateral Moraine Bryophyte Succession Basin/i,
      })
    ).toBeDefined();
    expect(
      screen.queryByRole('heading', {
        level: 3,
        name: /Polychrome Pass Permafrost Tundra/i,
      })
    ).toBeNull();

    // Reset to All Morphologies
    const allBtn = screen.getByRole('button', { name: /^All Morphologies$/i });
    fireEvent.click(allBtn);

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Polychrome Pass Permafrost Tundra/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Torngat Mountains Arctic Fjord Lichen Barrens/i,
      })
    ).toBeDefined();
  });

  it('updates live calculator result when controls are changed', () => {
    render(<TundraLichenHub />);

    const resultPanel = screen.getByTestId('lichen-calculator-result');
    expect(resultPanel.textContent).toContain('130 years');
    expect(resultPanel.textContent).toContain('0.96');
    expect(resultPanel.textContent).toContain('85.0');
    expect(resultPanel.textContent).toContain('Optimal Pristine Climax');

    // Change site to Torngat Mountains
    const siteSelect = screen.getByLabelText(/select study site/i);
    fireEvent.change(siteSelect, { target: { value: 'torngat-mountains-fjords' } });

    expect(resultPanel.textContent).toContain('Torngat Mountains Arctic Fjord Lichen Barrens');

    // Change colony diameter
    const diameterInput = screen.getByLabelText(/colony diameter/i);
    fireEvent.change(diameterInput, { target: { value: '150' } });

    // With 150 mm / 0.5 mm/yr = 300 years
    expect(resultPanel.textContent).toContain('300 years');

    // Change air deposition to elevated_anthropogenic
    const airSelect = screen.getByLabelText(/air quality & deposition/i);
    fireEvent.change(airSelect, { target: { value: 'elevated_anthropogenic' } });

    expect(resultPanel.textContent).toContain('Critical Cryoturbation Disturbance');
  });

  it('toggles checklist items and updates the gear counter', () => {
    render(<TundraLichenHub />);

    const counter = screen.getByTestId('lichen-gear-counter');
    expect(counter.textContent).toBe('0 of 6 packed');

    const loupeCheckbox = screen.getByLabelText(
      /20x Hastings Triplet Achromatic Field Hand Lens with LED/i
    );
    fireEvent.click(loupeCheckbox);
    expect(counter.textContent).toBe('1 of 6 packed');

    const kitCheckbox = screen.getByLabelText(
      /Micro-Dropper Spot Reagent Vial Set/i
    );
    fireEvent.click(kitCheckbox);
    expect(counter.textContent).toBe('2 of 6 packed');

    fireEvent.click(loupeCheckbox);
    expect(counter.textContent).toBe('1 of 6 packed');
  });
});
