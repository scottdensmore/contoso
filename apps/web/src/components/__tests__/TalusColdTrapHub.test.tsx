import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TalusColdTrapHub from '../TalusColdTrapHub';

describe('TalusColdTrapHub component', () => {
  it('renders all 4 subalpine boulder-talus air-draft ice cave & cold-trap block-field zones initially and filters by country, regime, difficulty, and search query', () => {
    render(<TalusColdTrapHub />);

    expect(
      screen.getByText(/King Ravine Subway & Mahoosuc Notch Balch-Ice Megatalus/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Indian Pass & Avalanche Pass Anorthosite Talus Ice Chasms/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Driftless Area Algific Talus Cold-Air Vent Slopes/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Kamenec & Naděje Pseudokarst Phonolite Cold-Trap Block-Field/i
      )
    ).toBeInTheDocument();

    // Filter by country
    const countrySelect = screen.getByLabelText(/Filter by Country/i);
    fireEvent.change(countrySelect, { target: { value: 'Czech Republic' } });

    expect(
      screen.getByText(
        /Kamenec & Naděje Pseudokarst Phonolite Cold-Trap Block-Field/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /King Ravine Subway & Mahoosuc Notch Balch-Ice Megatalus/i
      )
    ).not.toBeInTheDocument();

    // Reset filters
    fireEvent.click(screen.getByRole('button', { name: /Reset Filters/i }));
    expect(
      screen.getByText(/King Ravine Subway & Mahoosuc Notch Balch-Ice Megatalus/i)
    ).toBeInTheDocument();

    // Filter by regime
    const regimeSelect = screen.getByLabelText(/Talus Cold-Trap Regime/i);
    fireEvent.change(regimeSelect, {
      target: { value: 'algific-dolomite-cold-vent-slope' },
    });
    expect(
      screen.getByText(/Driftless Area Algific Talus Cold-Air Vent Slopes/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /King Ravine Subway & Mahoosuc Notch Balch-Ice Megatalus/i
      )
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Reset Filters/i }));

    // Filter by search
    const searchInput = screen.getByLabelText(/Search Talus Cold-Trap Zones/i);
    fireEvent.change(searchInput, { target: { value: 'Mahoosuc' } });
    expect(
      screen.getByText(/King Ravine Subway & Mahoosuc Notch Balch-Ice Megatalus/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Kamenec & Naděje Pseudokarst Phonolite Cold-Trap Block-Field/i
      )
    ).not.toBeInTheDocument();
  });

  it('loads site preset values into the calculator when clicking Load into Calculator on a site card', () => {
    render(<TalusColdTrapHub />);

    const kingRavineCard = screen.getByTestId(
      'talus-cold-trap-site-card-king-ravine-mahosuc-notch-white-mountains-nh'
    );
    const loadButton = kingRavineCard.querySelector('button');
    expect(loadButton).not.toBeNull();
    if (loadButton) {
      fireEvent.click(loadButton);
    }

    expect(
      screen.getByLabelText(/Crevice Void Depth \(m\)/i)
    ).toHaveValue(18);
  });

  it('updates live calculator telemetry when inputs or quick presets change', () => {
    render(<TalusColdTrapHub />);

    const resultPanel = screen.getByTestId('talus-cold-trap-calculator-result');
    expect(resultPanel).toHaveAttribute('role', 'status');
    expect(resultPanel).toHaveTextContent('three-point-dry-granite-hop');

    fireEvent.click(
      screen.getByRole('button', {
        name: /Moderate Sphagnum Probe & Microspike Transition/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'probe-sphagnum-mats-microspike-transition'
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /High Chockstone Crawl & Deep-Vent Avoidance/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'belay-chockstone-crawl-avoid-deep-vents'
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /Critical Glazed Megatalus Entrapment Abort/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'abort-glazed-megatalus-entrapment-hazard'
    );
  });

  it('toggles gear checklist items and updates the progress counter', () => {
    render(<TalusColdTrapHub />);

    const counter = screen.getByTestId('talus-cold-trap-gear-counter');
    expect(counter).toHaveTextContent('0 / 6 items verified');

    const spikesCheckbox = screen.getByLabelText(
      /Stainless-Steel Torsional Chain Microspikes & Carbide Talus Probe/i
    );
    fireEvent.click(spikesCheckbox);
    expect(counter).toHaveTextContent('1 / 6 items verified');

    const helmetCheckbox = screen.getByLabelText(
      /UIAA-Rated Sub-Talus Caving Helmet & Dual-Beam Headlamp/i
    );
    fireEvent.click(helmetCheckbox);
    expect(counter).toHaveTextContent('2 / 6 items verified');
  });
});
