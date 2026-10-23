import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import BentoniteBadlandsPage, { metadata } from '../page';

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

vi.mock('@/components/BentoniteBadlandsHub', () => ({
  __esModule: true,
  default: () => <div data-testid="bentonite-badlands-hub" />,
}));

describe('BentoniteBadlandsPage', () => {
  it('exports Next.js metadata with title and description', () => {
    expect(metadata).toBeDefined();
    expect(String(metadata.title)).toContain(
      'Arid Badlands Bentonite Popcorn-Clay & Piping-Tunnel Sinkhole Navigation Guide'
    );
    expect(String(metadata.description)).toMatch(
      /bentonite|smectite|popcorn|piping|sinkhole|badlands/i
    );
  });

  it('renders the literal H1, skip link, main landmark, educational safety sections, and BentoniteBadlandsHub', () => {
    render(<BentoniteBadlandsPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('bentonite-badlands-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe(
      'Arid Badlands Bentonite Popcorn-Clay & Piping-Tunnel Sinkhole Navigation Guide'
    );

    const mainLandmark = screen.getByRole('main');
    expect(mainLandmark.getAttribute('id')).toBe('bentonite-badlands-main');

    const skipLink = screen.getByRole('link', {
      name: /Skip to main content/i,
    });
    expect(skipLink.getAttribute('href')).toBe('#bentonite-badlands-main');

    expect(
      screen.getByRole('heading', {
        name: /Smectite Hydration-Swelling Mechanics, Subsurface Piping Pseudokarst & Caprock Routing/i,
      })
    ).toBeDefined();
  });
});
