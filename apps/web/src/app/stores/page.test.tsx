import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StoresPage from './page';
import { ACTION_FOCUS, FIELD_BOUNDARY } from '@/lib/control-classes';

vi.mock('@/components/header', () => ({
  __esModule: true,
  default: () => <div data-testid="header">Header</div>,
}));

describe('StoresPage', () => {
  it('renders header and main h1 heading', () => {
    render(<StoresPage />);
    expect(screen.getByTestId('header')).toBeDefined();
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toBe('Find a Contoso Outdoors Store');
  });

  it('renders interactive search input with ACTION_FOCUS and FIELD_BOUNDARY classes', () => {
    render(<StoresPage />);
    const searchInput = screen.getByRole('searchbox', {
      name: /search stores/i,
    });
    expect(searchInput).toBeDefined();
    expect(searchInput.className).toContain(ACTION_FOCUS);
    expect(searchInput.className).toContain(FIELD_BOUNDARY);
  });

  it('renders filter checkboxes for In-Store Pickup and Gear Rental Available', () => {
    render(<StoresPage />);
    const pickupCheckbox = screen.getByRole('checkbox', {
      name: /in-store pickup/i,
    });
    const gearRentalCheckbox = screen.getByRole('checkbox', {
      name: /gear rental/i,
    });
    expect(pickupCheckbox).toBeDefined();
    expect(gearRentalCheckbox).toBeDefined();
    expect((pickupCheckbox as HTMLInputElement).checked).toBe(false);
    expect((gearRentalCheckbox as HTMLInputElement).checked).toBe(false);
  });

  it('renders accessible live announcements with aria-live="polite"', () => {
    render(<StoresPage />);
    const liveRegion = document.querySelector('[aria-live="polite"]');
    expect(liveRegion).not.toBeNull();
    expect(liveRegion?.textContent).toMatch(/5 stores found/i);
  });

  it('renders all store cards with complete details and links', () => {
    render(<StoresPage />);
    const storeHeadings = screen.getAllByRole('heading', { level: 2 });
    const storeNames = storeHeadings.map((h) => h.textContent);

    expect(storeNames).toContain('Seattle Flagship');
    expect(storeNames).toContain('Denver Mountain Outpost');
    expect(storeNames).toContain('Portland Trailhead');
    expect(storeNames).toContain('Salt Lake City Basecamp');
    expect(storeNames).toContain('San Francisco Bay');

    // Check Seattle Flagship card specifics
    expect(screen.getByText('1201 3rd Ave')).toBeDefined();
    expect(screen.getByText(/Seattle, WA 98101/)).toBeDefined();

    // Phone link
    const seattlePhoneLink = screen.getByRole('link', { name: "(206) 555-0100" });
    expect(seattlePhoneLink.getAttribute('href')).toBe('tel:2065550100');

    // Hours
    expect(screen.getAllByText(/9:00 AM - 8:00 PM/).length).toBeGreaterThan(0);

    // Feature badges
    expect(screen.getAllByText('In-Store Pickup Available').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Gear Rental').length).toBeGreaterThan(0);

    // Google Maps directions links
    const directionLinks = screen.getAllByRole('link', { name: /get directions/i });
    expect(directionLinks).toHaveLength(5);
    expect(directionLinks[0].getAttribute('href')).toContain('https://www.google.com/maps/search/?api=1&query=');
  });

  it('filters stores by search text', () => {
    render(<StoresPage />);
    const searchInput = screen.getByRole('searchbox', {
      name: /search stores/i,
    });

    fireEvent.change(searchInput, { target: { value: 'Seattle' } });

    expect(screen.getByText('Seattle Flagship')).toBeDefined();
    expect(screen.queryByText('Denver Mountain Outpost')).toBeNull();
    expect(screen.queryByText('Portland Trailhead')).toBeNull();

    const liveRegion = document.querySelector('[aria-live="polite"]');
    expect(liveRegion?.textContent).toMatch(/1 store found/i);
  });

  it('filters stores by Gear Rental Available checkbox', () => {
    render(<StoresPage />);
    const gearRentalCheckbox = screen.getByRole('checkbox', {
      name: /gear rental/i,
    });

    fireEvent.click(gearRentalCheckbox);

    // Stores without gear rental (Portland, San Francisco) should be hidden
    expect(screen.queryByText('Portland Trailhead')).toBeNull();
    expect(screen.queryByText('San Francisco Bay')).toBeNull();

    // Stores with gear rental (Seattle, Denver, Salt Lake City) should be visible
    expect(screen.getByText('Seattle Flagship')).toBeDefined();
    expect(screen.getByText('Denver Mountain Outpost')).toBeDefined();
    expect(screen.getByText('Salt Lake City Basecamp')).toBeDefined();
  });

  it('displays empty state with Reset Filters button when no stores match', () => {
    render(<StoresPage />);
    const searchInput = screen.getByRole('searchbox', {
      name: /search stores/i,
    });

    fireEvent.change(searchInput, { target: { value: 'Nonexistent City' } });

    expect(screen.getByText(/no stores found/i)).toBeDefined();
    const resetButton = screen.getByRole('button', { name: /reset filters/i });
    expect(resetButton).toBeDefined();

    const liveRegion = document.querySelector('[aria-live="polite"]');
    expect(liveRegion?.textContent).toMatch(/0 stores found/i);
  });

  it('clicking Reset Filters button clears search and options, restoring all stores', () => {
    render(<StoresPage />);
    const searchInput = screen.getByRole('searchbox', {
      name: /search stores/i,
    });
    const gearRentalCheckbox = screen.getByRole('checkbox', {
      name: /gear rental/i,
    });

    fireEvent.change(searchInput, { target: { value: 'Nonexistent City' } });
    fireEvent.click(gearRentalCheckbox);

    expect(screen.getByText(/no stores found/i)).toBeDefined();

    const resetButton = screen.getByRole('button', { name: /reset filters/i });
    fireEvent.click(resetButton);

    expect((searchInput as HTMLInputElement).value).toBe('');
    expect((gearRentalCheckbox as HTMLInputElement).checked).toBe(false);

    expect(screen.getByText('Seattle Flagship')).toBeDefined();
    expect(screen.getByText('Denver Mountain Outpost')).toBeDefined();
    expect(screen.getByText('Portland Trailhead')).toBeDefined();
    expect(screen.getByText('Salt Lake City Basecamp')).toBeDefined();
    expect(screen.getByText('San Francisco Bay')).toBeDefined();
  });
});
