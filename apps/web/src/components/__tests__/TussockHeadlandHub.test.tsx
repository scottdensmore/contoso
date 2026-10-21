import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TussockHeadlandHub from '../TussockHeadlandHub';

describe('TussockHeadlandHub component', () => {
  it('renders all 4 subantarctic tussock-grass headland sites initially and filters by country, morphology, difficulty, and search query', () => {
    render(<TussockHeadlandHub />);

    expect(
      screen.getByText(
        /Fortuna Bay & Shackleton Gap Poa flabellata Tussock Headland/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Macquarie Island Featherbed Peat Terrace & Katabatic Escarpment/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Enderby & Adams Island Chionochloa Tussock & Megaherb Bog/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Péninsule Courbet & Baie de l'Oiseau Azorella Feldmark Headland/i
      )
    ).toBeInTheDocument();

    // Filter by country
    const countrySelect = screen.getByLabelText(/Filter by Country/i);
    fireEvent.change(countrySelect, { target: { value: 'Australia' } });

    expect(
      screen.getByText(
        /Macquarie Island Featherbed Peat Terrace & Katabatic Escarpment/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Fortuna Bay & Shackleton Gap Poa flabellata Tussock Headland/i
      )
    ).not.toBeInTheDocument();

    // Reset filters
    fireEvent.click(screen.getByRole('button', { name: /Reset Filters/i }));
    expect(
      screen.getByText(
        /Fortuna Bay & Shackleton Gap Poa flabellata Tussock Headland/i
      )
    ).toBeInTheDocument();

    // Filter by morphology
    const morphologySelect = screen.getByLabelText(/Tussock Morphology/i);
    fireEvent.change(morphologySelect, {
      target: { value: 'chionochloa-megaherb-peat-terrace' },
    });
    expect(
      screen.getByText(
        /Enderby & Adams Island Chionochloa Tussock & Megaherb Bog/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Macquarie Island Featherbed Peat Terrace & Katabatic Escarpment/i
      )
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Reset Filters/i }));

    // Filter by search
    const searchInput = screen.getByLabelText(/Search Tussock Sites/i);
    fireEvent.change(searchInput, { target: { value: 'Kerguelen' } });
    expect(
      screen.getByText(
        /Péninsule Courbet & Baie de l'Oiseau Azorella Feldmark Headland/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Fortuna Bay & Shackleton Gap Poa flabellata Tussock Headland/i
      )
    ).not.toBeInTheDocument();
  });

  it('loads site preset values into the calculator when clicking Load into Calculator on a site card', () => {
    render(<TussockHeadlandHub />);

    const fortunaCard = screen.getByTestId(
      'tussock-site-card-fortuna-bay-stromness-south-georgia'
    );
    const loadButton = fortunaCard.querySelector('button');
    expect(loadButton).not.toBeNull();
    if (loadButton) {
      fireEvent.click(loadButton);
    }

    expect(screen.getByLabelText(/Pedestal Height \(m\)/i)).toHaveValue(2.2);
  });

  it('updates live calculator telemetry when inputs or quick presets change', () => {
    render(<TussockHeadlandHub />);

    const resultPanel = screen.getByTestId('tussock-calculator-result');
    expect(resultPanel).toHaveAttribute('role', 'status');
    expect(resultPanel).toHaveTextContent('crown-hop-raised-peat-pedestals');

    fireEvent.click(
      screen.getByRole('button', {
        name: /Moderate Leeward Trench Probe/i,
      })
    );
    expect(resultPanel).toHaveTextContent('low-crawl-leeward-trench-probe');

    fireEvent.click(
      screen.getByRole('button', {
        name: /High Katabatic & Fur-Seal Maze/i,
      })
    );
    expect(resultPanel).toHaveTextContent('detour-inland-feldmark-bench');

    fireEvent.click(
      screen.getByRole('button', {
        name: /Critical Williwaw & Deep Wallow Trap/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'abort-katabatic-bivouac-lee-tussock'
    );
  });

  it('toggles gear checklist items and updates the progress counter', () => {
    render(<TussockHeadlandHub />);

    const counter = screen.getByTestId('tussock-gear-counter');
    expect(counter).toHaveTextContent('0 / 6 items verified');

    const probeCheckbox = screen.getByLabelText(
      /150 cm Graduated Carbon Peat-Bog & Seal-Wallow Depth Probe Staff/i
    );
    fireEvent.click(probeCheckbox);
    expect(counter).toHaveTextContent('1 / 6 items verified');

    const biosecurityCheckbox = screen.getByLabelText(
      /Virkon-S Biocide Boot Scrub Kit, Seed-Trap Gaiters & Acoustic Fur-Seal Deterrent Bodkin/i
    );
    fireEvent.click(biosecurityCheckbox);
    expect(counter).toHaveTextContent('2 / 6 items verified');
  });
});
