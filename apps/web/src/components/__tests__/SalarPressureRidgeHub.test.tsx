import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SalarPressureRidgeHub from '../SalarPressureRidgeHub';

describe('SalarPressureRidgeHub component', () => {
  it('renders all 4 high-altitude salar pressure-ridge trekking zones initially and filters by country, morphology, difficulty, and search query', () => {
    render(<SalarPressureRidgeHub />);

    expect(
      screen.getByText(
        /Salar de Uyuni Isla Incahuasi & Colchani Ojos del Salar Corridor/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Salar de Atacama Laguna Chaxa & Cordillera de la Sal Pressure-Ridge Core/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Salar de Arizaro & Cono de Arita Black-Halite Pressure-Ridge Basin/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Salar de Chalviri & Laguna Salada Borate-Mirabilite Margin/i
      )
    ).toBeInTheDocument();

    // Filter by country
    const countrySelect = screen.getByLabelText(/Filter by Country/i);
    fireEvent.change(countrySelect, { target: { value: 'Chile' } });

    expect(
      screen.getByText(
        /Salar de Atacama Laguna Chaxa & Cordillera de la Sal Pressure-Ridge Core/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Salar de Uyuni Isla Incahuasi & Colchani Ojos del Salar Corridor/i
      )
    ).not.toBeInTheDocument();

    // Reset filters
    fireEvent.click(screen.getByRole('button', { name: /Reset Filters/i }));
    expect(
      screen.getByText(
        /Salar de Uyuni Isla Incahuasi & Colchani Ojos del Salar Corridor/i
      )
    ).toBeInTheDocument();

    // Filter by morphology
    const morphologySelect = screen.getByLabelText(/Salar Morphology/i);
    fireEvent.change(morphologySelect, {
      target: { value: 'polygonal-halite-pressure-crust' },
    });
    expect(
      screen.getByText(
        /Salar de Arizaro & Cono de Arita Black-Halite Pressure-Ridge Basin/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Salar de Uyuni Isla Incahuasi & Colchani Ojos del Salar Corridor/i
      )
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Reset Filters/i }));

    // Filter by search
    const searchInput = screen.getByLabelText(/Search Salar Sites/i);
    fireEvent.change(searchInput, { target: { value: 'Incahuasi' } });
    expect(
      screen.getByText(
        /Salar de Uyuni Isla Incahuasi & Colchani Ojos del Salar Corridor/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Salar de Atacama Laguna Chaxa & Cordillera de la Sal Pressure-Ridge Core/i
      )
    ).not.toBeInTheDocument();
  });

  it('loads site preset values into the calculator when clicking Load into Calculator on a site card', () => {
    render(<SalarPressureRidgeHub />);

    const uyuniCard = screen.getByTestId(
      'salar-site-card-uyuni-incahuasi-ojos-bolivia'
    );
    const loadButton = uyuniCard.querySelector('button');
    expect(loadButton).not.toBeNull();
    if (loadButton) {
      fireEvent.click(loadButton);
    }

    expect(
      screen.getByLabelText(/Halite Crust Thickness \(cm\)/i)
    ).toHaveValue(28);
  });

  it('updates live calculator telemetry when inputs or quick presets change', () => {
    render(<SalarPressureRidgeHub />);

    const resultPanel = screen.getByTestId('salar-calculator-result');
    expect(resultPanel).toHaveAttribute('role', 'status');
    expect(resultPanel).toHaveTextContent('direct-polygonal-plate-march');

    fireEvent.click(
      screen.getByRole('button', {
        name: /Moderate Ojos Margin Detour/i,
      })
    );
    expect(resultPanel).toHaveTextContent('probe-ojos-margin-30m-detour');

    fireEvent.click(
      screen.getByRole('button', {
        name: /High Gypsum Ridge Pulk & Goggles/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'snowshoe-pulk-load-spread-glacier-goggles'
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /Critical Thin Mirabilite Brine Crust/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'abort-thin-mirabilite-brine-crust'
    );
  });

  it('toggles gear checklist items and updates the progress counter', () => {
    render(<SalarPressureRidgeHub />);

    const counter = screen.getByTestId('salar-gear-counter');
    expect(counter).toHaveTextContent('0 / 6 items verified');

    const gogglesCheckbox = screen.getByLabelText(
      /Category 4 Glacier Goggles with Leather Side-Shields & Nose Guard/i
    );
    fireEvent.click(gogglesCheckbox);
    expect(counter).toHaveTextContent('1 / 6 items verified');

    const probeCheckbox = screen.getByLabelText(
      /Graduated Carbon-Steel Halite Crust Probe Rod \(200 cm\)/i
    );
    fireEvent.click(probeCheckbox);
    expect(counter).toHaveTextContent('2 / 6 items verified');
  });
});
