import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TephraNavigationPage, { metadata } from '../page';

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

vi.mock('@/components/TephraNavigationHub', () => ({
  __esModule: true,
  default: () => <div data-testid="tephra-navigation-hub" />,
}));

describe('TephraNavigationPage', () => {
  it('exports Next.js metadata with title and description', () => {
    expect(metadata).toBeDefined();
    expect(String(metadata.title)).toContain(
      'Volcanic Tephra, Ash-Fall & Lapilli Scree Slope Descent & Respirator Guide'
    );
    expect(String(metadata.description)).toMatch(/cristobalite|tephra|lapilli/i);
  });

  it('renders the literal H1, skip link, main landmark, educational safety sections, and TephraNavigationHub', () => {
    render(<TephraNavigationPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('tephra-navigation-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe(
      'Volcanic Tephra, Ash-Fall & Lapilli Scree Slope Descent & Respirator Guide'
    );

    const mainLandmark = screen.getByRole('main');
    expect(mainLandmark.getAttribute('id')).toBe('tephra-navigation-main');

    const skipLink = screen.getByRole('link', {
      name: /Skip to main content/i,
    });
    expect(skipLink.getAttribute('href')).toBe('#tephra-navigation-main');

    expect(
      screen.getByRole('heading', {
        name: /Cristobalite Silicosis Prevention, Sealed Goggles & Plunge-Step Scree Mechanics/i,
      })
    ).toBeDefined();
  });
});
