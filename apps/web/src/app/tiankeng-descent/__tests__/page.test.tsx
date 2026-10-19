import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TiankengDescentPage, { metadata } from '../page';

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

vi.mock('@/components/TiankengDescentHub', () => ({
  __esModule: true,
  default: () => <div data-testid="tiankeng-descent-hub" />,
}));

describe('TiankengDescentPage', () => {
  it('exports Next.js metadata with title and description', () => {
    expect(metadata).toBeDefined();
    expect(String(metadata.title)).toContain(
      'Karst Tiankeng (Giant Collapse Sinkhole) & Vertical Cloud-Forest Rim Descent Guide'
    );
    expect(String(metadata.description)).toMatch(
      /tiankeng|sinkhole|rebelay|karst|rack/i
    );
  });

  it('renders the literal H1, skip link, main landmark, educational safety sections, and TiankengDescentHub', () => {
    render(<TiankengDescentPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('tiankeng-descent-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe(
      'Karst Tiankeng (Giant Collapse Sinkhole) & Vertical Cloud-Forest Rim Descent Guide'
    );

    const mainLandmark = screen.getByRole('main');
    expect(mainLandmark.getAttribute('id')).toBe('tiankeng-descent-main');

    const skipLink = screen.getByRole('link', {
      name: /Skip to main content/i,
    });
    expect(skipLink.getAttribute('href')).toBe('#tiankeng-descent-main');

    expect(
      screen.getByRole('heading', {
        name: /Long-Drop Rope Weight & 6-Bar Rack Thermal Glazing, Cloud-Forest Rebelay Deviations & Subterranean Inversion Hypothermia/i,
      })
    ).toBeDefined();
  });
});
