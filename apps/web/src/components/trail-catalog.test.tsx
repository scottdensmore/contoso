import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TrailCatalog from './trail-catalog';

describe('TrailCatalog component', () => {
  it('renders all trails and filter buttons initially', () => {
    render(<TrailCatalog onSelectTrail={vi.fn()} />);

    expect(screen.getByText('Rattlesnake Ridge Trail')).toBeDefined();
    expect(screen.getByText('Bear Peak Summit')).toBeDefined();
    expect(screen.getByText('Multnomah-Wahkeena Loop')).toBeDefined();
    expect(screen.getByText('Mount Olympus Trail')).toBeDefined();

    // Check filter buttons
    expect(screen.getByRole('button', { name: /^all regions$/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /pacific northwest/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /rocky mountains/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /wasatch range/i })).toBeDefined();

    expect(screen.getByRole('button', { name: /^all difficulties$/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /^easy$/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /^moderate$/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /^hard$/i })).toBeDefined();
  });

  it('filters trails by region when clicking region filter button', () => {
    render(<TrailCatalog onSelectTrail={vi.fn()} />);

    const rockiesBtn = screen.getByRole('button', { name: /rocky mountains/i });
    fireEvent.click(rockiesBtn);

    expect(screen.getByText('Bear Peak Summit')).toBeDefined();
    expect(screen.queryByText('Rattlesnake Ridge Trail')).toBeNull();
    expect(screen.queryByText('Multnomah-Wahkeena Loop')).toBeNull();
    expect(screen.queryByText('Mount Olympus Trail')).toBeNull();
  });

  it('filters trails by difficulty when clicking difficulty filter button', () => {
    render(<TrailCatalog onSelectTrail={vi.fn()} />);

    const moderateBtn = screen.getByRole('button', { name: /^moderate$/i });
    fireEvent.click(moderateBtn);

    expect(screen.getByText('Rattlesnake Ridge Trail')).toBeDefined();
    expect(screen.getByText('Multnomah-Wahkeena Loop')).toBeDefined();
    expect(screen.queryByText('Bear Peak Summit')).toBeNull();
    expect(screen.queryByText('Mount Olympus Trail')).toBeNull();
  });

  it('displays weather conditions, status badge, and advisories', () => {
    render(<TrailCatalog onSelectTrail={vi.fn()} />);

    expect(screen.getByText(/58°F/)).toBeDefined();
    expect(screen.getByText('Partly Cloudy')).toBeDefined();
    expect(screen.getByText('Slick rock surfaces near waterfalls spray')).toBeDefined();
  });

  it('invokes onSelectTrail callback when clicking Select Trail button', () => {
    const handleSelect = vi.fn();
    render(<TrailCatalog onSelectTrail={handleSelect} />);

    const selectButtons = screen.getAllByRole('button', { name: /select trail/i });
    fireEvent.click(selectButtons[0]);

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'rattlesnake-ridge' })
    );
  });
});
