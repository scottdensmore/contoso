import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PackGoatHub from './pack-goat-hub';

describe('PackGoatHub Component', () => {
  it('renders section headings (h2) and route card headings (h3) with no skipped levels', () => {
    render(<PackGoatHub />);

    // Section headings (h2)
    const h2Headings = screen.getAllByRole('heading', { level: 2 });
    expect(h2Headings.length).toBeGreaterThanOrEqual(3);
    const h2Texts = h2Headings.map((h) => h.textContent);
    expect(h2Texts.some((t) => /Iconic Alpine Pack-Goat Trekking Routes/i.test(t!))).toBe(true);
    expect(h2Texts.some((t) => /Goat Payload Balance & Alpine Agility Calculator/i.test(t!))).toBe(true);
    expect(h2Texts.some((t) => /Mandatory Alpine Pack-Goat Tack & Safety Checklist/i.test(t!))).toBe(true);

    // Card headings (h3)
    const h3Headings = screen.getAllByRole('heading', { level: 3 });
    expect(h3Headings).toHaveLength(5);
    const h3Texts = h3Headings.map((h) => h.textContent);
    expect(h3Texts).toContain('Wind River High Basin & Titcomb Lakes Goat Trek');
    expect(h3Texts).toContain('Sawtooth Wilderness Alice-Toxaway Loop');
    expect(h3Texts).toContain('Eagle Cap Wilderness Lakes Basin Traverse');
    expect(h3Texts).toContain('High Uintas Kings Peak Timberline Expedition');
    expect(h3Texts).toContain('Maroon Bells Snowmass Four Pass Alpine Loop');
  });

  it('filters route cards by saddle rigging buttons', () => {
    render(<PackGoatHub />);

    // Click "Crossbuck Sawbuck" filter button
    const crossbuckBtn = screen.getByRole('button', { name: /^Crossbuck Sawbuck$/i });
    fireEvent.click(crossbuckBtn);

    expect(screen.getByRole('heading', { level: 3, name: 'Sawtooth Wilderness Alice-Toxaway Loop' })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: 'Maroon Bells Snowmass Four Pass Alpine Loop' })).toBeDefined();
    expect(screen.queryByRole('heading', { level: 3, name: 'Wind River High Basin & Titcomb Lakes Goat Trek' })).toBeNull();
    expect(screen.queryByRole('heading', { level: 3, name: 'Eagle Cap Wilderness Lakes Basin Traverse' })).toBeNull();
    expect(screen.queryByRole('heading', { level: 3, name: 'High Uintas Kings Peak Timberline Expedition' })).toBeNull();

    // Click "Decker Soft Pack" filter button
    const deckerBtn = screen.getByRole('button', { name: /^Decker Soft Pack$/i });
    fireEvent.click(deckerBtn);

    expect(screen.getByRole('heading', { level: 3, name: 'Eagle Cap Wilderness Lakes Basin Traverse' })).toBeDefined();
    expect(screen.queryByRole('heading', { level: 3, name: 'Sawtooth Wilderness Alice-Toxaway Loop' })).toBeNull();

    // Click "All Saddles" filter button
    const allBtn = screen.getByRole('button', { name: /^All Saddles$/i });
    fireEvent.click(allBtn);

    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(5);
  });

  it('updates live calculator calculations, balance alerts, and buffer distances', () => {
    render(<PackGoatHub />);

    const routeSelect = screen.getByLabelText(/select alpine trekking route/i);
    fireEvent.change(routeSelect, { target: { value: 'wind-river-titcomb-basin' } });

    const leftPannierInput = screen.getByLabelText(/left pannier weight/i);
    const rightPannierInput = screen.getByLabelText(/right pannier weight/i);

    // Initial state (left=18, right=18, saddle=6, body=180 -> total=42, 23.3%, diff=0)
    const statusPanel = screen.getByRole('status');
    expect(statusPanel.textContent).toContain('42 lbs');
    expect(statusPanel.textContent).toContain('23.3%');
    expect(statusPanel.textContent).toContain('0 lbs');
    expect(statusPanel.textContent).toContain('Perfect Balance');
    expect(statusPanel.textContent).toContain('200m buffer');

    // Simulate severe imbalance: left=26, right=12
    fireEvent.change(leftPannierInput, { target: { value: '26' } });
    fireEvent.change(rightPannierInput, { target: { value: '12' } });

    expect(statusPanel.textContent).toContain('44 lbs'); // 26 + 12 + 6 = 44 lbs
    expect(statusPanel.textContent).toContain('14 lbs'); // |26 - 12| = 14 lbs
    expect(statusPanel.textContent).toMatch(/unbalanced.*roll risk/i);
    expect(statusPanel.textContent).toMatch(/warning.*rebalance/i);
    expect(statusPanel.textContent).toMatch(/recommended adjustment/i);
  });

  it('tracks checked gear items and updates pack-goat-gear-counter', () => {
    render(<PackGoatHub />);

    const counter = screen.getByTestId('pack-goat-gear-counter');
    expect(counter.textContent).toBe('0 of 6 packed');

    const forageCheckbox = screen.getByLabelText(/Weed-Free Certified Alfalfa\/Timothy Pellets/i);
    fireEvent.click(forageCheckbox);
    expect(counter.textContent).toBe('1 of 6 packed');

    const vestCheckbox = screen.getByLabelText(/Blaze Orange Goat Hunting-Season ID Vest/i);
    fireEvent.click(vestCheckbox);
    expect(counter.textContent).toBe('2 of 6 packed');

    fireEvent.click(forageCheckbox);
    expect(counter.textContent).toBe('1 of 6 packed');
  });
});
