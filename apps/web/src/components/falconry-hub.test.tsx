import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FalconryHub from './falconry-hub';

describe('FalconryHub component', () => {
  it('renders required h2 section headings and h3 card headings without skipped levels', () => {
    render(<FalconryHub />);

    const h2s = screen.getAllByRole('heading', { level: 2 });
    expect(h2s.length).toBeGreaterThanOrEqual(3);

    const h3s = screen.getAllByRole('heading', { level: 3 });
    expect(h3s.length).toBe(5); // 5 iconic grounds cards

    const h2Texts = h2s.map((h) => h.textContent);
    expect(
      h2Texts.some((t) => t?.includes('Iconic North American Falconry Grounds'))
    ).toBe(true);
    expect(
      h2Texts.some((t) => t?.includes('Raptor Weight Calibration & Stoop Velocity Calculator'))
    ).toBe(true);
    expect(
      h2Texts.some((t) => t?.includes('Falconry Safety & Furniture Checklist'))
    ).toBe(true);
  });

  it('filters grounds when species buttons are clicked', () => {
    render(<FalconryHub />);

    // Initially all 5 grounds are displayed
    expect(
      screen.getByRole('heading', { level: 3, name: /Red Desert High Steppe & Sagebrush Sea/i })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', { level: 3, name: /Morley Nelson Snake River Birds of Prey NCA/i })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', { level: 3, name: /San Luis Valley High Desert Falconry Grounds/i })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', { level: 3, name: /Sonoran Saguaro Scrub & Bajada Washes/i })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', { level: 3, name: /Bighorn Basin Rimrock & Shoshone Ridge/i })
    ).toBeDefined();

    // Click Gyrfalcon filter
    const gyrfalconBtn = screen.getByRole('button', { name: /^Gyrfalcon$/i });
    fireEvent.click(gyrfalconBtn);

    expect(
      screen.getByRole('heading', { level: 3, name: /Red Desert High Steppe & Sagebrush Sea/i })
    ).toBeDefined();
    expect(
      screen.queryByRole('heading', { level: 3, name: /Morley Nelson Snake River Birds of Prey NCA/i })
    ).toBeNull();
    expect(
      screen.queryByRole('heading', { level: 3, name: /San Luis Valley High Desert Falconry Grounds/i })
    ).toBeNull();
    expect(
      screen.queryByRole('heading', { level: 3, name: /Sonoran Saguaro Scrub & Bajada Washes/i })
    ).toBeNull();
    expect(
      screen.queryByRole('heading', { level: 3, name: /Bighorn Basin Rimrock & Shoshone Ridge/i })
    ).toBeNull();

    // Click Peregrine Falcon filter
    const peregrineBtn = screen.getByRole('button', { name: /^Peregrine Falcon$/i });
    fireEvent.click(peregrineBtn);

    expect(
      screen.getByRole('heading', { level: 3, name: /Morley Nelson Snake River Birds of Prey NCA/i })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', { level: 3, name: /San Luis Valley High Desert Falconry Grounds/i })
    ).toBeDefined();
    expect(
      screen.queryByRole('heading', { level: 3, name: /Red Desert High Steppe & Sagebrush Sea/i })
    ).toBeNull();

    // Click All Species
    const allBtn = screen.getByRole('button', { name: /^All Species$/i });
    fireEvent.click(allBtn);

    expect(
      screen.getByRole('heading', { level: 3, name: /Red Desert High Steppe & Sagebrush Sea/i })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', { level: 3, name: /Bighorn Basin Rimrock & Shoshone Ridge/i })
    ).toBeDefined();
  });

  it('updates calibration & stoop velocity calculations reactively with accessible live region', () => {
    render(<FalconryHub />);

    const liveStatus = screen.getByRole('status');
    expect(liveStatus).toBeDefined();
    expect(liveStatus.getAttribute('aria-live')).toBe('polite');

    const groundSelect = screen.getByLabelText(/select falconry ground/i);
    const speciesSelect = screen.getByLabelText(/raptor species/i);
    const baseMoltInput = screen.getByLabelText(/base molt weight/i);
    const targetWeightInput = screen.getByLabelText(/target flying weight/i);
    const pitchAltitudeInput = screen.getByLabelText(/pitch altitude/i);
    const ambientTempInput = screen.getByLabelText(/ambient temperature/i);

    // Initial defaults check
    expect(liveStatus.textContent).toContain('-12.2%');
    expect(liveStatus.textContent).toContain('Prime Hunting Condition');
    expect(liveStatus.textContent).toContain('142 mph');
    expect(liveStatus.textContent).toContain('40.5 km');

    // Change to Gyrfalcon at Red Desert with starvation weight
    fireEvent.change(groundSelect, { target: { value: 'sagebrush-sea-wyoming' } });
    fireEvent.change(speciesSelect, { target: { value: 'gyrfalcon' } });
    fireEvent.change(baseMoltInput, { target: { value: '1200' } });
    fireEvent.change(targetWeightInput, { target: { value: '950' } }); // (950-1200)/1200 = -20.8%
    fireEvent.change(pitchAltitudeInput, { target: { value: '350' } });
    fireEvent.change(ambientTempInput, { target: { value: '-5' } });

    expect(liveStatus.textContent).toContain('Red Desert High Steppe & Sagebrush Sea');
    expect(liveStatus.textContent).toContain('-20.8%');
    expect(liveStatus.textContent).toContain('Starvation Danger Lethal');
    expect(liveStatus.textContent).toContain('CRITICAL');
    expect(liveStatus.textContent).toContain('Sub-zero');
  });

  it('toggles checklist items and updates progress counter', () => {
    render(<FalconryHub />);

    const counter = screen.getByTestId('falconry-gear-counter');
    expect(counter.textContent).toBe('0 of 6 packed');

    const telemetryCheckbox = screen.getByLabelText(
      /Dual-Frequency 216MHz VHF Tail-Mount & Micro-GPS Backpack/i
    );
    fireEvent.click(telemetryCheckbox);
    expect(counter.textContent).toBe('1 of 6 packed');

    const gauntletCheckbox = screen.getByLabelText(
      /Reinforced Triple-Layer Elk-Hide Gauntlet with D-Ring Tether/i
    );
    fireEvent.click(gauntletCheckbox);
    expect(counter.textContent).toBe('2 of 6 packed');

    // Uncheck telemetry
    fireEvent.click(telemetryCheckbox);
    expect(counter.textContent).toBe('1 of 6 packed');
  });
});
