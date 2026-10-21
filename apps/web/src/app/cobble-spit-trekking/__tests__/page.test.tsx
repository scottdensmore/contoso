import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CobbleSpitTrekkingPage, { metadata } from '../page';

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

vi.mock('@/components/CobbleSpitTrekkingHub', () => ({
  __esModule: true,
  default: () => <div data-testid="cobble-spit-trekking-hub" />,
}));

describe('CobbleSpitTrekkingPage', () => {
  it('exports Next.js metadata with title and description', () => {
    expect(metadata).toBeDefined();
    expect(String(metadata.title)).toContain(
      'Coastal Kelp-Wrack Boulder Reef & Intertidal Cobble Spit Trekking Guide'
    );
    expect(String(metadata.description)).toMatch(
      /kelp|cobble|alginate|mucilage|swash/i
    );
  });

  it('renders the literal H1, skip link, main landmark, educational safety sections, and CobbleSpitTrekkingHub', () => {
    render(<CobbleSpitTrekkingPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('cobble-spit-trekking-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe(
      'Coastal Kelp-Wrack Boulder Reef & Intertidal Cobble Spit Trekking Guide'
    );

    const mainLandmark = screen.getByRole('main');
    expect(mainLandmark.getAttribute('id')).toBe('cobble-spit-trekking-main');

    const skipLink = screen.getByRole('link', {
      name: /Skip to main content/i,
    });
    expect(skipLink.getAttribute('href')).toBe('#cobble-spit-trekking-main');

    expect(
      screen.getByRole('heading', {
        name: /Alginate Kelp-Mucilage Slip Physics, Bowling-Ball Cobble Inversion & Longshore Swash Overwash Defense/i,
      })
    ).toBeDefined();
  });
});
