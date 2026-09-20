import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import ClimbingHub from './climbing-hub';

describe('ClimbingHub Component', () => {
  it('renders all required section headings (h2) and crag card headings (h3)', () => {
    render(<ClimbingHub />);

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Pacific Northwest Climbing Crags & Classic Routes/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Climbing Rack & Gear Loadout Calculator/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Rappel & Anchor Safety Checklist/i,
      })
    ).toBeDefined();

    // Verify crag card h3 headings
    expect(screen.getByRole('heading', { level: 3, name: /Index Town Wall — Lower Wall/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Castle Rock/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /The Feathers/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Liberty Bell — Beckey Route/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /The Dihedrals/i })).toBeDefined();
  });

  it('filters crags by discipline buttons', () => {
    render(<ClimbingHub />);

    // Initially all 5 crags are visible
    expect(screen.getByText(/Index Town Wall — Lower Wall/i)).toBeDefined();
    expect(screen.getByText(/The Feathers/i)).toBeDefined();

    // Filter by Sport
    const sportBtn = screen.getByRole('button', { name: /^Sport$/i });
    fireEvent.click(sportBtn);

    // The Feathers (sport) should be visible, Index Town Wall (pure trad) should be filtered out
    expect(screen.getByText(/The Feathers/i)).toBeDefined();
    expect(screen.queryByText(/Index Town Wall — Lower Wall/i)).toBeNull();

    // Filter by Alpine Rock
    const alpineBtn = screen.getByRole('button', { name: /^Alpine Rock$/i });
    fireEvent.click(alpineBtn);

    expect(screen.getByText(/Liberty Bell — Beckey Route/i)).toBeDefined();
    expect(screen.queryByText(/The Feathers/i)).toBeNull();

    // Reset to All
    const allBtn = screen.getByRole('button', { name: /^All/i });
    fireEvent.click(allBtn);

    expect(screen.getByText(/Index Town Wall — Lower Wall/i)).toBeDefined();
    expect(screen.getByText(/The Feathers/i)).toBeDefined();
  });

  it('calculates rack loadouts and updates live results panel', () => {
    render(<ClimbingHub />);

    const resultsPanel = screen.getByRole('status');
    expect(resultsPanel).toBeDefined();

    // Select Trad discipline, set 3 pitches, 300 ft
    const disciplineSelect = screen.getByLabelText('Climbing Style / Discipline');
    fireEvent.change(disciplineSelect, { target: { value: 'trad' } });

    const pitchesInput = screen.getByLabelText('Pitch Count');
    fireEvent.change(pitchesInput, { target: { value: '3' } });

    const lengthInput = screen.getByLabelText('Route Length (Feet)');
    fireEvent.change(lengthInput, { target: { value: '300' } });

    // Verify recommendations for 3-pitch Trad
    expect(within(resultsPanel).getByText(/Double rack/i)).toBeDefined();
    expect(within(resultsPanel).getByText(/12 draws/i)).toBeDefined(); // 12 alpine draws
    expect(within(resultsPanel).getByText(/70m dynamic rope/i)).toBeDefined(); // 300 ft -> 70m rope
    expect(within(resultsPanel).getByText(/Nut tool/i)).toBeDefined();
  });

  it('supports interactive rappel safety checklist and updates counter', () => {
    render(<ClimbingHub />);

    // Progress counter initially 0
    expect(screen.getByText(/0 of 5 checks completed/i)).toBeDefined();

    // Click stopper knots checkbox
    const stopperCheckbox = screen.getByLabelText(/Stopper knots|Knots in both rope ends/i);
    fireEvent.click(stopperCheckbox);

    expect(screen.getByText(/1 of 5 checks completed/i)).toBeDefined();

    // Click autoblock checkbox
    const autoblockCheckbox = screen.getByLabelText(/Autoblock|Backup friction hitch/i);
    fireEvent.click(autoblockCheckbox);

    expect(screen.getByText(/2 of 5 checks completed/i)).toBeDefined();

    // Uncheck stopper knots
    fireEvent.click(stopperCheckbox);
    expect(screen.getByText(/1 of 5 checks completed/i)).toBeDefined();
  });

  it('displays helmet advisory badge and crag details', () => {
    render(<ClimbingHub />);

    // Helmet badge
    const helmetBadges = screen.getAllByText(/Helmet Required/i);
    expect(helmetBadges.length).toBeGreaterThanOrEqual(1);

    // Standard rack info
    expect(screen.getByText(/Double rack 0.3 - 3, single 4/i)).toBeDefined();

    // Route table details
    expect(screen.getByText('Godzilla')).toBeDefined();
    expect(screen.getAllByText('5.9').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Iconic steep thin crack/i)).toBeDefined();
    expect(screen.getByText(/Lower or rappel from two-ring bolted anchor/i)).toBeDefined();
  });
});
