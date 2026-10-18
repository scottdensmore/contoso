import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SolfataraNavigationHub from './solfatara-navigation-hub';

describe('SolfataraNavigationHub', () => {
  it('renders all 5 curated solfatara and fumarole field sites initially', () => {
    render(<SolfataraNavigationHub />);

    expect(
      screen.getByRole('heading', {
        name: /Valley of Ten Thousand Smokes & Novarupta Vent Dome/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', {
        name: /Bumpass Hell & Devil's Kitchen Acid-Sulfate Basin/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', {
        name: /Askja Víti Crater & Kverkfjöll Subglacial Solfatara Field/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', {
        name: /El Tatio High-Andean Geyser & Sinter Terrace Field/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', {
        name: /Mutnovsky Volcano Active Crater & Donnoe Solfatara Field/i,
      })
    ).toBeDefined();
  });

  it('filters sites by hydrothermal crust type, volcanic gas regime, and boundary-layer wind state, and resets filters', () => {
    render(<SolfataraNavigationHub />);

    const windSelect = screen.getByLabelText(/Boundary-Layer Wind State/i);
    fireEvent.change(windSelect, {
      target: { value: 'katabatic_calms_inversion_trap' },
    });

    expect(
      screen.getByRole('heading', {
        name: /El Tatio High-Andean Geyser & Sinter Terrace Field/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', {
        name: /Mutnovsky Volcano Active Crater & Donnoe Solfatara Field/i,
      })
    ).toBeDefined();
    expect(
      screen.queryByRole('heading', {
        name: /Valley of Ten Thousand Smokes & Novarupta Vent Dome/i,
      })
    ).toBeNull();

    const gasSelect = screen.getByLabelText(/Volcanic Gas Regime/i);
    fireEvent.change(gasSelect, {
      target: { value: 'co2_cold_mofette_topographic_pooling' },
    });

    expect(
      screen.getByRole('heading', {
        name: /Mutnovsky Volcano Active Crater & Donnoe Solfatara Field/i,
      })
    ).toBeDefined();
    expect(
      screen.queryByRole('heading', {
        name: /El Tatio High-Andean Geyser & Sinter Terrace Field/i,
      })
    ).toBeNull();

    const crustSelect = screen.getByLabelText(/Hydrothermal Crust Type/i);
    fireEvent.change(crustSelect, {
      target: { value: 'native_sulfur_sublimation_dome' },
    });

    expect(
      screen.getByRole('heading', {
        name: /Mutnovsky Volcano Active Crater & Donnoe Solfatara Field/i,
      })
    ).toBeDefined();

    const resetBtn = screen.getByRole('button', { name: /Reset Filters/i });
    fireEvent.click(resetBtn);

    expect(
      screen.getByRole('heading', {
        name: /Valley of Ten Thousand Smokes & Novarupta Vent Dome/i,
      })
    ).toBeDefined();
  });

  it('populates calculator inputs when "Load into Calculator" is clicked on a site card', () => {
    render(<SolfataraNavigationHub />);

    const loadButtons = screen.getAllByRole('button', {
      name: /Load into Calculator/i,
    });
    expect(loadButtons.length).toBe(5);

    // Click Bumpass Hell (second card: meanCrustThicknessCm = 14, subsurfaceTemp10cmC = 84, basinDepressionDepthM = 5.5, baselineSo2Ppm = 3.8, baselineH2sPpm = 6.5)
    fireEvent.click(loadButtons[1]);

    const crustInput = screen.getByLabelText(
      /Sinter Crust Thickness \(cm\)/i
    ) as HTMLInputElement;
    const tempInput = screen.getByLabelText(
      /10 cm Subsurface Temp \(°C\)/i
    ) as HTMLInputElement;
    const depthInput = screen.getByLabelText(
      /Basin Depression Depth \(m\)/i
    ) as HTMLInputElement;
    const so2Input = screen.getByLabelText(
      /Ambient SO2 \(ppm\)/i
    ) as HTMLInputElement;
    const h2sInput = screen.getByLabelText(
      /Ambient H2S \(ppm\)/i
    ) as HTMLInputElement;

    expect(crustInput.value).toBe('14');
    expect(tempInput.value).toBe('84');
    expect(depthInput.value).toBe('5.5');
    expect(so2Input.value).toBe('3.8');
    expect(h2sInput.value).toBe('6.5');
  });

  it('updates live calculator output when numeric inputs or preset buttons change', () => {
    render(<SolfataraNavigationHub />);

    const resultPanel = screen.getByTestId('solfatara-calculator-result');
    expect(resultPanel.getAttribute('role')).toBe('status');

    // Click "Ventilated Sinter Shield Corridor" preset
    fireEvent.click(
      screen.getByRole('button', { name: /Ventilated Sinter Shield Corridor/i })
    );
    expect(resultPanel.textContent).toContain('nominal_upwind_sinter_corridor');

    // Click "Acid Plume Downwash Caution" preset
    fireEvent.click(
      screen.getByRole('button', { name: /Acid Plume Downwash Caution/i })
    );
    expect(resultPanel.textContent).toContain(
      'caution_acid_plume_respirator_required'
    );

    // Click "Calm Inversion Mofette & Thin Mudpot Abort" preset
    fireEvent.click(
      screen.getByRole('button', {
        name: /Calm Inversion Mofette & Thin Mudpot Abort/i,
      })
    );
    expect(resultPanel.textContent).toContain(
      'abort_lethal_gas_pool_or_crust_collapse'
    );
  });

  it('tracks mandatory gas telemetry and crust probing gear checklist verification', () => {
    render(<SolfataraNavigationHub />);

    const counter = screen.getByTestId('solfatara-gear-counter');
    expect(counter.textContent).toBe('0 / 6 mandatory items verified');

    const detectorCheckbox = screen.getByLabelText(
      /Pumped 4-Gas Electrochemical & NDIR Detector/i
    );
    fireEvent.click(detectorCheckbox);
    expect(counter.textContent).toBe('1 / 6 mandatory items verified');

    const respiratorCheckbox = screen.getByLabelText(
      /NIOSH OV\/AG\/P100 Acid-Gas Elastomeric Half-Mask Respirator/i
    );
    fireEvent.click(respiratorCheckbox);
    expect(counter.textContent).toBe('2 / 6 mandatory items verified');

    fireEvent.click(detectorCheckbox);
    expect(counter.textContent).toBe('1 / 6 mandatory items verified');
  });
});
