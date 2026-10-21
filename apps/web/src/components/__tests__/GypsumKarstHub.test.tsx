import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GypsumKarstHub from '../GypsumKarstHub';

describe('GypsumKarstHub component', () => {
  it('renders all 4 subterranean gypsum-karst dissolution maze systems initially and filters by country, morphology, difficulty, and search query', () => {
    render(<GypsumKarstHub />);

    expect(
      screen.getByText(
        /Optimisticeskaja \(Optymistychna\) & Ozerna Artesian Gypsum Mega-Labyrinth/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Sistema Spipola-Acquafredda & Vena del Gesso Messinian Selenite Karst/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Karst en Yesos de Sorbas & Cueva de Covadura Evaporite Maze/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Parks Ranch Cave & Yeso-Castile Evaporite Sink-Maze/i
      )
    ).toBeInTheDocument();

    // Filter by country
    const countrySelect = screen.getByLabelText(/Filter by Country/i);
    fireEvent.change(countrySelect, { target: { value: 'Ukraine' } });

    expect(
      screen.getByText(
        /Optimisticeskaja \(Optymistychna\) & Ozerna Artesian Gypsum Mega-Labyrinth/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Sistema Spipola-Acquafredda & Vena del Gesso Messinian Selenite Karst/i
      )
    ).not.toBeInTheDocument();

    // Reset filters
    fireEvent.click(screen.getByRole('button', { name: /Reset Filters/i }));
    expect(
      screen.getByText(
        /Sistema Spipola-Acquafredda & Vena del Gesso Messinian Selenite Karst/i
      )
    ).toBeInTheDocument();

    // Filter by morphology
    const morphologySelect = screen.getByLabelText(/Gypsum Maze Morphology/i);
    fireEvent.change(morphologySelect, {
      target: { value: 'messinian-selenite-epigenetic-gorge' },
    });
    expect(
      screen.getByText(
        /Sistema Spipola-Acquafredda & Vena del Gesso Messinian Selenite Karst/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Optimisticeskaja \(Optymistychna\) & Ozerna Artesian Gypsum Mega-Labyrinth/i
      )
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Reset Filters/i }));

    // Filter by search
    const searchInput = screen.getByLabelText(/Search Gypsum-Karst Systems/i);
    fireEvent.change(searchInput, { target: { value: 'Sorbas' } });
    expect(
      screen.getByText(
        /Karst en Yesos de Sorbas & Cueva de Covadura Evaporite Maze/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Optimisticeskaja \(Optymistychna\) & Ozerna Artesian Gypsum Mega-Labyrinth/i
      )
    ).not.toBeInTheDocument();
  });

  it('loads site preset values into the calculator when clicking Load into Calculator on a site card', () => {
    render(<GypsumKarstHub />);

    const podoliaCard = screen.getByTestId(
      'gypsum-karst-site-card-optimisticeskaja-ozerna-podolia-ukraine'
    );
    const loadButton = podoliaCard.querySelector('button');
    expect(loadButton).not.toBeNull();
    if (loadButton) {
      fireEvent.click(loadButton);
    }

    expect(
      screen.getByLabelText(/Junction Density per 100m/i)
    ).toHaveValue(36);
  });

  it('updates live calculator telemetry when inputs or quick presets change', () => {
    render(<GypsumKarstHub />);

    const resultPanel = screen.getByTestId('gypsum-karst-calculator-result');
    expect(resultPanel).toHaveAttribute('role', 'status');
    expect(resultPanel).toHaveTextContent(
      'continuous-retro-reflective-spool-survey'
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /Moderate Single-File Hydration-Buckle Bypass/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'silent-single-file-bypass-hydration-buckles'
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /High Upper-Phreatic Tier Retreat & Compass Lock/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'retreat-upper-phreatic-tier-lock-compass'
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /Critical Slab Delamination & Siphon Flood Abort/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'abort-evaporite-slab-collapse-siphon-closure'
    );
  });

  it('toggles gear checklist items and updates the progress counter', () => {
    render(<GypsumKarstHub />);

    const counter = screen.getByTestId('gypsum-karst-gear-counter');
    expect(counter).toHaveTextContent('0 / 6 items verified');

    const spoolCheckbox = screen.getByLabelText(
      /Continuous 400m Dyneema Labyrinth Spool & Retro-Reflective Directional Cookies/i
    );
    fireEvent.click(spoolCheckbox);
    expect(counter).toHaveTextContent('1 / 6 items verified');

    const glovesCheckbox = screen.getByLabelText(
      /ANSI A5 Kevlar-Palm Caving Gloves & Cordura Selenite-Guard Knee Pads/i
    );
    fireEvent.click(glovesCheckbox);
    expect(counter).toHaveTextContent('2 / 6 items verified');
  });
});
