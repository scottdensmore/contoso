import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RentalsPage from './page';

// Mock Header and Block components
vi.mock('@/components/header', () => ({
  __esModule: true,
  default: () => <div data-testid="header" />,
}));

vi.mock('@/components/block', () => ({
  __esModule: true,
  default: ({
    children,
    innerClassName,
  }: {
    children: React.ReactNode;
    innerClassName?: string;
  }) => (
    <div data-testid="block" className={innerClassName}>
      {children}
    </div>
  ),
}));

describe('RentalsPage', () => {
  it('renders the rentals page with required h1 and structured h2 headings', () => {
    render(<RentalsPage />);

    expect(screen.getByTestId('header')).toBeDefined();

    // Required h1
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Gear Rentals & Outfitting');

    // Required h2s
    const h2Elements = screen.getAllByRole('heading', { level: 2 });
    const h2Texts = h2Elements.map((h) => h.textContent);
    expect(h2Texts).toContain('Browse Rental Packages');
    expect(h2Texts).toContain('Reserve Your Gear');
    expect(h2Texts).toContain('Rental Policies & Included Outfitting');
  });

  it('updates the booking form package selection when a package is selected from catalog', () => {
    render(<RentalsPage />);

    const packageSelect = screen.getByLabelText(/rental package/i) as HTMLSelectElement;
    expect(packageSelect.value).toBe('camp-bundle-4p');

    // Find select button for "Ultralight Backpacking Kit"
    const backpackingBtn = screen.getByRole('button', {
      name: /select package: ultralight backpacking kit/i,
    });
    fireEvent.click(backpackingBtn);

    expect(packageSelect.value).toBe('backpack-ultralight');
  });
});
