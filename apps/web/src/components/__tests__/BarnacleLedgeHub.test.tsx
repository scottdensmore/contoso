import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BarnacleLedgeHub from '../BarnacleLedgeHub';

describe('BarnacleLedgeHub component', () => {
  it('renders all 4 intertidal barnacle-encrusted basalt ledge & sabellariid worm-reef zones initially and filters by country, substrateType, difficulty, and search query', () => {
    render(<BarnacleLedgeHub />);

    expect(
      screen.getByText(
        /Cape Perpetua & Thor's Well Basalt Mussel-Barnacle Bench/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Duckpool & Bude Intertidal Sabellaria alveolata Honeycomb Worm-Reef/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Owen Point & Thrasher Cove Wave-Cut Porphyra-Barnacle Shelf/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Roncudo & Cabo Vilán Gooseneck-Barnacle \(Percebe\) Surge Ledges/i
      )
    ).toBeInTheDocument();

    // Filter by country
    const countrySelect = screen.getByLabelText(/Filter by Country/i);
    fireEvent.change(countrySelect, { target: { value: 'UK' } });

    expect(
      screen.getByText(
        /Duckpool & Bude Intertidal Sabellaria alveolata Honeycomb Worm-Reef/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Cape Perpetua & Thor's Well Basalt Mussel-Barnacle Bench/i
      )
    ).not.toBeInTheDocument();

    // Reset filters
    fireEvent.click(screen.getByRole('button', { name: /Reset Filters/i }));
    expect(
      screen.getByText(
        /Cape Perpetua & Thor's Well Basalt Mussel-Barnacle Bench/i
      )
    ).toBeInTheDocument();

    // Filter by substrateType
    const substrateSelect = screen.getByLabelText(/Intertidal Substrate Type/i);
    fireEvent.change(substrateSelect, {
      target: { value: 'porphyra-ulva-glazed-shelf' },
    });
    expect(
      screen.getByText(
        /Owen Point & Thrasher Cove Wave-Cut Porphyra-Barnacle Shelf/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Duckpool & Bude Intertidal Sabellaria alveolata Honeycomb Worm-Reef/i
      )
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Reset Filters/i }));

    // Filter by search
    const searchInput = screen.getByLabelText(/Search Barnacle Ledge Zones/i);
    fireEvent.change(searchInput, { target: { value: 'Perpetua' } });
    expect(
      screen.getByText(
        /Cape Perpetua & Thor's Well Basalt Mussel-Barnacle Bench/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Duckpool & Bude Intertidal Sabellaria alveolata Honeycomb Worm-Reef/i
      )
    ).not.toBeInTheDocument();
  });

  it('loads site preset values into the calculator when clicking Load into Calculator on a site card', () => {
    render(<BarnacleLedgeHub />);

    const duckpoolCard = screen.getByTestId(
      'barnacle-ledge-site-card-duckpool-bude-sabellaria-reef-cornwall-uk'
    );
    const loadButton = duckpoolCard.querySelector('button');
    expect(loadButton).not.toBeNull();
    if (loadButton) {
      fireEvent.click(loadButton);
    }

    expect(
      screen.getByLabelText(/Sabellariid Colony Density \(%\)/i)
    ).toHaveValue(88);
  });

  it('updates live calculator telemetry when inputs or quick presets change', () => {
    render(<BarnacleLedgeHub />);

    const resultPanel = screen.getByTestId('barnacle-ledge-calculator-result');
    expect(resultPanel).toHaveAttribute('role', 'status');
    expect(resultPanel).toHaveTextContent('step-bare-basalt-avoid-worm-tubes');

    fireEvent.click(
      screen.getByRole('button', {
        name: /Moderate Algal Glaze & Studded Felt Stance/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'carbide-stud-felt-bootie-low-stance'
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /High Surge Channel & Ebb Slack Belay/i,
      })
    );
    expect(resultPanel).toHaveTextContent('wait-ebb-slack-belay-surge-gulley');

    fireEvent.click(
      screen.getByRole('button', {
        name: /Critical Infragravity Set Overwash Abort/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'abort-infragravity-set-sweep-hazard'
    );
  });

  it('toggles gear checklist items and updates the progress counter', () => {
    render(<BarnacleLedgeHub />);

    const counter = screen.getByTestId('barnacle-ledge-gear-counter');
    expect(counter).toHaveTextContent('0 / 6 items verified');

    const glovesCheckbox = screen.getByLabelText(
      /ANSI A5 Kevlar-Palm Neoprene Intertidal Rock Gloves & Shin Guards/i
    );
    fireEvent.click(glovesCheckbox);
    expect(counter).toHaveTextContent('1 / 6 items verified');

    const bootiesCheckbox = screen.getByLabelText(
      /Tungsten-Carbide Studded Felt-Sole Intertidal Reef Booties/i
    );
    fireEvent.click(bootiesCheckbox);
    expect(counter).toHaveTextContent('2 / 6 items verified');
  });
});
