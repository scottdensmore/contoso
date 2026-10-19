import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FlashFloodSlotHub from '../FlashFloodSlotHub';

describe('FlashFloodSlotHub component', () => {
  it('renders all 4 slot-canyon flash-flood drainages initially and filters by country, lithology, difficulty, and search query', () => {
    render(<FlashFloodSlotHub />);

    expect(
      screen.getByText(
        /Buckskin Gulch & Wire Pass Navajo Sandstone Constriction/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Little Wild Horse & Bell Canyon San Rafael Reef Narrows/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Wadi Mujib Dead Sea Sandstone Siq & Perennial Gorge/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Wadi Ghul \(Al Nakhar Balcony Gorge\) Limestone Slot/i)
    ).toBeInTheDocument();

    // Filter by country
    const countrySelect = screen.getByLabelText(/Filter by Country/i);
    fireEvent.change(countrySelect, { target: { value: 'Jordan' } });

    expect(
      screen.getByText(/Wadi Mujib Dead Sea Sandstone Siq & Perennial Gorge/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Buckskin Gulch & Wire Pass Navajo Sandstone Constriction/i
      )
    ).not.toBeInTheDocument();

    // Reset filters
    fireEvent.click(screen.getByRole('button', { name: /Reset Filters/i }));
    expect(
      screen.getByText(
        /Buckskin Gulch & Wire Pass Navajo Sandstone Constriction/i
      )
    ).toBeInTheDocument();

    // Filter by lithology
    const lithologySelect = screen.getByLabelText(/Slot Canyon Lithology/i);
    fireEvent.change(lithologySelect, {
      target: { value: 'wingate-vertical-fissure' },
    });
    expect(
      screen.getByText(
        /Little Wild Horse & Bell Canyon San Rafael Reef Narrows/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Buckskin Gulch & Wire Pass Navajo Sandstone Constriction/i
      )
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Reset Filters/i }));

    // Filter by search
    const searchInput = screen.getByLabelText(/Search Slot Canyon Sites/i);
    fireEvent.change(searchInput, { target: { value: 'Wadi Ghul' } });
    expect(
      screen.getByText(/Wadi Ghul \(Al Nakhar Balcony Gorge\) Limestone Slot/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Little Wild Horse & Bell Canyon San Rafael Reef Narrows/i
      )
    ).not.toBeInTheDocument();
  });

  it('loads site preset values into the calculator when clicking Load into Calculator on a site card', () => {
    render(<FlashFloodSlotHub />);

    const buckskinCard = screen.getByTestId(
      'flash-flood-site-card-buckskin-gulch-paria-usa'
    );
    const loadButton = buckskinCard.querySelector('button');
    expect(loadButton).not.toBeNull();
    if (loadButton) {
      fireEvent.click(loadButton);
    }

    expect(
      screen.getByLabelText(/Catchment Area \(km²\)/i)
    ).toHaveValue(1050);
    expect(screen.getByLabelText(/Slot Width \(m\)/i)).toHaveValue(1.2);
  });

  it('updates live calculator telemetry when inputs or quick presets change', () => {
    render(<FlashFloodSlotHub />);

    const resultPanel = screen.getByTestId('flash-flood-calculator-result');
    expect(resultPanel).toHaveAttribute('role', 'status');
    expect(resultPanel).toHaveTextContent('normal-transit-monitor-sky');

    fireEvent.click(
      screen.getByRole('button', {
        name: /Moderate Distant Virga & Slickrock Drip/i,
      })
    );
    expect(resultPanel).toHaveTextContent('accelerate-to-exit-stage-alcoves');

    fireEvent.click(
      screen.getByRole('button', {
        name: /High Upstream Cell Burst — Ascend Ledge/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'ascend-high-water-escape-ledge-immediately'
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /Critical Monsoon Flash-Flood Bore Abort/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'abort-do-not-enter-flash-flood-imminent'
    );
  });

  it('toggles gear checklist items and updates the progress counter', () => {
    render(<FlashFloodSlotHub />);

    const counter = screen.getByTestId('flash-flood-gear-counter');
    expect(counter).toHaveTextContent('0 / 6 items verified');

    const satCheckbox = screen.getByLabelText(
      /Dual-Band Iridium Satellite Communicator & NOAA NEXRAD Mesoscale Alerts/i
    );
    fireEvent.click(satCheckbox);
    expect(counter).toHaveTextContent('1 / 6 items verified');

    const ropeCheckbox = screen.getByLabelText(
      /60 m 8.5 mm Hydrophobic Aramid-Sheath Canyon Static Rope & Mechanical Ascenders/i
    );
    fireEvent.click(ropeCheckbox);
    expect(counter).toHaveTextContent('2 / 6 items verified');
  });
});
