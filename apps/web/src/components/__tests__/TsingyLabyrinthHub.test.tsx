import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TsingyLabyrinthHub from '../TsingyLabyrinthHub';

describe('TsingyLabyrinthHub component', () => {
  it('renders all 4 tropical tsingy labyrinth sites initially and filters by country, morphology, difficulty, and search query', () => {
    render(<TsingyLabyrinthHub />);

    expect(
      screen.getByText(
        /Tsingy de Bemaraha Grand Tsingy & Andamozavaky Razor Labyrinth/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Massif de l'Ankarana Tsingy Rary & Sunken Diaclase Forest/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Gunung Api & Gunung Mulu Razor-Limestone Pinnacles/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Shilin & Naigu Permian Dolomitic Pinnacle Labyrinth/i)
    ).toBeInTheDocument();

    // Filter by country
    const countrySelect = screen.getByLabelText(/Filter by Country/i);
    fireEvent.change(countrySelect, { target: { value: 'Malaysia' } });

    expect(
      screen.getByText(/Gunung Api & Gunung Mulu Razor-Limestone Pinnacles/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Tsingy de Bemaraha Grand Tsingy & Andamozavaky Razor Labyrinth/i
      )
    ).not.toBeInTheDocument();

    // Reset filters
    fireEvent.click(screen.getByRole('button', { name: /Reset Filters/i }));
    expect(
      screen.getByText(
        /Tsingy de Bemaraha Grand Tsingy & Andamozavaky Razor Labyrinth/i
      )
    ).toBeInTheDocument();

    // Filter by morphology
    const morphologySelect = screen.getByLabelText(/Karst Morphology/i);
    fireEvent.change(morphologySelect, {
      target: { value: 'diaclase-slot-corridor-maze' },
    });
    expect(
      screen.getByText(
        /Massif de l'Ankarana Tsingy Rary & Sunken Diaclase Forest/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Gunung Api & Gunung Mulu Razor-Limestone Pinnacles/i)
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Reset Filters/i }));

    // Filter by search
    const searchInput = screen.getByLabelText(/Search Tsingy Sites/i);
    fireEvent.change(searchInput, { target: { value: 'Kunming' } });
    expect(
      screen.getByText(/Shilin & Naigu Permian Dolomitic Pinnacle Labyrinth/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Tsingy de Bemaraha Grand Tsingy & Andamozavaky Razor Labyrinth/i
      )
    ).not.toBeInTheDocument();
  });

  it('loads site preset values into the calculator when clicking Load into Calculator on a site card', () => {
    render(<TsingyLabyrinthHub />);

    const bemarahaCard = screen.getByTestId(
      'tsingy-site-card-bemaraha-grand-tsingy-madagascar'
    );
    const loadButton = bemarahaCard.querySelector('button');
    expect(loadButton).not.toBeNull();
    if (loadButton) {
      fireEvent.click(loadButton);
    }

    expect(screen.getByLabelText(/Blade Edge Radius \(mm\)/i)).toHaveValue(0.5);
  });

  it('updates live calculator telemetry when inputs or quick presets change', () => {
    render(<TsingyLabyrinthHub />);

    const resultPanel = screen.getByTestId('tsingy-calculator-result');
    expect(resultPanel).toHaveAttribute('role', 'status');
    expect(resultPanel).toHaveTextContent('kevlar-gloves-approach-boots');

    fireEvent.click(
      screen.getByRole('button', {
        name: /Moderate Via-Ferrata Slot Scramble/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'via-ferrata-energy-absorber-lanyards'
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /High Razor-Arête Steel-Core Traverse/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'twin-steel-core-tethers-edge-protectors'
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /Critical Knife-Edge & Solar-Bake Crest/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'abort-razor-karst-hyperthermia-hazard'
    );
  });

  it('toggles gear checklist items and updates the progress counter', () => {
    render(<TsingyLabyrinthHub />);

    const counter = screen.getByTestId('tsingy-gear-counter');
    expect(counter).toHaveTextContent('0 / 6 items verified');

    const glovesCheckbox = screen.getByLabelText(
      /ANSI Cut-Level A5 Kevlar-Palm Scrambling Gloves & Forearm Sleeves/i
    );
    fireEvent.click(glovesCheckbox);
    expect(counter).toHaveTextContent('1 / 6 items verified');

    const lanyardCheckbox = screen.getByLabelText(
      /EN 958 Energy-Absorbing Via-Ferrata Lanyard with Steel-Core Tethers & Canvas Edge Rollers/i
    );
    fireEvent.click(lanyardCheckbox);
    expect(counter).toHaveTextContent('2 / 6 items verified');
  });
});
