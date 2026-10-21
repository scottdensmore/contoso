import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import YardangNavigationHub from '../YardangNavigationHub';

describe('YardangNavigationHub component', () => {
  it('renders all 4 aeolian yardang & mega-dune desert sites initially and filters by country, morphology, difficulty, and search query', () => {
    render(<YardangNavigationHub />);

    expect(
      screen.getByText(
        /Dasht-e Lut Gandom Beryan & Shahr-e Lut Mega-Yardang \(Kalut\) Corridors/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Badain Jaran Bilutu Peak Mega-Star-Dune & Interdune Lakes/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Lop Nur & Dunhuang Yadan Pleistocene Lacustrine Fleet/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Borkou–Tibesti Sandstone Yardang Wind-Tunnels & Erg Djourab/i
      )
    ).toBeInTheDocument();

    // Filter by country
    const countrySelect = screen.getByLabelText(/Filter by Country/i);
    fireEvent.change(countrySelect, { target: { value: 'Iran' } });

    expect(
      screen.getByText(
        /Dasht-e Lut Gandom Beryan & Shahr-e Lut Mega-Yardang \(Kalut\) Corridors/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Badain Jaran Bilutu Peak Mega-Star-Dune & Interdune Lakes/i
      )
    ).not.toBeInTheDocument();

    // Reset filters
    fireEvent.click(screen.getByRole('button', { name: /Reset Filters/i }));
    expect(
      screen.getByText(
        /Badain Jaran Bilutu Peak Mega-Star-Dune & Interdune Lakes/i
      )
    ).toBeInTheDocument();

    // Filter by morphology
    const morphologySelect = screen.getByLabelText(/Aeolian Morphology/i);
    fireEvent.change(morphologySelect, {
      target: { value: 'star-dune-multi-arm-slipface' },
    });
    expect(
      screen.getByText(
        /Badain Jaran Bilutu Peak Mega-Star-Dune & Interdune Lakes/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Dasht-e Lut Gandom Beryan & Shahr-e Lut Mega-Yardang \(Kalut\) Corridors/i
      )
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Reset Filters/i }));

    // Filter by search
    const searchInput = screen.getByLabelText(/Search Yardang Sites/i);
    fireEvent.change(searchInput, { target: { value: 'Bilutu' } });
    expect(
      screen.getByText(
        /Badain Jaran Bilutu Peak Mega-Star-Dune & Interdune Lakes/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Borkou–Tibesti Sandstone Yardang Wind-Tunnels & Erg Djourab/i
      )
    ).not.toBeInTheDocument();
  });

  it('loads site preset values into the calculator when clicking Load into Calculator on a site card', () => {
    render(<YardangNavigationHub />);

    const lutCard = screen.getByTestId(
      'yardang-site-card-dasht-e-lut-kaluts-iran'
    );
    const loadButton = lutCard.querySelector('button');
    expect(loadButton).not.toBeNull();
    if (loadButton) {
      fireEvent.click(loadButton);
    }

    expect(screen.getByLabelText(/Slip-Face Angle \(°\)/i)).toHaveValue(34);
  });

  it('updates live calculator telemetry when inputs or quick presets change', () => {
    render(<YardangNavigationHub />);

    const resultPanel = screen.getByTestId('yardang-calculator-result');
    expect(resultPanel).toHaveAttribute('role', 'status');
    expect(resultPanel).toHaveTextContent('follow-windward-stoss-ridge');

    fireEvent.click(
      screen.getByRole('button', {
        name: /Moderate Inter-Yardang Gassi Corridor/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'inter-yardang-gassi-corridor-bearing'
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /High Star-Dune Slip-Face & Venturi Gale/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'diagonal-switchback-avoid-leeward-horn'
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /Critical Haboob Blackout & 34° Avalanche/i,
      })
    );
    expect(resultPanel).toHaveTextContent('abort-haboob-sheltered-lee-trench');
  });

  it('toggles gear checklist items and updates the progress counter', () => {
    render(<YardangNavigationHub />);

    const counter = screen.getByTestId('yardang-gear-counter');
    expect(counter).toHaveTextContent('0 / 6 items verified');

    const gogglesCheckbox = screen.getByLabelText(
      /Foam-Sealed Ballistic Sand Goggles & P100 Fine-Silica Particulate Respirator/i
    );
    fireEvent.click(gogglesCheckbox);
    expect(counter).toHaveTextContent('1 / 6 items verified');

    const compassCheckbox = screen.getByLabelText(
      /Sighting Mirror Baseplate Compass, Pace-Bead Counter & Dual-Band GNSS Logger/i
    );
    fireEvent.click(compassCheckbox);
    expect(counter).toHaveTextContent('2 / 6 items verified');
  });
});
