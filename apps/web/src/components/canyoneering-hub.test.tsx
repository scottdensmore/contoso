import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import CanyoneeringHub from './canyoneering-hub';

describe('CanyoneeringHub', () => {
  it('renders all main sections with h2 headings and no skipped heading levels', () => {
    render(<CanyoneeringHub />);

    const h2s = screen.getAllByRole('heading', { level: 2 });
    const headings = h2s.map((h) => h.textContent);

    expect(headings.some((h) => /canyon routes|routes/i.test(h || ''))).toBe(true);
    expect(headings.some((h) => /rope rigging|calculator/i.test(h || ''))).toBe(true);
    expect(headings.some((h) => /checklist|kit/i.test(h || ''))).toBe(true);
  });

  it('renders route cards with h3 headings and key slot canyon metrics', () => {
    render(<CanyoneeringHub />);

    const grid = screen.getByTestId('canyon-routes-grid');
    const h3s = within(grid).getAllByRole('heading', { level: 3 });
    const titles = h3s.map((h) => h.textContent);

    expect(titles.some((t) => t?.includes('The Subway'))).toBe(true);
    expect(titles.some((t) => t?.includes('Mystery Canyon'))).toBe(true);
    expect(titles.some((t) => t?.includes('Choprock Canyon'))).toBe(true);
    expect(titles.some((t) => t?.includes('The Black Hole'))).toBe(true);
    expect(titles.some((t) => t?.includes('Bluejohn Canyon'))).toBe(true);

    // Verify rappel & thermal metrics
    expect(within(grid).getByText(/120 ft/)).toBeDefined();
    expect(within(grid).getByText(/12 rappels/)).toBeDefined();
    expect(within(grid).getAllByText(/3 mm/).length).toBeGreaterThan(0);
    expect(within(grid).getByText(/8 hrs/)).toBeDefined();
  });

  it('filters routes when technical grade filter buttons are clicked', () => {
    render(<CanyoneeringHub />);

    const grid = screen.getByTestId('canyon-routes-grid');

    // Filter by Class 4 Technical
    const class4Btn = screen.getByRole('button', { name: /class 4 technical/i });
    fireEvent.click(class4Btn);

    expect(within(grid).getByText(/Choprock Canyon/i)).toBeDefined();
    expect(within(grid).queryByText(/The Subway/i)).toBeNull();
    expect(within(grid).queryByText(/Mystery Canyon/i)).toBeNull();
    expect(within(grid).queryByText(/Bluejohn Canyon/i)).toBeNull();

    // Filter by Class 3B Swimming
    const class3bBtn = screen.getByRole('button', { name: /class 3b swimming/i });
    fireEvent.click(class3bBtn);

    expect(within(grid).getByText(/The Subway/i)).toBeDefined();
    expect(within(grid).getByText(/Mystery Canyon/i)).toBeDefined();
    expect(within(grid).queryByText(/Choprock Canyon/i)).toBeNull();

    // Filter by Class 3A Dry
    const class3aBtn = screen.getByRole('button', { name: /class 3a dry/i });
    fireEvent.click(class3aBtn);

    expect(within(grid).getByText(/Bluejohn Canyon/i)).toBeDefined();
    expect(within(grid).queryByText(/Mystery Canyon/i)).toBeNull();

    // Reset filter to All Routes
    const allBtn = screen.getByRole('button', { name: /all routes/i });
    fireEvent.click(allBtn);

    expect(within(grid).getByText(/The Subway/i)).toBeDefined();
    expect(within(grid).getByText(/Mystery Canyon/i)).toBeDefined();
    expect(within(grid).getByText(/Choprock Canyon/i)).toBeDefined();
    expect(within(grid).getByText(/The Black Hole/i)).toBeDefined();
    expect(within(grid).getByText(/Bluejohn Canyon/i)).toBeDefined();
  });

  it('updates live calculator reactive results panel with status role and aria-live', () => {
    render(<CanyoneeringHub />);

    const resultPanel = screen.getByTestId('canyon-calculator-result');
    expect(resultPanel.getAttribute('role')).toBe('status');
    expect(resultPanel.getAttribute('aria-live')).toBe('polite');

    const routeSelect = screen.getByLabelText(/select.*slot canyon route/i);
    const teamSizeInput = screen.getByLabelText(/team size/i);
    const ropeDiameterSelect = screen.getByLabelText(/rope diameter/i);
    const pullCordSelect = screen.getByLabelText(/retrieval.*pull cord/i);
    const immersionSelect = screen.getByLabelText(/water immersion/i);

    // Select Mystery Canyon
    fireEvent.change(routeSelect, { target: { value: 'zion-mystery-canyon' } });

    // Initial Mystery Canyon (drop 120ft -> rope 140ft, pull cord 140ft)
    expect(within(resultPanel).getAllByText(/Mystery Canyon/i).length).toBeGreaterThan(0);
    expect(within(resultPanel).getAllByText(/140\s*ft/i).length).toBeGreaterThanOrEqual(2);
    expect(within(resultPanel).getByText(/safe configuration/i)).toBeDefined();

    // Adjust team size and pull cord system
    fireEvent.change(teamSizeInput, { target: { value: '5' } });
    fireEvent.change(pullCordSelect, { target: { value: 'dual_rope_system' } });
    expect(within(resultPanel).getByText(/dual-rope/i)).toBeDefined();

    // Test critical hazard: FiddleStick in flowing water
    fireEvent.change(pullCordSelect, { target: { value: 'fiddle_stick_retrievable' } });
    fireEvent.change(immersionSelect, { target: { value: 'flowing_water' } });
    expect(within(resultPanel).getAllByText(/critical hazard/i).length).toBeGreaterThanOrEqual(1);
    expect(within(resultPanel).getByText(/never be deployed in flowing water/i)).toBeDefined();

    // Test caution on thin rope
    fireEvent.change(immersionSelect, { target: { value: 'dry' } });
    fireEvent.change(pullCordSelect, { target: { value: 'dedicated_pull_line' } });
    fireEvent.change(ropeDiameterSelect, { target: { value: '8.0' } });
    expect(within(resultPanel).getByText(/caution advisory/i)).toBeDefined();
    expect(within(resultPanel).getAllByText(/8\.0mm/i).length).toBeGreaterThanOrEqual(1);
  });

  it('toggles checklist items and updates live canyon-gear-counter', () => {
    render(<CanyoneeringHub />);

    const counter = screen.getByTestId('canyon-gear-counter');
    expect(counter.textContent).toMatch(/0 of 6 packed/i);

    const harnessCheckbox = screen.getByLabelText(/ce certified canyoneering harness/i);
    fireEvent.click(harnessCheckbox);
    expect(counter.textContent).toMatch(/1 of 6 packed/i);

    const ropeCheckbox = screen.getByLabelText(/8\.3mm-to-9\.2mm static hydrophobic canyoneering rope/i);
    fireEvent.click(ropeCheckbox);
    expect(counter.textContent).toMatch(/2 of 6 packed/i);

    fireEvent.click(harnessCheckbox);
    expect(counter.textContent).toMatch(/1 of 6 packed/i);
  });

  it('has accessible form control labels and distinct htmlFor pairings', () => {
    render(<CanyoneeringHub />);

    expect(screen.getByLabelText(/select.*slot canyon route/i)).toBeDefined();
    expect(screen.getByLabelText(/team size/i)).toBeDefined();
    expect(screen.getByLabelText(/rope diameter/i)).toBeDefined();
    expect(screen.getByLabelText(/retrieval.*pull cord/i)).toBeDefined();
    expect(screen.getByLabelText(/water immersion/i)).toBeDefined();
  });
});
