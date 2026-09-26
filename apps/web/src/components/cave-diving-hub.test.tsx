import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CaveDivingHub from './cave-diving-hub';

describe('CaveDivingHub component', () => {
  it('renders section headings (h2) and card headings (h3) without skipping levels', () => {
    render(<CaveDivingHub />);

    const h2s = screen.getAllByRole('heading', { level: 2 });
    expect(h2s.length).toBeGreaterThanOrEqual(3);

    const h3s = screen.getAllByRole('heading', { level: 3 });
    expect(h3s.length).toBe(5);
  });

  it('filters cave diving sites by rigging setup', () => {
    render(<CaveDivingHub />);

    expect(
      screen.getByRole('heading', { level: 3, name: 'Peacock Springs Karst Siphon & Grand Traverse' })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', { level: 3, name: "Devil's Eye & Ear Spring Trunk Conduit" })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', { level: 3, name: 'Lost Creek Siphon Sump Penetration' })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', { level: 3, name: 'Phantom Lake Cave Siphon Deep Conduit' })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', { level: 3, name: 'Smoky Mountain Tuckaleechee Siphon Resurgence' })
    ).toBeDefined();

    // Filter to Sidemount Dual Cylinder
    const sidemountBtn = screen.getByRole('button', { name: /^Sidemount Dual Cylinder$/i });
    fireEvent.click(sidemountBtn);

    expect(
      screen.getByRole('heading', { level: 3, name: 'Peacock Springs Karst Siphon & Grand Traverse' })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', { level: 3, name: 'Lost Creek Siphon Sump Penetration' })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', { level: 3, name: 'Smoky Mountain Tuckaleechee Siphon Resurgence' })
    ).toBeDefined();
    expect(
      screen.queryByRole('heading', { level: 3, name: "Devil's Eye & Ear Spring Trunk Conduit" })
    ).toBeNull();
    expect(
      screen.queryByRole('heading', { level: 3, name: 'Phantom Lake Cave Siphon Deep Conduit' })
    ).toBeNull();

    // Filter to Closed Circuit Rebreather (CCR)
    const ccrBtn = screen.getByRole('button', { name: /^Closed Circuit Rebreather \(CCR\)$/i });
    fireEvent.click(ccrBtn);

    expect(
      screen.getByRole('heading', { level: 3, name: 'Phantom Lake Cave Siphon Deep Conduit' })
    ).toBeDefined();
    expect(
      screen.queryByRole('heading', { level: 3, name: 'Peacock Springs Karst Siphon & Grand Traverse' })
    ).toBeNull();

    // Reset to All Riggings
    const allBtn = screen.getByRole('button', { name: /^All Riggings$/i });
    fireEvent.click(allBtn);

    expect(
      screen.getByRole('heading', { level: 3, name: 'Peacock Springs Karst Siphon & Grand Traverse' })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', { level: 3, name: 'Phantom Lake Cave Siphon Deep Conduit' })
    ).toBeDefined();
  });

  it('interactively calculates gas pressures, spools, and triggers safety alerts', () => {
    render(<CaveDivingHub />);

    const siteSelect = screen.getByLabelText(/select dive site/i);
    const flowSelect = screen.getByLabelText(/flow regime/i);
    const reserveSelect = screen.getByLabelText(/gas reserve rule/i);

    // Initial default check (Peacock Springs, static, rule of thirds, 3000 psi)
    const statusPanel = screen.getByRole('status');
    expect(statusPanel.textContent).toContain('2000 psi'); // Turn pressure
    expect(statusPanel.textContent).toContain('1000 psi'); // Usable gas
    expect(statusPanel.textContent).toContain('Nominal Safe Turn');

    // Switch to Lost Creek, Inflowing Siphon Suction, Rule of Thirds
    fireEvent.change(siteSelect, { target: { value: 'cholla-sump-lost-creek' } });
    fireEvent.change(flowSelect, { target: { value: 'inflowing_siphon_suction' } });
    fireEvent.change(reserveSelect, { target: { value: 'rule_of_thirds' } });

    expect(statusPanel.textContent).toContain('Critical Gas Reserve Alert');
    expect(statusPanel.textContent).toContain('Extreme Clay Zero Vis');

    // Switch reserve rule to Rule of Sixths
    fireEvent.change(reserveSelect, { target: { value: 'rule_of_sixths' } });
    expect(statusPanel.textContent).toContain('Nominal Safe Turn');
    expect(statusPanel.textContent).toContain('2500 psi'); // Turn pressure with rule of sixths
    expect(statusPanel.textContent).toContain('500 psi'); // Usable gas
  });

  it('tracks mandatory gear checklist packing progress', () => {
    render(<CaveDivingHub />);

    const counter = screen.getByTestId('cave-diving-gear-counter');
    expect(counter.textContent).toBe('0 of 6 packed');

    const reelCheck = screen.getByLabelText(/400ft Anodized Aluminum Primary Reel/i);
    fireEvent.click(reelCheck);
    expect(counter.textContent).toBe('1 of 6 packed');

    const lightsCheck = screen.getByLabelText(/1500-Lumen Primary Canister Light/i);
    fireEvent.click(lightsCheck);
    expect(counter.textContent).toBe('2 of 6 packed');

    fireEvent.click(reelCheck);
    expect(counter.textContent).toBe('1 of 6 packed');
  });
});
