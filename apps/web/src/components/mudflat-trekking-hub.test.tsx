import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import MudflatTrekkingHub from './mudflat-trekking-hub';

describe('MudflatTrekkingHub', () => {
  it('renders all main sections with h2 headings and no skipped heading levels', () => {
    render(<MudflatTrekkingHub />);

    const h2s = screen.getAllByRole('heading', { level: 2 });
    const headings = h2s.map((h) => h.textContent);

    expect(headings.some((h) => /routes|tidal flat routes/i.test(h || ''))).toBe(true);
    expect(headings.some((h) => /calculator|tidal silt suction/i.test(h || ''))).toBe(true);
    expect(headings.some((h) => /checklist|safety kit/i.test(h || ''))).toBe(true);
  });

  it('renders route cards with h3 headings and key mudflat metrics', () => {
    render(<MudflatTrekkingHub />);

    const grid = screen.getByTestId('mudflat-routes-grid');
    const h3s = within(grid).getAllByRole('heading', { level: 3 });
    const titles = h3s.map((h) => h.textContent);

    expect(titles.some((t) => t?.includes('Wadden Sea'))).toBe(true);
    expect(titles.some((t) => t?.includes('Bay of Fundy'))).toBe(true);
    expect(titles.some((t) => t?.includes('Mont-Saint-Michel'))).toBe(true);
    expect(titles.some((t) => t?.includes('Morecambe Bay'))).toBe(true);
    expect(titles.some((t) => t?.includes('Turnagain Arm'))).toBe(true);

    // Verify distance, tidal window, and max silt depth metrics
    expect(within(grid).getByText(/12\.5\s*km/i)).toBeDefined();
    expect(within(grid).getByText(/3\.5\s*hrs/i)).toBeDefined();
    expect(within(grid).getByText(/35\s*cm/i)).toBeDefined();
  });

  it('filters routes when terrain filter buttons are clicked', () => {
    render(<MudflatTrekkingHub />);

    const grid = screen.getByTestId('mudflat-routes-grid');

    // Filter by Deep Quicksilt Ooze
    const deepOozeBtn = screen.getByRole('button', { name: /deep quicksilt ooze/i });
    fireEvent.click(deepOozeBtn);

    expect(within(grid).getByRole('heading', { level: 3, name: /Bay of Fundy/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /Morecambe Bay/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /Turnagain Arm/i })).toBeDefined();
    expect(within(grid).queryByRole('heading', { level: 3, name: /Wadden Sea/i })).toBeNull();
    expect(within(grid).queryByRole('heading', { level: 3, name: /Mont-Saint-Michel/i })).toBeNull();

    // Filter by Soft Estuary Silt
    const softSiltBtn = screen.getByRole('button', { name: /soft estuary silt/i });
    fireEvent.click(softSiltBtn);

    expect(within(grid).getByRole('heading', { level: 3, name: /Wadden Sea/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /Mont-Saint-Michel/i })).toBeDefined();
    expect(within(grid).queryByRole('heading', { level: 3, name: /Bay of Fundy/i })).toBeNull();

    // Filter by Firm Compact Sand (0 matches)
    const firmSandBtn = screen.getByRole('button', { name: /firm compact sand/i });
    fireEvent.click(firmSandBtn);
    expect(within(grid).queryByRole('heading', { level: 3 })).toBeNull();

    // Reset filter to All Routes
    const allBtn = screen.getByRole('button', { name: /all routes/i });
    fireEvent.click(allBtn);

    expect(within(grid).getByRole('heading', { level: 3, name: /Wadden Sea/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /Bay of Fundy/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /Mont-Saint-Michel/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /Morecambe Bay/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /Turnagain Arm/i })).toBeDefined();
  });

  it('updates live calculator reactive results panel with role status and aria-live', () => {
    render(<MudflatTrekkingHub />);

    const resultPanel = screen.getByTestId('mudflat-calculator-result');
    expect(resultPanel.getAttribute('role')).toBe('status');
    expect(resultPanel.getAttribute('aria-live')).toBe('polite');

    const routeSelect = screen.getByLabelText(/select.*route/i);
    const siltDepthInput = screen.getByLabelText(/silt depth/i);
    const elapsedTimeInput = screen.getByLabelText(/elapsed time/i);
    const tidalPhaseSelect = screen.getByLabelText(/tidal current phase|tidal phase/i);

    // Initial default state for Wadden Sea
    expect(within(resultPanel).getByText(/165 min remaining/i)).toBeDefined();
    expect(within(resultPanel).getByText(/Drag Index: 6\/10/i)).toBeDefined();
    expect(within(resultPanel).getByText(/45 cm wading depth/i)).toBeDefined();
    expect(within(resultPanel).getByText(/safe low tide window/i)).toBeDefined();

    // Select Bay of Fundy, set silt depth 52cm, elapsed time 130 min, tidal phase spring_bore_incoming
    fireEvent.change(routeSelect, { target: { value: 'bay-of-fundy-miners-marsh' } });
    fireEvent.change(siltDepthInput, { target: { value: '52' } });
    fireEvent.change(elapsedTimeInput, { target: { value: '130' } });
    fireEvent.change(tidalPhaseSelect, { target: { value: 'spring_bore_incoming' } });

    expect(within(resultPanel).getByText(/20 min remaining/i)).toBeDefined();
    expect(within(resultPanel).getByText(/Drag Index: 10\/10/i)).toBeDefined();
    expect(within(resultPanel).getByText(/138 cm wading depth/i)).toBeDefined();
    expect(within(resultPanel).getByText(/hazardous quicksilt tidal entrapment/i)).toBeDefined();
  });

  it('quick selects route into calculator when card button is clicked', () => {
    render(<MudflatTrekkingHub />);

    const grid = screen.getByTestId('mudflat-routes-grid');
    const selectFundyBtn = within(grid).getByRole('button', {
      name: /select bay of fundy|load bay of fundy/i,
    });
    fireEvent.click(selectFundyBtn);

    const routeSelect = screen.getByLabelText(/select.*route/i) as HTMLSelectElement;
    expect(routeSelect.value).toBe('bay-of-fundy-miners-marsh');
  });

  it('toggles checklist items and updates live mudflat-trekking-gear-counter', () => {
    render(<MudflatTrekkingHub />);

    const counter = screen.getByTestId('mudflat-trekking-gear-counter');
    expect(counter.textContent).toMatch(/0 of 6 packed/i);

    const bootiesCheckbox = screen.getByLabelText(/lace-locked neoprene mudflat booties/i);
    fireEvent.click(bootiesCheckbox);
    expect(counter.textContent).toMatch(/1 of 6 packed/i);

    const poleCheckbox = screen.getByLabelText(/calibrated depth-graduated aluminum silt probe pole/i);
    fireEvent.click(poleCheckbox);
    expect(counter.textContent).toMatch(/2 of 6 packed/i);

    fireEvent.click(bootiesCheckbox);
    expect(counter.textContent).toMatch(/1 of 6 packed/i);
  });

  it('has accessible form control labels and distinct htmlFor pairings', () => {
    render(<MudflatTrekkingHub />);

    expect(screen.getByLabelText(/select.*route/i)).toBeDefined();
    expect(screen.getByLabelText(/silt depth/i)).toBeDefined();
    expect(screen.getByLabelText(/trekker pace/i)).toBeDefined();
    expect(screen.getByLabelText(/elapsed time/i)).toBeDefined();
    expect(screen.getByLabelText(/tidal current phase|tidal phase/i)).toBeDefined();
  });
});
