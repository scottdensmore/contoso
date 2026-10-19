import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import GlaciereCavingPage, { metadata } from '../page';

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

vi.mock('@/components/GlaciereCavingHub', () => ({
  __esModule: true,
  default: () => <div data-testid="glaciere-caving-hub" />,
}));

describe('GlaciereCavingPage', () => {
  it('exports Next.js metadata with title and description', () => {
    expect(metadata).toBeDefined();
    expect(String(metadata.title)).toContain(
      'Subterranean Ice-Filled Lava Tube & Permafrost Glacière Cave Navigation Guide'
    );
    expect(String(metadata.description)).toMatch(
      /glacière|balch|hoarfrost|crampon/i
    );
  });

  it('renders the literal H1, skip link, main landmark, educational safety sections, and GlaciereCavingHub', () => {
    render(<GlaciereCavingPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('glaciere-caving-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe(
      'Subterranean Ice-Filled Lava Tube & Permafrost Glacière Cave Navigation Guide'
    );

    const mainLandmark = screen.getByRole('main');
    expect(mainLandmark.getAttribute('id')).toBe('glaciere-caving-main');

    const skipLink = screen.getByRole('link', {
      name: /Skip to main content/i,
    });
    expect(skipLink.getAttribute('href')).toBe('#glaciere-caving-main');

    expect(
      screen.getByRole('heading', {
        name: /Balch-Effect Cold-Trap Stratification, Wet-Glaze Crampon Mechanics & CO2 Sump Defense/i,
      })
    ).toBeDefined();
  });
});
