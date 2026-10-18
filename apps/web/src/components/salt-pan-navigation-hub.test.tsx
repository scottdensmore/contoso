import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import SaltPanNavigationHub from './salt-pan-navigation-hub';

describe('SaltPanNavigationHub component', () => {
  it('renders all 5 curated salt pan & arid playa sites initially and filters by evaporite crust type, atmospheric refraction state, and traversal mode', () => {
    render(<SaltPanNavigationHub />);

    expect(
      screen.getByRole('heading', {
        name: /Salar de Uyuni & Isla Incahuasi Polygonal Halite Core/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: /Badwater Basin & Devil's Golf Course Serrated Halite Pan/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: /Makgadikgadi Ntwetwe & Sua Evaporite Pan Traverse/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: /Chott el Djerid Ephemeral Gypsum-Brine Sebkha/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: /Bonneville Salt Flats & Silver Island Halite Crust Corridor/i,
      })
    ).toBeInTheDocument();

    const crustSelect = screen.getByLabelText(/Evaporite Crust Type/i);
    fireEvent.change(crustSelect, {
      target: { value: 'polygonal_halite_pressure_ridge' },
    });

    expect(
      screen.getByRole('heading', {
        name: /Salar de Uyuni & Isla Incahuasi Polygonal Halite Core/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', {
        name: /Badwater Basin & Devil's Golf Course Serrated Halite Pan/i,
      })
    ).not.toBeInTheDocument();

    const resetBtn = screen.getByRole('button', { name: /Reset Filters/i });
    fireEvent.click(resetBtn);

    expect(
      screen.getByRole('heading', {
        name: /Badwater Basin & Devil's Golf Course Serrated Halite Pan/i,
      })
    ).toBeInTheDocument();

    const refractionSelect = screen.getByLabelText(
      /Atmospheric Refraction State/i
    );
    fireEvent.change(refractionSelect, {
      target: { value: 'fata_morgana_vertical_loom' },
    });

    expect(
      screen.getByRole('heading', {
        name: /Makgadikgadi Ntwetwe & Sua Evaporite Pan Traverse/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: /Chott el Djerid Ephemeral Gypsum-Brine Sebkha/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', {
        name: /Salar de Uyuni & Isla Incahuasi Polygonal Halite Core/i,
      })
    ).not.toBeInTheDocument();

    fireEvent.click(resetBtn);

    const traversalSelect = screen.getByLabelText(
      /Recommended Traversal Mode/i
    );
    fireEvent.change(traversalSelect, {
      target: { value: 'fat_tire_bikepacking_low_psi' },
    });

    expect(
      screen.getByRole('heading', {
        name: /Makgadikgadi Ntwetwe & Sua Evaporite Pan Traverse/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', {
        name: /Bonneville Salt Flats & Silver Island Halite Crust Corridor/i,
      })
    ).not.toBeInTheDocument();
  });

  it('loads site attributes into the calculator when clicking "Load into Calculator"', () => {
    render(<SaltPanNavigationHub />);

    const badwaterCard = screen.getByTestId(
      'salt-pan-site-card-badwater-devils-golf-course-halite-pan'
    );
    const loadBtn = within(badwaterCard).getByRole('button', {
      name: /Load into Calculator/i,
    });
    fireEvent.click(loadBtn);

    expect(
      screen.getByLabelText(/Halite Crust Thickness \(cm\)/i)
    ).toHaveValue(16);
    expect(screen.getByLabelText(/Water Table Depth \(cm\)/i)).toHaveValue(28);
    expect(screen.getByLabelText(/Surface Air Temp \(°C\)/i)).toHaveValue(39);
    expect(screen.getByLabelText(/Ground Skin Temp \(°C\)/i)).toHaveValue(58);
  });

  it('updates calculator live result panel via numeric inputs and quick preset buttons', () => {
    render(<SaltPanNavigationHub />);

    const resultPanel = screen.getByTestId('salt-pan-calculator-result');
    expect(resultPanel).toHaveAttribute('role', 'status');

    fireEvent.click(
      screen.getByRole('button', {
        name: /Predawn Crystalline Halite Corridor/i,
      })
    );
    expect(resultPanel).toHaveTextContent('nominal_crystalline_halite_corridor');

    fireEvent.click(
      screen.getByRole('button', {
        name: /Midday Inferior Mirage & Gypsum Crust Caution/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'caution_mirage_azimuth_drift_and_brine_crust'
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /Capillary Brine Margin & Liquefied Silt Abort/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'abort_subsurface_brine_mud_breakthrough'
    );

    const crustInput = screen.getByLabelText(/Halite Crust Thickness \(cm\)/i);
    fireEvent.change(crustInput, { target: { value: '35' } });
    expect(crustInput).toHaveValue(35);
  });

  it('tracks mandatory crust sounding and optical navigation gear checklist progress', () => {
    render(<SaltPanNavigationHub />);

    const counter = screen.getByTestId('salt-pan-gear-counter');
    expect(counter).toHaveTextContent('0 / 6 mandatory items verified');

    const augerCheckbox = screen.getByRole('checkbox', {
      name: /Graduated Stainless Evaporite Crust Core Auger/i,
    });
    fireEvent.click(augerCheckbox);
    expect(counter).toHaveTextContent('1 / 6 mandatory items verified');

    const compassCheckbox = screen.getByRole('checkbox', {
      name: /Fluid-Damped Prismatic Sighting Compass/i,
    });
    fireEvent.click(compassCheckbox);
    expect(counter).toHaveTextContent('2 / 6 mandatory items verified');

    fireEvent.click(augerCheckbox);
    expect(counter).toHaveTextContent('1 / 6 mandatory items verified');
  });
});
