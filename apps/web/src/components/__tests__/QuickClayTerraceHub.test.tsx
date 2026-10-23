import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import QuickClayTerraceHub from '../QuickClayTerraceHub';

describe('QuickClayTerraceHub component', () => {
  it('renders all 4 coastal fjord quick-clay marine-terrace corridors initially and filters by country, depositType, difficulty, and search query', () => {
    render(<QuickClayTerraceHub />);

    expect(
      screen.getByText(
        /Gauldalen & Rissa Trondheimsfjord Kvikkleire Marine-Terrace Ravines/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Romerike & Nittedal-Gjerdrum Dissected Quick-Clay Plateau/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /South Nation River & Lemieux Champlain Sea Leda-Clay Bluffs/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Saguenay Fjord & Rivière aux Vases Laflamme Sea Clay Terraces/i
      )
    ).toBeInTheDocument();

    // Filter by country
    const countrySelect = screen.getByLabelText(/Filter by Country/i);
    fireEvent.change(countrySelect, { target: { value: 'Canada' } });

    expect(
      screen.getByText(
        /South Nation River & Lemieux Champlain Sea Leda-Clay Bluffs/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Gauldalen & Rissa Trondheimsfjord Kvikkleire Marine-Terrace Ravines/i
      )
    ).not.toBeInTheDocument();

    // Reset filters
    fireEvent.click(screen.getByRole('button', { name: /Reset Filters/i }));
    expect(
      screen.getByText(
        /Gauldalen & Rissa Trondheimsfjord Kvikkleire Marine-Terrace Ravines/i
      )
    ).toBeInTheDocument();

    // Filter by depositType
    const depositSelect = screen.getByLabelText(/Quick-Clay Deposit Type/i);
    fireEvent.change(depositSelect, {
      target: { value: 'fjord-delta-subaqueous-scarp' },
    });
    expect(
      screen.getByText(
        /Romerike & Nittedal-Gjerdrum Dissected Quick-Clay Plateau/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Gauldalen & Rissa Trondheimsfjord Kvikkleire Marine-Terrace Ravines/i
      )
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Reset Filters/i }));

    // Filter by search
    const searchInput = screen.getByLabelText(
      /Search Quick-Clay Terraces & Basins/i
    );
    fireEvent.change(searchInput, { target: { value: 'Saguenay' } });
    expect(
      screen.getByText(
        /Saguenay Fjord & Rivière aux Vases Laflamme Sea Clay Terraces/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Gauldalen & Rissa Trondheimsfjord Kvikkleire Marine-Terrace Ravines/i
      )
    ).not.toBeInTheDocument();
  });

  it('loads site preset values into the calculator when clicking Load into Calculator on a site card', () => {
    render(<QuickClayTerraceHub />);

    const gauldalenCard = screen.getByTestId(
      'quick-clay-terrace-site-card-gauldalen-trondheimsfjord-kvikkleire-norway'
    );
    const loadButton = gauldalenCard.querySelector('button');
    expect(loadButton).not.toBeNull();
    if (loadButton) {
      fireEvent.click(loadButton);
    }

    expect(
      screen.getByLabelText(/Sensitivity Ratio St/i)
    ).toHaveValue(120);
  });

  it('updates live calculator telemetry when inputs or quick presets change', () => {
    render(<QuickClayTerraceHub />);

    const resultPanel = screen.getByTestId(
      'quick-clay-terrace-calculator-result'
    );
    expect(resultPanel).toHaveAttribute('role', 'status');
    expect(resultPanel).toHaveTextContent(
      'bedrock-ridge-above-marine-limit'
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /Moderate Wide-Setback Dry-Crust March/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'wide-setback-dry-crust-terrace-march'
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /High Evacuate Ravine Floor to High Ground/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'evacuate-ravine-floor-lateral-high-ground'
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /Critical Abort Imminent Flake-Flow Liquefaction/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'abort-imminent-flake-flow-liquefaction'
    );
  });

  it('toggles gear checklist items and updates the progress counter', () => {
    render(<QuickClayTerraceHub />);

    const counter = screen.getByTestId('quick-clay-terrace-gear-counter');
    expect(counter).toHaveTextContent('0 / 6 items verified');

    const probeCheckbox = screen.getByLabelText(
      /Portable Field Vane-Shear & Conductivity Pore-Salinity Probe/i
    );
    fireEvent.click(probeCheckbox);
    expect(counter).toHaveTextContent('1 / 6 items verified');

    const skisCheckbox = screen.getByLabelText(
      /Wide Backcountry Skis or High-Flotation Bog Snowshoes/i
    );
    fireEvent.click(skisCheckbox);
    expect(counter).toHaveTextContent('2 / 6 items verified');
  });
});
