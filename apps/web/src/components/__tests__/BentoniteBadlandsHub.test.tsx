import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BentoniteBadlandsHub from '../BentoniteBadlandsHub';

describe('BentoniteBadlandsHub component', () => {
  it('renders all 4 bentonite badlands sites initially and filters by country, morphology, swellingGrade, and search query', () => {
    render(<BentoniteBadlandsHub />);

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Badlands National Park Sage Creek & Chadron Smectite Pinnacles/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Cainville Reef & North Cainville Mesa Mancos-Morrison Bentonite Hills/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Dinosaur Provincial Park & Red Deer River Bearpaw Bentonite Badlands/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Bardenas Reales & Rallón-Pisquerra Evaporite-Smectite Piping Badlands/i,
      })
    ).toBeInTheDocument();

    // Filter by country
    const countrySelect = screen.getByLabelText(/Filter by Country/i);
    fireEvent.change(countrySelect, { target: { value: 'Canada' } });

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Dinosaur Provincial Park & Red Deer River Bearpaw Bentonite Badlands/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', {
        level: 3,
        name: /Badlands National Park Sage Creek & Chadron Smectite Pinnacles/i,
      })
    ).not.toBeInTheDocument();

    // Reset filters
    fireEvent.click(screen.getByRole('button', { name: /Reset Filters/i }));
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Badlands National Park Sage Creek & Chadron Smectite Pinnacles/i,
      })
    ).toBeInTheDocument();

    // Filter by morphology
    const morphologySelect = screen.getByLabelText(/Bentonite Morphology/i);
    fireEvent.change(morphologySelect, {
      target: { value: 'caprock-hoodoo-pedestal' },
    });
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Cainville Reef & North Cainville Mesa Mancos-Morrison Bentonite Hills/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', {
        level: 3,
        name: /Badlands National Park Sage Creek & Chadron Smectite Pinnacles/i,
      })
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Reset Filters/i }));

    // Filter by swellingGrade
    const swellingSelect = screen.getByLabelText(/Smectite Swelling Grade/i);
    fireEvent.change(swellingSelect, {
      target: { value: 'moderate-montmorillonite' },
    });
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Bardenas Reales & Rallón-Pisquerra Evaporite-Smectite Piping Badlands/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', {
        level: 3,
        name: /Badlands National Park Sage Creek & Chadron Smectite Pinnacles/i,
      })
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Reset Filters/i }));

    // Filter by search
    const searchInput = screen.getByLabelText(
      /Search Bentonite Badlands & Piping Sinkholes/i
    );
    fireEvent.change(searchInput, { target: { value: 'Bardenas' } });
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Bardenas Reales & Rallón-Pisquerra Evaporite-Smectite Piping Badlands/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', {
        level: 3,
        name: /Badlands National Park Sage Creek & Chadron Smectite Pinnacles/i,
      })
    ).not.toBeInTheDocument();
  });

  it('loads site preset values into the calculator and selected site detail banner when clicking Load into Calculator on a site card', () => {
    render(<BentoniteBadlandsHub />);

    const dinosaurCard = screen.getByTestId(
      'bentonite-badlands-site-card-dinosaur-red-deer-bearpaw-badlands-alberta-canada'
    );
    const loadButton = dinosaurCard.querySelector('button');
    expect(loadButton).not.toBeNull();
    if (loadButton) {
      fireEvent.click(loadButton);
    }

    const detailBanner = screen.getByTestId('bentonite-badlands-selected-site-banner');
    expect(detailBanner).toHaveTextContent(
      /Dinosaur Provincial Park & Red Deer River Bearpaw Bentonite Badlands/i
    );
  });

  it('updates live calculator telemetry when inputs or quick presets change', () => {
    render(<BentoniteBadlandsHub />);

    const resultPanel = screen.getByTestId(
      'bentonite-badlands-calculator-result'
    );
    expect(resultPanel).toHaveAttribute('role', 'status');
    expect(resultPanel).toHaveTextContent(/Risk:\s*low/i);

    fireEvent.click(
      screen.getByRole('button', {
        name: /Moderate Popcorn-Crust Probe March/i,
      })
    );
    expect(resultPanel).toHaveTextContent(/Risk:\s*moderate/i);

    fireEvent.click(
      screen.getByRole('button', {
        name: /High Piping-Bridge Bypass to Sandstone Caprock/i,
      })
    );
    expect(resultPanel).toHaveTextContent(/Risk:\s*high/i);

    fireEvent.click(
      screen.getByRole('button', {
        name: /Critical Abort Wet Gumbo & Sinkhole Roof Collapse/i,
      })
    );
    expect(resultPanel).toHaveTextContent(/Risk:\s*critical/i);
  });

  it('toggles gear checklist items and updates the progress counter', () => {
    render(<BentoniteBadlandsHub />);

    const counter = screen.getByTestId('bentonite-badlands-gear-counter');
    expect(counter).toHaveTextContent(/0 \/ \d+ items verified/i);

    const probeCheckbox = screen.getByLabelText(
      /Graduated 1\.8m T-Handle Piping-Void Sounding Staff/i
    );
    fireEvent.click(probeCheckbox);
    expect(counter).toHaveTextContent(/1 \/ \d+ items verified/i);
  });
});
