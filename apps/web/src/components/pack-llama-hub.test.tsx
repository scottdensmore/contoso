import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PackLlamaHub from './pack-llama-hub';

describe('PackLlamaHub Component', () => {
  it('renders section headings (h2) and route card headings (h3) with no skipped levels', () => {
    render(<PackLlamaHub />);

    // Section headings (h2)
    const h2Headings = screen.getAllByRole('heading', { level: 2 });
    expect(h2Headings.length).toBeGreaterThanOrEqual(3);
    const h2Texts = h2Headings.map((h) => h.textContent);
    expect(h2Texts.some((t) => /Iconic Wilderness Pack-Llama Routes/i.test(t!))).toBe(true);
    expect(h2Texts.some((t) => /Llama Payload Weight Balancing & High-Altitude String Calculator/i.test(t!))).toBe(true);
    expect(h2Texts.some((t) => /Mandatory Pack-Llama Safety & Tack Checklist/i.test(t!))).toBe(true);

    // Card headings (h3)
    const h3Headings = screen.getAllByRole('heading', { level: 3 });
    expect(h3Headings).toHaveLength(5);
    const h3Texts = h3Headings.map((h) => h.textContent);
    expect(h3Texts).toContain('High Sierra Bishop Pass & Dusy Basin Llama Trek');
    expect(h3Texts).toContain('Wind River Cirque of the Towers Llama Expedition');
    expect(h3Texts).toContain('Weminuche Wilderness Continental Divide Llama Trek');
    expect(h3Texts).toContain('Pasayten Wilderness Northern Loop Llama Pack');
    expect(h3Texts).toContain('High Uintas Four Lakes Basin Llama Expedition');
  });

  it('filters route cards by saddle rigging buttons', () => {
    render(<PackLlamaHub />);

    // Click "Wood Crossbuck Pack" filter button
    const crossbuckBtn = screen.getByRole('button', { name: /^Wood Crossbuck Pack$/i });
    fireEvent.click(crossbuckBtn);

    expect(screen.getByRole('heading', { level: 3, name: 'High Sierra Bishop Pass & Dusy Basin Llama Trek' })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: 'Pasayten Wilderness Northern Loop Llama Pack' })).toBeDefined();
    expect(screen.queryByRole('heading', { level: 3, name: 'Wind River Cirque of the Towers Llama Expedition' })).toBeNull();
    expect(screen.queryByRole('heading', { level: 3, name: 'Weminuche Wilderness Continental Divide Llama Trek' })).toBeNull();
    expect(screen.queryByRole('heading', { level: 3, name: 'High Uintas Four Lakes Basin Llama Expedition' })).toBeNull();

    // Click "Decker Cinch Pack" filter button
    const deckerBtn = screen.getByRole('button', { name: /^Decker Cinch Pack$/i });
    fireEvent.click(deckerBtn);

    expect(screen.getByRole('heading', { level: 3, name: 'Weminuche Wilderness Continental Divide Llama Trek' })).toBeDefined();
    expect(screen.queryByRole('heading', { level: 3, name: 'High Sierra Bishop Pass & Dusy Basin Llama Trek' })).toBeNull();

    // Click "Articulated Fiberglass Tree" filter button
    const fiberglassBtn = screen.getByRole('button', { name: /^Articulated Fiberglass Tree$/i });
    fireEvent.click(fiberglassBtn);

    expect(screen.getByRole('heading', { level: 3, name: 'Wind River Cirque of the Towers Llama Expedition' })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: 'High Uintas Four Lakes Basin Llama Expedition' })).toBeDefined();

    // Click "All Rigging" filter button
    const allBtn = screen.getByRole('button', { name: /^All Rigging$/i });
    fireEvent.click(allBtn);

    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(5);
  });

  it('updates live calculator calculations, balance alerts, and highline string values', () => {
    render(<PackLlamaHub />);

    const routeSelect = screen.getByLabelText(/select wilderness route/i);
    fireEvent.change(routeSelect, { target: { value: 'high-sierra-bishop-pass' } });

    const leftPannierInput = screen.getByLabelText(/left pannier weight/i);
    const rightPannierInput = screen.getByLabelText(/right pannier weight/i);

    // Initial state: left=32, right=32, saddle=12, body=360 -> total=76, 21.1%, diff=0
    const statusPanel = screen.getByRole('status');
    expect(statusPanel.textContent).toContain('76 lbs');
    expect(statusPanel.textContent).toContain('21.1%');
    expect(statusPanel.textContent).toContain('0 lbs');
    expect(statusPanel.textContent).toContain('Perfect Balance');
    expect(statusPanel.textContent).toContain('Optimal Working Capacity');
    expect(statusPanel.textContent).toContain('3.5 m');
    expect(statusPanel.textContent).toContain('2 gal/day');

    // Simulate severe imbalance: left=44, right=20
    fireEvent.change(leftPannierInput, { target: { value: '44' } });
    fireEvent.change(rightPannierInput, { target: { value: '20' } });

    expect(statusPanel.textContent).toContain('76 lbs'); // 44 + 20 + 12 = 76 lbs
    expect(statusPanel.textContent).toContain('24 lbs'); // |44 - 20| = 24 lbs
    expect(statusPanel.textContent).toMatch(/unbalanced.*girth gall risk/i);
    expect(statusPanel.textContent).toMatch(/warning.*girth gall/i);
  });

  it('tracks checked gear items and updates pack-llama-gear-counter', () => {
    render(<PackLlamaHub />);

    const counter = screen.getByTestId('pack-llama-gear-counter');
    expect(counter.textContent).toBe('0 of 6 packed');

    const saddleCheckbox = screen.getByLabelText(/Contoured Wool-Felt Padded Llama Pack Saddle/i);
    fireEvent.click(saddleCheckbox);
    expect(counter.textContent).toBe('1 of 6 packed');

    const canisterCheckbox = screen.getByLabelText(/Bear-Resistant Food Canisters/i);
    fireEvent.click(canisterCheckbox);
    expect(counter.textContent).toBe('2 of 6 packed');

    fireEvent.click(saddleCheckbox);
    expect(counter.textContent).toBe('1 of 6 packed');
  });
});
