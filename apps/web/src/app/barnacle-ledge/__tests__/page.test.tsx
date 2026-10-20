import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import BarnacleLedgePage, { metadata } from '../page';

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

vi.mock('@/components/BarnacleLedgeHub', () => ({
  __esModule: true,
  default: () => <div data-testid="barnacle-ledge-hub" />,
}));

describe('BarnacleLedgePage', () => {
  it('exports Next.js metadata with title and description', () => {
    expect(metadata).toBeDefined();
    expect(String(metadata.title)).toContain(
      'Coastal Intertidal Sabellariid Worm-Reef & Barnacle-Encrusted Basalt Ledge Traversing Guide'
    );
    expect(String(metadata.description)).toMatch(
      /sabellariid|barnacle|intertidal|basalt|infragravity|porphyra/i
    );
  });

  it('renders the literal H1, skip link, main landmark, educational safety sections, and BarnacleLedgeHub', () => {
    render(<BarnacleLedgePage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('barnacle-ledge-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe(
      'Coastal Intertidal Sabellariid Worm-Reef & Barnacle-Encrusted Basalt Ledge Traversing Guide'
    );

    const mainLandmark = screen.getByRole('main');
    expect(mainLandmark.getAttribute('id')).toBe('barnacle-ledge-main');

    const skipLink = screen.getByRole('link', {
      name: /Skip to main content/i,
    });
    expect(skipLink.getAttribute('href')).toBe('#barnacle-ledge-main');

    expect(
      screen.getByRole('heading', {
        name: /Biogenic Sabellariid Reef Preservation, Porphyra\/Balanus Laceration Mechanics & Infragravity Set Runup/i,
      })
    ).toBeDefined();
  });
});
