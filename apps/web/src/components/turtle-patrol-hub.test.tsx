import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import TurtlePatrolHub from './turtle-patrol-hub';

describe('TurtlePatrolHub', () => {
  it('renders all main sections with h2 headings and no skipped heading levels', () => {
    render(<TurtlePatrolHub />);

    const h2s = screen.getAllByRole('heading', { level: 2 });
    const headings = h2s.map((h) => h.textContent);

    expect(headings.some((h) => /patrol sector|conservation sectors|nesting sectors/i.test(h || ''))).toBe(true);
    expect(headings.some((h) => /calculator|emergence dynamics/i.test(h || ''))).toBe(true);
    expect(headings.some((h) => /checklist|patrol kit|gear checklist/i.test(h || ''))).toBe(true);
  });

  it('renders sector cards with h3 headings and key turtle patrol metrics', () => {
    render(<TurtlePatrolHub />);

    const grid = screen.getByTestId('turtle-patrol-sectors-grid');
    const h3s = within(grid).getAllByRole('heading', { level: 3 });
    const titles = h3s.map((h) => h.textContent);

    expect(titles.some((t) => t?.includes('Cape Hatteras'))).toBe(true);
    expect(titles.some((t) => t?.includes('Cumberland Island'))).toBe(true);
    expect(titles.some((t) => t?.includes('Padre Island'))).toBe(true);
    expect(titles.some((t) => t?.includes('Archie Carr'))).toBe(true);
    expect(titles.some((t) => t?.includes('Culebra Resaca'))).toBe(true);

    // Verify key metrics: beach length, avg nests/km
    expect(within(grid).getByText(/18\.5\s*km/i)).toBeDefined();
    expect(within(grid).getByText(/14\s*nests\/km/i)).toBeDefined();
    expect(within(grid).getByText(/35\s*nests\/km/i)).toBeDefined();
  });

  it('filters sectors when patrol zone filter buttons are clicked', () => {
    render(<TurtlePatrolHub />);

    const grid = screen.getByTestId('turtle-patrol-sectors-grid');

    // Filter by Barrier Island Dunes
    const dunesBtn = screen.getByRole('button', { name: /barrier island dunes/i });
    fireEvent.click(dunesBtn);

    expect(within(grid).getByRole('heading', { level: 3, name: /Cape Hatteras/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /Padre Island/i })).toBeDefined();
    expect(within(grid).queryByRole('heading', { level: 3, name: /Archie Carr/i })).toBeNull();
    expect(within(grid).queryByRole('heading', { level: 3, name: /Culebra Resaca/i })).toBeNull();

    // Filter by Coastal Wildlife Refuge
    const refugeBtn = screen.getByRole('button', { name: /coastal wildlife refuge/i });
    fireEvent.click(refugeBtn);

    expect(within(grid).getByRole('heading', { level: 3, name: /Cumberland Island/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /Archie Carr/i })).toBeDefined();
    expect(within(grid).queryByRole('heading', { level: 3, name: /Cape Hatteras/i })).toBeNull();

    // Filter by Remote Cays & Atoll
    const caysBtn = screen.getByRole('button', { name: /remote cays & atoll|remote cays/i });
    fireEvent.click(caysBtn);

    expect(within(grid).getByRole('heading', { level: 3, name: /Culebra Resaca/i })).toBeDefined();
    expect(within(grid).queryByRole('heading', { level: 3, name: /Cape Hatteras/i })).toBeNull();

    // Filter by Maritime Estuary Spit (0 sectors)
    const estuaryBtn = screen.getByRole('button', { name: /maritime estuary spit/i });
    fireEvent.click(estuaryBtn);

    expect(within(grid).queryByRole('heading', { level: 3 })).toBeNull();

    // Reset filter to All Sectors
    const allBtn = screen.getByRole('button', { name: /all sectors/i });
    fireEvent.click(allBtn);

    expect(within(grid).getByRole('heading', { level: 3, name: /Cape Hatteras/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /Cumberland Island/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /Padre Island/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /Archie Carr/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /Culebra Resaca/i })).toBeDefined();
  });

  it('updates live calculator reactive results panel with role status and aria-live', () => {
    render(<TurtlePatrolHub />);

    const resultPanel = screen.getByTestId('turtle-patrol-calculator-result');
    expect(resultPanel.getAttribute('role')).toBe('status');
    expect(resultPanel.getAttribute('aria-live')).toBe('polite');

    const sectorSelect = screen.getByLabelText(/select nesting sector/i);
    const patrolLengthSlider = screen.getByLabelText(/patrol length/i);
    const moonPhaseSlider = screen.getByLabelText(/moon phase illumination|moon phase/i);
    const ambientTempSlider = screen.getByLabelText(/ambient temperature/i);
    const predatorSelect = screen.getByLabelText(/predator pressure/i);

    // Select Cape Hatteras
    fireEvent.change(sectorSelect, { target: { value: 'cape-hatteras-barrier-spit' } });
    expect(within(resultPanel).getByText(/Cape Hatteras North Spit Barrier Beach/i)).toBeDefined();

    // Configure inputs: 18km, 15% moon, 28°C, moderate
    fireEvent.change(patrolLengthSlider, { target: { value: '18' } });
    fireEvent.change(moonPhaseSlider, { target: { value: '15' } });
    fireEvent.change(ambientTempSlider, { target: { value: '28' } });
    fireEvent.change(predatorSelect, { target: { value: 'moderate' } });

    // Assert badges: 428 hatchlings, 55 days, 22% loss risk, elevated predator advisory
    expect(within(resultPanel).getByText(/428 hatchlings/i)).toBeDefined();
    expect(within(resultPanel).getByText(/55 days/i)).toBeDefined();
    expect(within(resultPanel).getByText(/22% loss risk/i)).toBeDefined();
    expect(within(resultPanel).getByText(/elevated predator advisory/i)).toBeDefined();

    // Change to Critical pressure and 80% moon
    fireEvent.change(predatorSelect, { target: { value: 'critical' } });
    fireEvent.change(moonPhaseSlider, { target: { value: '80' } });

    // 42 + 80 * 0.15 = 54% loss risk, critical tidal washout hazard
    expect(within(resultPanel).getByText(/54% loss risk/i)).toBeDefined();
    expect(within(resultPanel).getByText(/critical tidal washout hazard/i)).toBeDefined();
  });

  it('allows clicking quick select button on sector card to load it into calculator', () => {
    render(<TurtlePatrolHub />);

    const resultPanel = screen.getByTestId('turtle-patrol-calculator-result');
    const selectCulebraBtn = screen.getByRole('button', {
      name: /configure.*culebra|load.*culebra|select.*culebra/i,
    });
    fireEvent.click(selectCulebraBtn);

    expect(within(resultPanel).getByText(/Culebra Resaca & Brava Coastal Cays/i)).toBeDefined();
  });

  it('toggles checklist items and updates live turtle-patrol-gear-counter', () => {
    render(<TurtlePatrolHub />);

    const counter = screen.getByTestId('turtle-patrol-gear-counter');
    expect(counter.textContent).toMatch(/0 of 6 packed/i);

    const redLedCheckbox = screen.getByLabelText(/narrow-spectrum red led headlamp/i);
    fireEvent.click(redLedCheckbox);
    expect(counter.textContent).toMatch(/1 of 6 packed/i);

    const cagesCheckbox = screen.getByLabelText(/stainless self-anchoring predator exclusion wire cages/i);
    fireEvent.click(cagesCheckbox);
    expect(counter.textContent).toMatch(/2 of 6 packed/i);

    fireEvent.click(redLedCheckbox);
    expect(counter.textContent).toMatch(/1 of 6 packed/i);
  });

  it('has accessible form control labels and distinct htmlFor pairings', () => {
    render(<TurtlePatrolHub />);

    expect(screen.getByLabelText(/select nesting sector/i)).toBeDefined();
    expect(screen.getByLabelText(/patrol length/i)).toBeDefined();
    expect(screen.getByLabelText(/moon phase illumination|moon phase/i)).toBeDefined();
    expect(screen.getByLabelText(/ambient temperature/i)).toBeDefined();
    expect(screen.getByLabelText(/predator pressure/i)).toBeDefined();
  });
});
