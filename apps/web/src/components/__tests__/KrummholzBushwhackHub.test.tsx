import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import KrummholzBushwhackHub from '../KrummholzBushwhackHub';

describe('KrummholzBushwhackHub component', () => {
  it('renders all 4 subalpine krummholz zones initially and filters by country, ecotype, difficulty, and search query', () => {
    render(<KrummholzBushwhackHub />);

    expect(
      screen.getByText(
        /Presidential Range Abies balsamea Krummholz Wave Zone/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Karwendel Pinus mugo \(Latschenkiefer\) Limestone Bench Labyrinth/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Garibaldi & Coast Range Sitka Alder \/ Subalpine Fir Mat/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Tateyama Kurobe Pinus pumila \(Hai-Matsu\) Wind-Swept Crest/i
      )
    ).toBeInTheDocument();

    // Filter by country
    const countrySelect = screen.getByLabelText(/Filter by Country/i);
    fireEvent.change(countrySelect, { target: { value: 'Austria' } });

    expect(
      screen.getByText(
        /Karwendel Pinus mugo \(Latschenkiefer\) Limestone Bench Labyrinth/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Presidential Range Abies balsamea Krummholz Wave Zone/i
      )
    ).not.toBeInTheDocument();

    // Reset filters
    fireEvent.click(screen.getByRole('button', { name: /Reset Filters/i }));
    expect(
      screen.getByText(
        /Presidential Range Abies balsamea Krummholz Wave Zone/i
      )
    ).toBeInTheDocument();

    // Filter by ecotype
    const ecotypeSelect = screen.getByLabelText(/Krummholz Ecotype/i);
    fireEvent.change(ecotypeSelect, {
      target: { value: 'wind-flagged-whitebark-cushion' },
    });
    expect(
      screen.getByText(
        /Tateyama Kurobe Pinus pumila \(Hai-Matsu\) Wind-Swept Crest/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Presidential Range Abies balsamea Krummholz Wave Zone/i
      )
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Reset Filters/i }));

    // Filter by search
    const searchInput = screen.getByLabelText(/Search Krummholz Zones/i);
    fireEvent.change(searchInput, { target: { value: 'Garibaldi' } });
    expect(
      screen.getByText(
        /Garibaldi & Coast Range Sitka Alder \/ Subalpine Fir Mat/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Tateyama Kurobe Pinus pumila \(Hai-Matsu\) Wind-Swept Crest/i
      )
    ).not.toBeInTheDocument();
  });

  it('loads site preset values into the calculator when clicking Load into Calculator on a site card', () => {
    render(<KrummholzBushwhackHub />);

    const presidentialCard = screen.getByTestId(
      'krummholz-site-card-presidential-krummholz-whitemtns-usa'
    );
    const loadButton = presidentialCard.querySelector('button');
    expect(loadButton).not.toBeNull();
    if (loadButton) {
      fireEvent.click(loadButton);
    }

    expect(
      screen.getByLabelText(/Stem Density \(stems\/m²\)/i)
    ).toHaveValue(34);
    expect(screen.getByLabelText(/Canopy Mat Height \(m\)/i)).toHaveValue(1.7);
    expect(screen.getByLabelText(/Snow Moat Depth \(cm\)/i)).toHaveValue(165);
  });

  it('updates live calculator telemetry when inputs or quick presets change', () => {
    render(<KrummholzBushwhackHub />);

    const resultPanel = screen.getByTestId('krummholz-calculator-result');
    expect(resultPanel).toHaveAttribute('role', 'status');
    expect(resultPanel).toHaveTextContent('follow-frost-heave-rock-leads');

    fireEvent.click(
      screen.getByRole('button', {
        name: /Moderate Waist-Deep Fir Thicket/i,
      })
    );
    expect(resultPanel).toHaveTextContent('streamline-pack-eye-shield-crawl');

    fireEvent.click(
      screen.getByRole('button', {
        name: /High Deep-Snow Spruce-Moat Labyrinth/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'snowshoe-float-probe-spruce-moats'
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /Critical Impenetrable Spruce-Trap Abort/i,
      })
    );
    expect(resultPanel).toHaveTextContent('abort-reroute-to-scree-drainage');
  });

  it('toggles gear checklist items and updates the progress counter', () => {
    render(<KrummholzBushwhackHub />);

    const counter = screen.getByTestId('krummholz-gear-counter');
    expect(counter).toHaveTextContent('0 / 6 items verified');

    const eyeArmorCheckbox = screen.getByLabelText(
      /ANSI Z87\.1 Ballistic Polycarbonate Wrap-Around Eye Shield & Mesh Face Visor/i
    );
    fireEvent.click(eyeArmorCheckbox);
    expect(counter).toHaveTextContent('1 / 6 items verified');

    const packCheckbox = screen.getByLabelText(
      /Slick-Faced Cordura 500D Internal-Frame Pack with Zero External Lash Points/i
    );
    fireEvent.click(packCheckbox);
    expect(counter).toHaveTextContent('2 / 6 items verified');
  });
});
