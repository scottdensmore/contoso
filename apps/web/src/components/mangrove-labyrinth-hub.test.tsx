import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MangroveLabyrinthHub from './mangrove-labyrinth-hub';

describe('MangroveLabyrinthHub component', () => {
  it('renders all 5 curated sites initially and filters by root morphology, tidal creek regime, and traversal mode', () => {
    render(<MangroveLabyrinthHub />);

    expect(
      screen.getByText(
        /Hell Bay & Whitewater Bay Rhizophora Prop-Root Wilderness/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Harbhanga & Matla Estuarine Pneumatophore Creek Labyrinth/i
      )
    ).toBeInTheDocument();

    const morphologySelect = screen.getByLabelText(/Mangrove Root Morphology/i);
    fireEvent.change(morphologySelect, {
      target: { value: 'avicennia_dense_pencil_pneumatophore_mat' },
    });

    expect(
      screen.getByText(
        /Harbhanga & Matla Estuarine Pneumatophore Creek Labyrinth/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /Hell Bay & Whitewater Bay Rhizophora Prop-Root Wilderness/i
      )
    ).not.toBeInTheDocument();

    const resetBtn = screen.getByRole('button', { name: /Reset Filters/i });
    fireEvent.click(resetBtn);

    expect(
      screen.getByText(
        /Hell Bay & Whitewater Bay Rhizophora Prop-Root Wilderness/i
      )
    ).toBeInTheDocument();
  });

  it('loads a site into the calculator when clicking Load into Calculator', () => {
    render(<MangroveLabyrinthHub />);

    const sundarbansCard = screen.getByTestId(
      'mangrove-labyrinth-site-card-sundarbans-harbhanga-tidal-creek-nexus'
    );
    const loadButton = sundarbansCard.querySelector('button');
    expect(loadButton).not.toBeNull();
    if (loadButton) {
      fireEvent.click(loadButton);
    }

    expect(
      screen.getByLabelText(/Prop-Root Density \(stems\/m²\)/i)
    ).toHaveValue(42);
    expect(
      screen.getByLabelText(/Tidal Current Velocity \(knots\)/i)
    ).toHaveValue(2.4);
    expect(
      screen.getByLabelText(/Water Depth Over Mud \(cm\)/i)
    ).toHaveValue(48);
    expect(
      screen.getByLabelText(/Anoxic Silt Sink Depth \(cm\)/i)
    ).toHaveValue(72);
    expect(
      screen.getByLabelText(/Canopy Closure \(%\)/i)
    ).toHaveValue(76);
  });

  it('updates calculator live output panel across all 3 quick presets and numeric inputs', () => {
    render(<MangroveLabyrinthHub />);

    const resultPanel = screen.getByTestId(
      'mangrove-labyrinth-calculator-result'
    );
    expect(resultPanel).toHaveAttribute('role', 'status');
    expect(resultPanel).toHaveTextContent('nominal_high_slack_canopy_corridor');

    fireEvent.click(
      screen.getByRole('button', {
        name: /Mid-Ebb Prop-Root Strainer Caution/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'caution_prop_root_pinning_and_oyster_laceration'
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /Spring-Low Sulfidic Mud & Stranding Abort/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'abort_ebb_stranding_or_anoxic_silt_entrapment'
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /High-Slack Canopy Tunnel Float/i,
      })
    );
    expect(resultPanel).toHaveTextContent('nominal_high_slack_canopy_corridor');
  });

  it('tracks mandatory oyster armor and sub-canopy wayfinding gear checklist items', () => {
    render(<MangroveLabyrinthHub />);

    const counter = screen.getByTestId('mangrove-labyrinth-gear-counter');
    expect(counter).toHaveTextContent('0 / 6 mandatory items verified');

    const glovesCheckbox = screen.getByLabelText(
      /Kevlar-Armored Cut-Resistant Oyster Gloves & Puncture-Proof Booties/i
    );
    fireEvent.click(glovesCheckbox);
    expect(counter).toHaveTextContent('1 / 6 mandatory items verified');

    const paddleCheckbox = screen.getByLabelText(
      /Compact 115 cm Double-Blade Breakdown Canopy-Tunnel Paddle/i
    );
    fireEvent.click(paddleCheckbox);
    expect(counter).toHaveTextContent('2 / 6 mandatory items verified');
  });
});
