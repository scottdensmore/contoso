import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SandurCrossingPage, { metadata } from '../page';

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

vi.mock('@/components/SandurCrossingHub', () => ({
  __esModule: true,
  default: () => <div data-testid="sandur-crossing-hub" />,
}));

describe('SandurCrossingPage', () => {
  it('exports Next.js metadata with title and description', () => {
    expect(metadata).toBeDefined();
    expect(String(metadata.title)).toContain(
      'Glacial Outwash Braided-River Sandur & Quicksand Silt-Bar Crossing Guide'
    );
    expect(String(metadata.description)).toMatch(
      /sandur|braided|quicksand|silt|glacial/i
    );
  });

  it('renders the literal H1, skip link, main landmark, educational safety sections, and SandurCrossingHub', () => {
    render(<SandurCrossingPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('sandur-crossing-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe(
      'Glacial Outwash Braided-River Sandur & Quicksand Silt-Bar Crossing Guide'
    );

    const mainLandmark = screen.getByRole('main');
    expect(mainLandmark.getAttribute('id')).toBe('sandur-crossing-main');

    const skipLink = screen.getByRole('link', {
      name: /Skip to main content/i,
    });
    expect(skipLink.getAttribute('href')).toBe('#sandur-crossing-main');

    expect(
      screen.getByRole('heading', {
        name: /Diurnal Ablation Hydrographs, Braided-Channel Riffle Selection & Thixotropic Quicksand Extraction/i,
      })
    ).toBeDefined();
  });
});
