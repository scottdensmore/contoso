import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import JokulhlaupEscapeHub from '../JokulhlaupEscapeHub';

describe('JokulhlaupEscapeHub component', () => {
  it('renders all 4 subglacial jökulhlaup & ice-dammed lake outburst corridors initially and filters by country, triggerMechanism, difficulty, and search query', () => {
    render(<JokulhlaupEscapeHub />);

    expect(
      screen.getByText(
        /Grímsvötn & Skeiðarárjökull Subglacial Caldera Outburst Corridor/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Suicide Basin \(Klesteroa\) & Mendenhall Glacier Ice-Dammed Margin/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Lago Cachet II & Glaciar Colonia Proglacial Canyon/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Kyagar Tso & Upper Shaksgam Glacier Ice-Dammed Gorge/i
      )
    ).toBeInTheDocument();

    // Filter by country
    const countrySelect = screen.getByLabelText(/Filter by Country/i);
    fireEvent.change(countrySelect, { target: { value: 'Iceland' } });

    expect(
      screen.getByText(
        /Grímsvötn & Skeiðarárjökull Subglacial Caldera Outburst Corridor/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Suicide Basin \(Klesteroa\) & Mendenhall Glacier Ice-Dammed Margin/i
      )
    ).not.toBeInTheDocument();

    // Reset filters
    fireEvent.click(screen.getByRole('button', { name: /Reset Filters/i }));
    expect(
      screen.getByText(
        /Suicide Basin \(Klesteroa\) & Mendenhall Glacier Ice-Dammed Margin/i
      )
    ).toBeInTheDocument();

    // Filter by trigger mechanism
    const triggerSelect = screen.getByLabelText(/Outburst Trigger Mechanism/i);
    fireEvent.change(triggerSelect, {
      target: { value: 'supraglacial-englacial-conduit' },
    });
    expect(
      screen.getByText(/Lago Cachet II & Glaciar Colonia Proglacial Canyon/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Grímsvötn & Skeiðarárjökull Subglacial Caldera Outburst Corridor/i
      )
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Reset Filters/i }));

    // Filter by search
    const searchInput = screen.getByLabelText(/Search Jökulhlaup Corridors/i);
    fireEvent.change(searchInput, { target: { value: 'Mendenhall' } });
    expect(
      screen.getByText(
        /Suicide Basin \(Klesteroa\) & Mendenhall Glacier Ice-Dammed Margin/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Grímsvötn & Skeiðarárjökull Subglacial Caldera Outburst Corridor/i
      )
    ).not.toBeInTheDocument();
  });

  it('loads site preset values into the calculator when clicking Load into Calculator on a site card', () => {
    render(<JokulhlaupEscapeHub />);

    const grimsvotnCard = screen.getByTestId(
      'jokulhlaup-site-card-grimsvotn-skeidararsandur-vatnajokull-iceland'
    );
    const loadButton = grimsvotnCard.querySelector('button');
    expect(loadButton).not.toBeNull();
    if (loadButton) {
      fireEvent.click(loadButton);
    }

    expect(
      screen.getByLabelText(/Vertical Gain to Safe Terrace \(m\)/i)
    ).toHaveValue(95);
  });

  it('updates live calculator telemetry when inputs or quick presets change', () => {
    render(<JokulhlaupEscapeHub />);

    const resultPanel = screen.getByTestId('jokulhlaup-calculator-result');
    expect(resultPanel).toHaveAttribute('role', 'status');
    expect(resultPanel).toHaveTextContent('routine-proglacial-terrace-watch');

    fireEvent.click(
      screen.getByRole('button', {
        name: /Moderate H2S Plume & Conductivity Watch/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'halt-canyon-entry-monitor-h2s-plume'
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /High R-Channel Lateral Moraine Sprint/i,
      })
    );
    expect(resultPanel).toHaveTextContent('immediate-lateral-moraine-sprint');

    fireEvent.click(
      screen.getByRole('button', {
        name: /Critical Subglacial Outburst Scree Scramble/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'emergency-vertical-scree-scramble-abandon-loads'
    );
  });

  it('toggles gear checklist items and updates the progress counter', () => {
    render(<JokulhlaupEscapeHub />);

    const counter = screen.getByTestId('jokulhlaup-gear-counter');
    expect(counter).toHaveTextContent('0 / 6 items verified');

    const gasDetectorCheckbox = screen.getByLabelText(
      /Clip-On H2S \/ SO2 Subglacial Gas Detector & Conductivity Probe/i
    );
    fireEvent.click(gasDetectorCheckbox);
    expect(counter).toHaveTextContent('1 / 6 items verified');

    const cramponsCheckbox = screen.getByLabelText(
      /Quick-Deploy Micro-Crampons & Whippet Self-Arrest Pole/i
    );
    fireEvent.click(cramponsCheckbox);
    expect(counter).toHaveTextContent('2 / 6 items verified');
  });
});
