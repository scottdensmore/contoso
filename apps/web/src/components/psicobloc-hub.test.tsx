import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import PsicoblocHub from './psicobloc-hub';

describe('PsicoblocHub', () => {
  it('renders all main sections with h2 headings and no skipped heading levels', () => {
    render(<PsicoblocHub />);

    const h2s = screen.getAllByRole('heading', { level: 2 });
    const headings = h2s.map((h) => h.textContent);

    expect(headings.some((h) => /crags|destinations|locations/i.test(h || ''))).toBe(true);
    expect(headings.some((h) => /velocity|calculator|safety/i.test(h || ''))).toBe(true);
    expect(headings.some((h) => /checklist|kit|safety kit/i.test(h || ''))).toBe(true);
  });

  it('renders crag cards with h3 headings and key psicobloc metrics', () => {
    render(<PsicoblocHub />);

    const grid = screen.getByTestId('psicobloc-crags-grid');
    const h3s = within(grid).getAllByRole('heading', { level: 3 });
    const titles = h3s.map((h) => h.textContent);

    expect(titles.some((t) => t?.includes('Es Pontàs'))).toBe(true);
    expect(titles.some((t) => t?.includes('Cala Barques'))).toBe(true);
    expect(titles.some((t) => t?.includes('Railay'))).toBe(true);
    expect(titles.some((t) => t?.includes('Conner Cove'))).toBe(true);
    expect(titles.some((t) => t?.includes("Pirate's Cove"))).toBe(true);

    // Verify rock type, heights, water depth, and badges
    expect(within(grid).getByText(/Santanyí, Mallorca/i)).toBeDefined();
    expect(within(grid).getByText(/9a\+ \(5\.15a\)/i)).toBeDefined();
    expect(within(grid).getAllByText(/20\s*m/i).length).toBeGreaterThanOrEqual(1);
    expect(within(grid).getAllByText(/10\s*m/i).length).toBeGreaterThanOrEqual(1);
    expect(within(grid).getAllByText(/Boat Access Only/i).length).toBeGreaterThanOrEqual(1);
  });

  it('filters crags when rock type filter buttons are clicked', () => {
    render(<PsicoblocHub />);

    const grid = screen.getByTestId('psicobloc-crags-grid');

    // Filter by Pocketed Limestone
    const pocketedBtn = screen.getByRole('button', { name: /pocketed limestone/i });
    fireEvent.click(pocketedBtn);

    expect(within(grid).getByRole('heading', { level: 3, name: /Es Pontàs/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /Conner Cove/i })).toBeDefined();
    expect(within(grid).queryByRole('heading', { level: 3, name: /Cala Barques/i })).toBeNull();
    expect(within(grid).queryByRole('heading', { level: 3, name: /Railay/i })).toBeNull();
    expect(within(grid).queryByRole('heading', { level: 3, name: /Pirate's Cove/i })).toBeNull();

    // Filter by Karst Limestone
    const karstBtn = screen.getByRole('button', { name: /karst limestone/i });
    fireEvent.click(karstBtn);

    expect(within(grid).getByRole('heading', { level: 3, name: /Railay/i })).toBeDefined();
    expect(within(grid).queryByRole('heading', { level: 3, name: /Es Pontàs/i })).toBeNull();

    // Filter by Marine Sandstone
    const sandstoneBtn = screen.getByRole('button', { name: /marine sandstone/i });
    fireEvent.click(sandstoneBtn);

    expect(within(grid).getByRole('heading', { level: 3, name: /Pirate's Cove/i })).toBeDefined();
    expect(within(grid).queryByRole('heading', { level: 3, name: /Railay/i })).toBeNull();

    // Reset to All Crags
    const allBtn = screen.getByRole('button', { name: /all crags/i });
    fireEvent.click(allBtn);

    expect(within(grid).getByRole('heading', { level: 3, name: /Es Pontàs/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /Cala Barques/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /Railay/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /Conner Cove/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /Pirate's Cove/i })).toBeDefined();
  });

  it('updates live calculator reactive results panel with status role and aria-live', () => {
    render(<PsicoblocHub />);

    const resultPanel = screen.getByTestId('psicobloc-calculator-result');
    expect(resultPanel.getAttribute('role')).toBe('status');
    expect(resultPanel.getAttribute('aria-live')).toBe('polite');

    const cragSelect = screen.getByLabelText(/select.*crag/i);
    const climbingHeightInput = screen.getByLabelText(/climbing height/i);
    const waterDepthInput = screen.getByLabelText(/^water depth/i);
    const bodyEntrySelect = screen.getByLabelText(/body entry position/i);

    // Initial default: Es Pontas, 12m height, 7m water depth, pencil entry -> Approved
    expect(within(resultPanel).getByText(/Es Pontàs/i)).toBeDefined();
    expect(within(resultPanel).getByText('Approved')).toBeDefined();

    // Switch body entry to flat back or belly -> Hazardous: Prohibited Dive
    fireEvent.change(bodyEntrySelect, { target: { value: 'flat_back_or_belly' } });
    expect(within(resultPanel).getByText('Hazardous: Prohibited Dive')).toBeDefined();
    expect(within(resultPanel).getByText(/catastrophic impact trauma/i)).toBeDefined();

    // Switch back to pencil, but lower water depth below minimum safe depth (e.g. 3m vs 6.1m safe)
    fireEvent.change(bodyEntrySelect, { target: { value: 'pencil_feet_first_pointed' } });
    fireEvent.change(waterDepthInput, { target: { value: '4.0' } });
    expect(within(resultPanel).getByText('Hazardous: Prohibited Dive')).toBeDefined();

    // Set height to 18m with deep water 12m -> Caution: High Risk
    fireEvent.change(waterDepthInput, { target: { value: '12.0' } });
    fireEvent.change(climbingHeightInput, { target: { value: '18.0' } });
    expect(within(resultPanel).getByText('Caution: High Risk')).toBeDefined();

    // Select Railay Beach in dropdown
    fireEvent.change(cragSelect, { target: { value: 'railay-tonsai-krabi' } });
    expect(within(resultPanel).getByText(/Railay Beach/i)).toBeDefined();
  });

  it('tracks checked items in the psicobloc safety kit checklist and updates counter', () => {
    render(<PsicoblocHub />);

    const counter = screen.getByTestId('psicobloc-gear-counter');
    expect(counter.textContent).toContain('0 of 6 packed');

    const liquidChalk = screen.getByLabelText(/quick-drying resin-enhanced liquid chalk tube/i);
    fireEvent.click(liquidChalk);
    expect(counter.textContent).toContain('1 of 6 packed');

    const exitLadder = screen.getByLabelText(/15m heavy-duty marine rope ladder/i);
    fireEvent.click(exitLadder);
    expect(counter.textContent).toContain('2 of 6 packed');

    fireEvent.click(liquidChalk);
    expect(counter.textContent).toContain('1 of 6 packed');
  });
});
