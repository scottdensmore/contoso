import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import FirstAidPage from './page';

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

vi.mock('@/components/first-aid-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="first-aid-hub" />,
}));

describe('FirstAidPage', () => {
  it('renders the literal H1 and the first aid hub component', () => {
    render(<FirstAidPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('first-aid-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Wilderness First Aid & Medical Evacuation Advisor');
  });
});
