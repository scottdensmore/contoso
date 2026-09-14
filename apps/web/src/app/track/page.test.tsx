import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TrackPage, { metadata } from './page';

vi.mock('@/components/header', () => ({
  __esModule: true,
  default: () => <header data-testid="header" />,
}));

vi.mock('@/components/order-tracker', () => ({
  __esModule: true,
  default: () => <div data-testid="order-tracker" />,
}));

describe('Track Page', () => {
  it('exports correct metadata title', () => {
    expect(metadata.title).toBe('Track Your Order | Contoso Outdoors');
  });

  it('renders Header and OrderTracker component', () => {
    render(<TrackPage />);
    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('order-tracker')).toBeDefined();
  });
});
