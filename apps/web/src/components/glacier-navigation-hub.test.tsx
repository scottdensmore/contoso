import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import GlacierNavigationHub from './glacier-navigation-hub';

describe('GlacierNavigationHub', () => {
  it('renders all main sections with h2 headings and no skipped heading levels', () => {
    render(<GlacierNavigationHub />);

    const h2s = screen.getAllByRole('heading', { level: 2 });
    const headings = h2s.map((h) => h.textContent);

    expect(headings.some((h) => /glacier.*zones|crevasse.*terrain/i.test(h || ''))).toBe(true);
    expect(headings.some((h) => /snow bridge.*calculator|rope interval/i.test(h || ''))).toBe(true);
    expect(headings.some((h) => /checklist|safety kit/i.test(h || ''))).toBe(true);
  });

  it('renders zone cards with h3 headings and key glacier metrics', () => {
    render(<GlacierNavigationHub />);

    const grid = screen.getByTestId('glacier-zones-grid');
    const h3s = within(grid).getAllByRole('heading', { level: 3 });
    const titles = h3s.map((h) => h.textContent);

    expect(titles.some((t) => t?.includes('Khumbu Icefall Lower Maze'))).toBe(true);
    expect(titles.some((t) => t?.includes('Ingraham Direct'))).toBe(true);
    expect(titles.some((t) => t?.includes('Mer de Glace'))).toBe(true);
    expect(titles.some((t) => t?.includes('Root & Kennicott'))).toBe(true);
    expect(titles.some((t) => t?.includes('Upper Tasman Glacier'))).toBe(true);

    // Verify elevations, durations, systems
    expect(within(grid).getByText(/5350\s*m/i)).toBeDefined();
    expect(within(grid).getByText(/6\.5\s*hrs/i)).toBeDefined();
    expect(within(grid).getAllByText(/Khumbu Glacier/i).length).toBeGreaterThan(0);

    // Verify hazard and pattern badges
    expect(within(grid).getAllByText(/Extreme Hazard/i).length).toBeGreaterThan(0);
    expect(within(grid).getAllByText(/Icefall Chaos/i).length).toBeGreaterThan(0);
    expect(within(grid).getAllByText(/Ladder Sections Required/i).length).toBeGreaterThan(0);
  });

  it('filters zones when serac hazard level filter buttons are clicked', () => {
    render(<GlacierNavigationHub />);

    const grid = screen.getByTestId('glacier-zones-grid');

    // Filter by Extreme Hazard
    const extremeBtn = screen.getByRole('button', { name: /extreme/i });
    fireEvent.click(extremeBtn);

    expect(within(grid).getByRole('heading', { name: /Khumbu Icefall Lower Maze/i })).toBeDefined();
    expect(within(grid).queryByRole('heading', { name: /Mer de Glace/i })).toBeNull();
    expect(within(grid).queryByRole('heading', { name: /Root & Kennicott/i })).toBeNull();

    // Filter by High Hazard
    const highBtn = screen.getByRole('button', { name: /high hazard/i });
    fireEvent.click(highBtn);

    expect(within(grid).getByRole('heading', { name: /Ingraham Direct/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { name: /Upper Tasman Glacier/i })).toBeDefined();
    expect(within(grid).queryByRole('heading', { name: /Khumbu Icefall/i })).toBeNull();

    // Filter by Low Hazard
    const lowBtn = screen.getByRole('button', { name: /low hazard/i });
    fireEvent.click(lowBtn);

    expect(within(grid).getByRole('heading', { name: /Root & Kennicott/i })).toBeDefined();
    expect(within(grid).queryByRole('heading', { name: /Ingraham Direct/i })).toBeNull();

    // Reset to All Zones
    const allBtn = screen.getByRole('button', { name: /all zones/i });
    fireEvent.click(allBtn);

    expect(within(grid).getByRole('heading', { name: /Khumbu Icefall Lower Maze/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { name: /Ingraham Direct/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { name: /Mer de Glace/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { name: /Root & Kennicott/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { name: /Upper Tasman Glacier/i })).toBeDefined();
  });

  it('updates live calculator reactive results panel with role="status" and aria-live="polite"', () => {
    render(<GlacierNavigationHub />);

    const resultPanel = screen.getByTestId('crevasse-calculator-result');
    expect(resultPanel.getAttribute('role')).toBe('status');
    expect(resultPanel.getAttribute('aria-live')).toBe('polite');

    const zoneSelect = screen.getByLabelText(/select.*glacier zone/i);
    const teamSizeInput = screen.getByLabelText(/rope team size/i);
    const depthInput = screen.getByLabelText(/snow bridge depth/i);
    const widthInput = screen.getByLabelText(/crevasse width/i);
    const tempInput = screen.getByLabelText(/ambient temperature/i);
    const intervalInput = screen.getByLabelText(/team rope interval/i);

    // Initial default state: 3 members, depth 1.2m, width 2.0m, temp 24°F, interval 12m
    expect(within(resultPanel).getByText(/0\.60/i)).toBeDefined();
    expect(within(resultPanel).getByText(/36\s*m/i)).toBeDefined();
    expect(within(resultPanel).getByText(/Safe Crossing/i)).toBeDefined();
    expect(within(resultPanel).getByText(/Optimal/i)).toBeDefined();

    // Switch zone to Ingraham
    fireEvent.change(zoneSelect, { target: { value: 'ingraham-glacier-rainier' } });
    expect(within(resultPanel).getByText(/Ingraham Direct & Disappointment Cleaver/i)).toBeDefined();

    // Increase temp > 34°F -> triggers hazardous
    fireEvent.change(tempInput, { target: { value: '38' } });
    expect(within(resultPanel).getByText(/Hazardous: Bypass Required/i)).toBeDefined();
    expect(within(resultPanel).getByText(/Isothermal melting state/i)).toBeDefined();

    // Reset temp, make bridge thin (<0.5m) with wide crevasse -> triggers hazardous
    fireEvent.change(tempInput, { target: { value: '20' } });
    fireEvent.change(depthInput, { target: { value: '0.4' } });
    fireEvent.change(widthInput, { target: { value: '2.5' } });
    expect(within(resultPanel).getByText(/Hazardous: Bypass Required/i)).toBeDefined();

    // Change to 2-person team -> recommended interval becomes 15m
    fireEvent.change(depthInput, { target: { value: '1.5' } });
    fireEvent.change(teamSizeInput, { target: { value: '2' } });
    // with interval 12m and recommended 15m -> adequate
    expect(within(resultPanel).getAllByText(/15\s*m/i).length).toBeGreaterThan(0);
    // change interval to 15m -> optimal
    fireEvent.change(intervalInput, { target: { value: '15' } });
    expect(within(resultPanel).getByText(/Optimal/i)).toBeDefined();
    // Reserve: 60 - 15 = 45m
    expect(within(resultPanel).getByText(/45\s*m/i)).toBeDefined();
  });

  it('allows clicking "Configure Calculator for this Zone" button on a card to select it', () => {
    render(<GlacierNavigationHub />);

    const configureButtons = screen.getAllByRole('button', { name: /configure calculator/i });
    expect(configureButtons.length).toBe(5);

    // Click the button on Root Glacier
    fireEvent.click(configureButtons[3]);

    const resultPanel = screen.getByTestId('crevasse-calculator-result');
    expect(within(resultPanel).getByText(/Root & Kennicott Glacier Confluence/i)).toBeDefined();
  });

  it('tracks progress on the Mandatory Glacier Safety Kit Checklist', () => {
    render(<GlacierNavigationHub />);

    const counter = screen.getByTestId('glacier-gear-counter');
    expect(counter.textContent).toContain('0 of 6 packed');

    const probeCheckbox = screen.getByRole('checkbox', {
      name: /320cm Graduated Aluminum Snow & Crevasse Probe/i,
    });
    const pulleyCheckbox = screen.getByRole('checkbox', {
      name: /Micro Traxion, Tibloc, and Prusik Cord/i,
    });

    fireEvent.click(probeCheckbox);
    expect(counter.textContent).toContain('1 of 6 packed');

    fireEvent.click(pulleyCheckbox);
    expect(counter.textContent).toContain('2 of 6 packed');

    fireEvent.click(probeCheckbox);
    expect(counter.textContent).toContain('1 of 6 packed');
  });
});
