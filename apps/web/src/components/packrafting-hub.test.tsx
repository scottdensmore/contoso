import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import PackraftingHub from './packrafting-hub';

describe('PackraftingHub', () => {
  it('renders all main sections with h2 headings and no skipped heading levels', () => {
    render(<PackraftingHub />);

    const h2s = screen.getAllByRole('heading', { level: 2 });
    const headings = h2s.map((h) => h.textContent);

    expect(headings.some((h) => /expedition|routes/i.test(h || ''))).toBe(true);
    expect(headings.some((h) => /calculator|payload/i.test(h || ''))).toBe(true);
    expect(headings.some((h) => /checklist|kit/i.test(h || ''))).toBe(true);
  });

  it('renders route cards with h3 headings and key expedition data', () => {
    render(<PackraftingHub />);

    const grid = screen.getByTestId('packraft-routes-grid');
    const h3s = within(grid).getAllByRole('heading', { level: 3 });
    const titles = h3s.map((h) => h.textContent);

    expect(titles.some((t) => t?.includes('Middle Fork Salmon River'))).toBe(true);
    expect(titles.some((t) => t?.includes('South Fork Flathead River'))).toBe(true);
    expect(titles.some((t) => t?.includes('Talkeetna River'))).toBe(true);
    expect(titles.some((t) => t?.includes('Escalante River'))).toBe(true);
    expect(titles.some((t) => t?.includes('Green River'))).toBe(true);

    // Verify distance & portage formatting
    expect(within(grid).getByText(/96 mi/)).toBeDefined();
    expect(within(grid).getByText(/4\.5 mi portage/)).toBeDefined();
    expect(within(grid).getAllByText(/Spraydeck Required/i).length).toBeGreaterThan(0);
  });

  it('filters routes when river grade filter buttons are clicked', () => {
    render(<PackraftingHub />);

    const grid = screen.getByTestId('packraft-routes-grid');

    // Filter by Class IV Technical
    const classIVBtn = screen.getByRole('button', { name: /class iv/i });
    fireEvent.click(classIVBtn);

    expect(within(grid).getByText(/Talkeetna River/i)).toBeDefined();
    expect(within(grid).queryByText(/Middle Fork Salmon River/i)).toBeNull();
    expect(within(grid).queryByText(/Escalante River/i)).toBeNull();

    // Filter by Class III Moderate
    const classIIIBtn = screen.getByRole('button', { name: /class iii/i });
    fireEvent.click(classIIIBtn);

    expect(within(grid).getByText(/Middle Fork Salmon River/i)).toBeDefined();
    expect(within(grid).queryByText(/Talkeetna River/i)).toBeNull();

    // Reset filter to All Routes
    const allBtn = screen.getByRole('button', { name: /all routes/i });
    fireEvent.click(allBtn);

    expect(within(grid).getByText(/Talkeetna River/i)).toBeDefined();
    expect(within(grid).getByText(/Middle Fork Salmon River/i)).toBeDefined();
    expect(within(grid).getByText(/Escalante River/i)).toBeDefined();
  });

  it('updates live calculator reactive results panel with status role and aria-live', () => {
    render(<PackraftingHub />);

    const resultPanel = screen.getByTestId('packraft-calculator-result');
    expect(resultPanel.getAttribute('role')).toBe('status');
    expect(resultPanel.getAttribute('aria-live')).toBe('polite');

    const routeSelect = screen.getByLabelText(/select expedition route/i);
    const flowInput = screen.getByLabelText(/flow rate/i);
    const boatCapacityInput = screen.getByLabelText(/boat weight capacity/i);
    const paddlerWeightInput = screen.getByLabelText(/paddler.*weight/i);

    // Select Middle Fork Salmon River
    fireEvent.change(routeSelect, { target: { value: 'frank-church-middle-fork-salmon' } });

    // Initial flow is optimal 2100 CFS, default boat capacity 135kg, paddler weight 90kg -> margin 45kg
    expect(within(resultPanel).getAllByText(/navigable/i).length).toBeGreaterThan(0);
    expect(within(resultPanel).getByText(/whitewater deck/i)).toBeDefined();
    expect(within(resultPanel).getAllByText(/45\s*kg/i).length).toBeGreaterThan(0);
    expect(within(resultPanel).getByText(/210\s*cm/i)).toBeDefined();

    // Change flow to 800 CFS (below 1200 CFS min)
    fireEvent.change(flowInput, { target: { value: '800' } });
    expect(within(resultPanel).getAllByText(/scrape/i).length).toBeGreaterThan(0);

    // Change flow to 4500 CFS (above 3500 CFS max)
    fireEvent.change(flowInput, { target: { value: '4500' } });
    expect(within(resultPanel).getAllByText(/hazardous/i).length).toBeGreaterThan(0);

    // Overload payload capacity
    fireEvent.change(boatCapacityInput, { target: { value: '100' } });
    fireEvent.change(paddlerWeightInput, { target: { value: '110' } });
    expect(within(resultPanel).getAllByText(/-10\s*kg/i).length).toBeGreaterThan(0);
    expect(within(resultPanel).getAllByText(/warning|overload|swamp/i).length).toBeGreaterThan(0);
  });

  it('toggles checklist items and updates live packraft-gear-counter', () => {
    render(<PackraftingHub />);

    const counter = screen.getByTestId('packraft-gear-counter');
    expect(counter.textContent).toMatch(/0 of 6 packed/i);

    const pfdCheckbox = screen.getByLabelText(/uscg type iii\/v whitewater pfd/i);
    fireEvent.click(pfdCheckbox);
    expect(counter.textContent).toMatch(/1 of 6 packed/i);

    const paddleCheckbox = screen.getByLabelText(/4-piece breakdown packrafting paddle/i);
    fireEvent.click(paddleCheckbox);
    expect(counter.textContent).toMatch(/2 of 6 packed/i);

    fireEvent.click(pfdCheckbox);
    expect(counter.textContent).toMatch(/1 of 6 packed/i);
  });

  it('has accessible form control labels and checkboxes', () => {
    render(<PackraftingHub />);

    expect(screen.getByLabelText(/select expedition route/i)).toBeDefined();
    expect(screen.getByLabelText(/paddler skill level/i)).toBeDefined();
    expect(screen.getByLabelText(/flow rate/i)).toBeDefined();
    expect(screen.getByLabelText(/boat weight capacity/i)).toBeDefined();
    expect(screen.getByLabelText(/paddler.*weight/i)).toBeDefined();
  });
});
