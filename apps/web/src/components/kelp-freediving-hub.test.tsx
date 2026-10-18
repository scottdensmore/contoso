import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import KelpFreedivingHub from './kelp-freediving-hub';

describe('KelpFreedivingHub', () => {
  it('renders section headings and site cards with proper heading hierarchy', () => {
    render(<KelpFreedivingHub />);

    const h2s = screen.getAllByRole('heading', { level: 2 });
    expect(h2s.map((h) => h.textContent)).toEqual([
      'Premier Coastal Kelp Forest Freediving & Holdfast Sites',
      'Kelp Forest Ballast, Surge & Holdfast Dynamics Calculator',
      'Mandatory Kelp Freediving & Benthic Survey Gear Checklist',
    ]);

    const h3s = screen.getAllByRole('heading', { level: 3 });
    expect(h3s.length).toBeGreaterThanOrEqual(6);
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Point Lobos State Natural Reserve & Carmel Pinnacles/i,
      })
    ).toBeDefined();
  });

  it('filters kelp freediving sites when kelp stratum filter buttons are clicked', () => {
    render(<KelpFreedivingHub />);

    // Filter to Floating Pneumatocyst Canopy
    const canopyBtn = screen.getByRole('button', {
      name: /^Floating Pneumatocyst Canopy$/i,
    });
    expect(canopyBtn.getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(canopyBtn);
    expect(canopyBtn.getAttribute('aria-pressed')).toBe('true');

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Point Lobos State Natural Reserve & Carmel Pinnacles/i,
      })
    ).toBeDefined();
    expect(
      screen.queryByRole('heading', {
        level: 3,
        name: /Anacapa Island Cathedral Cove & Landing Cove Holdfast Reefs/i,
      })
    ).toBeNull();

    // Filter to Benthic Haptera Holdfast Reef
    const holdfastBtn = screen.getByRole('button', {
      name: /^Benthic Haptera Holdfast Reef$/i,
    });
    fireEvent.click(holdfastBtn);

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Anacapa Island Cathedral Cove & Landing Cove Holdfast Reefs/i,
      })
    ).toBeDefined();
    expect(
      screen.queryByRole('heading', {
        level: 3,
        name: /Point Lobos State Natural Reserve & Carmel Pinnacles/i,
      })
    ).toBeNull();

    // Reset to All Kelp Strata
    const allBtn = screen.getByRole('button', {
      name: /^All Kelp Strata$/i,
    });
    fireEvent.click(allBtn);

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Point Lobos State Natural Reserve & Carmel Pinnacles/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Anacapa Island Cathedral Cove & Landing Cove Holdfast Reefs/i,
      })
    ).toBeDefined();
  });

  it('updates live calculator result when controls are adjusted', () => {
    render(<KelpFreedivingHub />);

    const resultPanel = screen.getByTestId('kelp-freediving-calculator-result');
    expect(resultPanel.getAttribute('role')).toBe('status');
    expect(resultPanel.textContent).toContain(
      'Point Lobos State Natural Reserve & Carmel Pinnacles'
    );

    // Switch site to Barkley Sound
    const siteSelect = screen.getByLabelText(/select kelp forest site/i);
    fireEvent.change(siteSelect, {
      target: { value: 'barkley-sound-broken-group-bull-kelp' },
    });

    expect(resultPanel.textContent).toContain(
      'Barkley Sound Broken Group Islands Bull Kelp Surge Channels'
    );

    // Adjust target depth and surge velocity
    const depthInput = screen.getByLabelText(/target depth/i);
    fireEvent.change(depthInput, { target: { value: '16' } });

    const surgeInput = screen.getByLabelText(/surge velocity/i);
    fireEvent.change(surgeInput, { target: { value: '1.4' } });

    expect(resultPanel.textContent).toContain('Canopy Entry & Ascent Protocol');
    expect(resultPanel.textContent).toContain(
      'Benthic Holdfast Survey Advisory'
    );
  });

  it('toggles gear checklist items and updates the packed gear counter', () => {
    render(<KelpFreedivingHub />);

    const counter = screen.getByTestId('kelp-freediving-gear-counter');
    expect(counter.textContent).toBe('0 of 6 packed');

    const wetsuitCheckbox = screen.getByLabelText(
      /Open-Cell 7mm Two-Piece Hooded Freedive Wetsuit/i
    );
    fireEvent.click(wetsuitCheckbox);
    expect(counter.textContent).toBe('1 of 6 packed');

    const cutterCheckbox = screen.getByLabelText(
      /Dual-Sheathed Blunt-Tip Titanium Kelp & Line Cutter/i
    );
    fireEvent.click(cutterCheckbox);
    expect(counter.textContent).toBe('2 of 6 packed');

    fireEvent.click(wetsuitCheckbox);
    expect(counter.textContent).toBe('1 of 6 packed');
  });
});
