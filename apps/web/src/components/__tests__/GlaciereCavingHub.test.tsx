import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GlaciereCavingHub from '../GlaciereCavingHub';

describe('GlaciereCavingHub component', () => {
  it('renders all 4 subterranean glacière cave sites initially and filters by country, morphology, difficulty, and search query', () => {
    render(<GlaciereCavingHub />);

    expect(
      screen.getByText(/Eisriesenwelt Dynamic Wind-Chimney Ice Labyrinth/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Peștera Scărișoara Stratified Firn-Block Cold Trap/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Bandera & Candelaria Static Cold-Trap Basalt Lava Tube/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Lofthellir Permafrost Basaltic Lava Tube Glacière/i)
    ).toBeInTheDocument();

    // Filter by country
    const countrySelect = screen.getByLabelText(/Filter by Country/i);
    fireEvent.change(countrySelect, { target: { value: 'Iceland' } });

    expect(
      screen.getByText(/Lofthellir Permafrost Basaltic Lava Tube Glacière/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Eisriesenwelt Dynamic Wind-Chimney Ice Labyrinth/i)
    ).not.toBeInTheDocument();

    // Reset filters
    fireEvent.click(screen.getByRole('button', { name: /Reset Filters/i }));
    expect(
      screen.getByText(/Eisriesenwelt Dynamic Wind-Chimney Ice Labyrinth/i)
    ).toBeInTheDocument();

    // Filter by morphology
    const morphologySelect = screen.getByLabelText(/Glacière Morphology/i);
    fireEvent.change(morphologySelect, {
      target: { value: 'stratified-firn-plug-pit' },
    });
    expect(
      screen.getByText(/Peștera Scărișoara Stratified Firn-Block Cold Trap/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Lofthellir Permafrost Basaltic Lava Tube Glacière/i)
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Reset Filters/i }));

    // Filter by search
    const searchInput = screen.getByLabelText(/Search Glacière Sites/i);
    fireEvent.change(searchInput, { target: { value: 'Bandera' } });
    expect(
      screen.getByText(
        /Bandera & Candelaria Static Cold-Trap Basalt Lava Tube/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Peștera Scărișoara Stratified Firn-Block Cold Trap/i)
    ).not.toBeInTheDocument();
  });

  it('loads site preset values into the calculator when clicking Load into Calculator on a site card', () => {
    render(<GlaciereCavingHub />);

    const lofthellirCard = screen.getByTestId(
      'glaciere-site-card-lofthellir-lava-glaciere-iceland'
    );
    const loadButton = lofthellirCard.querySelector('button');
    expect(loadButton).not.toBeNull();
    if (loadButton) {
      fireEvent.click(loadButton);
    }

    expect(screen.getByLabelText(/Floor Ice Slope \(deg\)/i)).toHaveValue(34);
    expect(screen.getByLabelText(/Cave Air Temperature \(°C\)/i)).toHaveValue(
      -0.8
    );
    expect(screen.getByLabelText(/CO2 Sump Concentration \(ppm\)/i)).toHaveValue(
      2600
    );
  });

  it('updates live calculator telemetry when inputs or quick presets change', () => {
    render(<GlaciereCavingHub />);

    const resultPanel = screen.getByTestId('glaciere-calculator-result');
    expect(resultPanel).toHaveAttribute('role', 'status');
    expect(resultPanel).toHaveTextContent('microspikes-10pt');

    fireEvent.click(
      screen.getByRole('button', {
        name: /Moderate Firn-Ramp & Cold-Trap Corridor/i,
      })
    );
    expect(resultPanel).toHaveTextContent('steel-12pt-crampons-ice-axe');

    fireEvent.click(
      screen.getByRole('button', {
        name: /High Wet-Glaze Ramp & CO2 Sump/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'front-point-dual-tools-ice-screws'
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /Critical Thermal-Thaw Hoarfrost & Hypoxic Abort/i,
      })
    );
    expect(resultPanel).toHaveTextContent('abort-glaze-co2-collapse-hazard');
  });

  it('toggles gear checklist items and updates the progress counter', () => {
    render(<GlaciereCavingHub />);

    const counter = screen.getByTestId('glaciere-gear-counter');
    expect(counter).toHaveTextContent('0 / 6 items verified');

    const cramponCheckbox = screen.getByLabelText(
      /12-Point Chromoly Steel Crampons with Full Anti-Balling Plates/i
    );
    fireEvent.click(cramponCheckbox);
    expect(counter).toHaveTextContent('1 / 6 items verified');

    const co2Checkbox = screen.getByLabelText(
      /NDIR Dual-Channel CO2 & O2 Subterranean Sump Gas Monitor/i
    );
    fireEvent.click(co2Checkbox);
    expect(counter).toHaveTextContent('2 / 6 items verified');
  });
});
