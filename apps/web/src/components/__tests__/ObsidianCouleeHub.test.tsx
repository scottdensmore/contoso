import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ObsidianCouleeHub from '../ObsidianCouleeHub';

describe('ObsidianCouleeHub component', () => {
  it('renders all 4 high-altitude volcanic obsidian-flow & glass-block coulee zones initially and filters by country, lithology, difficulty, and search query', () => {
    render(<ObsidianCouleeHub />);

    expect(
      screen.getByText(/Big Obsidian Flow & Paulina Peak Rhyolite Coulee/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Glass Mountain & Little Glass Mountain Dacite-Rhyolite Obsidian Flow/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Panum Crater & Obsidian Dome Pressure-Spine Coulee/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Hrafntinnusker & Laugavegur Subglacial-Rhyolite Obsidian Ridge/i
      )
    ).toBeInTheDocument();

    // Filter by country
    const countrySelect = screen.getByLabelText(/Filter by Country/i);
    fireEvent.change(countrySelect, { target: { value: 'Iceland' } });

    expect(
      screen.getByText(
        /Hrafntinnusker & Laugavegur Subglacial-Rhyolite Obsidian Ridge/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Big Obsidian Flow & Paulina Peak Rhyolite Coulee/i)
    ).not.toBeInTheDocument();

    // Reset filters
    fireEvent.click(screen.getByRole('button', { name: /Reset Filters/i }));
    expect(
      screen.getByText(/Big Obsidian Flow & Paulina Peak Rhyolite Coulee/i)
    ).toBeInTheDocument();

    // Filter by lithology
    const lithologySelect = screen.getByLabelText(/Obsidian Lithology/i);
    fireEvent.change(lithologySelect, {
      target: { value: 'pumiceous-carapace-glass-dome' },
    });
    expect(
      screen.getByText(
        /Glass Mountain & Little Glass Mountain Dacite-Rhyolite Obsidian Flow/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Big Obsidian Flow & Paulina Peak Rhyolite Coulee/i)
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Reset Filters/i }));

    // Filter by search
    const searchInput = screen.getByLabelText(
      /Search Obsidian Flows & Coulees/i
    );
    fireEvent.change(searchInput, { target: { value: 'Panum Crater' } });
    expect(
      screen.getByText(/Panum Crater & Obsidian Dome Pressure-Spine Coulee/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Big Obsidian Flow & Paulina Peak Rhyolite Coulee/i)
    ).not.toBeInTheDocument();
  });

  it('loads site preset values into the calculator when clicking Load into Calculator on a site card', () => {
    render(<ObsidianCouleeHub />);

    const newberryCard = screen.getByTestId(
      'obsidian-coulee-site-card-big-obsidian-flow-newberry-caldera-oregon'
    );
    const loadButton = newberryCard.querySelector('button');
    expect(loadButton).not.toBeNull();
    if (loadButton) {
      fireEvent.click(loadButton);
    }

    expect(
      screen.getByLabelText(/Coulee Crest Relief \(m\)/i)
    ).toHaveValue(42);
  });

  it('updates live calculator telemetry when inputs or quick presets change', () => {
    render(<ObsidianCouleeHub />);

    const resultPanel = screen.getByTestId(
      'obsidian-coulee-calculator-result'
    );
    expect(resultPanel).toHaveAttribute('role', 'status');
    expect(resultPanel).toHaveTextContent(
      'step-massive-flow-banded-ribs-avoid-flakes'
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /Moderate Kevlar Gauntlet & 3-Point Test/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'kevlar-gauntlet-shinguard-three-point-test'
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /High Bypass Pumice Carapace Trough/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'bypass-pumice-carapace-trough-detour'
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /Critical Abort Glass-Breccia Spine/i,
      })
    );
    expect(resultPanel).toHaveTextContent(
      'abort-glass-breccia-spine-imminent-shear'
    );
  });

  it('toggles gear checklist items and updates the progress counter', () => {
    render(<ObsidianCouleeHub />);

    const counter = screen.getByTestId('obsidian-coulee-gear-counter');
    expect(counter).toHaveTextContent('0 / 6 items verified');

    const gauntletsCheckbox = screen.getByLabelText(
      /ANSI\/ISEA A6\/A7 Para-Aramid Kevlar Scrambling Gauntlets/i
    );
    fireEvent.click(gauntletsCheckbox);
    expect(counter).toHaveTextContent('1 / 6 items verified');

    const bootsCheckbox = screen.getByLabelText(
      /Full-Shank Mountaineering Boots with High-Durometer Vibram Mont Compound/i
    );
    fireEvent.click(bootsCheckbox);
    expect(counter).toHaveTextContent('2 / 6 items verified');
  });
});
