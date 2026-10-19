import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TepuiNavigationPage, { metadata } from '../page';

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

vi.mock('@/components/TepuiNavigationHub', () => ({
  __esModule: true,
  default: () => <div data-testid="tepui-navigation-hub" />,
}));

describe('TepuiNavigationPage', () => {
  it('exports Next.js metadata with title and description', () => {
    expect(metadata).toBeDefined();
    expect(String(metadata.title)).toContain(
      'Table-Mountain Quartzite Tepui & High-Plateau Sandstone Fissure Navigation Guide'
    );
    expect(String(metadata.description)).toMatch(
      /tepui|quartzite|stigonema|brocchinia|pseudokarst/i
    );
  });

  it('renders the literal H1, skip link, main landmark, educational safety sections, and TepuiNavigationHub', () => {
    render(<TepuiNavigationPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('tepui-navigation-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe(
      'Table-Mountain Quartzite Tepui & High-Plateau Sandstone Fissure Navigation Guide'
    );

    const mainLandmark = screen.getByRole('main');
    expect(mainLandmark.getAttribute('id')).toBe('tepui-navigation-main');

    const skipLink = screen.getByRole('link', {
      name: /Skip to main content/i,
    });
    expect(skipLink.getAttribute('href')).toBe('#tepui-navigation-main');

    expect(
      screen.getByRole('heading', {
        name: /Stigonema Cyanobacteria Biofilm Slip, False Brocchinia Peat Bridges & Overhang Bivouac Biosecurity/i,
      })
    ).toBeDefined();
  });
});
