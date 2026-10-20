import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ThermokarstTundraHub from '../ThermokarstTundraHub';

describe('ThermokarstTundraHub component', () => {
  it('renders all 4 Arctic ice-wedge polygon & thermokarst thaw-slump sites initially and filters by country, morphology, difficulty, and search query', () => {
    render(<ThermokarstTundraHub />);

    expect(
      screen.getByText(
        /Tuktoyaktuk Peninsula Ice-Wedge Polygon & Pingo Littoral Tundra/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Batagaika & Yana Highlands Retrogressive Thaw-Slump Headwall/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Noatak & Brooks Range Foothills Eriophorum Tussock Polygon Basin/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Lena Delta & Bykovsky Yedoma Ice-Complex Alas Depressions/i
      )
    ).toBeInTheDocument();

    // Filter by country
    const countrySelect = screen.getByLabelText(/Filter by Country/i);
    fireEvent.change(countrySelect, { target: { value: 'Canada' } });

    expect(
      screen.getByText(
        /Tuktoyaktuk Peninsula Ice-Wedge Polygon & Pingo Littoral Tundra/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Batagaika & Yana Highlands Retrogressive Thaw-Slump Headwall/i
      )
    ).not.toBeInTheDocument();

    // Reset filters
    fireEvent.click(screen.getByRole('button', { name: /Reset Filters/i }));
    expect(
      screen.getByText(
        /Batagaika & Yana Highlands Retrogressive Thaw-Slump Headwall/i
      )
    ).toBeInTheDocument();

    // Filter by morphology
    const morphologySelect = screen.getByLabelText(/Thermokarst Morphology/i);
    fireEvent.change(morphologySelect, {
      target: { value: 'retrogressive-thaw-slump-headwall' },
    });
    expect(
      screen.getByText(
        /Batagaika & Yana Highlands Retrogressive Thaw-Slump Headwall/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Tuktoyaktuk Peninsula Ice-Wedge Polygon & Pingo Littoral Tundra/i
      )
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Reset Filters/i }));

    // Filter by search
    const searchInput = screen.getByLabelText(/Search Thermokarst Sites/i);
    fireEvent.change(searchInput, { target: { value: 'Noatak' } });
    expect(
      screen.getByText(
        /Noatak & Brooks Range Foothills Eriophorum Tussock Polygon Basin/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Lena Delta & Bykovsky Yedoma Ice-Complex Alas Depressions/i
      )
    ).not.toBeInTheDocument();
  });

  it('loads site preset values into the calculator when clicking Load into Calculator on a site card', () => {
    render(<ThermokarstTundraHub />);

    const batagaikaCard = screen.getByTestId(
      'thermokarst-site-card-batagaika-mega-slump-yakutia'
    );
    const loadButton = batagaikaCard.querySelector('button');
    expect(loadButton).not.toBeNull();
    if (loadButton) {
      fireEvent.click(loadButton);
    }

    expect(screen.getByLabelText(/Active-Layer Thaw Depth \(cm\)/i)).toHaveValue(
      135
    );
  });

  it('updates live calculator telemetry when inputs or quick presets change', () => {
    render(<ThermokarstTundraHub />);

    const resultPanel = screen.getByTestId('thermokarst-calculator-result');
    expect(resultPanel).toHaveAttribute('role', 'status');
    expect(resultPanel).toHaveTextContent('walk-polygon-rim-levees');

    fireEvent.click(
      screen.getByRole('button', {
        name: /Moderate High-Center Polygon Trough/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'probe-frost-table-diagonal-trough-hop'
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /High Eriophorum Tussock & Deep Trough/i,
      })
    );
    expect(resultPanel).toHaveTextContent('gravel-esker-ridge-detour');

    fireEvent.click(
      screen.getByRole('button', {
        name: /Critical Yedoma Thaw-Slump Liquefaction/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'abort-retrogressive-slump-mudflow-hazard'
    );
  });

  it('toggles gear checklist items and updates the progress counter', () => {
    render(<ThermokarstTundraHub />);

    const counter = screen.getByTestId('thermokarst-gear-counter');
    expect(counter).toHaveTextContent('0 / 6 items verified');

    const probeCheckbox = screen.getByLabelText(
      /Graduated 160 cm Carbon-Steel Permafrost Frost-Table Tile Probe/i
    );
    fireEvent.click(probeCheckbox);
    expect(counter).toHaveTextContent('1 / 6 items verified');

    const bootsCheckbox = screen.getByLabelText(
      /Knee-High Neoprene-Lined Tundra Wading Boots & Locking Lace Gaiters/i
    );
    fireEvent.click(bootsCheckbox);
    expect(counter).toHaveTextContent('2 / 6 items verified');
  });
});
