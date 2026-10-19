import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TephraNavigationHub from '../TephraNavigationHub';

describe('TephraNavigationHub component', () => {
  it('renders all 4 volcanic tephra sites initially and filters by country, lithology, difficulty, and search query', () => {
    render(<TephraNavigationHub />);

    expect(
      screen.getByText(/Mount Yasur Ash Plain & Scoria Cone Apron/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Volcán Acatenango–Fuego Lapilli Saddle & Scree Chute/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Mount Tarawera Chasm & Basaltic Scoria Scree/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Volcán Chaitén Obsidian Dome & Cristobalite Ash Apron/i
      )
    ).toBeInTheDocument();

    // Filter by country
    const countrySelect = screen.getByLabelText(/Filter by Country/i);
    fireEvent.change(countrySelect, { target: { value: 'Chile' } });

    expect(
      screen.getByText(
        /Volcán Chaitén Obsidian Dome & Cristobalite Ash Apron/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Mount Yasur Ash Plain & Scoria Cone Apron/i)
    ).not.toBeInTheDocument();

    // Reset filters
    fireEvent.click(screen.getByRole('button', { name: /Reset Filters/i }));
    expect(
      screen.getByText(/Mount Yasur Ash Plain & Scoria Cone Apron/i)
    ).toBeInTheDocument();

    // Filter by lithology
    const lithologySelect = screen.getByLabelText(/Tephra Lithology/i);
    fireEvent.change(lithologySelect, {
      target: { value: 'vesicular-pumice' },
    });
    expect(
      screen.getByText(/Mount Tarawera Chasm & Basaltic Scoria Scree/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Volcán Chaitén Obsidian Dome & Cristobalite Ash Apron/i
      )
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Reset Filters/i }));

    // Filter by search
    const searchInput = screen.getByLabelText(/Search Tephra Sites/i);
    fireEvent.change(searchInput, { target: { value: 'Acatenango' } });
    expect(
      screen.getByText(
        /Volcán Acatenango–Fuego Lapilli Saddle & Scree Chute/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Mount Tarawera Chasm & Basaltic Scoria Scree/i)
    ).not.toBeInTheDocument();
  });

  it('loads site preset values into the calculator when clicking Load into Calculator on a site card', () => {
    render(<TephraNavigationHub />);

    const chaitenCard = screen.getByTestId(
      'tephra-site-card-chaiten-rhyolite-pumice-chile'
    );
    const loadButton = chaitenCard.querySelector('button');
    expect(loadButton).not.toBeNull();
    if (loadButton) {
      fireEvent.click(loadButton);
    }

    expect(screen.getByLabelText(/Slope Angle \(deg\)/i)).toHaveValue(35);
    expect(screen.getByLabelText(/Cristobalite Ash \(%\)/i)).toHaveValue(19);
    expect(screen.getByLabelText(/Median Grain Size \(mm\)/i)).toHaveValue(0.12);
  });

  it('updates live calculator telemetry when inputs or quick presets change', () => {
    render(<TephraNavigationHub />);

    const resultPanel = screen.getByTestId('tephra-calculator-result');
    expect(resultPanel).toHaveAttribute('role', 'status');
    expect(resultPanel).toHaveTextContent('N95-goggles');

    fireEvent.click(
      screen.getByRole('button', {
        name: /Moderate Scoria Plunge-Step Corridor/i,
      })
    );
    expect(resultPanel).toHaveTextContent('P100-elastomeric-sealed-goggles');

    fireEvent.click(
      screen.getByRole('button', {
        name: /High Ash Resuspension & Lapilli Chute/i,
      })
    );
    expect(resultPanel).toHaveTextContent('P100-full-face-APR');

    fireEvent.click(
      screen.getByRole('button', {
        name: /Critical Cristobalite Dome & Grain-Flow Abort/i,
      })
    );
    expect(resultPanel).toHaveTextContent('abort-silicosis-grainflow-hazard');
  });

  it('toggles gear checklist items and updates the progress counter', () => {
    render(<TephraNavigationHub />);

    const counter = screen.getByTestId('tephra-gear-counter');
    expect(counter).toHaveTextContent('0 / 6 items verified');

    const p100Checkbox = screen.getByLabelText(
      /NIOSH P100 Elastomeric Half-Mask Respirator & Spare Particulate Cartridges/i
    );
    fireEvent.click(p100Checkbox);
    expect(counter).toHaveTextContent('1 / 6 items verified');

    const gogglesCheckbox = screen.getByLabelText(
      /Non-Vented Sealed Polycarbonate Ash & Lapilli Goggles/i
    );
    fireEvent.click(gogglesCheckbox);
    expect(counter).toHaveTextContent('2 / 6 items verified');
  });
});
