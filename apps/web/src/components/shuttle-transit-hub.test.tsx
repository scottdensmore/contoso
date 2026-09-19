import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ShuttleTransitHub from './shuttle-transit-hub';

describe('ShuttleTransitHub Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders route catalog, booking form, reservations section, and carpool board', () => {
    render(<ShuttleTransitHub />);

    // Structured Headings
    expect(
      screen.getByRole('heading', { name: /find trailhead shuttles & connectors/i })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', { name: /reserve shuttle seats/i })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', { name: /active shuttle reservations/i })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', { name: /community carpool & rideshare board/i })
    ).toBeDefined();

    // Route cards
    expect(screen.getByText('Enchantments Through-Hike Connector')).toBeDefined();
    expect(screen.getByText('Mount Rainier Skyline & Paradise Shuttle')).toBeDefined();

    // Booking Form controls
    expect(screen.getByLabelText(/select route/i)).toBeDefined();
    expect(screen.getByLabelText(/departure date/i)).toBeDefined();
    expect(screen.getByLabelText(/departure time/i)).toBeDefined();
    expect(screen.getByLabelText(/number of seats/i)).toBeDefined();
    expect(screen.getByLabelText(/passenger name/i)).toBeDefined();
    expect(screen.getByLabelText(/passenger email/i)).toBeDefined();
    expect(screen.getByLabelText(/passenger phone/i)).toBeDefined();
    expect(
      screen.getByRole('button', { name: /confirm shuttle reservation/i })
    ).toBeDefined();

    // Initial Carpool Listings
    expect(screen.getByText('Marcus Vance (marcus.vance@example.com)')).toBeDefined();
    expect(screen.getByText('Sarah Chen (555-0144)')).toBeDefined();
  });

  it('filters routes by region and toggles through-hike connectors only', () => {
    render(<ShuttleTransitHub />);

    // Filter by Cascades
    const cascadesFilter = screen.getByRole('button', { name: /^cascades$/i });
    fireEvent.click(cascadesFilter);

    expect(screen.getByText('Enchantments Through-Hike Connector')).toBeDefined();
    expect(screen.queryByText('Mount Rainier Skyline & Paradise Shuttle')).toBeNull();
    expect(screen.queryByText('Colorado Continental Divide Shuttle')).toBeNull();

    // Return to All
    const allFilter = screen.getByRole('button', { name: /^all$/i });
    fireEvent.click(allFilter);
    expect(screen.getByText('Mount Rainier Skyline & Paradise Shuttle')).toBeDefined();

    // Toggle Through-Hike Connectors Only
    const throughHikeCheckbox = screen.getByLabelText(/through-hike connectors only/i);
    fireEvent.click(throughHikeCheckbox);

    expect(screen.getByText('Enchantments Through-Hike Connector')).toBeDefined();
    expect(screen.getByText('Olympic Coast Wilderness Transit')).toBeDefined();
    expect(screen.queryByText('Mount Rainier Skyline & Paradise Shuttle')).toBeNull();
    expect(screen.queryByText('Colorado Continental Divide Shuttle')).toBeNull();
  });

  it('updates live price quote when changing selected route and seat count', () => {
    render(<ShuttleTransitHub />);

    // Select Enchantments ($30)
    const routeSelect = screen.getByLabelText(/select route/i);
    fireEvent.change(routeSelect, { target: { value: 'enchantments-connector' } });

    const seatsInput = screen.getByLabelText(/number of seats/i);
    fireEvent.change(seatsInput, { target: { value: '2' } });

    // Live quote should display $60
    expect(screen.getByTestId('live-quote-price').textContent).toContain('$60');

    // Change to 3 seats -> $90
    fireEvent.change(seatsInput, { target: { value: '3' } });
    expect(screen.getByTestId('live-quote-price').textContent).toContain('$90');
  });

  it('clicking "Book Shuttle" on a route card pre-selects the route in booking form', () => {
    render(<ShuttleTransitHub />);

    const bookButtons = screen.getAllByRole('button', { name: /book shuttle/i });
    // First book button is Enchantments
    fireEvent.click(bookButtons[0]);

    const routeSelect = screen.getByLabelText(/select route/i) as HTMLSelectElement;
    expect(routeSelect.value).toBe('enchantments-connector');
  });

  it('submits booking, displays SHT- reservation card with details, and cancels it', () => {
    render(<ShuttleTransitHub />);

    // Fill booking form
    fireEvent.change(screen.getByLabelText(/select route/i), {
      target: { value: 'enchantments-connector' },
    });
    fireEvent.change(screen.getByLabelText(/departure date/i), {
      target: { value: '2026-10-05' },
    });
    fireEvent.change(screen.getByLabelText(/departure time/i), {
      target: { value: '06:00 AM' },
    });
    fireEvent.change(screen.getByLabelText(/number of seats/i), {
      target: { value: '2' },
    });
    fireEvent.change(screen.getByLabelText(/passenger name/i), {
      target: { value: 'Alex Honnold' },
    });
    fireEvent.change(screen.getByLabelText(/passenger email/i), {
      target: { value: 'alex@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/passenger phone/i), {
      target: { value: '555-0199' },
    });

    const submitBtn = screen.getByRole('button', {
      name: /confirm shuttle reservation/i,
    });
    fireEvent.click(submitBtn);

    // Reservation card should appear
    const shtElements = screen.getAllByText(/SHT-\d{5}/);
    expect(shtElements.length).toBeGreaterThan(0);
    expect(screen.getByText('Alex Honnold')).toBeDefined();
    expect(screen.getByText('2 seats')).toBeDefined();
    expect(screen.getAllByText('$60').length).toBeGreaterThan(0);
    expect(screen.getByText('confirmed')).toBeDefined();

    // Cancel reservation
    const cancelBtn = screen.getByRole('button', { name: /cancel reservation/i });
    fireEvent.click(cancelBtn);

    expect(screen.getByText('cancelled')).toBeDefined();
    expect(screen.queryByRole('button', { name: /cancel reservation/i })).toBeNull();
  });

  it('posts a new carpool offer and displays it on the carpool board', () => {
    render(<ShuttleTransitHub />);

    fireEvent.change(screen.getByLabelText(/origin city/i), {
      target: { value: 'Seattle' },
    });
    fireEvent.change(screen.getByLabelText(/destination trailhead/i), {
      target: { value: 'Snow Lakes Trailhead' },
    });
    fireEvent.change(screen.getByLabelText(/carpool date/i), {
      target: { value: '2026-10-12' },
    });
    fireEvent.change(screen.getByLabelText(/seats available/i), {
      target: { value: '3' },
    });
    fireEvent.change(screen.getByLabelText(/driver name/i), {
      target: { value: 'Alex' },
    });
    fireEvent.change(screen.getByLabelText(/driver contact/i), {
      target: { value: 'alex@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/carpool notes/i), {
      target: { value: 'Leaving early from Seattle' },
    });

    const postBtn = screen.getByRole('button', {
      name: /post carpool offer|offer a ride/i,
    });
    fireEvent.click(postBtn);

    expect(screen.getByText(/Alex \(alex@example\.com\)/)).toBeDefined();
    expect(screen.getByText(/Leaving early from Seattle/)).toBeDefined();
    expect(screen.getAllByText(/3 seats available/).length).toBeGreaterThanOrEqual(2);
  });

  it('validates booking form fields and prevents submission with invalid values', () => {
    render(<ShuttleTransitHub />);

    const submitBtn = screen.getByRole('button', {
      name: /confirm shuttle reservation/i,
    });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/please fill in all passenger and route details/i)).toBeDefined();
  });
});
