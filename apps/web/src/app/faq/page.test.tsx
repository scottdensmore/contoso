import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import FAQPage, { metadata } from './page';

// Mock Header and FaqSearch components
vi.mock('@/components/header', () => ({
  __esModule: true,
  default: () => <div data-testid="header" />,
}));

vi.mock('@/components/faq-search', () => ({
  __esModule: true,
  default: () => <div data-testid="faq-search" />,
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

describe('FAQ Page', () => {
  it('exports page metadata with Help Center & FAQ title', () => {
    expect(metadata.title).toBe('Help Center & FAQ | Contoso Outdoors');
  });

  it('renders the FAQ page with Header, Hero banner, FaqSearch, and Bottom CTA', () => {
    render(<FAQPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByRole('heading', { level: 1, name: /help center & faq/i })).toBeDefined();
    expect(screen.getByTestId('faq-search')).toBeDefined();
    expect(screen.getByRole('heading', { level: 2, name: /still have questions\?/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /contact support/i })).toBeDefined();
  });
});
