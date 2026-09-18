import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TrailsPage from './page';

// Mock Header and Block components
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

describe('TrailsPage', () => {
  it('renders the trails page with required h1 and structured h2 headings', () => {
    render(<TrailsPage />);

    expect(screen.getByTestId('header')).toBeDefined();

    // Required h1
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Trail Activity & Weather Outfitting Guide');

    // Required h2s
    const h2Elements = screen.getAllByRole('heading', { level: 2 });
    const h2Texts = h2Elements.map((h) => h.textContent);
    expect(h2Texts).toContain('Featured Regional Trails');
    expect(h2Texts).toContain('Custom Outfitting Checklist');
    expect(h2Texts).toContain('Weather & Trail Safety Advice');
  });

  it('updates checklist when a trail is selected from the catalog', () => {
    render(<TrailsPage />);

    const selectButtons = screen.getAllByRole('button', { name: /select trail/i });
    expect(selectButtons.length).toBeGreaterThan(1);

    // Select the second trail (Bear Peak Summit)
    fireEvent.click(selectButtons[1]);

    expect(screen.getByText(/Selected Trail: Bear Peak Summit/i)).toBeDefined();
  });
});
