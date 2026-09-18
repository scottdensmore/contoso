import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TrailChecklist from './trail-checklist';
import { TRAILS } from '../lib/trails';

describe('TrailChecklist component', () => {
  it('renders activity and season selectors and progress bar initially at 0%', () => {
    render(<TrailChecklist />);

    expect(screen.getByLabelText(/activity/i)).toBeDefined();
    expect(screen.getByLabelText(/season/i)).toBeDefined();

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeDefined();
    expect(progressBar.getAttribute('aria-valuenow')).toBe('0');
    expect(progressBar.getAttribute('aria-valuemin')).toBe('0');
    expect(progressBar.getAttribute('aria-valuemax')).toBe('100');
    expect(screen.getByText(/0 of \d+ items packed \(0%\)/i)).toBeDefined();
  });

  it('allows changing activity and season and refreshes the items list', () => {
    render(<TrailChecklist />);

    const activitySelect = screen.getByLabelText(/activity/i) as HTMLSelectElement;
    fireEvent.change(activitySelect, { target: { value: 'alpine-snow' } });
    expect(activitySelect.value).toBe('alpine-snow');

    expect(screen.getByText(/Alpine Snowshoes & Steel Crampons/i)).toBeDefined();
    expect(screen.getByText(/Technical Mountaineering Ice Axe/i)).toBeDefined();

    const seasonSelect = screen.getByLabelText(/season/i) as HTMLSelectElement;
    fireEvent.change(seasonSelect, { target: { value: 'winter' } });
    expect(seasonSelect.value).toBe('winter');

    expect(screen.getByText(/Heavyweight Thermal Insulation Fleece/i)).toBeDefined();
  });

  it('updates progress bar and live announcement when toggling checkboxes', () => {
    render(<TrailChecklist />);

    const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
    expect(checkboxes.length).toBeGreaterThan(0);

    // Initial check
    expect(checkboxes[0].checked).toBe(false);

    fireEvent.click(checkboxes[0]);
    expect(checkboxes[0].checked).toBe(true);

    const progressBar = screen.getByRole('progressbar');
    const valueNow = Number(progressBar.getAttribute('aria-valuenow'));
    expect(valueNow).toBeGreaterThan(0);

    // Check screen reader live announcement
    const liveRegion = screen.getByRole('status');
    expect(liveRegion.getAttribute('aria-live')).toBe('polite');
    expect(liveRegion.textContent?.toLowerCase()).toContain('packed');

    // Uncheck item
    fireEvent.click(checkboxes[0]);
    expect(checkboxes[0].checked).toBe(false);
    expect(progressBar.getAttribute('aria-valuenow')).toBe('0');
    expect(liveRegion.textContent?.toLowerCase()).toContain('unpacked');
  });

  it('resets all checked items when clicking the Reset Checklist button', () => {
    render(<TrailChecklist />);

    const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);
    expect(checkboxes[0].checked).toBe(true);
    expect(checkboxes[1].checked).toBe(true);

    const resetBtn = screen.getByRole('button', { name: /reset checklist/i });
    fireEvent.click(resetBtn);

    expect(checkboxes[0].checked).toBe(false);
    expect(checkboxes[1].checked).toBe(false);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar.getAttribute('aria-valuenow')).toBe('0');
  });

  it('displays category badges and Essential badges for items', () => {
    render(<TrailChecklist />);

    const essentialBadges = screen.getAllByText(/essential/i);
    expect(essentialBadges.length).toBeGreaterThan(0);
  });

  it('displays selected trail details and highlights trail-specific essential gear when a trail is passed', () => {
    const trail = TRAILS[0]; // Rattlesnake Ridge
    render(<TrailChecklist selectedTrail={trail} />);

    expect(screen.getByText(/Selected Trail: Rattlesnake Ridge Trail/i)).toBeDefined();
    for (const gear of trail.essentialGear) {
      const matching = screen.getAllByText(new RegExp(gear, 'i'));
      expect(matching.length).toBeGreaterThan(0);
    }
  });
});
