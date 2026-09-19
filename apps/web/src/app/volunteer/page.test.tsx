import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import VolunteerPage from './page';

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

vi.mock('@/components/volunteer-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="volunteer-hub" />,
}));

describe('VolunteerPage', () => {
  it('renders the literal H1 and the volunteer hub component', () => {
    render(<VolunteerPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('volunteer-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Trail Volunteer & Stewardship Workparties');
  });
});
