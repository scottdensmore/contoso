import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PenitentesNavigationHub from './penitentes-navigation-hub';

describe('PenitentesNavigationHub', () => {
  it('renders all 5 curated penitentes and sun-cup sites initially', () => {
    render(<PenitentesNavigationHub />);

    expect(
      screen.getByRole('heading', {
        name: /Aconcagua Polish Glacier & Upper Guanacos Penitentes Labyrinth/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', {
        name: /Mount Rainier Late-Summer Muir Snowfield Sun-Cup Matrix/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', {
        name: /Volcán Tupungato High-Puna Cathedral Penitente Forest/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', {
        name: /Mount Shasta Avalanche Gulch & Red Banks Sun-Cup Troughs/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', {
        name: /Khumbu Glacier & Lobuche East High-Camp Ablation Spires/i,
      })
    ).toBeDefined();
  });

  it('filters sites by ablation morphology, traversal technique, and diurnal freeze state, and resets filters', () => {
    render(<PenitentesNavigationHub />);

    const morphologySelect = screen.getByLabelText(/Ablation Morphology/i);
    fireEvent.change(morphologySelect, {
      target: { value: 'mature_cathedral_nieves_penitentes' },
    });

    expect(
      screen.getByRole('heading', {
        name: /Aconcagua Polish Glacier & Upper Guanacos Penitentes Labyrinth/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', {
        name: /Volcán Tupungato High-Puna Cathedral Penitente Forest/i,
      })
    ).toBeDefined();
    expect(
      screen.queryByRole('heading', {
        name: /Mount Rainier Late-Summer Muir Snowfield Sun-Cup Matrix/i,
      })
    ).toBeNull();

    const techniqueSelect = screen.getByLabelText(/Crampon Traversal Technique/i);
    fireEvent.change(techniqueSelect, {
      target: { value: 'hybrid_frontpoint_stemming' },
    });

    expect(
      screen.getByRole('heading', {
        name: /Volcán Tupungato High-Puna Cathedral Penitente Forest/i,
      })
    ).toBeDefined();
    expect(
      screen.queryByRole('heading', {
        name: /Aconcagua Polish Glacier & Upper Guanacos Penitentes Labyrinth/i,
      })
    ).toBeNull();

    const resetBtn = screen.getByRole('button', { name: /Reset Filters/i });
    fireEvent.click(resetBtn);

    expect(
      screen.getByRole('heading', {
        name: /Mount Rainier Late-Summer Muir Snowfield Sun-Cup Matrix/i,
      })
    ).toBeDefined();
  });

  it('populates calculator inputs when "Load into Calculator" is clicked on a site card', () => {
    render(<PenitentesNavigationHub />);

    const loadButtons = screen.getAllByRole('button', {
      name: /Load into Calculator/i,
    });
    expect(loadButtons.length).toBe(5);

    // Click Aconcagua (first card: bladeHeightCm = 185, slopeAngleDeg = 34)
    fireEvent.click(loadButtons[0]);

    const bladeInput = screen.getByLabelText(/Blade Height \(cm\)/i) as HTMLInputElement;
    const slopeInput = screen.getByLabelText(/Slope Angle \(deg\)/i) as HTMLInputElement;

    expect(bladeInput.value).toBe('185');
    expect(slopeInput.value).toBe('34');
  });

  it('updates live calculator output when numeric inputs or preset buttons change', () => {
    render(<PenitentesNavigationHub />);

    const resultPanel = screen.getByTestId('penitentes-calculator-result');
    expect(resultPanel.getAttribute('role')).toBe('status');

    // Click "Predawn Frozen Trough Corridor" preset
    fireEvent.click(
      screen.getByRole('button', { name: /Predawn Frozen Trough Corridor/i })
    );
    expect(resultPanel.textContent).toContain('optimal_predawn_frozen_corridor');

    // Click "Midday Sun-Cup Crest Labyrinth" preset
    fireEvent.click(
      screen.getByRole('button', { name: /Midday Sun-Cup Crest Labyrinth/i })
    );
    expect(resultPanel.textContent).toContain(
      'caution_crampon_balling_and_ankle_torque'
    );

    // Click "Rotten Isothermal Penitentes Collapse" preset
    fireEvent.click(
      screen.getByRole('button', { name: /Rotten Isothermal Penitentes Collapse/i })
    );
    expect(resultPanel.textContent).toContain('abort_isothermal_blade_collapse');
  });

  it('tracks mandatory crampon and lower-limb armor gear checklist verification', () => {
    render(<PenitentesNavigationHub />);

    const counter = screen.getByTestId('penitentes-gear-counter');
    expect(counter.textContent).toBe('0 / 6 mandatory items verified');

    const cramponCheckbox = screen.getByLabelText(
      /Chromoly 12-Point Mountaineering Crampons/i
    );
    fireEvent.click(cramponCheckbox);
    expect(counter.textContent).toBe('1 / 6 mandatory items verified');

    const gaiterCheckbox = screen.getByLabelText(
      /Hardshell Kevlar-Reinforced Padded Shin Armor/i
    );
    fireEvent.click(gaiterCheckbox);
    expect(counter.textContent).toBe('2 / 6 mandatory items verified');

    fireEvent.click(cramponCheckbox);
    expect(counter.textContent).toBe('1 / 6 mandatory items verified');
  });
});
