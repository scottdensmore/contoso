import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CenoteHaloclinePage, { metadata } from '../page';

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

vi.mock('@/components/CenoteHaloclineHub', () => ({
  __esModule: true,
  default: () => <div data-testid="cenote-halocline-hub" />,
}));

describe('CenoteHaloclinePage', () => {
  it('exports Next.js metadata with title and description', () => {
    expect(metadata).toBeDefined();
    expect(String(metadata.title)).toContain(
      'Subterranean Cenote Halocline & Anchialine Phreatic Cave-Passage Navigation Guide'
    );
    expect(String(metadata.description)).toMatch(
      /cenote|halocline|anchialine|schlieren|phreatic|hydrogen-sulfide/i
    );
  });

  it('renders the literal H1, skip link, main landmark, educational safety sections, and CenoteHaloclineHub', () => {
    render(<CenoteHaloclinePage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('cenote-halocline-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe(
      'Subterranean Cenote Halocline & Anchialine Phreatic Cave-Passage Navigation Guide'
    );

    const mainLandmark = screen.getByRole('main');
    expect(mainLandmark.getAttribute('id')).toBe('cenote-halocline-main');

    const skipLink = screen.getByRole('link', {
      name: /Skip to main content/i,
    });
    expect(skipLink.getAttribute('href')).toBe('#cenote-halocline-main');

    expect(
      screen.getByRole('heading', {
        name: /Halocline Refractive Schlieren Distortion, Meromictic H2S Chemoclines & Phreatic Guideline Protocols/i,
      })
    ).toBeDefined();
  });
});
