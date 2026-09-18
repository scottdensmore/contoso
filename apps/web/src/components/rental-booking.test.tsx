import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RentalCatalog from './rental-catalog';
import RentalBookingForm from './rental-booking-form';
import { RENTAL_PACKAGES } from '../lib/rentals';

describe('Rental Components', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('RentalCatalog', () => {
    it('renders all rental packages initially', () => {
      render(<RentalCatalog />);
      expect(screen.getByText('4-Person Deluxe Camping Package')).toBeDefined();
      expect(screen.getByText('Ultralight Backpacking Kit')).toBeDefined();
      expect(screen.getByText('Touring Kayak & Paddle Set')).toBeDefined();
      expect(screen.getByText('Alpine Snowshoe & Pole Kit')).toBeDefined();
    });

    it('filters packages when clicking category buttons', () => {
      render(<RentalCatalog />);

      // Filter by Camping
      const campingFilter = screen.getByRole('button', { name: /^camping$/i });
      fireEvent.click(campingFilter);

      expect(screen.getByText('4-Person Deluxe Camping Package')).toBeDefined();
      expect(screen.queryByText('Ultralight Backpacking Kit')).toBeNull();
      expect(screen.queryByText('Touring Kayak & Paddle Set')).toBeNull();
      expect(screen.queryByText('Alpine Snowshoe & Pole Kit')).toBeNull();

      // Filter by Paddling
      const paddlingFilter = screen.getByRole('button', { name: /^paddling$/i });
      fireEvent.click(paddlingFilter);

      expect(screen.queryByText('4-Person Deluxe Camping Package')).toBeNull();
      expect(screen.getByText('Touring Kayak & Paddle Set')).toBeDefined();

      // Filter by All
      const allFilter = screen.getByRole('button', { name: /^all$/i });
      fireEvent.click(allFilter);

      expect(screen.getByText('4-Person Deluxe Camping Package')).toBeDefined();
      expect(screen.getByText('Alpine Snowshoe & Pole Kit')).toBeDefined();
    });

    it('invokes onSelectPackage callback when Select Package is clicked', () => {
      const handleSelect = vi.fn();
      render(<RentalCatalog onSelectPackage={handleSelect} />);

      const selectButtons = screen.getAllByRole('button', { name: /select package/i });
      fireEvent.click(selectButtons[0]);

      expect(handleSelect).toHaveBeenCalledWith(RENTAL_PACKAGES[0]);
    });
  });

  describe('RentalBookingForm', () => {
    it('renders all form inputs and live pricing status container', () => {
      render(<RentalBookingForm />);

      expect(screen.getByLabelText(/rental package/i)).toBeDefined();
      expect(screen.getByLabelText(/pickup location/i)).toBeDefined();
      expect(screen.getByLabelText(/start date/i)).toBeDefined();
      expect(screen.getByLabelText(/end date/i)).toBeDefined();
      expect(screen.getByLabelText(/full name/i)).toBeDefined();
      expect(screen.getByLabelText(/email address/i)).toBeDefined();
      expect(screen.getByLabelText(/phone number/i)).toBeDefined();

      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toBeDefined();
      expect(liveRegion.getAttribute('aria-live')).toBe('polite');
    });

    it('updates live pricing calculation when dates and package are selected', async () => {
      render(<RentalBookingForm initialPackageId="camp-bundle-4p" />);

      // Select 3 days: 2026-10-01 to 2026-10-03
      fireEvent.change(screen.getByLabelText(/start date/i), {
        target: { value: '2026-10-01' },
      });
      fireEvent.change(screen.getByLabelText(/end date/i), {
        target: { value: '2026-10-03' },
      });

      const liveRegion = screen.getByRole('status');
      expect(liveRegion.textContent).toContain('3 days');
      expect(liveRegion.textContent).toContain('10%');
      // Subtotal = 121, Deposit = 100, Total = 221
      expect(liveRegion.textContent).toContain('$221');
    });

    it('validates that end date cannot be before start date', () => {
      render(<RentalBookingForm initialPackageId="camp-bundle-4p" />);

      fireEvent.change(screen.getByLabelText(/start date/i), {
        target: { value: '2026-10-05' },
      });
      fireEvent.change(screen.getByLabelText(/end date/i), {
        target: { value: '2026-10-01' },
      });

      expect(screen.getByText(/end date must be on or after start date/i)).toBeDefined();
    });

    it('submits a reservation successfully and displays confirmation details', async () => {
      render(<RentalBookingForm initialPackageId="camp-bundle-4p" />);

      fireEvent.change(screen.getByLabelText(/pickup location/i), {
        target: { value: 'seattle' },
      });
      fireEvent.change(screen.getByLabelText(/start date/i), {
        target: { value: '2026-10-01' },
      });
      fireEvent.change(screen.getByLabelText(/end date/i), {
        target: { value: '2026-10-03' },
      });
      fireEvent.change(screen.getByLabelText(/full name/i), {
        target: { value: 'Alex Morgan' },
      });
      fireEvent.change(screen.getByLabelText(/email address/i), {
        target: { value: 'alex@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/phone number/i), {
        target: { value: '(206) 555-0123' },
      });

      const submitButton = screen.getByRole('button', { name: /confirm reservation/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/reservation confirmed/i)).toBeDefined();
      });

      expect(screen.getByText(/RNT-\d{5}/)).toBeDefined();
      expect(screen.getAllByText(/Seattle Flagship/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/Alex Morgan/i)).toBeDefined();

      // Check "Book Another Rental" button functionality
      const bookAnotherBtn = screen.getByRole('button', { name: /book another rental/i });
      expect(bookAnotherBtn).toBeDefined();
      fireEvent.click(bookAnotherBtn);

      // Returns to form
      expect(screen.getByLabelText(/rental package/i)).toBeDefined();
    });
  });
});
