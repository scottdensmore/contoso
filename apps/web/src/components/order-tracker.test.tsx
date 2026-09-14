import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import OrderTracker from './order-tracker';

describe('OrderTracker', () => {
  it('renders lookup form with Order ID and Zip Code inputs', () => {
    render(<OrderTracker />);

    const orderIdInput = document.getElementById('track-order-id');
    const postalCodeInput = document.getElementById('track-postal-code');
    const submitButton = screen.getByRole('button', { name: /track order/i });

    expect(orderIdInput).not.toBeNull();
    expect(orderIdInput).toHaveAttribute('required');
    expect(postalCodeInput).not.toBeNull();
    expect(postalCodeInput).toHaveAttribute('required');
    expect(submitButton).toBeDefined();
    expect(screen.getByText(/CTSO-98765/i)).toBeDefined();
  });

  it('submits valid order CTSO-98765 and displays milestone progress stepper', () => {
    render(<OrderTracker />);

    const orderIdInput = document.getElementById('track-order-id') as HTMLInputElement;
    const postalCodeInput = document.getElementById('track-postal-code') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /track order/i });

    fireEvent.change(orderIdInput, { target: { value: 'CTSO-98765' } });
    fireEvent.change(postalCodeInput, { target: { value: '98101' } });
    fireEvent.click(submitButton);

    // Assert milestone progress stepper with <ol>
    const stepper = screen.getByRole('list', { name: /order milestones/i });
    expect(stepper.tagName.toLowerCase()).toBe('ol');

    expect(screen.getByText('Order Placed')).toBeDefined();
    expect(screen.getByText('Processing')).toBeDefined();
    expect(screen.getByText('Shipped & In Transit')).toBeDefined();
    expect(screen.getByText('Out for Delivery')).toBeDefined();
    expect(screen.getByText('Delivered')).toBeDefined();

    // The active milestone for CTSO-98765 (status: Shipped) is "Shipped & In Transit"
    const currentStep = document.querySelector('[aria-current="step"]');
    expect(currentStep).not.toBeNull();
    expect(currentStep?.textContent).toContain('Shipped & In Transit');

    // Carrier, tracking, items
    expect(screen.getAllByText(/FedEx Ground/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/FX-9876543210/i)).toBeDefined();
    expect(screen.getByText(/Cascade Mountain Backpack/i)).toBeDefined();
    expect(screen.getByText(/Sarah Connor/i)).toBeDefined();
  });

  it('displays an accessible alert with role="alert" when order is not found', () => {
    render(<OrderTracker />);

    const orderIdInput = document.getElementById('track-order-id') as HTMLInputElement;
    const postalCodeInput = document.getElementById('track-postal-code') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /track order/i });

    fireEvent.change(orderIdInput, { target: { value: 'NONEXISTENT-999' } });
    fireEvent.change(postalCodeInput, { target: { value: '98101' } });
    fireEvent.click(submitButton);

    const alert = screen.getByRole('alert');
    expect(alert).toBeDefined();
    expect(alert.textContent).toMatch(/no order found/i);
    expect(alert.textContent).toMatch(/confirmation email/i);
  });

  it('resets back to the search form when clicking Track Another Order', () => {
    render(<OrderTracker />);

    const orderIdInput = document.getElementById('track-order-id') as HTMLInputElement;
    const postalCodeInput = document.getElementById('track-postal-code') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /track order/i });

    fireEvent.change(orderIdInput, { target: { value: 'CTSO-98765' } });
    fireEvent.change(postalCodeInput, { target: { value: '98101' } });
    fireEvent.click(submitButton);

    expect(screen.getByText(/FX-9876543210/i)).toBeDefined();

    const resetButton = screen.getByRole('button', { name: /track another order/i });
    fireEvent.click(resetButton);

    // Form inputs should be visible again
    expect(document.getElementById('track-order-id')).not.toBeNull();
    expect(document.getElementById('track-postal-code')).not.toBeNull();
  });

  it('announces live updates via aria-live="polite"', () => {
    render(<OrderTracker />);

    const liveRegion = document.querySelector('[aria-live="polite"]');
    expect(liveRegion).not.toBeNull();

    const orderIdInput = document.getElementById('track-order-id') as HTMLInputElement;
    const postalCodeInput = document.getElementById('track-postal-code') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /track order/i });

    fireEvent.change(orderIdInput, { target: { value: 'CTSO-98765' } });
    fireEvent.change(postalCodeInput, { target: { value: '98101' } });
    fireEvent.click(submitButton);

    expect(liveRegion?.textContent).toMatch(/CTSO-98765/i);
  });
});
