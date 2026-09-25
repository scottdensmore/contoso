import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import TreeClimbingHub from './tree-climbing-hub';

describe('TreeClimbingHub Component', () => {
  it('renders all main sections with h2 headings and no skipped levels', () => {
    render(<TreeClimbingHub />);

    const h2s = screen.getAllByRole('heading', { level: 2 });
    const headings = h2s.map((h) => h.textContent);

    expect(headings.some((h) => /expedition groves|canopy groves/i.test(h || ''))).toBe(true);
    expect(headings.some((h) => /calculator|anchor load/i.test(h || ''))).toBe(true);
    expect(headings.some((h) => /checklist|kit checklist|tree ethics/i.test(h || ''))).toBe(true);
  });

  it('renders canopy grove cards with h3 headings and key arboreal metrics', () => {
    render(<TreeClimbingHub />);

    const grid = screen.getByTestId('canopy-groves-grid');
    const h3s = within(grid).getAllByRole('heading', { level: 3 });
    const titles = h3s.map((h) => h.textContent);

    expect(titles.some((t) => t?.includes('Prairie Creek Redwoods'))).toBe(true);
    expect(titles.some((t) => t?.includes('Hoh River Valley'))).toBe(true);
    expect(titles.some((t) => t?.includes('Giant Forest Sierra'))).toBe(true);
    expect(titles.some((t) => t?.includes('Smoky Mountains Grand White Oak'))).toBe(true);
    expect(titles.some((t) => t?.includes('Tarkine Forest Swamp Gum'))).toBe(true);

    // Verify key metrics in cards
    expect(within(grid).getAllByText(/92\s*m/).length).toBeGreaterThan(0);
    expect(within(grid).getAllByText(/25\s*cm/).length).toBeGreaterThan(0);
    expect(within(grid).getAllByText(/Coast Redwood/i).length).toBeGreaterThan(0);
  });

  it('filters groves when climbing system filter buttons are clicked', () => {
    render(<TreeClimbingHub />);

    const grid = screen.getByTestId('canopy-groves-grid');

    // Filter by Moving Rope Technique (MRT/DRT)
    const mrtBtn = screen.getByRole('button', { name: /Moving Rope Technique \(MRT\/DRT\)/i });
    fireEvent.click(mrtBtn);

    expect(within(grid).getByRole('heading', { level: 3, name: /Smoky Mountains Grand White Oak/i })).toBeDefined();
    expect(within(grid).queryByRole('heading', { level: 3, name: /Prairie Creek Redwoods/i })).toBeNull();
    expect(within(grid).queryByRole('heading', { level: 3, name: /Giant Forest Sierra/i })).toBeNull();

    // Filter by Single Rope Technique (SRT)
    const srtBtn = screen.getByRole('button', { name: /Single Rope Technique \(SRT\)/i });
    fireEvent.click(srtBtn);

    expect(within(grid).getByRole('heading', { level: 3, name: /Prairie Creek Redwoods/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /Giant Forest Sierra/i })).toBeDefined();
    expect(within(grid).queryByRole('heading', { level: 3, name: /Smoky Mountains Grand White Oak/i })).toBeNull();

    // Reset filter to All Groves
    const allBtn = screen.getByRole('button', { name: /All Groves/i });
    fireEvent.click(allBtn);

    expect(within(grid).getByRole('heading', { level: 3, name: /Prairie Creek Redwoods/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /Smoky Mountains Grand White Oak/i })).toBeDefined();
  });

  it('updates calculator when quick select button on a grove card is clicked', () => {
    render(<TreeClimbingHub />);

    const selectButtons = screen.getAllByRole('button', { name: /Configure in Calculator|Load into Calculator/i });
    expect(selectButtons.length).toBeGreaterThan(0);

    // Click quick select on Appalachian White Oak
    fireEvent.click(selectButtons[3]);

    const resultPanel = screen.getByTestId('tree-climbing-calculator-result');
    expect(within(resultPanel).getByText(/Smoky Mountains Grand White Oak Canopy/i)).toBeDefined();
  });

  it('updates live calculator reactive results panel with role="status" and aria-live="polite"', () => {
    render(<TreeClimbingHub />);

    const resultPanel = screen.getByTestId('tree-climbing-calculator-result');
    expect(resultPanel.getAttribute('role')).toBe('status');
    expect(resultPanel.getAttribute('aria-live')).toBe('polite');

    const groveSelect = screen.getByLabelText(/Canopy Grove Expedition/i);
    const systemSelect = screen.getByLabelText(/^Climbing System$/i);
    const anchorSelect = screen.getByLabelText(/Anchor Rigging Style/i);
    const weightInput = screen.getByLabelText(/Climber Weight \+ Gear/i);
    const diameterInput = screen.getByLabelText(/Branch Diameter/i);

    // Initial state check (Default 190 lbs, 22 cm branch, basal_anchor, SRT)
    expect(within(resultPanel).getByText(/456\s*lbs\s*\(2\.03\s*kN\)/i)).toBeDefined();
    expect(within(resultPanel).getByText(/2\.15x/i)).toBeDefined();
    expect(within(resultPanel).getByText(/Approved: Cambium Saver Required/i)).toBeDefined();
    expect(
      within(resultPanel).getByText(/Valdôtain Tresse \(VT\) or Rope Wrench with 8mm Heat-Resistant Cord/i)
    ).toBeDefined();

    // Change to canopy isolated anchor
    fireEvent.change(anchorSelect, { target: { value: 'canopy_anchor' } });
    expect(within(resultPanel).getByText(/228\s*lbs\s*\(1\.01\s*kN\)/i)).toBeDefined();

    // Test climber weight change
    fireEvent.change(weightInput, { target: { value: '200' } });
    expect(within(resultPanel).getByText(/240\s*lbs\s*\(1\.07\s*kN\)/i)).toBeDefined();

    // Change to MRT/DRT system
    fireEvent.change(systemSelect, { target: { value: 'MRT_DRT' } });
    expect(
      within(resultPanel).getByText(/Distel or Michoacan friction hitch on dynamic split-tail/i)
    ).toBeDefined();

    // Change branch diameter to 11 cm (<12 cm => prohibited)
    fireEvent.change(diameterInput, { target: { value: '11' } });
    expect(within(resultPanel).getByText(/Prohibited: Structural Failure Risk/i)).toBeDefined();

    // Change branch diameter to 14 cm (12 to <15 cm => marginal)
    fireEvent.change(diameterInput, { target: { value: '14' } });
    expect(within(resultPanel).getByText(/Marginal: Undersized Limb Hazard/i)).toBeDefined();

    // Change branch diameter back to 24 cm
    fireEvent.change(diameterInput, { target: { value: '24' } });
    expect(within(resultPanel).getByText(/Approved: Cambium Saver Required/i)).toBeDefined();

    // Select another grove
    fireEvent.change(groveSelect, { target: { value: 'olympic-rainforest-sitka' } });
    expect(within(resultPanel).getByText(/Hoh River Valley Giant Sitka Spruce/i)).toBeDefined();
  });

  it('tracks live packing completion count and provides check all and reset in Arboreal Canopy Kit checklist', () => {
    render(<TreeClimbingHub />);

    const counter = screen.getByTestId('tree-gear-counter');
    expect(counter.textContent).toBe('0 of 6 packed');

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBe(6);

    // Check first item
    fireEvent.click(checkboxes[0]);
    expect(counter.textContent).toBe('1 of 6 packed');

    // Pack all
    const packAllBtn = screen.getByRole('button', { name: /Pack All|Select All/i });
    fireEvent.click(packAllBtn);
    expect(counter.textContent).toBe('6 of 6 packed');

    // Reset checklist
    const resetBtn = screen.getByRole('button', { name: /Reset|Clear All/i });
    fireEvent.click(resetBtn);
    expect(counter.textContent).toBe('0 of 6 packed');
  });
});
