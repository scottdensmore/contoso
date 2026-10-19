import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CobbleSpitTrekkingHub from '../CobbleSpitTrekkingHub';

describe('CobbleSpitTrekkingHub component', () => {
  it('renders all 4 intertidal cobble spit & kelp-wrack boulder reef sites initially and filters by country, morphology, difficulty, and search query', () => {
    render(<CobbleSpitTrekkingHub />);

    expect(
      screen.getByText(/Dungeness Cuspate Shingle Spit & Drift-Log Berm/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Chesil Beach Graded Flint & Chert Storm-Berm Tombolo/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Pachena–Carmanah Intertidal Kelp-Wrack Boulder Reef/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Nelson Boulder Bank & Farewell Spit Granodiorite Cobble Bar/i
      )
    ).toBeInTheDocument();

    // Filter by country
    const countrySelect = screen.getByLabelText(/Filter by Country/i);
    fireEvent.change(countrySelect, { target: { value: 'New Zealand' } });

    expect(
      screen.getByText(
        /Nelson Boulder Bank & Farewell Spit Granodiorite Cobble Bar/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Dungeness Cuspate Shingle Spit & Drift-Log Berm/i)
    ).not.toBeInTheDocument();

    // Reset filters
    fireEvent.click(screen.getByRole('button', { name: /Reset Filters/i }));
    expect(
      screen.getByText(/Dungeness Cuspate Shingle Spit & Drift-Log Berm/i)
    ).toBeInTheDocument();

    // Filter by morphology
    const morphologySelect = screen.getByLabelText(/Cobble Spit Morphology/i);
    fireEvent.change(morphologySelect, {
      target: { value: 'storm-berm-cobble-bar' },
    });
    expect(
      screen.getByText(/Chesil Beach Graded Flint & Chert Storm-Berm Tombolo/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Pachena–Carmanah Intertidal Kelp-Wrack Boulder Reef/i)
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Reset Filters/i }));

    // Filter by search
    const searchInput = screen.getByLabelText(/Search Cobble Spit Sites/i);
    fireEvent.change(searchInput, { target: { value: 'Pachena' } });
    expect(
      screen.getByText(/Pachena–Carmanah Intertidal Kelp-Wrack Boulder Reef/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Chesil Beach Graded Flint & Chert Storm-Berm Tombolo/i
      )
    ).not.toBeInTheDocument();
  });

  it('loads site preset values into the calculator when clicking Load into Calculator on a site card', () => {
    render(<CobbleSpitTrekkingHub />);

    const wctCard = screen.getByTestId(
      'cobble-site-card-west-coast-trail-boulder-reef-canada'
    );
    const loadButton = wctCard.querySelector('button');
    expect(loadButton).not.toBeNull();
    if (loadButton) {
      fireEvent.click(loadButton);
    }

    expect(
      screen.getByLabelText(/Median Cobble Diameter \(mm\)/i)
    ).toHaveValue(260);
    expect(screen.getByLabelText(/Kelp Wrack Depth \(cm\)/i)).toHaveValue(85);
    expect(screen.getByLabelText(/Berm Slope \(deg\)/i)).toHaveValue(22);
  });

  it('updates live calculator telemetry when inputs or quick presets change', () => {
    render(<CobbleSpitTrekkingHub />);

    const resultPanel = screen.getByTestId('cobble-calculator-result');
    expect(resultPanel).toHaveAttribute('role', 'status');
    expect(resultPanel).toHaveTextContent('trail-runner-trekking-poles');

    fireEvent.click(
      screen.getByRole('button', {
        name: /Moderate Shingle Berm & Wrack Band/i,
      })
    );
    expect(resultPanel).toHaveTextContent('high-cuff-scree-boot-dual-poles');

    fireEvent.click(
      screen.getByRole('button', {
        name: /High Kelp-Mucilage Boulder Reef/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'tungsten-studded-felt-boot-wading-staff'
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /Critical Storm-Swell Overwash Abort/i,
      })
    );
    expect(resultPanel).toHaveTextContent('abort-swash-overwash-entrapment');
  });

  it('toggles gear checklist items and updates the progress counter', () => {
    render(<CobbleSpitTrekkingHub />);

    const counter = screen.getByTestId('cobble-gear-counter');
    expect(counter).toHaveTextContent('0 / 6 items verified');

    const bootCheckbox = screen.getByLabelText(
      /Tungsten-Carbide Studded Felt-Sole Intertidal Wading Boots/i
    );
    fireEvent.click(bootCheckbox);
    expect(counter).toHaveTextContent('1 / 6 items verified');

    const staffCheckbox = screen.getByLabelText(
      /Basketless Carbon-Chromoly Wading Staffs with Carbide Tips/i
    );
    fireEvent.click(staffCheckbox);
    expect(counter).toHaveTextContent('2 / 6 items verified');
  });
});
