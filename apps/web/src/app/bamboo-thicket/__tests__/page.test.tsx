import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import BambooThicketPage, { metadata } from '../page';

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

vi.mock('@/components/BambooThicketHub', () => ({
  __esModule: true,
  default: () => <div data-testid="bamboo-thicket-hub" />,
}));

describe('BambooThicketPage', () => {
  it('exports Next.js metadata with title and description', () => {
    expect(metadata).toBeDefined();
    expect(String(metadata.title)).toContain(
      'Montane Bamboo-Thicket (Chusquea / Sasa) & Cloud-Forest Ridge-Crest Bushwhacking Guide'
    );
    expect(String(metadata.description)).toMatch(
      /bamboo|chusquea|sasa|punji|cornice|bushwhacking/i
    );
  });

  it('renders the literal H1, skip link, main landmark, educational safety sections, and BambooThicketHub', () => {
    render(<BambooThicketPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('bamboo-thicket-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe(
      'Montane Bamboo-Thicket (Chusquea / Sasa) & Cloud-Forest Ridge-Crest Bushwhacking Guide'
    );

    const mainLandmark = screen.getByRole('main');
    expect(mainLandmark.getAttribute('id')).toBe('bamboo-thicket-main');

    const skipLink = screen.getByRole('link', {
      name: /Skip to main content/i,
    });
    expect(skipLink.getAttribute('href')).toBe('#bamboo-thicket-main');

    expect(
      screen.getByRole('heading', {
        name: /Chusquea & Sasa Culm Springback Mechanics, Flush-Node Pruning & Ridge Cornice Hazards/i,
      })
    ).toBeDefined();
  });
});
