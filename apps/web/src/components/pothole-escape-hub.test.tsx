import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import PotholeEscapeHub from './pothole-escape-hub';

describe('PotholeEscapeHub', () => {
  it('renders all main sections with h2 headings and no skipped heading levels', () => {
    render(<PotholeEscapeHub />);

    const h2s = screen.getAllByRole('heading', { level: 2 });
    const headings = h2s.map((h) => h.textContent);

    expect(headings.some((h) => /routes|canyon/i.test(h || ''))).toBe(true);
    expect(headings.some((h) => /calculator|dynamics/i.test(h || ''))).toBe(true);
    expect(headings.some((h) => /checklist|gear/i.test(h || ''))).toBe(true);
  });

  it('renders route cards with h3 headings, lip friction angles, and depth', () => {
    render(<PotholeEscapeHub />);

    const grid = screen.getByTestId('pothole-routes-grid');
    const h3s = within(grid).getAllByRole('heading', { level: 3 });
    const titles = h3s.map((h) => h.textContent);

    expect(titles.some((t) => t?.includes('Neon Canyon'))).toBe(true);
    expect(titles.some((t) => t?.includes('Choprock Canyon'))).toBe(true);
    expect(titles.some((t) => t?.includes('White Canyon Black Hole'))).toBe(true);
    expect(titles.some((t) => t?.includes('Imlay Canyon'))).toBe(true);
    expect(titles.some((t) => t?.includes('Heaps Canyon'))).toBe(true);

    // Verify depth and angle metrics
    expect(within(grid).getByText(/45\s*m/i)).toBeDefined();
    expect(within(grid).getByText(/65°/)).toBeDefined();
  });

  it('filters routes by escape technique when filter buttons are clicked', () => {
    render(<PotholeEscapeHub />);

    const grid = screen.getByTestId('pothole-routes-grid');

    // Filter by SandTrap Ghost Anchor
    const sandtrapBtn = screen.getByRole('button', { name: /sandtrap ghost anchor/i });
    fireEvent.click(sandtrapBtn);

    expect(within(grid).getByText(/Neon Canyon/i)).toBeDefined();
    expect(within(grid).getByText(/Heaps Canyon/i)).toBeDefined();
    expect(within(grid).queryByText(/Choprock Canyon/i)).toBeNull();
    expect(within(grid).queryByText(/Imlay Canyon/i)).toBeNull();

    // Filter by Pot-Hole Escape Hook
    const hookBtn = screen.getByRole('button', { name: /pot-hole escape hook/i });
    fireEvent.click(hookBtn);

    expect(within(grid).getByText(/Choprock Canyon/i)).toBeDefined();
    expect(within(grid).queryByText(/Neon Canyon/i)).toBeNull();

    // Filter by Water Anchor Pack Toss
    const packTossBtn = screen.getByRole('button', { name: /water anchor pack toss/i });
    fireEvent.click(packTossBtn);

    expect(within(grid).getByText(/White Canyon Black Hole/i)).toBeDefined();
    expect(within(grid).queryByText(/Choprock Canyon/i)).toBeNull();

    // Filter by Cheater Stick Reach
    const stickBtn = screen.getByRole('button', { name: /cheater stick reach/i });
    fireEvent.click(stickBtn);

    expect(within(grid).getByText(/Imlay Canyon/i)).toBeDefined();
    expect(within(grid).queryByText(/White Canyon Black Hole/i)).toBeNull();

    // Reset to All Techniques
    const allBtn = screen.getByRole('button', { name: /all techniques/i });
    fireEvent.click(allBtn);

    expect(within(grid).getByText(/Neon Canyon/i)).toBeDefined();
    expect(within(grid).getByText(/Choprock Canyon/i)).toBeDefined();
    expect(within(grid).getByText(/White Canyon Black Hole/i)).toBeDefined();
    expect(within(grid).getByText(/Imlay Canyon/i)).toBeDefined();
    expect(within(grid).getByText(/Heaps Canyon/i)).toBeDefined();
  });

  it('allows clicking configure button on a route card to prefill the calculator', () => {
    render(<PotholeEscapeHub />);

    const choprockCard = screen.getByTestId('pothole-route-choprock-canyon-keepers');
    const configBtn = within(choprockCard).getByRole('button', { name: /configure.*dynamics/i });
    fireEvent.click(configBtn);

    const resultPanel = screen.getByTestId('pothole-calculator-result');
    expect(within(resultPanel).getByText(/Choprock Canyon/i)).toBeDefined();
  });

  it('updates live reactive calculator results with accessible status attributes', () => {
    render(<PotholeEscapeHub />);

    const resultPanel = screen.getByTestId('pothole-calculator-result');
    expect(resultPanel.getAttribute('role')).toBe('status');
    expect(resultPanel.getAttribute('aria-live')).toBe('polite');

    const routeSelect = screen.getByLabelText(/select.*route/i);
    expect(routeSelect).toBeDefined();
    const techniqueSelect = screen.getByLabelText(/select escape technique/i);
    const waterLevelSelect = screen.getByLabelText(/water level condition/i);
    const wallWetnessSelect = screen.getByLabelText(/wall wetness/i);
    const teamSizeInput = screen.getByLabelText(/team size/i);
    const climberWeightInput = screen.getByLabelText(/lead climber weight/i);
    const lipHeightInput = screen.getByLabelText(/lip height/i);
    const inclineAngleInput = screen.getByLabelText(/incline angle/i);

    // Initial default test (Neon Canyon, 75kg, 3.0m, 70deg -> hoist force 735 N, counterweight 56.2 kg)
    expect(within(resultPanel).getByText(/735\s*N/i)).toBeDefined();
    expect(within(resultPanel).getByText(/56\.2\s*kg/i)).toBeDefined();
    expect(within(resultPanel).getByText(/0\.56/i)).toBeDefined();
    expect(within(resultPanel).getByText(/caution: technical hook required/i)).toBeDefined();

    // Adjust parameters to trigger critical hazard
    fireEvent.change(waterLevelSelect, { target: { value: 'flooded_swimming_flume' } });
    expect(within(resultPanel).getByText(/critical keeper trap hazard/i)).toBeDefined();
    expect(within(resultPanel).getByText(/CRITICAL KEEPER ESCAPE/i)).toBeDefined();

    // Adjust to nominal partner boost
    fireEvent.change(waterLevelSelect, { target: { value: 'bone_dry_scour' } });
    fireEvent.change(techniqueSelect, { target: { value: 'sandtrap_ghost_anchor' } });
    fireEvent.change(wallWetnessSelect, { target: { value: 'dry_slickrock' } });
    fireEvent.change(lipHeightInput, { target: { value: '1.5' } });
    fireEvent.change(inclineAngleInput, { target: { value: '45' } });
    fireEvent.change(climberWeightInput, { target: { value: '60' } });
    fireEvent.change(teamSizeInput, { target: { value: '4' } });

    expect(within(resultPanel).getAllByText(/nominal partner boost/i).length).toBeGreaterThanOrEqual(1);
    expect(within(resultPanel).getByText(/NOMINAL PARTNER BOOST PROTOCOL/i)).toBeDefined();
  });

  it('tracks checklist item checkboxes and updates live pothole-gear-counter', () => {
    render(<PotholeEscapeHub />);

    const counter = screen.getByTestId('pothole-gear-counter');
    expect(counter.textContent).toMatch(/0 of 6 packed/i);

    const sandtrapCheckbox = screen.getByLabelText(/retrievable sandtrap canyoneering anchor fabric bag/i);
    fireEvent.click(sandtrapCheckbox);
    expect(counter.textContent).toMatch(/1 of 6 packed/i);

    const cheaterStickCheckbox = screen.getByLabelText(/carbon fiber telescoping cheater stick/i);
    fireEvent.click(cheaterStickCheckbox);
    expect(counter.textContent).toMatch(/2 of 6 packed/i);

    fireEvent.click(sandtrapCheckbox);
    expect(counter.textContent).toMatch(/1 of 6 packed/i);
  });
});
