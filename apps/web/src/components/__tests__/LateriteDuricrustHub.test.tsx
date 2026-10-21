import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LateriteDuricrustHub from '../LateriteDuricrustHub';

describe('LateriteDuricrustHub component', () => {
  it('renders all 4 tropical laterite duricrust mesa, bowal & canga scarp-edge zones initially and filters by country, duricrustType, difficulty, and search query', () => {
    render(<LateriteDuricrustHub />);

    expect(
      screen.getByText(
        /Fouta Djallon & Labé Ferricrete Bowé \(Cuirasse Latéritique\) Escarpment/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Serra dos Carajás & Campos Rupestres de Canga Hematite Mesa/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Mitchell Plateau \(Ngauwudu\) Bauxite-Laterite Breakaway Scarp/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Kaas Plateau & Panchgani Deccan Laterite Tableland Rim/i
      )
    ).toBeInTheDocument();

    // Filter by country
    const countrySelect = screen.getByLabelText(/Filter by Country/i);
    fireEvent.change(countrySelect, { target: { value: 'Guinea' } });

    expect(
      screen.getByText(
        /Fouta Djallon & Labé Ferricrete Bowé \(Cuirasse Latéritique\) Escarpment/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Serra dos Carajás & Campos Rupestres de Canga Hematite Mesa/i
      )
    ).not.toBeInTheDocument();

    // Reset filters
    fireEvent.click(screen.getByRole('button', { name: /Reset Filters/i }));
    expect(
      screen.getByText(
        /Serra dos Carajás & Campos Rupestres de Canga Hematite Mesa/i
      )
    ).toBeInTheDocument();

    // Filter by duricrust type
    const typeSelect = screen.getByLabelText(/Duricrust Type/i);
    fireEvent.change(typeSelect, {
      target: { value: 'canga-hematite-rupestre-plateau' },
    });
    expect(
      screen.getByText(
        /Serra dos Carajás & Campos Rupestres de Canga Hematite Mesa/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Fouta Djallon & Labé Ferricrete Bowé \(Cuirasse Latéritique\) Escarpment/i
      )
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Reset Filters/i }));

    // Filter by search
    const searchInput = screen.getByLabelText(
      /Search Laterite & Canga Mesas/i
    );
    fireEvent.change(searchInput, { target: { value: 'Mitchell Plateau' } });
    expect(
      screen.getByText(
        /Mitchell Plateau \(Ngauwudu\) Bauxite-Laterite Breakaway Scarp/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Fouta Djallon & Labé Ferricrete Bowé \(Cuirasse Latéritique\) Escarpment/i
      )
    ).not.toBeInTheDocument();
  });

  it('loads site preset values into the calculator when clicking Load into Calculator on a site card', () => {
    render(<LateriteDuricrustHub />);

    const foutaCard = screen.getByTestId(
      'laterite-duricrust-site-card-fouta-djallon-bowe-labe-guinea'
    );
    const loadButton = foutaCard.querySelector('button');
    expect(loadButton).not.toBeNull();
    if (loadButton) {
      fireEvent.click(loadButton);
    }

    expect(
      screen.getByLabelText(/Saprolite Undercut Span \(m\)/i)
    ).toHaveValue(2.8);
  });

  it('updates live calculator telemetry when inputs or quick presets change', () => {
    render(<LateriteDuricrustHub />);

    const resultPanel = screen.getByTestId(
      'laterite-duricrust-calculator-result'
    );
    expect(resultPanel).toHaveAttribute('role', 'status');
    expect(resultPanel).toHaveTextContent(
      'inland-cuirasse-slab-gnss-bearing'
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /Moderate Sweep Pisolite Pea-Gravel with Poles/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'sweep-pisolite-pea-gravel-trekking-poles'
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /High 6m Setback from Saprolite Cornice/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'setback-6m-undercut-saprolite-cornice'
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /Critical Abort Rim & Descend Gully/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'abort-rim-descend-gully-lightning-collapse'
    );
  });

  it('toggles gear checklist items and updates the progress counter', () => {
    render(<LateriteDuricrustHub />);

    const counter = screen.getByTestId('laterite-duricrust-gear-counter');
    expect(counter).toHaveTextContent('0 / 6 items verified');

    const bootsCheckbox = screen.getByLabelText(
      /Deep-Lug Vibram Megagrip Approach Boots & Carbide-Tip Trekking Poles/i
    );
    fireEvent.click(bootsCheckbox);
    expect(counter).toHaveTextContent('1 / 6 items verified');

    const gnssCheckbox = screen.getByLabelText(
      /Multi-Band Dual-Frequency GNSS Receiver & Optical Sun-Shadow Compass/i
    );
    fireEvent.click(gnssCheckbox);
    expect(counter).toHaveTextContent('2 / 6 items verified');
  });
});
