import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SandurCrossingHub from '../SandurCrossingHub';

describe('SandurCrossingHub component', () => {
  it('renders all 4 glacial outwash braided-river sandur crossings initially and filters by country, morphology, difficulty, and search query', () => {
    render(<SandurCrossingHub />);

    expect(
      screen.getByText(
        /Skeiðarársandur & Þórsmörk Krossá Braided Outwash Plain/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Kaskawulsh & Slims River \(Ä'äy Chù\) Glacial Silt Outwash/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Rakaia & Hopkins Braided Greywacke Shingle Outwash/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Sheridan & Scott Glacier Outwash Sandur Delta/i)
    ).toBeInTheDocument();

    // Filter by country
    const countrySelect = screen.getByLabelText(/Filter by Country/i);
    fireEvent.change(countrySelect, { target: { value: 'Iceland' } });

    expect(
      screen.getByText(
        /Skeiðarársandur & Þórsmörk Krossá Braided Outwash Plain/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Rakaia & Hopkins Braided Greywacke Shingle Outwash/i
      )
    ).not.toBeInTheDocument();

    // Reset filters
    fireEvent.click(screen.getByRole('button', { name: /Reset Filters/i }));
    expect(
      screen.getByText(
        /Rakaia & Hopkins Braided Greywacke Shingle Outwash/i
      )
    ).toBeInTheDocument();

    // Filter by morphology
    const morphologySelect = screen.getByLabelText(/Sandur Morphology/i);
    fireEvent.change(morphologySelect, {
      target: { value: 'anastomosing-glacial-silt-braid' },
    });
    expect(
      screen.getByText(
        /Kaskawulsh & Slims River \(Ä'äy Chù\) Glacial Silt Outwash/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Skeiðarársandur & Þórsmörk Krossá Braided Outwash Plain/i
      )
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Reset Filters/i }));

    // Filter by search
    const searchInput = screen.getByLabelText(/Search Sandur Crossings/i);
    fireEvent.change(searchInput, { target: { value: 'Rakaia' } });
    expect(
      screen.getByText(
        /Rakaia & Hopkins Braided Greywacke Shingle Outwash/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Kaskawulsh & Slims River \(Ä'äy Chù\) Glacial Silt Outwash/i
      )
    ).not.toBeInTheDocument();
  });

  it('loads site preset values into the calculator when clicking Load into Calculator on a site card', () => {
    render(<SandurCrossingHub />);

    const icelandCard = screen.getByTestId(
      'sandur-site-card-skeidararsandur-krossa-iceland'
    );
    const loadButton = icelandCard.querySelector('button');
    expect(loadButton).not.toBeNull();
    if (loadButton) {
      fireEvent.click(loadButton);
    }

    expect(
      screen.getByLabelText(/Silt Flour Concentration \(mg\/L\)/i)
    ).toHaveValue(3800);
  });

  it('updates live calculator telemetry when inputs or quick presets change', () => {
    render(<SandurCrossingHub />);

    const resultPanel = screen.getByTestId('sandur-calculator-result');
    expect(resultPanel).toHaveAttribute('role', 'status');
    expect(resultPanel).toHaveTextContent('solo-diagonal-downstream-pole');

    fireEvent.click(
      screen.getByRole('button', {
        name: /Moderate Midday Multi-Thread Riffle/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'tripod-wedge-linked-belt-unbuckled'
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /High Afternoon Melt & Silt-Bar Liquefaction/i,
      })
    );
    expect(resultPanel).toHaveTextContent('wait-for-dawn-low-melt-window');

    fireEvent.click(
      screen.getByRole('button', {
        name: /Critical Evening Glacial Surge Torrent/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'abort-impassable-glacial-torrent'
    );
  });

  it('toggles gear checklist items and updates the progress counter', () => {
    render(<SandurCrossingHub />);

    const counter = screen.getByTestId('sandur-gear-counter');
    expect(counter).toHaveTextContent('0 / 6 items verified');

    const staffCheckbox = screen.getByLabelText(
      /Carbide-Tipped Collapsible Wading Staff & Dual Flick-Lock Trekking Poles/i
    );
    fireEvent.click(staffCheckbox);
    expect(counter).toHaveTextContent('1 / 6 items verified');

    const linerCheckbox = screen.getByLabelText(
      /Submersible Roll-Top TPU Pack Liner & Quick-Release Hipbelt Buckle Check/i
    );
    fireEvent.click(linerCheckbox);
    expect(counter).toHaveTextContent('2 / 6 items verified');
  });
});
