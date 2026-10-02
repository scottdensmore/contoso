import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import SlickrockBurroHub from './slickrock-burro-hub';

describe('SlickrockBurroHub', () => {
  it('renders all main sections with h2 headings and zero skipped heading levels', () => {
    render(<SlickrockBurroHub />);

    const h2s = screen.getAllByRole('heading', { level: 2 });
    const headings = h2s.map((h) => h.textContent);

    expect(
      headings.some((h) => /routes|pack-burro routes|wilderness/i.test(h || '')),
    ).toBe(true);
    expect(
      headings.some((h) => /calculator|hydration.*counterbalance|slickrock footing/i.test(h || '')),
    ).toBe(true);
    expect(
      headings.some((h) => /gear checklist|field checklist/i.test(h || '')),
    ).toBe(true);
  });

  it('renders route cards with h3 headings, distance, water availability, max temp, and highlights', () => {
    render(<SlickrockBurroHub />);

    const grid = screen.getByTestId('slickrock-burro-routes-grid');
    const h3s = within(grid).getAllByRole('heading', { level: 3 });
    const titles = h3s.map((h) => h.textContent);

    expect(titles.some((t) => t?.includes('San Rafael Swell Chute Canyon'))).toBe(true);
    expect(titles.some((t) => t?.includes('Grand Gulch Primitive Desert Wash'))).toBe(true);
    expect(titles.some((t) => t?.includes('Death Valley Cottonwood-Marble'))).toBe(true);
    expect(titles.some((t) => t?.includes('Escalante River & Baker Canyon'))).toBe(true);
    expect(titles.some((t) => t?.includes('Big Bend Mesa de Anguila'))).toBe(true);

    // Verify distance and temp
    expect(within(grid).getByText(/42\s*km/i)).toBeDefined();
    expect(within(grid).getByText(/38\s*°C/i)).toBeDefined();
    expect(within(grid).getByText(/58\s*km/i)).toBeDefined();
    expect(within(grid).getByText(/44\s*°C/i)).toBeDefined();

    // Verify highlights
    expect(
      within(grid).getAllByText(/Slickrock friction hoof traction management/i).length,
    ).toBeGreaterThan(0);
    expect(
      within(grid).getAllByText(/Extreme hyper-arid hydration logistics/i).length,
    ).toBeGreaterThan(0);
  });

  it('filters routes when terrain filter buttons are clicked', () => {
    render(<SlickrockBurroHub />);

    const grid = screen.getByTestId('slickrock-burro-routes-grid');

    // Filter by Slickrock Dry Wash
    const slickrockBtn = screen.getByRole('button', { name: /slickrock dry wash/i });
    fireEvent.click(slickrockBtn);

    expect(
      within(grid).getByRole('heading', { name: /San Rafael Swell Chute Canyon/i }),
    ).toBeDefined();
    expect(
      within(grid).getByRole('heading', { name: /Escalante River & Baker Canyon/i }),
    ).toBeDefined();
    expect(
      within(grid).queryByRole('heading', { name: /Grand Gulch Primitive Desert Wash/i }),
    ).toBeNull();
    expect(
      within(grid).queryByRole('heading', { name: /Death Valley Cottonwood-Marble/i }),
    ).toBeNull();
    expect(
      within(grid).queryByRole('heading', { name: /Big Bend Mesa de Anguila/i }),
    ).toBeNull();

    // Filter by Deep Alluvial Sand
    const sandBtn = screen.getByRole('button', { name: /deep alluvial sand/i });
    fireEvent.click(sandBtn);

    expect(
      within(grid).getByRole('heading', { name: /Grand Gulch Primitive Desert Wash/i }),
    ).toBeDefined();
    expect(
      within(grid).queryByRole('heading', { name: /San Rafael Swell Chute Canyon/i }),
    ).toBeNull();

    // Reset to All Terrains
    const allBtn = screen.getByRole('button', { name: /all terrains/i });
    fireEvent.click(allBtn);

    expect(
      within(grid).getByRole('heading', { name: /San Rafael Swell Chute Canyon/i }),
    ).toBeDefined();
    expect(
      within(grid).getByRole('heading', { name: /Grand Gulch Primitive Desert Wash/i }),
    ).toBeDefined();
    expect(
      within(grid).getByRole('heading', { name: /Death Valley Cottonwood-Marble/i }),
    ).toBeDefined();
    expect(
      within(grid).getByRole('heading', { name: /Escalante River & Baker Canyon/i }),
    ).toBeDefined();
    expect(
      within(grid).getByRole('heading', { name: /Big Bend Mesa de Anguila/i }),
    ).toBeDefined();
  });

  it('updates live calculator reactive results panel with role="status" and aria-live="polite"', () => {
    render(<SlickrockBurroHub />);

    const resultPanel = screen.getByTestId('burro-calculator-result');
    expect(resultPanel.getAttribute('role')).toBe('status');
    expect(resultPanel.getAttribute('aria-live')).toBe('polite');

    // Default calculations: 34C, 18km, 40kg -> 41.7 L/day
    expect(resultPanel.textContent).toContain('41.7');
    expect(resultPanel.textContent).toContain('0.38');
    expect(resultPanel.textContent).toContain('88');

    // Adjust temperature slider to 20C, distance to 10km, cargo to 20kg, delta to 0.5kg
    const tempInput = screen.getByLabelText(/ambient peak temperature/i);
    const distInput = screen.getByLabelText(/daily trek distance/i);
    const cargoInput = screen.getByLabelText(/cargo weight per burro/i);
    const deltaInput = screen.getByLabelText(/pannier weight delta/i);

    fireEvent.change(tempInput, { target: { value: '20' } });
    fireEvent.change(distInput, { target: { value: '10' } });
    fireEvent.change(cargoInput, { target: { value: '20' } });
    fireEvent.change(deltaInput, { target: { value: '0.5' } });

    // Water: 15 + 0 + 4.5 + 3.0 = 22.5 L
    expect(resultPanel.textContent).toContain('22.5');
    // Balance score: 100 - 5.0 = 95.0%
    expect(resultPanel.textContent).toContain('95');
    expect(resultPanel.textContent).toMatch(/optimal/i);
  });

  it('triggers critical load warning on severe pannier weight delta', () => {
    render(<SlickrockBurroHub />);

    const resultPanel = screen.getByTestId('burro-calculator-result');
    const deltaInput = screen.getByLabelText(/pannier weight delta/i);

    fireEvent.change(deltaInput, { target: { value: '5.0' } });

    // Balance score: 100 - 50 = 50.0% (< 60%)
    expect(resultPanel.textContent).toContain('50');
    expect(resultPanel.textContent).toMatch(/CRITICAL IMBALANCE/i);
  });

  it('updates gear checklist counter when checkboxes are toggled', () => {
    render(<SlickrockBurroHub />);

    const counter = screen.getByTestId('burro-gear-counter');
    expect(counter.textContent).toContain('0 of 6 packed');

    const saddleCheckbox = screen.getByLabelText(/Hand-Crafted Ash Wood Sawbuck Pack Saddle/i);
    fireEvent.click(saddleCheckbox);
    expect(counter.textContent).toContain('1 of 6 packed');

    const pannierCheckbox = screen.getByLabelText(/Reinforced 24oz Duck Canvas Pack Panniers/i);
    fireEvent.click(pannierCheckbox);
    expect(counter.textContent).toContain('2 of 6 packed');

    fireEvent.click(saddleCheckbox);
    expect(counter.textContent).toContain('1 of 6 packed');
  });

  it('populates calculator when a route card "Configure Calculator" button is clicked', () => {
    render(<SlickrockBurroHub />);

    const grid = screen.getByTestId('slickrock-burro-routes-grid');
    const grandGulchCard = within(grid).getByRole('heading', {
      name: /Grand Gulch Primitive Desert Wash/i,
    }).closest('article');
    expect(grandGulchCard).not.toBeNull();

    const configureBtn = within(grandGulchCard!).getByRole('button', {
      name: /configure calculator for this route/i,
    });
    fireEvent.click(configureBtn);

    const resultPanel = screen.getByTestId('burro-calculator-result');
    expect(resultPanel.textContent).toContain('Grand Gulch Primitive Desert Wash Packing Route');

    const terrainSelect = screen.getByLabelText(/canyon terrain/i) as HTMLSelectElement;
    expect(terrainSelect.value).toBe('deep_alluvial_sand');
  });
});
