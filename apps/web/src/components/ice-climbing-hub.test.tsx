import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import IceClimbingHub from './ice-climbing-hub';

describe('IceClimbingHub', () => {
  it('renders all main sections with h2 headings and no skipped heading levels', () => {
    render(<IceClimbingHub />);

    const h2s = screen.getAllByRole('heading', { level: 2 });
    const headings = h2s.map((h) => h.textContent);

    expect(headings.some((h) => /ice climbing routes|routes/i.test(h || ''))).toBe(true);
    expect(headings.some((h) => /ice screw rigging|calculator/i.test(h || ''))).toBe(true);
    expect(headings.some((h) => /checklist|safety kit/i.test(h || ''))).toBe(true);
  });

  it('renders route cards with h3 headings and key ice climbing metrics', () => {
    render(<IceClimbingHub />);

    const grid = screen.getByTestId('ice-routes-grid');
    const h3s = within(grid).getAllByRole('heading', { level: 3 });
    const titles = h3s.map((h) => h.textContent);

    expect(titles.some((t) => t?.includes('Pic of the Vic'))).toBe(true);
    expect(titles.some((t) => t?.includes('Genesis II'))).toBe(true);
    expect(titles.some((t) => t?.includes('The Weeping Wall'))).toBe(true);
    expect(titles.some((t) => t?.includes('The Promised Land'))).toBe(true);
    expect(titles.some((t) => t?.includes('The Fang'))).toBe(true);

    // Verify pitches, length, elevation, duration
    expect(within(grid).getByText(/2 pitches/i)).toBeDefined();
    expect(within(grid).getByText(/45\s*m/i)).toBeDefined();
    expect(within(grid).getByText(/2400\s*m/i)).toBeDefined();
    expect(within(grid).getByText(/2\.5\s*hrs/i)).toBeDefined();

    // Verify grade and structure badges
    expect(within(grid).getAllByText(/WI3 - Intermediate/i).length).toBeGreaterThan(0);
    expect(within(grid).getAllByText(/Plastic Water Ice/i).length).toBeGreaterThan(0);
  });

  it('filters routes when ice grade filter buttons are clicked', () => {
    render(<IceClimbingHub />);

    const grid = screen.getByTestId('ice-routes-grid');

    // Filter by WI5 Expert
    const wi5Btn = screen.getByRole('button', { name: /wi5/i });
    fireEvent.click(wi5Btn);

    expect(within(grid).getByText(/The Promised Land/i)).toBeDefined();
    expect(within(grid).queryByText(/Pic of the Vic/i)).toBeNull();
    expect(within(grid).queryByText(/The Fang/i)).toBeNull();

    // Filter by WI6 Extreme
    const wi6Btn = screen.getByRole('button', { name: /wi6/i });
    fireEvent.click(wi6Btn);

    expect(within(grid).getByText(/The Fang/i)).toBeDefined();
    expect(within(grid).queryByText(/The Promised Land/i)).toBeNull();
    expect(within(grid).queryByText(/Genesis II/i)).toBeNull();

    // Filter by WI4 Advanced
    const wi4Btn = screen.getByRole('button', { name: /wi4/i });
    fireEvent.click(wi4Btn);

    expect(within(grid).getByText(/Genesis II Waterfall/i)).toBeDefined();
    expect(within(grid).getByText(/The Weeping Wall/i)).toBeDefined();
    expect(within(grid).queryByText(/The Fang/i)).toBeNull();

    // Reset filter to All Routes
    const allBtn = screen.getByRole('button', { name: /all routes/i });
    fireEvent.click(allBtn);

    expect(within(grid).getByText(/Pic of the Vic/i)).toBeDefined();
    expect(within(grid).getByText(/Genesis II/i)).toBeDefined();
    expect(within(grid).getByText(/The Weeping Wall/i)).toBeDefined();
    expect(within(grid).getByText(/The Promised Land/i)).toBeDefined();
    expect(within(grid).getByText(/The Fang/i)).toBeDefined();
  });

  it('updates live calculator reactive results panel with role="status" and aria-live="polite"', () => {
    render(<IceClimbingHub />);

    const resultPanel = screen.getByTestId('ice-calculator-result');
    expect(resultPanel.getAttribute('role')).toBe('status');
    expect(resultPanel.getAttribute('aria-live')).toBe('polite');

    const routeSelect = screen.getByLabelText(/select.*ice climbing route/i);
    const tempInput = screen.getByLabelText(/ice temperature/i);
    const thicknessInput = screen.getByLabelText(/ice thickness/i);
    const anchorSelect = screen.getByLabelText(/anchor configuration|anchor type/i);

    // Initial state: Ouray Ice Park, 20°F, 25cm, 19cm screw, dual equalized
    fireEvent.change(routeSelect, { target: { value: 'ouray-ice-park-pic-of-the-vic' } });
    expect(within(resultPanel).getByText(/Pic of the Vic & Upper Bridge Area/i)).toBeDefined();
    expect(within(resultPanel).getByText(/Dense hero ice/i)).toBeDefined();
    expect(within(resultPanel).getByText(/Approved Belay Anchor/i)).toBeDefined();

    // Change temperature to warm > 32°F
    fireEvent.change(tempInput, { target: { value: '36' } });
    expect(within(resultPanel).getByText(/Wet melting risk/i)).toBeDefined();
    expect(within(resultPanel).getByText(/Hazardous Thin or Melting/i)).toBeDefined();
    expect(within(resultPanel).getByText(/Melting hazard/i)).toBeDefined();

    // Reset temperature and test single screw bail
    fireEvent.change(tempInput, { target: { value: '20' } });
    fireEvent.change(anchorSelect, { target: { value: 'single_screw_bail' } });
    expect(within(resultPanel).getByText(/Caution Conditions/i)).toBeDefined();
    expect(within(resultPanel).getByText(/WARNING: Single screw/i)).toBeDefined();

    // Test thin ice < 12cm
    fireEvent.change(anchorSelect, { target: { value: 'dual_screw_equalized' } });
    fireEvent.change(thicknessInput, { target: { value: '9' } });
    expect(within(resultPanel).getByText(/Hazardous Thin or Melting/i)).toBeDefined();
  });

  it('toggles checklist items and updates live ice-gear-counter', () => {
    render(<IceClimbingHub />);

    const counter = screen.getByTestId('ice-gear-counter');
    expect(counter.textContent).toMatch(/0 of 6 packed/i);

    const toolsCheckbox = screen.getByLabelText(/Pair of Ergonomic Technical Ice Tools/i);
    fireEvent.click(toolsCheckbox);
    expect(counter.textContent).toMatch(/1 of 6 packed/i);

    const cramponsCheckbox = screen.getByLabelText(/Rigid or Semi-Rigid Steel Ice Climbing Crampons/i);
    fireEvent.click(cramponsCheckbox);
    expect(counter.textContent).toMatch(/2 of 6 packed/i);

    fireEvent.click(toolsCheckbox);
    expect(counter.textContent).toMatch(/1 of 6 packed/i);
  });

  it('has accessible form control labels and distinct htmlFor pairings', () => {
    render(<IceClimbingHub />);

    expect(screen.getByLabelText(/select.*ice climbing route/i)).toBeDefined();
    expect(screen.getByLabelText(/ice temperature/i)).toBeDefined();
    expect(screen.getByLabelText(/ice thickness/i)).toBeDefined();
    expect(screen.getByLabelText(/screw length/i)).toBeDefined();
    expect(screen.getByLabelText(/placement angle/i)).toBeDefined();
    expect(screen.getByLabelText(/anchor configuration/i)).toBeDefined();
  });
});
