import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RoutesNavigator from './routes-navigator';

describe('RoutesNavigator Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders section headings with valid h2 hierarchy and search controls', () => {
    render(<RoutesNavigator />);

    const h2s = screen.getAllByRole('heading', { level: 2 });
    expect(h2s.length).toBeGreaterThanOrEqual(2);

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Explore Wilderness Routes & GPS Tracks/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Offline Navigation & Safety Protocols/i,
      })
    ).toBeDefined();

    expect(screen.getByLabelText(/search wilderness routes/i)).toBeDefined();
    expect(screen.getByRole('status')).toBeDefined();
  });

  it('filters routes by search query and updates aria-live result count', () => {
    render(<RoutesNavigator />);

    const searchInput = screen.getByLabelText(/search wilderness routes/i);
    const status = screen.getByRole('status');

    expect(status.textContent).toContain('Showing 5 of 5');

    fireEvent.change(searchInput, { target: { value: 'Enchantments' } });

    expect(status.textContent).toContain('Showing 1 of 5');
    expect(screen.getByText('The Enchantments Thru-Hike')).toBeDefined();
    expect(screen.queryByText('Rattlesnake Ledge Trail')).toBeNull();
  });

  it('clears search input when clicking clear button', () => {
    render(<RoutesNavigator />);

    const searchInput = screen.getByLabelText(/search wilderness routes/i);
    fireEvent.change(searchInput, { target: { value: 'Rainier' } });

    const clearButton = screen.getByRole('button', { name: /clear search/i });
    expect(clearButton).toBeDefined();

    fireEvent.click(clearButton);
    expect((searchInput as HTMLInputElement).value).toBe('');
    expect(screen.getByRole('status').textContent).toContain('Showing 5 of 5');
  });

  it('filters routes using region filter pills', () => {
    render(<RoutesNavigator />);

    const rainierPill = screen.getByRole('button', { name: /^Mount Rainier$/i });
    fireEvent.click(rainierPill);

    expect(screen.getByText('Spray Park & Mount Rainier Loop')).toBeDefined();
    expect(screen.queryByText('The Enchantments Thru-Hike')).toBeNull();

    const allPill = screen.getByRole('button', { name: /all regions/i });
    fireEvent.click(allPill);
    expect(screen.getByText('The Enchantments Thru-Hike')).toBeDefined();
  });

  it('filters routes using difficulty filter pills', () => {
    render(<RoutesNavigator />);

    const expertPill = screen.getByRole('button', { name: /^Expert$/i });
    fireEvent.click(expertPill);

    expect(screen.getByText('The Enchantments Thru-Hike')).toBeDefined();
    expect(screen.queryByText('Rattlesnake Ledge Trail')).toBeNull();

    const easyPill = screen.getByRole('button', { name: /^Easy$/i });
    fireEvent.click(easyPill);

    expect(screen.getByText('Rattlesnake Ledge Trail')).toBeDefined();
    expect(screen.queryByText('The Enchantments Thru-Hike')).toBeNull();
  });

  it('opens route detail view when clicking View Route & GPS Track', () => {
    render(<RoutesNavigator />);

    const viewButtons = screen.getAllByRole('button', { name: /view route & gps track/i });
    expect(viewButtons.length).toBeGreaterThan(0);

    // Click for The Enchantments (first card)
    fireEvent.click(viewButtons[0]);

    // Detail section contains waypoints
    expect(screen.getByText('Aasgard Pass')).toBeDefined();
    expect(screen.getByText('Colchuck Lake')).toBeDefined();

    // Elevation statistics
    expect(screen.getAllByText(/7,841 ft/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/4,500 ft/i).length).toBeGreaterThanOrEqual(1);
  });

  it('triggers GPX export download and displays confirmation notice', () => {
    // Mock URL methods and document.createElement / click
    const createObjectURLMock = vi.fn().mockReturnValue('blob:mock-url');
    const revokeObjectURLMock = vi.fn();
    window.URL.createObjectURL = createObjectURLMock;
    window.URL.revokeObjectURL = revokeObjectURLMock;

    render(<RoutesNavigator />);

    // Open detail
    const viewButtons = screen.getAllByRole('button', { name: /view route & gps track/i });
    fireEvent.click(viewButtons[0]);

    // Click GPX download button
    const downloadButton = screen.getByRole('button', { name: /download \.gpx track/i });
    fireEvent.click(downloadButton);

    expect(createObjectURLMock).toHaveBeenCalled();
    expect(
      screen.getByText(/GPX Track Downloaded: enchantments-thru-hike\.gpx/i)
    ).toBeDefined();
  });

  it('displays offline navigation and safety protocols with Garmin, Gaia GPS, and AllTrails instructions', () => {
    render(<RoutesNavigator />);

    expect(screen.getByText(/Ten Essentials for Wilderness Travel/i)).toBeDefined();
    expect(screen.getAllByText(/Garmin/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Gaia GPS/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/AllTrails/i).length).toBeGreaterThanOrEqual(1);
  });
});
