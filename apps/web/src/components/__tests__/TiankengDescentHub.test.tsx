import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TiankengDescentHub from '../TiankengDescentHub';

describe('TiankengDescentHub component', () => {
  it('renders all 4 karst tiankeng collapse sinkhole sites initially and filters by country, morphology, difficulty, and search query', () => {
    render(<TiankengDescentHub />);

    expect(
      screen.getByText(
        /Xiaozhai Tiankeng Double-Nested Collapse Mega-Doline/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Dashiwei Tiankeng Subterranean Cloud-Forest Rim/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Sótano de las Golondrinas Overhung Free-Fall Bell Shaft/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Sima Mayor de Sarisariñama Quartzite Tepui Sinkhole/i
      )
    ).toBeInTheDocument();

    // Filter by country
    const countrySelect = screen.getByLabelText(/Filter by Country/i);
    fireEvent.change(countrySelect, { target: { value: 'Mexico' } });

    expect(
      screen.getByText(
        /Sótano de las Golondrinas Overhung Free-Fall Bell Shaft/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Xiaozhai Tiankeng Double-Nested Collapse Mega-Doline/i
      )
    ).not.toBeInTheDocument();

    // Reset filters
    fireEvent.click(screen.getByRole('button', { name: /Reset Filters/i }));
    expect(
      screen.getByText(
        /Xiaozhai Tiankeng Double-Nested Collapse Mega-Doline/i
      )
    ).toBeInTheDocument();

    // Filter by morphology
    const morphologySelect = screen.getByLabelText(/Tiankeng Morphology/i);
    fireEvent.change(morphologySelect, {
      target: { value: 'twin-window-karst-chasm' },
    });
    expect(
      screen.getByText(/Dashiwei Tiankeng Subterranean Cloud-Forest Rim/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Sótano de las Golondrinas Overhung Free-Fall Bell Shaft/i
      )
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Reset Filters/i }));

    // Filter by search
    const searchInput = screen.getByLabelText(/Search Tiankeng Sites/i);
    fireEvent.change(searchInput, { target: { value: 'Sarisariñama' } });
    expect(
      screen.getByText(
        /Sima Mayor de Sarisariñama Quartzite Tepui Sinkhole/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Xiaozhai Tiankeng Double-Nested Collapse Mega-Doline/i
      )
    ).not.toBeInTheDocument();
  });

  it('loads site preset values into the calculator when clicking Load into Calculator on a site card', () => {
    render(<TiankengDescentHub />);

    const xiaozhaiCard = screen.getByTestId(
      'tiankeng-site-card-xiaozhai-tiankeng-chongqing-china'
    );
    const loadButton = xiaozhaiCard.querySelector('button');
    expect(loadButton).not.toBeNull();
    if (loadButton) {
      fireEvent.click(loadButton);
    }

    expect(screen.getByLabelText(/Vertical Drop \(m\)/i)).toHaveValue(662);
  });

  it('updates live calculator telemetry when inputs or quick presets change', () => {
    render(<TiankengDescentHub />);

    const resultPanel = screen.getByTestId('tiankeng-calculator-result');
    expect(resultPanel).toHaveAttribute('role', 'status');
    expect(resultPanel).toHaveTextContent('single-pitch-rack-descender');

    fireEvent.click(
      screen.getByRole('button', {
        name: /Moderate Cloud-Forest Rebelay Pitch/i,
      })
    );
    expect(resultPanel).toHaveTextContent('multi-rebelay-deviation-srt');

    fireEvent.click(
      screen.getByRole('button', {
        name: /High Deep-Shaft Thermal & Spall Exposure/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'expedition-6-bar-rack-water-deviation'
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /Critical Unbroken Mega-Shaft Waterfall Plume/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'abort-plummet-spall-hypothermia-hazard'
    );
  });

  it('toggles gear checklist items and updates the progress counter', () => {
    render(<TiankengDescentHub />);

    const counter = screen.getByTestId('tiankeng-gear-counter');
    expect(counter).toHaveTextContent('0 / 6 items verified');

    const rackCheckbox = screen.getByLabelText(
      /6-Bar Stainless U-Rack with Hyper-Bar & Stainless Heat-Sink Spacers/i
    );
    fireEvent.click(rackCheckbox);
    expect(counter).toHaveTextContent('1 / 6 items verified');

    const rebelayCheckbox = screen.getByLabelText(
      /10.5 mm Low-Stretch Polyamide SRT Static Line, Dyneema Rebelay Slings & Canvas Edge Rollers/i
    );
    fireEvent.click(rebelayCheckbox);
    expect(counter).toHaveTextContent('2 / 6 items verified');
  });
});
