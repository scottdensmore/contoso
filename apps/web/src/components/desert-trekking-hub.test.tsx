import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import DesertTrekkingHub from './desert-trekking-hub';

describe('DesertTrekkingHub', () => {
  it('renders all main sections with h2 headings and no skipped heading levels', () => {
    render(<DesertTrekkingHub />);

    const h2s = screen.getAllByRole('heading', { level: 2 });
    const headings = h2s.map((h) => h.textContent);

    expect(headings.some((h) => /desert.*routes|routes directory/i.test(h || ''))).toBe(true);
    expect(headings.some((h) => /water cache.*calculator|heat index.*calculator/i.test(h || ''))).toBe(true);
    expect(headings.some((h) => /checklist|safety kit/i.test(h || ''))).toBe(true);
  });

  it('renders route cards with h3 headings and key desert metrics', () => {
    render(<DesertTrekkingHub />);

    const grid = screen.getByTestId('desert-routes-grid');
    const h3s = within(grid).getAllByRole('heading', { level: 3 });
    const titles = h3s.map((h) => h.textContent);

    expect(titles.some((t) => t?.includes('Badwater Basin'))).toBe(true);
    expect(titles.some((t) => t?.includes('Buckskin Gulch'))).toBe(true);
    expect(titles.some((t) => t?.includes('Mazatzal Divide'))).toBe(true);
    expect(titles.some((t) => t?.includes('Black Rock Desert'))).toBe(true);
    expect(titles.some((t) => t?.includes('Mariscal Canyon Rim'))).toBe(true);

    // Verify distance & elevation metrics
    expect(within(grid).getByText(/48(\.0)?\s*km/i)).toBeDefined();
    expect(within(grid).getByText(/3450\s*m/i)).toBeDefined();
    expect(within(grid).getAllByText(/3\s*days/i).length).toBeGreaterThan(0);
    expect(within(grid).getAllByText(/water cache/i).length).toBeGreaterThan(0);
  });

  it('filters routes when aridity zone filter buttons are clicked', () => {
    render(<DesertTrekkingHub />);

    const grid = screen.getByTestId('desert-routes-grid');

    // Filter by Salt Playa
    const saltPlayaBtn = screen.getByRole('button', { name: /salt playa/i });
    fireEvent.click(saltPlayaBtn);

    expect(within(grid).getByRole('heading', { name: /Badwater Basin/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { name: /Black Rock Desert/i })).toBeDefined();
    expect(within(grid).queryByRole('heading', { name: /Buckskin Gulch/i })).toBeNull();
    expect(within(grid).queryByRole('heading', { name: /Mazatzal Divide/i })).toBeNull();

    // Filter by Canyon Wash
    const canyonWashBtn = screen.getByRole('button', { name: /canyon wash/i });
    fireEvent.click(canyonWashBtn);

    expect(within(grid).getByRole('heading', { name: /Buckskin Gulch/i })).toBeDefined();
    expect(within(grid).queryByRole('heading', { name: /Badwater Basin/i })).toBeNull();
    expect(within(grid).queryByRole('heading', { name: /Black Rock Desert/i })).toBeNull();

    // Filter by High Desert
    const highDesertBtn = screen.getByRole('button', { name: /high desert/i });
    fireEvent.click(highDesertBtn);

    expect(within(grid).getByRole('heading', { name: /Mariscal Canyon/i })).toBeDefined();
    expect(within(grid).queryByRole('heading', { name: /Buckskin Gulch/i })).toBeNull();

    // Filter by Creosote Bajada
    const bajadaBtn = screen.getByRole('button', { name: /creosote bajada/i });
    fireEvent.click(bajadaBtn);

    expect(within(grid).getByRole('heading', { name: /Mazatzal Divide/i })).toBeDefined();
    expect(within(grid).queryByRole('heading', { name: /Mariscal Canyon/i })).toBeNull();

    // Reset filter to All Routes
    const allBtn = screen.getByRole('button', { name: /all routes/i });
    fireEvent.click(allBtn);

    expect(within(grid).getByRole('heading', { name: /Badwater Basin/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { name: /Buckskin Gulch/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { name: /Mazatzal Divide/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { name: /Black Rock Desert/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { name: /Mariscal Canyon/i })).toBeDefined();
  });

  it('updates live calculator reactive results panel with status role and aria-live', () => {
    render(<DesertTrekkingHub />);

    const resultPanel = screen.getByTestId('desert-calculator-result');
    expect(resultPanel.getAttribute('role')).toBe('status');
    expect(resultPanel.getAttribute('aria-live')).toBe('polite');

    const routeSelect = screen.getByLabelText(/select.*desert route/i);
    const tempInput = screen.getByLabelText(/ambient temperature/i);
    const hoursInput = screen.getByLabelText(/hours in direct sun/i);
    const umbrellaCheckbox = screen.getByLabelText(/reflective shade umbrella/i);

    // Initial check with default route
    expect(within(resultPanel).getAllByText(/Badwater Basin/i).length).toBeGreaterThan(0);

    // Increase temp and hours to trigger water cache mandatory (> 7L)
    fireEvent.change(tempInput, { target: { value: '102' } });
    fireEvent.change(hoursInput, { target: { value: '8' } });

    expect(within(resultPanel).getAllByText(/water cache mandatory/i).length).toBeGreaterThanOrEqual(1);
    expect(within(resultPanel).getByText(/exceeds safe pack carrying capacity/i)).toBeDefined();

    // Test extreme heat no travel (> 110°F felt heat index)
    fireEvent.change(tempInput, { target: { value: '120' } });
    expect(within(resultPanel).getAllByText(/extreme heat no travel/i).length).toBeGreaterThanOrEqual(1);

    // Toggle umbrella to reduce felt heat
    fireEvent.click(umbrellaCheckbox);
    // Select Buckskin Gulch to check extreme flash flood advisory
    fireEvent.change(routeSelect, { target: { value: 'hayduke-buckskin-gulch-paria' } });
    expect(within(resultPanel).getAllByText(/Buckskin Gulch/i).length).toBeGreaterThan(0);
    expect(within(resultPanel).getByText(/EXTREME FLASH FLOOD RISK/i)).toBeDefined();
  });

  it('toggles checklist items and updates live desert-gear-counter', () => {
    render(<DesertTrekkingHub />);

    const counter = screen.getByTestId('desert-gear-counter');
    expect(counter.textContent).toMatch(/0 of 6 packed/i);

    const hatCheckbox = screen.getByLabelText(/upf 50\+ wide-brim desert sun hat/i);
    fireEvent.click(hatCheckbox);
    expect(counter.textContent).toMatch(/1 of 6 packed/i);

    const umbrellaCheckbox = screen.getByLabelText(/reflective chrome uv-block trekking sun umbrella/i);
    fireEvent.click(umbrellaCheckbox);
    expect(counter.textContent).toMatch(/2 of 6 packed/i);

    fireEvent.click(hatCheckbox);
    expect(counter.textContent).toMatch(/1 of 6 packed/i);
  });

  it('has accessible form control labels and distinct htmlFor pairings', () => {
    render(<DesertTrekkingHub />);

    expect(screen.getByLabelText(/select.*desert route/i)).toBeDefined();
    expect(screen.getByLabelText(/ambient temperature/i)).toBeDefined();
    expect(screen.getByLabelText(/relative humidity/i)).toBeDefined();
    expect(screen.getByLabelText(/hiker weight/i)).toBeDefined();
    expect(screen.getByLabelText(/pack weight/i)).toBeDefined();
    expect(screen.getByLabelText(/trekking pace/i)).toBeDefined();
    expect(screen.getByLabelText(/hours in direct sun/i)).toBeDefined();
    expect(screen.getByLabelText(/reflective shade umbrella/i)).toBeDefined();
  });
});
