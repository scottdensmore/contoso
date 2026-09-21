import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MountaineeringHub from './mountaineering-hub';

describe('MountaineeringHub component', () => {
  it('renders required h2 section headings and h3 card headings without skipped levels', () => {
    render(<MountaineeringHub />);

    const h2s = screen.getAllByRole('heading', { level: 2 });
    expect(h2s.length).toBeGreaterThanOrEqual(3);

    const h3s = screen.getAllByRole('heading', { level: 3 });
    expect(h3s.length).toBe(5); // 5 iconic peak cards

    // Check specific h2 section headings
    const h2Texts = h2s.map((h) => h.textContent);
    expect(h2Texts.some((t) => t?.includes('Iconic Glaciated Peaks & Technical Routes'))).toBe(true);
    expect(h2Texts.some((t) => t?.includes('Rope Team Spacing & Crevasse Rescue Calculator'))).toBe(true);
    expect(h2Texts.some((t) => t?.includes('Mandatory Technical Glacier Kit Checklist'))).toBe(true);
  });

  it('filters routes when grade buttons are clicked', () => {
    render(<MountaineeringHub />);

    // Initially all 5 routes present
    expect(screen.getByText('Disappointment Cleaver')).toBeDefined();
    expect(screen.getByText('Coleman-Deming Glacier')).toBeDefined();
    expect(screen.getByText('Avalanche Gulch & Clear Creek')).toBeDefined();
    expect(screen.getByText('South Side via Pearly Gates / Old Chute')).toBeDefined();
    expect(screen.getByText('Blue Glacier via Hoh River')).toBeDefined();

    // Click Grade III filter button
    const grade3Btn = screen.getByRole('button', { name: /grade iii/i });
    fireEvent.click(grade3Btn);

    expect(screen.getByText('Disappointment Cleaver')).toBeDefined();
    expect(screen.queryByText('Coleman-Deming Glacier')).toBeNull();
    expect(screen.queryByText('Blue Glacier via Hoh River')).toBeNull();

    // Click Grade IV filter button
    const grade4Btn = screen.getByRole('button', { name: /grade iv/i });
    fireEvent.click(grade4Btn);

    expect(screen.getByText('Blue Glacier via Hoh River')).toBeDefined();
    expect(screen.queryByText('Disappointment Cleaver')).toBeNull();

    // Click All Routes
    const allBtn = screen.getByRole('button', { name: /all routes/i });
    fireEvent.click(allBtn);

    expect(screen.getByText('Disappointment Cleaver')).toBeDefined();
    expect(screen.getByText('Coleman-Deming Glacier')).toBeDefined();
  });

  it('updates rope team calculation reactively and renders status live region', () => {
    render(<MountaineeringHub />);

    const liveStatus = screen.getByRole('status');
    expect(liveStatus).toBeDefined();
    expect(liveStatus.getAttribute('aria-live')).toBe('polite');

    // Find route select, team members input, snowpack select
    const routeSelect = screen.getByLabelText(/select glaciated route/i);
    const teamInput = screen.getByLabelText(/team members count/i);
    const snowpackSelect = screen.getByLabelText(/snowpack firmness/i);

    // Select Mount Baker
    fireEvent.change(routeSelect, { target: { value: 'baker-coleman-deming' } });

    // Set team size to 2
    fireEvent.change(teamInput, { target: { value: '2' } });

    // Live status should show brake knots recommended and 2-person spacing
    expect(liveStatus.textContent).toContain('14m');
    expect(liveStatus.textContent).toContain('Brake Knots: Required');

    // Change to soft wet spring snow
    fireEvent.change(snowpackSelect, { target: { value: 'soft_wet_spring' } });
    expect(liveStatus.textContent).toContain('16m'); // 14 + 2m
    expect(liveStatus.textContent).toContain('Brake Knots: Required');
  });

  it('toggles checklist items and updates progress counter', () => {
    render(<MountaineeringHub />);

    const counter = screen.getByTestId('mountaineering-gear-counter');
    expect(counter.textContent).toBe('0 of 6 packed');

    const iceAxeCheckbox = screen.getByLabelText(/ice axe/i);
    fireEvent.click(iceAxeCheckbox);

    expect(counter.textContent).toBe('1 of 6 packed');

    const cramponsCheckbox = screen.getByLabelText(/crampons/i);
    fireEvent.click(cramponsCheckbox);

    expect(counter.textContent).toBe('2 of 6 packed');

    // Uncheck ice axe
    fireEvent.click(iceAxeCheckbox);
    expect(counter.textContent).toBe('1 of 6 packed');
  });
});
