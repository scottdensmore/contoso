import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CenoteHaloclineHub from '../CenoteHaloclineHub';

describe('CenoteHaloclineHub component', () => {
  it('renders all 4 anchialine cenote & halocline cave systems initially and filters by country, morphology, difficulty, and search query', () => {
    render(<CenoteHaloclineHub />);

    expect(
      screen.getByText(/Sistema Ox Bel Ha Anchialine Halocline Labyrinth/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Cenote Angelita Meromictic Hydrogen-Sulfide Cloud Shaft/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Sistema Sac Actun & Dos Ojos Decorated Phreatic Conduit/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Dan's Cave & Sawmill Sink Anchialine Blue Hole Conduit/i
      )
    ).toBeInTheDocument();

    // Filter by country
    const countrySelect = screen.getByLabelText(/Filter by Country/i);
    fireEvent.change(countrySelect, { target: { value: 'Bahamas' } });

    expect(
      screen.getByText(
        /Dan's Cave & Sawmill Sink Anchialine Blue Hole Conduit/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Sistema Ox Bel Ha Anchialine Halocline Labyrinth/i)
    ).not.toBeInTheDocument();

    // Reset filters
    fireEvent.click(screen.getByRole('button', { name: /Reset Filters/i }));
    expect(
      screen.getByText(/Sistema Ox Bel Ha Anchialine Halocline Labyrinth/i)
    ).toBeInTheDocument();

    // Filter by morphology
    const morphologySelect = screen.getByLabelText(/Cenote Morphology/i);
    fireEvent.change(morphologySelect, {
      target: { value: 'meromictic-h2s-cloud-bell-sinkhole' },
    });
    expect(
      screen.getByText(
        /Cenote Angelita Meromictic Hydrogen-Sulfide Cloud Shaft/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Sistema Ox Bel Ha Anchialine Halocline Labyrinth/i)
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Reset Filters/i }));

    // Filter by search
    const searchInput = screen.getByLabelText(/Search Cenote Sites/i);
    fireEvent.change(searchInput, { target: { value: 'Sac Actun' } });
    expect(
      screen.getByText(
        /Sistema Sac Actun & Dos Ojos Decorated Phreatic Conduit/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Dan's Cave & Sawmill Sink Anchialine Blue Hole Conduit/i
      )
    ).not.toBeInTheDocument();
  });

  it('loads site preset values into the calculator when clicking Load into Calculator on a site card', () => {
    render(<CenoteHaloclineHub />);

    const angelitaCard = screen.getByTestId(
      'cenote-site-card-angelita-h2s-cloud-tulum-mexico'
    );
    const loadButton = angelitaCard.querySelector('button');
    expect(loadButton).not.toBeNull();
    if (loadButton) {
      fireEvent.click(loadButton);
    }

    expect(
      screen.getByLabelText(/Halocline Salinity Delta \(ppt\)/i)
    ).toHaveValue(33);
  });

  it('updates live calculator telemetry when inputs or quick presets change', () => {
    render(<CenoteHaloclineHub />);

    const resultPanel = screen.getByTestId('cenote-calculator-result');
    expect(resultPanel).toHaveAttribute('role', 'status');
    expect(resultPanel).toHaveTextContent('visual-daylight-cavern-zone-line');

    fireEvent.click(
      screen.getByRole('button', {
        name: /Moderate Halocline Phreatic Traverse/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'continuous-guideline-frog-kick-above-halocline'
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /High Schlieren Blur & Clay Resuspension/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'blind-tactile-line-cookies-zero-vis-drill'
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /Critical Meromictic H2S & Zero-Vis Siltout/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'abort-toxic-h2s-siltout-entrapment-hazard'
    );
  });

  it('toggles gear checklist items and updates the progress counter', () => {
    render(<CenoteHaloclineHub />);

    const counter = screen.getByTestId('cenote-gear-counter');
    expect(counter).toHaveTextContent('0 / 6 items verified');

    const reelCheckbox = screen.getByLabelText(
      /Primary 120 m Braided Nylon Cave Reel, Directional Line Arrows & REM Cookies/i
    );
    fireEvent.click(reelCheckbox);
    expect(counter).toHaveTextContent('1 / 6 items verified');

    const canisterCheckbox = screen.getByLabelText(
      /2,500-Lumen Tight-Beam 6° Canister Primary Light & Dual Backup Torches/i
    );
    fireEvent.click(canisterCheckbox);
    expect(counter).toHaveTextContent('2 / 6 items verified');
  });
});
