import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SalarPressureRidgePage, { metadata } from '../page';

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

vi.mock('@/components/SalarPressureRidgeHub', () => ({
  __esModule: true,
  default: () => <div data-testid="salar-pressure-ridge-hub" />,
}));

describe('SalarPressureRidgePage', () => {
  it('exports Next.js metadata with title and description', () => {
    expect(metadata).toBeDefined();
    expect(String(metadata.title)).toContain(
      'High-Altitude Salar Brine-Pool & Polygonal Halite Pressure-Ridge Trekking Guide'
    );
    expect(String(metadata.description)).toMatch(
      /salar|halite|brine|ojos|albedo|pressure-ridge/i
    );
  });

  it('renders the literal H1, skip link, main landmark, educational safety sections, and SalarPressureRidgeHub', () => {
    render(<SalarPressureRidgePage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('salar-pressure-ridge-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe(
      'High-Altitude Salar Brine-Pool & Polygonal Halite Pressure-Ridge Trekking Guide'
    );

    const mainLandmark = screen.getByRole('main');
    expect(mainLandmark.getAttribute('id')).toBe('salar-pressure-ridge-main');

    const skipLink = screen.getByRole('link', {
      name: /Skip to main content/i,
    });
    expect(skipLink.getAttribute('href')).toBe('#salar-pressure-ridge-main');

    expect(
      screen.getByRole('heading', {
        name: /Ojos del Salar Brine Upwelling Chimneys, Dual-Hemisphere UV-Albedo & Halite Suture Abrasion/i,
      })
    ).toBeDefined();
  });
});
