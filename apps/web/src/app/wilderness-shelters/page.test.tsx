import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import WildernessSheltersPage from './page';

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

vi.mock('@/components/wilderness-shelters-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="wilderness-shelters-hub" />,
}));

describe('WildernessSheltersPage', () => {
  it('renders literal H1, Header, and WildernessSheltersHub component', () => {
    render(<WildernessSheltersPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('wilderness-shelters-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Wilderness Survival Shelters & Snow Bivouac Guide');
  });
});
