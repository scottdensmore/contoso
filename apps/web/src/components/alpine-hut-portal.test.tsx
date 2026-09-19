import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AlpineHutPortal from './alpine-hut-portal';

describe('AlpineHutPortal Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders hut catalog, reservation form, active reservations, and stewardship guidelines', () => {
    render(<AlpineHutPortal />);

    // Structured H2 Headings
    expect(
      screen.getByRole('heading', { name: /explore alpine huts & remote shelters/i })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', { name: /reserve bunks or campsite/i })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', { name: /active hut reservations/i })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', { name: /alpine hut guidelines & stewardship/i })
    ).toBeDefined();

    // Catalog items
    expect(screen.getByText('Asgard Pass High Alpine Refuge')).toBeDefined();
    expect(screen.getByText('Mueller Ridge Backcountry Cabin')).toBeDefined();
    expect(screen.getByText('Cirque of the Towers Alpine Shelter')).toBeDefined();
    expect(screen.getByText('Red Mountain Backcountry Yurt')).toBeDefined();

    // Elevations and prices
    expect(screen.getByText(/7,850 ft/i)).toBeDefined();
    expect(screen.getByText(/10,200 ft/i)).toBeDefined();

    // Booking form controls
    expect(screen.getByLabelText(/select hut/i)).toBeDefined();
    expect(screen.getByLabelText(/check-in date/i)).toBeDefined();
    expect(screen.getByLabelText(/duration \(nights\)|nights/i)).toBeDefined();
    expect(screen.getByLabelText(/guests \/ bunks|number of guests/i)).toBeDefined();
    expect(screen.getByLabelText(/lead guest name/i)).toBeDefined();
    expect(screen.getByLabelText(/lead guest email/i)).toBeDefined();
    expect(screen.getByLabelText(/lead guest phone/i)).toBeDefined();
    expect(
      screen.getByRole('button', { name: /confirm hut reservation/i })
    ).toBeDefined();

    // Stewardship guidelines
    expect(screen.getAllByText(/pack-it-in/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/21:00/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/sleeping bag liner/i).length).toBeGreaterThan(0);
  });

  it('filters huts by mountain range and access difficulty', () => {
    render(<AlpineHutPortal />);

    // Filter by Difficulty: Strenuous
    const strenuousFilter = screen.getByRole('button', { name: /^strenuous$/i });
    fireEvent.click(strenuousFilter);

    expect(screen.getByText('Asgard Pass High Alpine Refuge')).toBeDefined();
    expect(screen.getByText('Red Mountain Backcountry Yurt')).toBeDefined();
    expect(screen.queryByText('Mueller Ridge Backcountry Cabin')).toBeNull();
    expect(screen.queryByText('Cirque of the Towers Alpine Shelter')).toBeNull();

    // Filter by Range: Cascades while Strenuous is active
    const cascadesFilter = screen.getByRole('button', { name: /^cascades$/i });
    fireEvent.click(cascadesFilter);

    expect(screen.getByText('Asgard Pass High Alpine Refuge')).toBeDefined();
    expect(screen.queryByText('Red Mountain Backcountry Yurt')).toBeNull();

    // Reset difficulty to All
    const allDiff = screen.getByRole('button', { name: /^all difficulties$/i });
    fireEvent.click(allDiff);
    expect(screen.getByText('Asgard Pass High Alpine Refuge')).toBeDefined();
  });

  it('clicking "Book Bunks" on a hut card pre-selects the hut in the reservation form', () => {
    render(<AlpineHutPortal />);

    const bookButtons = screen.getAllByRole('button', { name: /book bunks/i });
    // First card is Asgard Pass, second is Mueller Ridge, third is Cirque of the Towers
    fireEvent.click(bookButtons[2]);

    const hutSelect = screen.getByLabelText(/select hut/i) as HTMLSelectElement;
    expect(hutSelect.value).toBe('cirque-towers');
  });

  it('updates live price calculation dynamically when hut, nights, or guests change', () => {
    render(<AlpineHutPortal />);

    // Asgard Pass ($45/night)
    const hutSelect = screen.getByLabelText(/select hut/i);
    fireEvent.change(hutSelect, { target: { value: 'asgard-refuge' } });

    const nightsInput = screen.getByLabelText(/duration \(nights\)|nights/i);
    fireEvent.change(nightsInput, { target: { value: '2' } });

    const guestsInput = screen.getByLabelText(/guests \/ bunks|number of guests/i);
    fireEvent.change(guestsInput, { target: { value: '2' } });

    // Live quote: $45 * 2 * 2 = $180
    const quote = screen.getByTestId('live-quote-price');
    expect(quote.textContent).toContain('$180');

    // Change guests to 3: $45 * 2 * 3 = $270
    fireEvent.change(guestsInput, { target: { value: '3' } });
    expect(quote.textContent).toContain('$270');
  });

  it('validates booking form fields and prevents submission with invalid values', () => {
    render(<AlpineHutPortal />);

    const submitBtn = screen.getByRole('button', {
      name: /confirm hut reservation/i,
    });
    fireEvent.click(submitBtn);

    expect(
      screen.getByText(/please fill in all required fields/i)
    ).toBeDefined();
  });

  it('submits booking, displays HUT- reservation card with details, and cancels it', () => {
    render(<AlpineHutPortal />);

    fireEvent.change(screen.getByLabelText(/select hut/i), {
      target: { value: 'asgard-refuge' },
    });
    fireEvent.change(screen.getByLabelText(/check-in date/i), {
      target: { value: '2026-10-15' },
    });
    fireEvent.change(screen.getByLabelText(/duration \(nights\)|nights/i), {
      target: { value: '2' },
    });
    fireEvent.change(screen.getByLabelText(/guests \/ bunks|number of guests/i), {
      target: { value: '2' },
    });
    fireEvent.change(screen.getByLabelText(/lead guest name/i), {
      target: { value: 'Alex Honnold' },
    });
    fireEvent.change(screen.getByLabelText(/lead guest email/i), {
      target: { value: 'alex@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/lead guest phone/i), {
      target: { value: '555-0199' },
    });

    const submitBtn = screen.getByRole('button', {
      name: /confirm hut reservation/i,
    });
    fireEvent.click(submitBtn);

    // Reservation confirmation card should appear
    const hutElements = screen.getAllByText(/HUT-\d{5}/);
    expect(hutElements.length).toBeGreaterThan(0);
    expect(screen.getByText('Alex Honnold')).toBeDefined();
    expect(screen.getByText('2 bunks')).toBeDefined();
    expect(screen.getAllByText('$180').length).toBeGreaterThan(0);
    expect(screen.getByText('confirmed')).toBeDefined();

    // Cancel reservation
    const cancelBtn = screen.getByRole('button', { name: /cancel reservation/i });
    fireEvent.click(cancelBtn);

    expect(screen.getByText('cancelled')).toBeDefined();
    expect(screen.queryByRole('button', { name: /cancel reservation/i })).toBeNull();
  });
});
