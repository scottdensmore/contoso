import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AapaPalsaMireHub from '../AapaPalsaMireHub';

describe('AapaPalsaMireHub component', () => {
  it('renders all 4 boreal string-bog (aapa mire) & palsa permafrost-mound zones initially and filters by country, morphology, difficulty, and search query', () => {
    render(<AapaPalsaMireHub />);

    expect(
      screen.getByText(
        /Viiankiaapa & Sodankylä Concentric String-Bog \(Aapasuo\) Labyrinth/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Tavvavuoma & Vissátvuopmi Giant Palsa-Mound Plateau/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Hudson Bay Lowlands & Polar Bear Provincial Park String-Fen & Palsa Complex/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Øvre Pasvik & Neiden-Munkefjord Palsa-Aapa Mire Corridor/i
      )
    ).toBeInTheDocument();

    // Filter by country
    const countrySelect = screen.getByLabelText(/Filter by Country/i);
    fireEvent.change(countrySelect, { target: { value: 'Finland' } });

    expect(
      screen.getByText(
        /Viiankiaapa & Sodankylä Concentric String-Bog \(Aapasuo\) Labyrinth/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Tavvavuoma & Vissátvuopmi Giant Palsa-Mound Plateau/i)
    ).not.toBeInTheDocument();

    // Reset filters
    fireEvent.click(screen.getByRole('button', { name: /Reset Filters/i }));
    expect(
      screen.getByText(/Tavvavuoma & Vissátvuopmi Giant Palsa-Mound Plateau/i)
    ).toBeInTheDocument();

    // Filter by morphology
    const morphologySelect = screen.getByLabelText(/Mire Morphology/i);
    fireEvent.change(morphologySelect, {
      target: { value: 'ice-cored-palsa-dome-plateau' },
    });
    expect(
      screen.getByText(/Tavvavuoma & Vissátvuopmi Giant Palsa-Mound Plateau/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Viiankiaapa & Sodankylä Concentric String-Bog \(Aapasuo\) Labyrinth/i
      )
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Reset Filters/i }));

    // Filter by search
    const searchInput = screen.getByLabelText(/Search Aapa & Palsa Mires/i);
    fireEvent.change(searchInput, { target: { value: 'Hudson Bay' } });
    expect(
      screen.getByText(
        /Hudson Bay Lowlands & Polar Bear Provincial Park String-Fen & Palsa Complex/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Viiankiaapa & Sodankylä Concentric String-Bog \(Aapasuo\) Labyrinth/i
      )
    ).not.toBeInTheDocument();
  });

  it('loads site preset values into the calculator when clicking Load into Calculator on a site card', () => {
    render(<AapaPalsaMireHub />);

    const viiankiaapaCard = screen.getByTestId(
      'aapa-palsa-mire-site-card-voda-viiankiaapa-sodankyla-lapland-finland'
    );
    const loadButton = viiankiaapaCard.querySelector('button');
    expect(loadButton).not.toBeNull();
    if (loadButton) {
      fireEvent.click(loadButton);
    }

    expect(screen.getByLabelText(/Sträng Ridge Width \(m\)/i)).toHaveValue(1.4);
  });

  it('updates live calculator telemetry when inputs or quick presets change', () => {
    render(<AapaPalsaMireHub />);

    const resultPanel = screen.getByTestId(
      'aapa-palsa-mire-calculator-result'
    );
    expect(resultPanel).toHaveAttribute('role', 'status');
    expect(resultPanel).toHaveTextContent(
      'thread-continuous-betula-strang-crests'
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /Moderate Sedge-Mat Probe & Load Distribution/i,
      })
    );
    expect(resultPanel).toHaveTextContent('probe-sedge-mat-distribute-load');

    fireEvent.click(
      screen.getByRole('button', {
        name: /High Wide-Berth Palsa Lagg-Moat Detour/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'wide-berth-palsa-lagg-moat-detour'
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /Critical Quaking Flark Abort & Esker Bypass/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'abort-quaking-flark-basin-route-esker'
    );
  });

  it('toggles gear checklist items and updates the progress counter', () => {
    render(<AapaPalsaMireHub />);

    const counter = screen.getByTestId('aapa-palsa-mire-gear-counter');
    expect(counter).toHaveTextContent('0 / 6 items verified');

    const probeCheckbox = screen.getByLabelText(
      /240cm Graduated Peat-Depth Probe Staff & Wide-Basket Mire Trekking Poles/i
    );
    fireEvent.click(probeCheckbox);
    expect(counter).toHaveTextContent('1 / 6 items verified');

    const throwBagCheckbox = screen.getByLabelText(
      /20m Floating Dyneema Mire-Rescue Throw Bag & Chest-Harness Tow Tether/i
    );
    fireEvent.click(throwBagCheckbox);
    expect(counter).toHaveTextContent('2 / 6 items verified');
  });
});
