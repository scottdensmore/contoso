import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TrailPackingHub from './trail-packing-hub';

describe('TrailPackingHub Component', () => {
  it('renders required h2 section headings and h3 route card headings without skipping levels', () => {
    render(<TrailPackingHub />);

    const h2Headings = screen.getAllByRole('heading', { level: 2 });
    expect(h2Headings.length).toBeGreaterThanOrEqual(3);

    const h3Headings = screen.getAllByRole('heading', { level: 3 });
    expect(h3Headings.length).toBe(5);

    // Verify h1 does not exist inside the hub (as h1 is rendered by the page)
    const h1Headings = screen.queryAllByRole('heading', { level: 1 });
    expect(h1Headings.length).toBe(0);
  });

  it('filters route cards by saddle type buttons', () => {
    render(<TrailPackingHub />);

    // Initially all 5 cards visible
    expect(screen.getByTestId('route-card-bob-marshall-wilderness')).toBeDefined();
    expect(screen.getByTestId('route-card-pasayten-wilderness')).toBeDefined();
    expect(screen.getByTestId('route-card-wind-river-range')).toBeDefined();
    expect(screen.getByTestId('route-card-pecos-wilderness')).toBeDefined();
    expect(screen.getByTestId('route-card-frank-church-river-of-no-return')).toBeDefined();

    // Click "Decker Rigging" filter
    const deckerBtn = screen.getByRole('button', { name: /^Decker Rigging$/i });
    fireEvent.click(deckerBtn);

    expect(screen.getByTestId('route-card-bob-marshall-wilderness')).toBeDefined();
    expect(screen.getByTestId('route-card-wind-river-range')).toBeDefined();
    expect(screen.getByTestId('route-card-frank-church-river-of-no-return')).toBeDefined();
    expect(screen.queryByTestId('route-card-pasayten-wilderness')).toBeNull();
    expect(screen.queryByTestId('route-card-pecos-wilderness')).toBeNull();

    // Click "Sawbuck Rigging" filter
    const sawbuckBtn = screen.getByRole('button', { name: /^Sawbuck Rigging$/i });
    fireEvent.click(sawbuckBtn);

    expect(screen.getByTestId('route-card-pasayten-wilderness')).toBeDefined();
    expect(screen.getByTestId('route-card-pecos-wilderness')).toBeDefined();
    expect(screen.queryByTestId('route-card-bob-marshall-wilderness')).toBeNull();

    // Click "All Saddles" filter
    const allBtn = screen.getByRole('button', { name: /^All Saddles$/i });
    fireEvent.click(allBtn);

    expect(screen.getByTestId('route-card-bob-marshall-wilderness')).toBeDefined();
    expect(screen.getByTestId('route-card-pasayten-wilderness')).toBeDefined();
  });

  it('updates calculator status panel when pannier weights and stock animal change', () => {
    render(<TrailPackingHub />);

    const resultPanel = screen.getByTestId('trail-packing-calculator-result');
    expect(resultPanel).toBeDefined();

    // Default: left 65, right 65, top 20 -> 150 lbs total, 0 lbs diff
    expect(screen.getByTestId('trail-balance-status-badge').textContent).toMatch(/Balanced/i);
    expect(screen.getByTestId('trail-capacity-status-badge').textContent).toMatch(/Within Capacity/i);
    expect(resultPanel.textContent).toContain('150 lbs');
    expect(resultPanel.textContent).toContain('0 lbs');
    expect(resultPanel.textContent).toContain('3.5 m (12 ft)');

    // Change left pannier to 85 lbs and right to 50 lbs
    const leftPannierInput = screen.getByLabelText(/Left Pannier \(lbs\)/i);
    fireEvent.change(leftPannierInput, { target: { value: '85' } });

    const rightPannierInput = screen.getByLabelText(/Right Pannier \(lbs\)/i);
    fireEvent.change(rightPannierInput, { target: { value: '50' } });

    // Live status should reflect unbalanced
    expect(screen.getByTestId('trail-balance-status-badge').textContent).toMatch(/Unbalanced - Risk of Galls/i);
    expect(resultPanel.textContent).toContain('35 lbs');
    expect(resultPanel.textContent).toMatch(/Shift approximately 18 lbs/i);

    // Overload the animal (e.g. left 100, right 100, top 30 = 230 lbs)
    fireEvent.change(leftPannierInput, { target: { value: '100' } });
    fireEvent.change(rightPannierInput, { target: { value: '100' } });
    const topPackInput = screen.getByLabelText(/Top Pack \(lbs\)/i);
    fireEvent.change(topPackInput, { target: { value: '30' } });

    expect(screen.getByTestId('trail-capacity-status-badge').textContent).toMatch(/Overloaded - Injury Risk/i);
    expect(resultPanel.textContent).toContain('230 lbs');
  });

  it('updates tack checklist counter with data-testid="tack-gear-counter"', () => {
    render(<TrailPackingHub />);

    const counter = screen.getByTestId('tack-gear-counter');
    expect(counter.textContent).toBe('0 of 6 packed');

    const firstCheckbox = screen.getByLabelText(/Wide Nylon Tree-Saver Straps/i);
    expect(firstCheckbox).not.toBeChecked();

    fireEvent.click(firstCheckbox);
    expect(firstCheckbox).toBeChecked();
    expect(counter.textContent).toBe('1 of 6 packed');

    const secondCheckbox = screen.getByLabelText(/Heavy-Duty Cotton Lead Ropes/i);
    fireEvent.click(secondCheckbox);
    expect(counter.textContent).toBe('2 of 6 packed');

    fireEvent.click(firstCheckbox);
    expect(counter.textContent).toBe('1 of 6 packed');
  });
});
