import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TurtlePatrolPage from './page';

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

vi.mock('@/components/turtle-patrol-hub', () => ({
  __esModule: true,
  default: () => <div data-testid="turtle-patrol-hub" />,
}));

describe('TurtlePatrolPage', () => {
  it('renders the literal H1 and the turtle patrol hub component', () => {
    render(<TurtlePatrolPage />);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('turtle-patrol-hub')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe(
      'Wilderness Sea Turtle Hatchling Conservation & Barrier Beach Patrolling'
    );
  });
});
