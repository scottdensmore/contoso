import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TussockHeadlandPage, { metadata } from '../page';

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

vi.mock('@/components/TussockHeadlandHub', () => ({
  __esModule: true,
  default: () => <div data-testid="tussock-headland-hub" />,
}));

describe('TussockHeadlandPage', () => {
  it('exports Next.js metadata with title and description', () => {
    expect(metadata).toBeDefined();
    expect(String(metadata.title)).toContain(
      'Subantarctic Tussock-Grass Peat Bog & Katabatic Headland Navigation Guide'
    );
    expect(String(metadata.description)).toMatch(
      /tussock|katabatic|flabellata|wallow|virkon/i
    );
  });

  it('renders the literal H1, skip link, main landmark, educational safety sections, and TussockHeadlandHub', () => {
    render(<TussockHeadlandPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('tussock-headland-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe(
      'Subantarctic Tussock-Grass Peat Bog & Katabatic Headland Navigation Guide'
    );

    const mainLandmark = screen.getByRole('main');
    expect(mainLandmark.getAttribute('id')).toBe('tussock-headland-main');

    const skipLink = screen.getByRole('link', {
      name: /Skip to main content/i,
    });
    expect(skipLink.getAttribute('href')).toBe('#tussock-headland-main');

    expect(
      screen.getByRole('heading', {
        name: /Poa flabellata Pedestal-Maze Navigation, Glacier Katabatic Williwaws & Subantarctic Biosecurity/i,
      })
    ).toBeDefined();
  });
});
