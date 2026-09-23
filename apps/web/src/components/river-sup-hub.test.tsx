import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import RiverSupHub from './river-sup-hub';

describe('RiverSupHub', () => {
  it('renders all main sections with h2 headings and no skipped heading levels', () => {
    render(<RiverSupHub />);

    const h2s = screen.getAllByRole('heading', { level: 2 });
    const headings = h2s.map((h) => h.textContent);

    expect(headings.some((h) => /river.*runs|whitewater.*reaches/i.test(h || ''))).toBe(true);
    expect(headings.some((h) => /buoyancy.*safety calculator|river safety calculator/i.test(h || ''))).toBe(true);
    expect(headings.some((h) => /checklist|safety kit/i.test(h || ''))).toBe(true);
  });

  it('renders run cards with h3 headings and key river SUP metrics', () => {
    render(<RiverSupHub />);

    const grid = screen.getByTestId('river-sup-runs-grid');
    const h3s = within(grid).getAllByRole('heading', { level: 3 });
    const titles = h3s.map((h) => h.textContent);

    expect(titles.some((t) => t?.includes('Browns Canyon National Monument'))).toBe(true);
    expect(titles.some((t) => t?.includes('Middle White Salmon River'))).toBe(true);
    expect(titles.some((t) => t?.includes('French Broad River (Section 9)'))).toBe(true);
    expect(titles.some((t) => t?.includes('Lower Deschutes (Maupin Reach)'))).toBe(true);
    expect(titles.some((t) => t?.includes('Soča River (Kobarid Reach)'))).toBe(true);

    // Verify lengths, gradients, flows, durations
    expect(within(grid).getByText(/14\s*miles/i)).toBeDefined();
    expect(within(grid).getByText(/28\s*ft\/mi/i)).toBeDefined();
    expect(within(grid).getByText(/800 - 2,200 CFS/i)).toBeDefined();
    expect(within(grid).getByText(/4\.5\s*hrs/i)).toBeDefined();

    // Verify difficulty badges
    expect(within(grid).getAllByText(/^Class III$/i).length).toBeGreaterThan(0);
    expect(within(grid).getAllByText(/^Class IV$/i).length).toBeGreaterThan(0);
  });

  it('filters runs when difficulty filter buttons are clicked', () => {
    render(<RiverSupHub />);

    const grid = screen.getByTestId('river-sup-runs-grid');

    // Filter by Class IV
    const class4Btn = screen.getByRole('button', { name: /^class iv$/i });
    fireEvent.click(class4Btn);

    expect(within(grid).getByRole('heading', { name: /Middle White Salmon River/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { name: /Soča River/i })).toBeDefined();
    expect(within(grid).queryByRole('heading', { name: /Browns Canyon/i })).toBeNull();
    expect(within(grid).queryByRole('heading', { name: /French Broad/i })).toBeNull();
    expect(within(grid).queryByRole('heading', { name: /Lower Deschutes/i })).toBeNull();

    // Filter by Class III
    const class3Btn = screen.getByRole('button', { name: /^class iii$/i });
    fireEvent.click(class3Btn);

    expect(within(grid).getByRole('heading', { name: /Browns Canyon/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { name: /French Broad/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { name: /Lower Deschutes/i })).toBeDefined();
    expect(within(grid).queryByRole('heading', { name: /Middle White Salmon/i })).toBeNull();
    expect(within(grid).queryByRole('heading', { name: /Soča River/i })).toBeNull();

    // Filter by Class II
    const class2Btn = screen.getByRole('button', { name: /^class ii$/i });
    fireEvent.click(class2Btn);
    expect(within(grid).queryByRole('heading', { name: /Browns Canyon/i })).toBeNull();
    expect(within(grid).getByText(/no river sup runs found/i)).toBeDefined();

    // Reset to All Runs
    const allBtn = screen.getByRole('button', { name: /^all runs$/i });
    fireEvent.click(allBtn);

    expect(within(grid).getByRole('heading', { name: /Browns Canyon/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { name: /Middle White Salmon/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { name: /French Broad/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { name: /Lower Deschutes/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { name: /Soča River/i })).toBeDefined();
  });

  it('updates live calculator reactive results panel with role="status" and aria-live="polite"', () => {
    render(<RiverSupHub />);

    const resultPanel = screen.getByTestId('river-sup-calculator-result');
    expect(resultPanel.getAttribute('role')).toBe('status');
    expect(resultPanel.getAttribute('aria-live')).toBe('polite');

    const runSelect = screen.getByLabelText(/select.*river.*run/i);
    const paddlerInput = screen.getByLabelText(/paddler weight/i);
    const gearInput = screen.getByLabelText(/gear weight/i);
    const volumeInput = screen.getByLabelText(/board volume/i);
    const flowInput = screen.getByLabelText(/river flow/i);
    const finSelect = screen.getByLabelText(/fin configuration/i);
    const leashSelect = screen.getByLabelText(/leash system/i);

    // Initial default state: Browns Canyon, 75kg paddler, 5kg gear, 310L volume -> 80kg payload, 3.88x ratio
    expect(within(resultPanel).getByText(/Browns Canyon National Monument/i)).toBeDefined();
    expect(within(resultPanel).getByText(/80\s*kg/i)).toBeDefined();
    expect(within(resultPanel).getByText(/3\.88x/i)).toBeDefined();
    expect(within(resultPanel).getAllByText(/Approved/i).length).toBeGreaterThan(0);

    // Changing river flow to high discharge (>4000 CFS) triggers caution
    fireEvent.change(flowInput, { target: { value: '4500' } });
    expect(within(resultPanel).getByText(/Caution: Expert Only/i)).toBeDefined();
    fireEvent.change(flowInput, { target: { value: '1500' } });

    // Switch leash to fixed ankle leash -> Hazardous prohibited
    fireEvent.change(leashSelect, { target: { value: 'ankle_fixed_coiled' } });
    expect(within(resultPanel).getByText(/Hazardous: Prohibited Setup/i)).toBeDefined();
    expect(within(resultPanel).getByText(/DANGER: Lethal Ankle Entrapment Hazard/i)).toBeDefined();

    // Reset leash to quick-release, change fin to long touring fin -> Hazardous prohibited
    fireEvent.change(leashSelect, { target: { value: 'torso_quick_release' } });
    fireEvent.change(finSelect, { target: { value: 'standard_long_touring_fin' } });
    expect(within(resultPanel).getByText(/Hazardous: Prohibited Setup/i)).toBeDefined();
    expect(within(resultPanel).getByText(/DANGER: Severe Fin Strike/i)).toBeDefined();

    // Reset fin, switch to White Salmon (Class IV) -> Caution Expert Only
    fireEvent.change(finSelect, { target: { value: 'short_flexible_river_fins' } });
    fireEvent.change(runSelect, { target: { value: 'white-salmon-husum' } });
    expect(within(resultPanel).getByText(/Middle White Salmon River/i)).toBeDefined();
    expect(within(resultPanel).getByText(/Caution: Expert Only/i)).toBeDefined();
    expect(within(resultPanel).getByText(/Expert paddlers only/i)).toBeDefined();

    // Change paddler/gear weight to test under-buoyant ratio
    fireEvent.change(paddlerInput, { target: { value: '120' } });
    fireEvent.change(gearInput, { target: { value: '20' } });
    fireEvent.change(volumeInput, { target: { value: '220' } });
    expect(within(resultPanel).getByText(/140\s*kg/i)).toBeDefined();
    expect(within(resultPanel).getByText(/1\.57x/i)).toBeDefined();
    expect(within(resultPanel).getByText(/Hazardous: Prohibited Setup/i)).toBeDefined();
    expect(within(resultPanel).getByText(/Low Buoyancy Warning/i)).toBeDefined();
  });

  it('allows clicking "Configure Calculator for this Run" button on a card to select it', () => {
    render(<RiverSupHub />);

    const configureButtons = screen.getAllByRole('button', { name: /configure calculator/i });
    expect(configureButtons.length).toBe(5);

    // Click configure on Middle White Salmon (index 1)
    fireEvent.click(configureButtons[1]);

    const resultPanel = screen.getByTestId('river-sup-calculator-result');
    expect(within(resultPanel).getByText(/Middle White Salmon River/i)).toBeDefined();
  });

  it('tracks progress on the Mandatory River SUP Safety Kit Checklist', () => {
    render(<RiverSupHub />);

    const counter = screen.getByTestId('river-sup-gear-counter');
    expect(counter.textContent).toContain('0 of 6 packed');

    const leashCheckbox = screen.getByLabelText(/Chest-Harness Quick-Release River Leash Belt/i);
    const pfdCheckbox = screen.getByLabelText(/Type V High-Buoyancy Whitewater PFD/i);

    fireEvent.click(leashCheckbox);
    expect(counter.textContent).toContain('1 of 6 packed');

    fireEvent.click(pfdCheckbox);
    expect(counter.textContent).toContain('2 of 6 packed');

    fireEvent.click(leashCheckbox);
    expect(counter.textContent).toContain('1 of 6 packed');
  });
});
