import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LateriteDuricrustPage, { metadata } from '../page';

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

vi.mock('@/components/LateriteDuricrustHub', () => ({
  __esModule: true,
  default: () => <div data-testid="laterite-duricrust-hub" />,
}));

describe('LateriteDuricrustPage', () => {
  it('exports Next.js metadata with title and description', () => {
    expect(metadata).toBeDefined();
    expect(String(metadata.title)).toContain(
      'Tropical Laterite Duricrust Mesa & Bauxite Ferricrete Scarp-Edge Bushwhacking Guide'
    );
    expect(String(metadata.description)).toMatch(
      /laterite|duricrust|ferricrete|bauxite|canga|pisolite/i
    );
  });

  it('renders the literal H1, skip link, main landmark, educational safety sections, and LateriteDuricrustHub', () => {
    render(<LateriteDuricrustPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('laterite-duricrust-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe(
      'Tropical Laterite Duricrust Mesa & Bauxite Ferricrete Scarp-Edge Bushwhacking Guide'
    );

    const mainLandmark = screen.getByRole('main');
    expect(mainLandmark.getAttribute('id')).toBe('laterite-duricrust-main');

    const skipLink = screen.getByRole('link', {
      name: /Skip to main content/i,
    });
    expect(skipLink.getAttribute('href')).toBe('#laterite-duricrust-main');

    expect(
      screen.getByRole('heading', {
        name: /Pisolitic Pea-Gravel Mechanics, Pallid-Zone Saprolite Piping & Remanent Magnetic Anomalies/i,
      })
    ).toBeDefined();
  });
});
