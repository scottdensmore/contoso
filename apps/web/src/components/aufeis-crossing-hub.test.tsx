import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import AufeisCrossingHub from './aufeis-crossing-hub';

describe('AufeisCrossingHub component', () => {
  it('renders all 5 curated aufeis sites initially and filters by morphology, overflow hydrology state, and traversal mode', () => {
    render(<AufeisCrossingHub />);

    expect(
      screen.getByRole('heading', {
        name: /Canning River & Shublik Springs Perennial Aufeis Field/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: /Firth River & Joe Creek Braided Naled Sheet/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: /Delta River & Castner Creek Glacial-Spring Overflow Corridor/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: /Moma River Valley Ulakhan-Taryn Great Naled/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: /Hess River & Macmillan Pass Pressurized Frost-Blister Crossing/i,
      })
    ).toBeInTheDocument();

    const morphologySelect = screen.getByLabelText(/Aufeis Morphology/i);
    fireEvent.change(morphologySelect, {
      target: { value: 'perennial_tundra_spring_naled' },
    });

    expect(
      screen.getByRole('heading', {
        name: /Canning River & Shublik Springs Perennial Aufeis Field/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: /Moma River Valley Ulakhan-Taryn Great Naled/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', {
        name: /Firth River & Joe Creek Braided Naled Sheet/i,
      })
    ).not.toBeInTheDocument();

    const resetBtn = screen.getByRole('button', { name: /Reset Filters/i });
    fireEvent.click(resetBtn);

    expect(
      screen.getByRole('heading', {
        name: /Firth River & Joe Creek Braided Naled Sheet/i,
      })
    ).toBeInTheDocument();

    const overflowSelect = screen.getByLabelText(/Overflow Hydrology State/i);
    fireEvent.change(overflowSelect, {
      target: { value: 'hollow_drained_air_cavity_vault' },
    });

    expect(
      screen.getByRole('heading', {
        name: /Hess River & Macmillan Pass Pressurized Frost-Blister Crossing/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', {
        name: /Canning River & Shublik Springs Perennial Aufeis Field/i,
      })
    ).not.toBeInTheDocument();

    fireEvent.click(resetBtn);

    const traversalSelect = screen.getByLabelText(
      /Recommended Traversal Mode/i
    );
    fireEvent.change(traversalSelect, {
      target: { value: 'boot_microspike_pulk_tow' },
    });

    expect(
      screen.getByRole('heading', {
        name: /Delta River & Castner Creek Glacial-Spring Overflow Corridor/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', {
        name: /Moma River Valley Ulakhan-Taryn Great Naled/i,
      })
    ).not.toBeInTheDocument();
  });

  it('loads site attributes into the calculator when clicking "Load into Calculator"', () => {
    render(<AufeisCrossingHub />);

    const deltaCard = screen.getByTestId(
      'aufeis-site-card-delta-river-black-rapids-overflow-sheet'
    );
    const loadBtn = within(deltaCard).getByRole('button', {
      name: /Load into Calculator/i,
    });
    fireEvent.click(loadBtn);

    expect(screen.getByLabelText(/Upper Crust Thickness \(cm\)/i)).toHaveValue(
      11
    );
    expect(screen.getByLabelText(/Slush Water Lens Depth \(cm\)/i)).toHaveValue(
      45
    );
    expect(screen.getByLabelText(/Hydrostatic Head \(kPa\)/i)).toHaveValue(42);
    expect(screen.getByLabelText(/Cavity Span \(m\)/i)).toHaveValue(2.2);
  });

  it('updates calculator live result panel via numeric inputs and quick preset buttons', () => {
    render(<AufeisCrossingHub />);

    const resultPanel = screen.getByTestId('aufeis-calculator-result');
    expect(resultPanel).toHaveAttribute('role', 'status');

    fireEvent.click(
      screen.getByRole('button', {
        name: /Cryolocked Laminar Sheet Corridor/i,
      })
    );
    expect(resultPanel).toHaveTextContent('nominal_cryolocked_laminar_sheet');

    fireEvent.click(
      screen.getByRole('button', {
        name: /Active Overflow Slush Accretion Caution/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'caution_overflow_slush_accretion_hazard'
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /Pressurized Frost-Blister & Hollow Vault Abort/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'abort_pressurized_lens_or_cavity_collapse'
    );

    const crustInput = screen.getByLabelText(/Upper Crust Thickness \(cm\)/i);
    fireEvent.change(crustInput, { target: { value: '32' } });
    expect(crustInput).toHaveValue(32);
  });

  it('tracks mandatory ice sounding and slush accretion gear checklist progress', () => {
    render(<AufeisCrossingHub />);

    const counter = screen.getByTestId('aufeis-gear-counter');
    expect(counter).toHaveTextContent('0 / 6 mandatory items verified');

    const soundingBarCheckbox = screen.getByRole('checkbox', {
      name: /Graduated Chisel-Tip Steel Ice Sounding Bar/i,
    });
    fireEvent.click(soundingBarCheckbox);
    expect(counter).toHaveTextContent('1 / 6 mandatory items verified');

    const overbootsCheckbox = screen.getByRole('checkbox', {
      name: /Vapor-Barrier Neoprene & Coated-Nylon Insulated Overboots/i,
    });
    fireEvent.click(overbootsCheckbox);
    expect(counter).toHaveTextContent('2 / 6 mandatory items verified');

    fireEvent.click(soundingBarCheckbox);
    expect(counter).toHaveTextContent('1 / 6 mandatory items verified');
  });
});
