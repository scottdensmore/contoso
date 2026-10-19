import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ParamoNavigationHub from './paramo-navigation-hub';

describe('ParamoNavigationHub component', () => {
  it('renders all 5 curated sites initially and filters by substrate morphology, fog regime, and traversal technique', () => {
    render(<ParamoNavigationHub />);

    expect(
      screen.getByText(
        /Páramo de Sumapaz & Lagunas de Chisacá Frailejón Moorland/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Reserva Ecológica El Ángel & Voladero Cushion-Bog Basin/i
      )
    ).toBeInTheDocument();

    const substrateSelect = screen.getByLabelText(
      /Páramo Substrate Morphology/i
    );
    fireEvent.change(substrateSelect, {
      target: { value: 'plantago_distichia_cushion_bog_dome' },
    });

    expect(
      screen.getByText(
        /Reserva Ecológica El Ángel & Voladero Cushion-Bog Basin/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Páramo de Sumapaz & Lagunas de Chisacá Frailejón Moorland/i
      )
    ).not.toBeInTheDocument();

    const resetBtn = screen.getByRole('button', { name: /Reset Filters/i });
    fireEvent.click(resetBtn);

    expect(
      screen.getByText(
        /Páramo de Sumapaz & Lagunas de Chisacá Frailejón Moorland/i
      )
    ).toBeInTheDocument();
  });

  it('loads a site into the calculator when clicking Load into Calculator', () => {
    render(<ParamoNavigationHub />);

    const cajasCard = screen.getByTestId(
      'paramo-site-card-cajas-toreadora-glacial-turbera-labyrinth'
    );
    const loadButton = cajasCard.querySelector('button');
    expect(loadButton).not.toBeNull();
    if (loadButton) {
      fireEvent.click(loadButton);
    }

    expect(screen.getByLabelText(/Cushion Mat Thickness \(cm\)/i)).toHaveValue(
      14
    );
    expect(
      screen.getByLabelText(/Histosol Water Saturation \(%\)/i)
    ).toHaveValue(92);
    expect(screen.getByLabelText(/Visibility \(m\)/i)).toHaveValue(28);
    expect(screen.getByLabelText(/Ambient Temperature \(°C\)/i)).toHaveValue(4);
    expect(screen.getByLabelText(/Wind Speed \(km\/h\)/i)).toHaveValue(32);
  });

  it('updates calculator live output panel across all 3 quick presets and numeric inputs', () => {
    render(<ParamoNavigationHub />);

    const resultPanel = screen.getByTestId('paramo-calculator-result');
    expect(resultPanel).toHaveAttribute('role', 'status');
    expect(resultPanel).toHaveTextContent(
      'nominal_morning_window_cushion_corridor'
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /Orographic Drizzle Whiteout & Turbera Caution/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'caution_whiteout_fog_and_turbera_breakthrough'
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /Freezing Sleet Squall & Saturated Peat Abort/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'abort_hypothermic_squall_and_peat_mire_entrapment'
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /Morning Clear Distichia Cushion Corridor/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'nominal_morning_window_cushion_corridor'
    );
  });

  it('tracks mandatory turbera footwear, probing, and hypothermia gear checklist items', () => {
    render(<ParamoNavigationHub />);

    const counter = screen.getByTestId('paramo-gear-counter');
    expect(counter).toHaveTextContent('0 / 6 mandatory items verified');

    const pantanerasCheckbox = screen.getByLabelText(
      /Knee-High Neoprene-Lined Vulcanized Rubber Páramo Pantaneras/i
    );
    fireEvent.click(pantanerasCheckbox);
    expect(counter).toHaveTextContent('1 / 6 mandatory items verified');

    const polesCheckbox = screen.getByLabelText(
      /Dual-Probe Carbon\/Alloy Trekking Poles with 85 mm Snow Baskets/i
    );
    fireEvent.click(polesCheckbox);
    expect(counter).toHaveTextContent('2 / 6 mandatory items verified');
  });
});
