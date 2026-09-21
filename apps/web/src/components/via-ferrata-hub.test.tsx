import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ViaFerrataHub from './via-ferrata-hub';

describe('ViaFerrataHub component', () => {
  it('renders required h2 section headings and h3 card headings without skipped levels', () => {
    render(<ViaFerrataHub />);

    const h2s = screen.getAllByRole('heading', { level: 2 });
    expect(h2s.length).toBeGreaterThanOrEqual(3);

    const h3s = screen.getAllByRole('heading', { level: 3 });
    expect(h3s.length).toBe(5); // 5 iconic route cards

    const h2Texts = h2s.map((h) => h.textContent);
    expect(h2Texts.some((t) => t?.includes('Iconic Via Ferrata Routes & Iron Ways'))).toBe(true);
    expect(h2Texts.some((t) => t?.includes('Fall-Arrest Rigging & Safety Calculator'))).toBe(true);
    expect(h2Texts.some((t) => t?.includes('Mandatory Via Ferrata Safety Kit Checklist'))).toBe(true);

    const h3Texts = h3s.map((h) => h.textContent);
    expect(h3Texts).toContain('Telluride Via Ferrata');
    expect(h3Texts).toContain('Mount Olympus Iron Way Ridge');
    expect(h3Texts).toContain('Ouray Via Ferrata Gold Mountain');
    expect(h3Texts).toContain('Whistler Peak West Ridge Via Ferrata');
    expect(h3Texts).toContain('Mammoth Mountain Iron Crest Wall');
  });

  it('filters routes when grade buttons are clicked', () => {
    render(<ViaFerrataHub />);

    // Initially all 5 routes present
    expect(screen.getByText('Telluride Via Ferrata')).toBeDefined();
    expect(screen.getByText('Mount Olympus Iron Way Ridge')).toBeDefined();
    expect(screen.getByText('Ouray Via Ferrata Gold Mountain')).toBeDefined();
    expect(screen.getByText('Whistler Peak West Ridge Via Ferrata')).toBeDefined();
    expect(screen.getByText('Mammoth Mountain Iron Crest Wall')).toBeDefined();

    // Click Grade D filter button
    const gradeDBtn = screen.getByRole('button', { name: /grade d/i });
    fireEvent.click(gradeDBtn);

    expect(screen.getByText('Ouray Via Ferrata Gold Mountain')).toBeDefined();
    expect(screen.queryByText('Telluride Via Ferrata')).toBeNull();
    expect(screen.queryByText('Mount Olympus Iron Way Ridge')).toBeNull();
    expect(screen.queryByText('Whistler Peak West Ridge Via Ferrata')).toBeNull();
    expect(screen.queryByText('Mammoth Mountain Iron Crest Wall')).toBeNull();

    // Click Grade E filter button
    const gradeEBtn = screen.getByRole('button', { name: /grade e/i });
    fireEvent.click(gradeEBtn);

    expect(screen.getByText('Mammoth Mountain Iron Crest Wall')).toBeDefined();
    expect(screen.queryByText('Ouray Via Ferrata Gold Mountain')).toBeNull();

    // Click Grade B filter button
    const gradeBBtn = screen.getByRole('button', { name: /grade b/i });
    fireEvent.click(gradeBBtn);

    expect(screen.getByText('Mount Olympus Iron Way Ridge')).toBeDefined();
    expect(screen.getByText('Whistler Peak West Ridge Via Ferrata')).toBeDefined();
    expect(screen.queryByText('Mammoth Mountain Iron Crest Wall')).toBeNull();

    // Click All Routes
    const allBtn = screen.getByRole('button', { name: /all routes/i });
    fireEvent.click(allBtn);

    expect(screen.getByText('Telluride Via Ferrata')).toBeDefined();
    expect(screen.getByText('Mount Olympus Iron Way Ridge')).toBeDefined();
    expect(screen.getByText('Ouray Via Ferrata Gold Mountain')).toBeDefined();
  });

  it('updates fall-arrest rigging calculation reactively and renders status live region', () => {
    render(<ViaFerrataHub />);

    const liveStatus = screen.getByRole('status');
    expect(liveStatus).toBeDefined();
    expect(liveStatus.getAttribute('aria-live')).toBe('polite');

    const routeSelect = screen.getByLabelText(/select via ferrata route/i);
    const weightInput = screen.getByLabelText(/climber body weight/i);
    const backpackCheck = screen.getByLabelText(/heavy alpine backpack/i);
    const absorberSelect = screen.getByLabelText(/energy absorber type/i);
    const restLanyardCheck = screen.getByLabelText(/rest lanyard attached/i);

    // Initial state: Telluride, 75kg, no backpack, EN958 tearing webbing, rest lanyard attached (default or unchecked)
    fireEvent.change(routeSelect, { target: { value: 'telluride-via-ferrata' } });
    fireEvent.change(weightInput, { target: { value: '75' } });

    expect(liveStatus.textContent).toContain('75 kg');
    expect(liveStatus.textContent).toContain('4.2 kN');
    expect(liveStatus.textContent).toContain('Certified Compliant');

    // Toggle backpack (+10 kg)
    fireEvent.click(backpackCheck);
    expect(liveStatus.textContent).toContain('85 kg');
    expect(liveStatus.textContent).toContain('4.4 kN');

    // Switch to underweight climber (35 kg, without backpack)
    fireEvent.click(backpackCheck); // uncheck
    fireEvent.change(weightInput, { target: { value: '35' } });
    expect(liveStatus.textContent).toContain('35 kg');
    expect(liveStatus.textContent).toContain('Underweight Risk');
    expect(liveStatus.textContent).toContain('Warning: Top-Rope Backup Required');

    // Switch to legacy friction brake
    fireEvent.change(absorberSelect, { target: { value: 'friction_brake_legacy' } });
    expect(liveStatus.textContent).toContain('Outdated & Unsafe');
    expect(liveStatus.textContent).toContain('CRITICAL SAFETY HAZARD');

    // Restore tearing webbing and test rest lanyard toggle on Telluride
    fireEvent.change(absorberSelect, { target: { value: 'tearing_webbing_en958' } });
    fireEvent.change(weightInput, { target: { value: '75' } });
    // If rest lanyard is unchecked, should show advisory
    if ((restLanyardCheck as HTMLInputElement).checked) {
      fireEvent.click(restLanyardCheck);
    }
    expect(liveStatus.textContent).toContain('Rest lanyard strongly recommended');

    // Check rest lanyard
    fireEvent.click(restLanyardCheck);
    expect(liveStatus.textContent).toContain('Rest lanyard attached');
  });

  it('toggles checklist items and updates progress counter', () => {
    render(<ViaFerrataHub />);

    const counter = screen.getByTestId('ferrata-gear-counter');
    expect(counter.textContent).toBe('0 of 6 packed');

    const lanyardCheck = screen.getByLabelText(/EN 958:2017 Certified Y-Lanyard/i);
    fireEvent.click(lanyardCheck);
    expect(counter.textContent).toBe('1 of 6 packed');

    const carabinerCheck = screen.getByLabelText(/Dual Ergonomic Palm-Squeeze/i);
    fireEvent.click(carabinerCheck);
    expect(counter.textContent).toBe('2 of 6 packed');

    // Uncheck lanyard
    fireEvent.click(lanyardCheck);
    expect(counter.textContent).toBe('1 of 6 packed');
  });
});
