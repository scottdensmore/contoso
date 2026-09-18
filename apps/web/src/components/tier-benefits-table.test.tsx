import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TierBenefitsTable from './tier-benefits-table';

describe('TierBenefitsTable', () => {
  it('renders all three tiers and benefit categories', () => {
    render(<TierBenefitsTable currentTier="Pathfinder" />);

    expect(screen.getByText('Trailblazer')).toBeDefined();
    expect(screen.getByText('Pathfinder')).toBeDefined();
    expect(screen.getByText('Summit Explorer')).toBeDefined();

    expect(screen.getByText('Points Multiplier')).toBeDefined();
    expect(screen.getByText('Shipping Perks')).toBeDefined();
    expect(screen.getByText('Gear Access')).toBeDefined();
    expect(screen.getByText('Annual Bonus Perks')).toBeDefined();

    expect(screen.getByText('1x Points')).toBeDefined();
    expect(screen.getByText('1.25x Points')).toBeDefined();
    expect(screen.getByText('1.5x Points')).toBeDefined();

    expect(screen.getByText('Current')).toBeDefined();
  });
});
