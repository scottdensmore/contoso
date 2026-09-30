import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import CrevassePulkHub from './crevasse-pulk-hub';

describe('CrevassePulkHub', () => {
  it('renders all main sections with h2 headings and zero skipped heading levels', () => {
    render(<CrevassePulkHub />);

    const h2s = screen.getAllByRole('heading', { level: 2 });
    const headings = h2s.map((h) => h.textContent);

    expect(
      headings.some((h) => /routes|expedition.*logistics|wilderness.*haul/i.test(h || '')),
    ).toBe(true);
    expect(
      headings.some((h) => /tow.*arrest.*calculator|glacial.*slope.*tow/i.test(h || '')),
    ).toBe(true);
    expect(
      headings.some((h) => /gear checklist|self-arrest.*gear/i.test(h || '')),
    ).toBe(true);
  });

  it('renders route cards with h3 headings, elevation, average slope, and badges', () => {
    render(<CrevassePulkHub />);

    const grid = screen.getByTestId('crevasse-pulk-routes-grid');
    const h3s = within(grid).getAllByRole('heading', { level: 3 });
    const titles = h3s.map((h) => h.textContent);

    expect(titles.some((t) => t?.includes('Denali Kahiltna Glacier Pulk Ascent'))).toBe(true);
    expect(titles.some((t) => t?.includes('Bagley Icefield Polar Traverse'))).toBe(true);
    expect(titles.some((t) => t?.includes('Ruth Glacier Great Gorge Sled Haul'))).toBe(true);
    expect(titles.some((t) => t?.includes('Columbia Icefield Glacial Plateau Sledging'))).toBe(true);
    expect(titles.some((t) => t?.includes('Mount Rainier Ingraham Direct Pulk Staging'))).toBe(true);

    // Verify elevations and slopes
    expect(within(grid).getByText(/2200\s*m/i)).toBeDefined();
    expect(within(grid).getByText(/8\.5°/i)).toBeDefined();
    expect(within(grid).getByText(/3300\s*m/i)).toBeDefined();
    expect(within(grid).getByText(/16(\.0)?°/i)).toBeDefined();

    // Verify badges and highlights
    expect(within(grid).getAllByText(/Rigid Fiberglass Shaft/i).length).toBeGreaterThan(0);
    expect(within(grid).getAllByText(/Extreme/i).length).toBeGreaterThan(0);
    expect(within(grid).getAllByText(/Heavily crevassed lower icefall maze/i).length).toBeGreaterThan(0);
  });

  it('filters routes when terrain filter pills are clicked', () => {
    render(<CrevassePulkHub />);

    const grid = screen.getByTestId('crevasse-pulk-routes-grid');

    // Filter by Crevassed Icefall Labyrinth
    const labyrinthBtn = screen.getByRole('button', { name: /crevassed icefall labyrinth/i });
    fireEvent.click(labyrinthBtn);

    expect(
      within(grid).getByRole('heading', { name: /Denali Kahiltna Glacier Pulk Ascent/i }),
    ).toBeDefined();
    expect(
      within(grid).queryByRole('heading', { name: /Bagley Icefield Polar Traverse/i }),
    ).toBeNull();
    expect(
      within(grid).queryByRole('heading', { name: /Mount Rainier Ingraham Direct/i }),
    ).toBeNull();

    // Filter by Steep Alpine Headwall
    const headwallBtn = screen.getByRole('button', { name: /steep alpine headwall/i });
    fireEvent.click(headwallBtn);

    expect(
      within(grid).getByRole('heading', { name: /Mount Rainier Ingraham Direct/i }),
    ).toBeDefined();
    expect(
      within(grid).queryByRole('heading', { name: /Denali Kahiltna/i }),
    ).toBeNull();

    // Reset to All Terrains
    const allBtn = screen.getByRole('button', { name: /all terrains/i });
    fireEvent.click(allBtn);

    expect(
      within(grid).getByRole('heading', { name: /Denali Kahiltna Glacier Pulk Ascent/i }),
    ).toBeDefined();
    expect(
      within(grid).getByRole('heading', { name: /Bagley Icefield Polar Traverse/i }),
    ).toBeDefined();
    expect(
      within(grid).getByRole('heading', { name: /Ruth Glacier Great Gorge Sled Haul/i }),
    ).toBeDefined();
    expect(
      within(grid).getByRole('heading', { name: /Columbia Icefield Glacial Plateau/i }),
    ).toBeDefined();
    expect(
      within(grid).getByRole('heading', { name: /Mount Rainier Ingraham Direct/i }),
    ).toBeDefined();
  });

  it('updates live calculator reactive results panel with role="status" and aria-live="polite"', () => {
    render(<CrevassePulkHub />);

    const resultPanel = screen.getByTestId('crevasse-pulk-calculator-result');
    expect(resultPanel.getAttribute('role')).toBe('status');
    expect(resultPanel.getAttribute('aria-live')).toBe('polite');

    const routeSelect = screen.getByLabelText(/select.*route/i);
    const riggingSelect = screen.getByLabelText(/rigging system/i);
    const payloadInput = screen.getByLabelText(/payload/i);
    const haulerInput = screen.getByLabelText(/hauler weight/i);
    const inclineInput = screen.getByLabelText(/incline/i);
    const snowSelect = screen.getByLabelText(/snow.*condition/i);
    const riskSelect = screen.getByLabelText(/crevasse hazard/i);

    // Initial default calculations (50kg payload, 7 deg incline, wind packed firn, moderate risk)
    expect(within(resultPanel).getByText(/94\s*N/i)).toBeDefined();
    expect(within(resultPanel).getByText(/60\s*N/i)).toBeDefined();
    expect(within(resultPanel).getByText(/34\s*N/i)).toBeDefined();
    expect(within(resultPanel).getByText(/190\s*J/i)).toBeDefined();
    expect(within(resultPanel).getByText(/0\.78\s*kN/i)).toBeDefined();
    expect(within(resultPanel).getByText(/Nominal Dynamic Hold/i)).toBeDefined();

    // Adjust hauler weight and snow condition
    fireEvent.change(haulerInput, { target: { value: '82' } });
    fireEvent.change(snowSelect, { target: { value: 'hard_blue_ice' } });
    expect(within(resultPanel).getByText(/19\s*N/i)).toBeDefined();

    // Trigger Critical Arrest Failure Alert (incline > 14 deg with non-rigid rigging)
    fireEvent.change(inclineInput, { target: { value: '16' } });
    fireEvent.change(riggingSelect, { target: { value: 'rope_trace_with_brake_fin' } });
    expect(within(resultPanel).getByText(/Critical Arrest Failure Alert/i)).toBeDefined();

    // Restore rigid fiberglass shaft harness on steep incline -> returns to Nominal Dynamic Hold
    fireEvent.change(riggingSelect, { target: { value: 'rigid_fiberglass_shaft_harness' } });
    expect(within(resultPanel).getByText(/Nominal Dynamic Hold/i)).toBeDefined();

    // Trigger Caution Overrun Risk (payload > 70kg, crevasse hazard extreme)
    fireEvent.change(inclineInput, { target: { value: '10' } });
    fireEvent.change(payloadInput, { target: { value: '85' } });
    fireEvent.change(riskSelect, { target: { value: 'extreme' } });
    expect(within(resultPanel).getByText(/Caution Overrun Risk/i)).toBeDefined();

    // Switch route to Mount Rainier
    fireEvent.change(routeSelect, { target: { value: 'mount-rainier-ingraham-glacier' } });
    expect(within(resultPanel).getByText(/Mount Rainier Ingraham Direct/i)).toBeDefined();
  });

  it('allows clicking "Configure Calculator for this Route" button on a route card', () => {
    render(<CrevassePulkHub />);

    const configureButtons = screen.getAllByRole('button', { name: /configure calculator/i });
    expect(configureButtons.length).toBe(5);

    // Click on Columbia Icefield (index 3)
    fireEvent.click(configureButtons[3]);

    const resultPanel = screen.getByTestId('crevasse-pulk-calculator-result');
    expect(
      within(resultPanel).getByText(/Columbia Icefield Glacial Plateau Sledging/i),
    ).toBeDefined();
  });

  it('tracks progress on the Mandatory Glacial Sledging & Self-Arrest Gear Checklist', () => {
    render(<CrevassePulkHub />);

    const counter = screen.getByTestId('crevasse-pulk-gear-counter');
    expect(counter.textContent).toContain('0 of 6 packed');

    const pulkCheckbox = screen.getByRole('checkbox', {
      name: /UHMWPE Heavy-Duty Glacial Expedition Pulk/i,
    });
    const shaftCheckbox = screen.getByRole('checkbox', {
      name: /Locking Aluminum-Jointed Fiberglass Haul Shafts/i,
    });

    fireEvent.click(pulkCheckbox);
    expect(counter.textContent).toContain('1 of 6 packed');

    fireEvent.click(shaftCheckbox);
    expect(counter.textContent).toContain('2 of 6 packed');

    fireEvent.click(pulkCheckbox);
    expect(counter.textContent).toContain('1 of 6 packed');
  });
});
