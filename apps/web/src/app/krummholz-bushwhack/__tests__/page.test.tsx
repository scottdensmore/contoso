import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import KrummholzBushwhackPage, { metadata } from '../page';

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

vi.mock('@/components/KrummholzBushwhackHub', () => ({
  __esModule: true,
  default: () => <div data-testid="krummholz-bushwhack-hub" />,
}));

describe('KrummholzBushwhackPage', () => {
  it('exports Next.js metadata with title and description', () => {
    expect(metadata).toBeDefined();
    expect(String(metadata.title)).toContain(
      'Subalpine Krummholz & Wind-Sculpted Dwarf-Conifer Thicket Bushwhacking Guide'
    );
    expect(String(metadata.description)).toMatch(
      /krummholz|spruce-trap|bushwhack|conifer|subalpine/i
    );
  });

  it('renders the literal H1, skip link, main landmark, educational safety sections, and KrummholzBushwhackHub', () => {
    render(<KrummholzBushwhackPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('krummholz-bushwhack-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe(
      'Subalpine Krummholz & Wind-Sculpted Dwarf-Conifer Thicket Bushwhacking Guide'
    );

    const mainLandmark = screen.getByRole('main');
    expect(mainLandmark.getAttribute('id')).toBe('krummholz-bushwhack-main');

    const skipLink = screen.getByRole('link', {
      name: /Skip to main content/i,
    });
    expect(skipLink.getAttribute('href')).toBe('#krummholz-bushwhack-main');

    expect(
      screen.getByRole('heading', {
        name: /Polycarbonate Eye Protection, Spruce-Trap Void Inversion Extraction & Frost-Heave Lead Routing/i,
      })
    ).toBeDefined();
  });
});
