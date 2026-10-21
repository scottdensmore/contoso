import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import FlashFloodSlotPage, { metadata } from '../page';

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

vi.mock('@/components/FlashFloodSlotHub', () => ({
  __esModule: true,
  default: () => <div data-testid="flash-flood-slot-hub" />,
}));

describe('FlashFloodSlotPage', () => {
  it('exports Next.js metadata with title and description', () => {
    expect(metadata).toBeDefined();
    expect(String(metadata.title)).toContain(
      'High-Desert Slot-Canyon Ephemeral Flash-Flood Hydrograph & Escape-Ledge Navigation Guide'
    );
    expect(String(metadata.description)).toMatch(
      /slot|flash-flood|hydrograph|slickrock|escape-ledge/i
    );
  });

  it('renders the literal H1, skip link, main landmark, educational safety sections, and FlashFloodSlotHub', () => {
    render(<FlashFloodSlotPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('flash-flood-slot-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe(
      'High-Desert Slot-Canyon Ephemeral Flash-Flood Hydrograph & Escape-Ledge Navigation Guide'
    );

    const mainLandmark = screen.getByRole('main');
    expect(mainLandmark.getAttribute('id')).toBe('flash-flood-slot-main');

    const skipLink = screen.getByRole('link', {
      name: /Skip to main content/i,
    });
    expect(skipLink.getAttribute('href')).toBe('#flash-flood-slot-main');

    expect(
      screen.getByRole('heading', {
        name: /Slickrock Basin Lag-Time & Blue-Sky Thunderstorm Bores, Venturi Constriction Physics & High-Water Alcove Survival/i,
      })
    ).toBeDefined();
  });
});
