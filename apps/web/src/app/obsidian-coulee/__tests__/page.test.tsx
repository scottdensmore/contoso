import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ObsidianCouleePage, { metadata } from '../page';

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

vi.mock('@/components/ObsidianCouleeHub', () => ({
  __esModule: true,
  default: () => <div data-testid="obsidian-coulee-hub" />,
}));

describe('ObsidianCouleePage', () => {
  it('exports Next.js metadata with title and description', () => {
    expect(metadata).toBeDefined();
    expect(String(metadata.title)).toContain(
      'High-Altitude Volcanic Obsidian-Flow & Glass-Block Coulee Scrambling Guide'
    );
    expect(String(metadata.description)).toMatch(
      /obsidian|coulee|conchoidal|rhyolite|pumice|vitrophyre/i
    );
  });

  it('renders the literal H1, skip link, main landmark, educational safety sections, and ObsidianCouleeHub', () => {
    render(<ObsidianCouleePage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('obsidian-coulee-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe(
      'High-Altitude Volcanic Obsidian-Flow & Glass-Block Coulee Scrambling Guide'
    );

    const mainLandmark = screen.getByRole('main');
    expect(mainLandmark.getAttribute('id')).toBe('obsidian-coulee-main');

    const skipLink = screen.getByRole('link', {
      name: /Skip to main content/i,
    });
    expect(skipLink.getAttribute('href')).toBe('#obsidian-coulee-main');

    expect(
      screen.getByRole('heading', {
        name: /3-Nanometer Conchoidal Fracture Mechanics, Pumiceous Carapace Bridges & Federal Zero-Collect Laws/i,
      })
    ).toBeDefined();
  });
});
