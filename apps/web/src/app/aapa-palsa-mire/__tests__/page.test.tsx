import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AapaPalsaMirePage, { metadata } from '../page';

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

vi.mock('@/components/AapaPalsaMireHub', () => ({
  __esModule: true,
  default: () => <div data-testid="aapa-palsa-mire-hub" />,
}));

describe('AapaPalsaMirePage', () => {
  it('exports Next.js metadata with title and description', () => {
    expect(metadata).toBeDefined();
    expect(String(metadata.title)).toContain(
      'Boreal String-Bog (Aapa Mire) Flark-Pool & Palsa Permafrost-Mound Crossing Guide'
    );
    expect(String(metadata.description)).toMatch(
      /aapa|palsa|flark|sträng|permafrost|mire/i
    );
  });

  it('renders the literal H1, skip link, main landmark, educational safety sections, and AapaPalsaMireHub', () => {
    render(<AapaPalsaMirePage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('aapa-palsa-mire-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe(
      'Boreal String-Bog (Aapa Mire) Flark-Pool & Palsa Permafrost-Mound Crossing Guide'
    );

    const mainLandmark = screen.getByRole('main');
    expect(mainLandmark.getAttribute('id')).toBe('aapa-palsa-mire-main');

    const skipLink = screen.getByRole('link', {
      name: /Skip to main content/i,
    });
    expect(skipLink.getAttribute('href')).toBe('#aapa-palsa-mire-main');

    expect(
      screen.getByRole('heading', {
        name: /Perpendicular Sträng-Flark Hydro-Geomorphology, Palsa Lagg-Moat Collapse & Esker Routing/i,
      })
    ).toBeDefined();
  });
});
