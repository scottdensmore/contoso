import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import JokulhlaupEscapePage, { metadata } from '../page';

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

vi.mock('@/components/JokulhlaupEscapeHub', () => ({
  __esModule: true,
  default: () => <div data-testid="jokulhlaup-escape-hub" />,
}));

describe('JokulhlaupEscapePage', () => {
  it('exports Next.js metadata with title and description', () => {
    expect(metadata).toBeDefined();
    expect(String(metadata.title)).toContain(
      'Subglacial Jökulhlaup Ice-Dammed Lake Outburst & Proglacial Canyon Escape Guide'
    );
    expect(String(metadata.description)).toMatch(
      /jökulhlaup|subglacial|outburst|proglacial|canyon|moraine/i
    );
  });

  it('renders the literal H1, skip link, main landmark, educational safety sections, and JokulhlaupEscapeHub', () => {
    render(<JokulhlaupEscapePage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('jokulhlaup-escape-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe(
      'Subglacial Jökulhlaup Ice-Dammed Lake Outburst & Proglacial Canyon Escape Guide'
    );

    const mainLandmark = screen.getByRole('main');
    expect(mainLandmark.getAttribute('id')).toBe('jokulhlaup-escape-main');

    const skipLink = screen.getByRole('link', {
      name: /Skip to main content/i,
    });
    expect(skipLink.getAttribute('href')).toBe('#jokulhlaup-escape-main');

    expect(
      screen.getByRole('heading', {
        name: /Röthlisberger Conduit Enlargement, Subglacial H2S\/Conductivity Precursors & Perpendicular Terrace Evacuation/i,
      })
    ).toBeDefined();
  });
});
