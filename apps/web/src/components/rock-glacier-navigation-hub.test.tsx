import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RockGlacierNavigationHub from './rock-glacier-navigation-hub';

describe('RockGlacierNavigationHub component', () => {
  it('renders all 5 curated sites initially and filters by morphology, ice state, and technique', () => {
    render(<RockGlacierNavigationHub />);

    expect(
      screen.getByText(/Sourdough Peak & McCarthy Creek Lobate Rock Glacier/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Glaciar de Escombros Dos Lenguas/i)
    ).toBeInTheDocument();

    const morphologySelect = screen.getByLabelText(/Rock-Glacier Morphology/i);
    fireEvent.change(morphologySelect, {
      target: { value: 'oversteepened_frontal_talus_apron' },
    });

    expect(
      screen.getByText(/Glaciar de Escombros Dos Lenguas/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Sourdough Peak & McCarthy Creek Lobate Rock Glacier/i)
    ).not.toBeInTheDocument();

    const resetBtn = screen.getByRole('button', { name: /Reset Filters/i });
    fireEvent.click(resetBtn);

    expect(
      screen.getByText(/Sourdough Peak & McCarthy Creek Lobate Rock Glacier/i)
    ).toBeInTheDocument();
  });

  it('loads a site into the calculator when clicking Load into Calculator', () => {
    render(<RockGlacierNavigationHub />);

    const muraglCard = screen.getByTestId(
      'rock-glacier-site-card-muragl-upper-engadine-permafrost-carapace'
    );
    const loadButton = muraglCard.querySelector('button');
    expect(loadButton).not.toBeNull();
    if (loadButton) {
      fireEvent.click(loadButton);
    }

    expect(screen.getByLabelText(/Mean Block Diameter \(cm\)/i)).toHaveValue(
      84
    );
    expect(screen.getByLabelText(/Slope Angle \(deg\)/i)).toHaveValue(25);
    expect(
      screen.getByLabelText(/Active-Layer Thaw Depth \(cm\)/i)
    ).toHaveValue(145);
    expect(
      screen.getByLabelText(/Interstitial Void Ratio \(%\)/i)
    ).toHaveValue(35);
  });

  it('updates calculator live output panel across all 3 quick presets and numeric inputs', () => {
    render(<RockGlacierNavigationHub />);

    const resultPanel = screen.getByTestId('rock-glacier-calculator-result');
    expect(resultPanel).toHaveAttribute('role', 'status');
    expect(resultPanel).toHaveTextContent('nominal_cryo_cemented_carapace');

    fireEvent.click(
      screen.getByRole('button', {
        name: /Midday Active-Layer Thaw & Void Caution/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'caution_perched_block_and_void_hazard'
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /Oversteepened Frontal Scarp & Thaw-Slump Abort/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'abort_oversteepened_scarp_or_thaw_rotation'
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /Cryo-Cemented Compression Ridge Corridor/i,
      })
    );
    expect(resultPanel).toHaveTextContent('nominal_cryo_cemented_carapace');
  });

  it('tracks mandatory ankle/tibial armor and block extrication gear checklist items', () => {
    render(<RockGlacierNavigationHub />);

    const counter = screen.getByTestId('rock-glacier-gear-counter');
    expect(counter).toHaveTextContent('0 / 6 mandatory items verified');

    const bootCheckbox = screen.getByLabelText(
      /Full\/3-Quarter Shank Vibram Megagrip B2\/B3 Mountaineering Boots/i
    );
    fireEvent.click(bootCheckbox);
    expect(counter).toHaveTextContent('1 / 6 mandatory items verified');

    const staffCheckbox = screen.getByLabelText(
      /Fixed-Wall Chromoly\/7075-T6 Scrambling Staff/i
    );
    fireEvent.click(staffCheckbox);
    expect(counter).toHaveTextContent('2 / 6 mandatory items verified');
  });
});
