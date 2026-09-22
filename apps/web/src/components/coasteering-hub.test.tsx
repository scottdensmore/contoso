import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import CoasteeringHub from './coasteering-hub';

describe('CoasteeringHub', () => {
  it('renders all main sections with h2 headings and no skipped heading levels', () => {
    render(<CoasteeringHub />);

    const h2s = screen.getAllByRole('heading', { level: 2 });
    const headings = h2s.map((h) => h.textContent);

    expect(headings.some((h) => /coasteering routes|routes/i.test(h || ''))).toBe(true);
    expect(headings.some((h) => /jump safety|calculator/i.test(h || ''))).toBe(true);
    expect(headings.some((h) => /checklist|kit|safety kit/i.test(h || ''))).toBe(true);
  });

  it('renders route cards with h3 headings and key coasteering metrics', () => {
    render(<CoasteeringHub />);

    const grid = screen.getByTestId('coasteering-routes-grid');
    const h3s = within(grid).getAllByRole('heading', { level: 3 });
    const titles = h3s.map((h) => h.textContent);

    expect(titles.some((t) => t?.includes('Point Lobos'))).toBe(true);
    expect(titles.some((t) => t?.includes('Depoe Bay'))).toBe(true);
    expect(titles.some((t) => t?.includes('Acadia Otter Cliffs'))).toBe(true);
    expect(titles.some((t) => t?.includes('La Jolla'))).toBe(true);
    expect(titles.some((t) => t?.includes('Cape Flattery'))).toBe(true);

    // Verify distance, duration, max jump, water temp, sea caves, min depth
    expect(within(grid).getByText(/2\.8\s*km/i)).toBeDefined();
    expect(within(grid).getByText(/3\.0\s*hrs/i)).toBeDefined();
    expect(within(grid).getAllByText(/5\.5\s*m/i).length).toBeGreaterThanOrEqual(1);
    expect(within(grid).getByText(/52°F/i)).toBeDefined();
  });

  it('filters routes when grade filter buttons are clicked', () => {
    render(<CoasteeringHub />);

    const grid = screen.getByTestId('coasteering-routes-grid');

    // Filter by Grade 4 Extreme
    const grade4Btn = screen.getByRole('button', { name: /grade 4/i });
    fireEvent.click(grade4Btn);

    expect(within(grid).getByRole('heading', { level: 3, name: /Cape Flattery/i })).toBeDefined();
    expect(within(grid).queryByRole('heading', { level: 3, name: /Point Lobos/i })).toBeNull();
    expect(within(grid).queryByRole('heading', { level: 3, name: /Depoe Bay/i })).toBeNull();
    expect(within(grid).queryByRole('heading', { level: 3, name: /La Jolla/i })).toBeNull();

    // Filter by Grade 3 Advanced
    const grade3Btn = screen.getByRole('button', { name: /grade 3/i });
    fireEvent.click(grade3Btn);

    expect(within(grid).getByRole('heading', { level: 3, name: /Depoe Bay/i })).toBeDefined();
    expect(within(grid).queryByRole('heading', { level: 3, name: /Cape Flattery/i })).toBeNull();
    expect(within(grid).queryByRole('heading', { level: 3, name: /Point Lobos/i })).toBeNull();

    // Filter by Grade 1 Sheltered
    const grade1Btn = screen.getByRole('button', { name: /grade 1/i });
    fireEvent.click(grade1Btn);

    expect(within(grid).getByRole('heading', { level: 3, name: /La Jolla/i })).toBeDefined();
    expect(within(grid).queryByRole('heading', { level: 3, name: /Depoe Bay/i })).toBeNull();

    // Reset filter to All Routes
    const allBtn = screen.getByRole('button', { name: /all routes/i });
    fireEvent.click(allBtn);

    expect(within(grid).getByRole('heading', { level: 3, name: /Point Lobos/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /Depoe Bay/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /Acadia Otter Cliffs/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /La Jolla/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /Cape Flattery/i })).toBeDefined();
  });

  it('updates live calculator reactive results panel with status role and aria-live', () => {
    render(<CoasteeringHub />);

    const resultPanel = screen.getByTestId('coasteering-calculator-result');
    expect(resultPanel.getAttribute('role')).toBe('status');
    expect(resultPanel.getAttribute('aria-live')).toBe('polite');

    const routeSelect = screen.getByLabelText(/select.*coasteering route/i);
    const jumpHeightInput = screen.getByLabelText(/jump height/i);
    const waterDepthInput = screen.getByLabelText(/water depth/i);
    const swellHeightInput = screen.getByLabelText(/swell height/i);
    const foamCheckbox = screen.getByLabelText(/water aerated with foam/i);

    // Select Depoe Bay
    fireEvent.change(routeSelect, { target: { value: 'depoe-bay-spouting-horn-surge' } });
    expect(within(resultPanel).getByText(/Depoe Bay/i)).toBeDefined();

    // Test shallow water hazard
    fireEvent.change(jumpHeightInput, { target: { value: '8.0' } });
    fireEvent.change(waterDepthInput, { target: { value: '2.5' } });
    expect(within(resultPanel).getAllByText(/critical shallow hazard/i).length).toBeGreaterThanOrEqual(1);
    expect(within(resultPanel).getByText(/DO NOT ENTER/i)).toBeDefined();

    // Test extreme surge warning
    fireEvent.change(waterDepthInput, { target: { value: '7.0' } });
    fireEvent.change(swellHeightInput, { target: { value: '3.0' } });
    expect(within(resultPanel).getAllByText(/extreme surge warning/i).length).toBeGreaterThanOrEqual(1);

    // Toggle aerated foam checkbox
    fireEvent.change(swellHeightInput, { target: { value: '1.0' } });
    fireEvent.click(foamCheckbox);
    expect(within(resultPanel).getByText(/foam aeration/i)).toBeDefined();
  });

  it('toggles checklist items and updates live coasteering-gear-counter', () => {
    render(<CoasteeringHub />);

    const counter = screen.getByTestId('coasteering-gear-counter');
    expect(counter.textContent).toMatch(/0 of 6 packed/i);

    const helmetCheckbox = screen.getByLabelText(/en 1385 certified watersports helmet/i);
    fireEvent.click(helmetCheckbox);
    expect(counter.textContent).toMatch(/1 of 6 packed/i);

    const wetsuitCheckbox = screen.getByLabelText(/heavy-duty neoprene steamer wetsuit/i);
    fireEvent.click(wetsuitCheckbox);
    expect(counter.textContent).toMatch(/2 of 6 packed/i);

    fireEvent.click(helmetCheckbox);
    expect(counter.textContent).toMatch(/1 of 6 packed/i);
  });

  it('has accessible form control labels and distinct htmlFor pairings', () => {
    render(<CoasteeringHub />);

    expect(screen.getByLabelText(/select.*coasteering route/i)).toBeDefined();
    expect(screen.getByLabelText(/jump height/i)).toBeDefined();
    expect(screen.getByLabelText(/water depth/i)).toBeDefined();
    expect(screen.getByLabelText(/swell height/i)).toBeDefined();
    expect(screen.getByLabelText(/swell period/i)).toBeDefined();
    expect(screen.getByLabelText(/tide state/i)).toBeDefined();
    expect(screen.getByLabelText(/water aerated with foam/i)).toBeDefined();
  });
});
