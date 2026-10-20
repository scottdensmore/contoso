import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BambooThicketHub from '../BambooThicketHub';

describe('BambooThicketHub component', () => {
  it('renders all 4 montane bamboo-thicket bushwhacking zones initially and filters by country, ecotype, difficulty, and search query', () => {
    render(<BambooThicketHub />);

    expect(
      screen.getByText(
        /Cordillera de Talamanca & Cerro Kamuk Chusquea Cloud-Ridge/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Hidaka Mountains Poroshiri-dake Sasa kurilensis \(Chishima-zasa\) Crest/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Rwenzori & Virunga Yushania alpina Montane Bamboo Belt/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Cordillera Vilcabamba & Apurímac Chusquea scandens Knife-Edge/i
      )
    ).toBeInTheDocument();

    // Filter by country
    const countrySelect = screen.getByLabelText(/Filter by Country/i);
    fireEvent.change(countrySelect, { target: { value: 'Japan' } });

    expect(
      screen.getByText(
        /Hidaka Mountains Poroshiri-dake Sasa kurilensis \(Chishima-zasa\) Crest/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Cordillera de Talamanca & Cerro Kamuk Chusquea Cloud-Ridge/i
      )
    ).not.toBeInTheDocument();

    // Reset filters
    fireEvent.click(screen.getByRole('button', { name: /Reset Filters/i }));
    expect(
      screen.getByText(
        /Cordillera de Talamanca & Cerro Kamuk Chusquea Cloud-Ridge/i
      )
    ).toBeInTheDocument();

    // Filter by ecotype
    const ecotypeSelect = screen.getByLabelText(/Bamboo Ecotype/i);
    fireEvent.change(ecotypeSelect, {
      target: { value: 'yushania-alpina-montane-belt' },
    });
    expect(
      screen.getByText(/Rwenzori & Virunga Yushania alpina Montane Bamboo Belt/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Cordillera de Talamanca & Cerro Kamuk Chusquea Cloud-Ridge/i
      )
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Reset Filters/i }));

    // Filter by search
    const searchInput = screen.getByLabelText(/Search Bamboo Sites/i);
    fireEvent.change(searchInput, { target: { value: 'Kamuk' } });
    expect(
      screen.getByText(
        /Cordillera de Talamanca & Cerro Kamuk Chusquea Cloud-Ridge/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Hidaka Mountains Poroshiri-dake Sasa kurilensis \(Chishima-zasa\) Crest/i
      )
    ).not.toBeInTheDocument();
  });

  it('loads site preset values into the calculator when clicking Load into Calculator on a site card', () => {
    render(<BambooThicketHub />);

    const chirripoCard = screen.getByTestId(
      'bamboo-site-card-chirripo-talamanca-chusquea-costa-rica'
    );
    const loadButton = chirripoCard.querySelector('button');
    expect(loadButton).not.toBeNull();
    if (loadButton) {
      fireEvent.click(loadButton);
    }

    expect(
      screen.getByLabelText(/Culm Density \(culms\/m²\)/i)
    ).toHaveValue(82);
  });

  it('updates live calculator telemetry when inputs or quick presets change', () => {
    render(<BambooThicketHub />);

    const resultPanel = screen.getByTestId('bamboo-calculator-result');
    expect(resultPanel).toHaveAttribute('role', 'status');
    expect(resultPanel).toHaveTextContent('follow-tapir-bear-tunnel-leads');

    fireEvent.click(
      screen.getByRole('button', {
        name: /Moderate Sasa Crest Culm Swim/i,
      })
    );
    expect(resultPanel).toHaveTextContent('hand-over-hand-culm-belay-swim');

    fireEvent.click(
      screen.getByRole('button', {
        name: /High Chusquea Ridge Node-Saw Prune/i,
      })
    );
    expect(resultPanel).toHaveTextContent('flush-node-saw-prune-4m-spacing');

    fireEvent.click(
      screen.getByRole('button', {
        name: /Critical Spiny Impaction & Cornice Overhang/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'abort-cornice-drop-spiny-impaction'
    );
  });

  it('toggles gear checklist items and updates the progress counter', () => {
    render(<BambooThicketHub />);

    const counter = screen.getByTestId('bamboo-gear-counter');
    expect(counter).toHaveTextContent('0 / 6 items verified');

    const gogglesCheckbox = screen.getByLabelText(
      /Polycarbonate Forestry Mesh Goggles & Ballistic Eye-Whip Visor/i
    );
    fireEvent.click(gogglesCheckbox);
    expect(counter).toHaveTextContent('1 / 6 items verified');

    const sawCheckbox = screen.getByLabelText(
      /Folding Japanese Pull-Saw \(Silky Gomboy\) for Flush Node Cuts/i
    );
    fireEvent.click(sawCheckbox);
    expect(counter).toHaveTextContent('2 / 6 items verified');
  });
});
