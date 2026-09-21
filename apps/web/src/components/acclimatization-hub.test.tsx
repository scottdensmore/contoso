import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AcclimatizationHub from './acclimatization-hub';

describe('AcclimatizationHub component', () => {
  it('renders required h2 section headings and h3 card headings without skipped levels', () => {
    render(<AcclimatizationHub />);

    const h2s = screen.getAllByRole('heading', { level: 2 });
    expect(h2s.length).toBeGreaterThanOrEqual(3);

    const h3s = screen.getAllByRole('heading', { level: 3 });
    expect(h3s.length).toBe(5); // 5 iconic peak cards

    // Check specific h2 section headings
    const h2Texts = h2s.map((h) => h.textContent);
    expect(
      h2Texts.some((t) => t?.includes('Iconic High-Altitude Peaks'))
    ).toBe(true);
    expect(
      h2Texts.some((t) => t?.includes('Ascent Pacing & Lake Louise AMS Calculator'))
    ).toBe(true);
    expect(
      h2Texts.some((t) => t?.includes('Mandatory High-Altitude Medical'))
    ).toBe(true);
  });

  it('filters peaks when zone buttons are clicked', () => {
    render(<AcclimatizationHub />);

    // Initially all 5 peaks present
    expect(screen.getByRole('heading', { level: 3, name: /Mount Elbert/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Mount Rainier/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Denali/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Mount Whitney/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Pico de Orizaba/i })).toBeDefined();

    // Click Extreme (18k+) filter button
    const extremeBtn = screen.getByRole('button', { name: /extreme/i });
    fireEvent.click(extremeBtn);

    expect(screen.getByRole('heading', { level: 3, name: /Denali/i })).toBeDefined();
    expect(screen.queryByRole('heading', { level: 3, name: /Mount Rainier/i })).toBeNull();
    expect(screen.queryByRole('heading', { level: 3, name: /Mount Elbert/i })).toBeNull();
    expect(screen.queryByRole('heading', { level: 3, name: /Mount Whitney/i })).toBeNull();
    expect(screen.queryByRole('heading', { level: 3, name: /Pico de Orizaba/i })).toBeNull();

    // Click High (12k-14k) filter button
    const highBtn = screen.getByRole('button', { name: /high \(12k-14k\)/i });
    fireEvent.click(highBtn);

    expect(screen.getByRole('heading', { level: 3, name: /Mount Elbert/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Mount Rainier/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Mount Whitney/i })).toBeDefined();
    expect(screen.queryByRole('heading', { level: 3, name: /Denali/i })).toBeNull();
    expect(screen.queryByRole('heading', { level: 3, name: /Pico de Orizaba/i })).toBeNull();

    // Click All Peaks
    const allBtn = screen.getByRole('button', { name: /all peaks/i });
    fireEvent.click(allBtn);

    expect(screen.getByRole('heading', { level: 3, name: /Denali/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Mount Rainier/i })).toBeDefined();
  });

  it('updates ascent pacing and AMS calculation reactively with accessible live region', () => {
    render(<AcclimatizationHub />);

    const liveStatus = screen.getByRole('status');
    expect(liveStatus).toBeDefined();
    expect(liveStatus.getAttribute('aria-live')).toBe('polite');

    const peakSelect = screen.getByLabelText(/select target peak/i);
    const daysInput = screen.getByLabelText(/days allowed for ascent/i);
    const currentAltInput = screen.getByLabelText(/current acclimatized altitude/i);

    // Select Denali
    fireEvent.change(peakSelect, { target: { value: 'alaska-denali' } });
    fireEvent.change(currentAltInput, { target: { value: '7200' } });
    fireEvent.change(daysInput, { target: { value: '14' } });

    expect(liveStatus.textContent).toContain('936 ft/day');
    expect(liveStatus.textContent).toContain('Denali');

    // Change to 3 days (dangerous ascent)
    fireEvent.change(daysInput, { target: { value: '3' } });
    expect(liveStatus.textContent).toContain('4,370 ft/day');
    expect(liveStatus.textContent?.toLowerCase()).toContain('severe');
  });

  it('toggles checklist items and updates progress counter', () => {
    render(<AcclimatizationHub />);

    const counter = screen.getByTestId('altitude-gear-counter');
    expect(counter.textContent).toBe('0 of 6 packed');

    const oximeterCheckbox = screen.getByLabelText(/clinical fingertip pulse oximeter/i);
    fireEvent.click(oximeterCheckbox);
    expect(counter.textContent).toBe('1 of 6 packed');

    const diamoxCheckbox = screen.getByLabelText(/acetazolamide \(diamox\)/i);
    fireEvent.click(diamoxCheckbox);
    expect(counter.textContent).toBe('2 of 6 packed');

    // Uncheck oximeter
    fireEvent.click(oximeterCheckbox);
    expect(counter.textContent).toBe('1 of 6 packed');
  });
});
