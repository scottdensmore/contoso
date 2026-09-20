import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import TrailRunningHub from './trail-running-hub';

describe('TrailRunningHub Component', () => {
  it('renders all required section headings with correct h2 hierarchy', () => {
    render(<TrailRunningHub />);

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Pacific Northwest & Rocky Mountain Trail Runs/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Ultra Pacing & Fuel Calculator/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Mandatory Mountain Ultra Kit Checklist/i,
      })
    ).toBeDefined();
  });

  it('renders route cards with h3 headings, stats, badges, and footwear specs', () => {
    render(<TrailRunningHub />);

    expect(screen.getByRole('heading', { level: 3, name: /The Enchantments Thru-Run/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Timberline Trail Around Mt. Hood/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Wonderland Trail Fastpack/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Mount Si to Mailbox Peak Double Vert/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Olympic Wilderness Coast Tide Run/i })).toBeDefined();

    // Verify badges and specs for Timberline Trail
    expect(screen.getByText(/Drop: 6mm \| Lugs: 4.5mm/i)).toBeDefined();
    expect(screen.getByText(/\+9,000' \/ -9,000'/i)).toBeDefined();
    expect(screen.getByText(/Fast Time: 8.5h/i)).toBeDefined();
    expect(screen.getByText(/10 Refill Points/i)).toBeDefined();
  });

  it('filters route catalog cards using filter pills', () => {
    render(<TrailRunningHub />);

    const highMountainPill = screen.getByRole('button', { name: /^High Mountain$/i });
    fireEvent.click(highMountainPill);

    expect(screen.getByRole('heading', { level: 3, name: /Wonderland Trail Fastpack/i })).toBeDefined();
    expect(screen.queryByRole('heading', { level: 3, name: /The Enchantments Thru-Run/i })).toBeNull();
    expect(screen.queryByRole('heading', { level: 3, name: /Timberline Trail Around Mt. Hood/i })).toBeNull();

    // Switch to Severe Technical
    const severePill = screen.getByRole('button', { name: /^Severe Technical$/i });
    fireEvent.click(severePill);

    expect(screen.getByRole('heading', { level: 3, name: /The Enchantments Thru-Run/i })).toBeDefined();
    expect(screen.queryByRole('heading', { level: 3, name: /Wonderland Trail Fastpack/i })).toBeNull();

    // Reset to All Routes
    const allPill = screen.getByRole('button', { name: /^All Routes$/i });
    fireEvent.click(allPill);

    expect(screen.getByRole('heading', { level: 3, name: /The Enchantments Thru-Run/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Timberline Trail Around Mt. Hood/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Wonderland Trail Fastpack/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Mount Si to Mailbox Peak Double Vert/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Olympic Wilderness Coast Tide Run/i })).toBeDefined();
  });

  it('calculates pacing and nutrition reactively when inputs change', () => {
    render(<TrailRunningHub />);

    const routeSelect = screen.getByLabelText(/Select Mountain Route/i);
    const paceInput = screen.getByLabelText(/Target Pace \(min\/mile\)/i);
    const weightInput = screen.getByLabelText(/Runner Weight \(lbs\)/i);
    const tempInput = screen.getByLabelText(/Ambient Temperature \(°F\)/i);

    // Initial check on status region
    const statusRegion = screen.getByRole('status');
    expect(statusRegion).toBeDefined();

    // Select Timberline Trail
    fireEvent.change(routeSelect, { target: { value: 'timberline-trail-ultra' } });
    fireEvent.change(paceInput, { target: { value: '12.0' } });
    fireEvent.change(weightInput, { target: { value: '150' } });
    fireEvent.change(tempInput, { target: { value: '65' } });

    // Verify initial calculation text in status region
    expect(within(statusRegion).getAllByText(/9.8 hrs/i).length).toBeGreaterThan(0);
    expect(within(statusRegion).getByText(/6548 kcal/i)).toBeDefined();
    expect(within(statusRegion).getByText(/70 g\/hr/i)).toBeDefined();
    expect(within(statusRegion).getByText(/6.1 L/i)).toBeDefined();
    expect(within(statusRegion).getByText(/490 mg\/hr/i)).toBeDefined();
    expect(within(statusRegion).getByText(/1.5 L/i)).toBeDefined();

    // Change target pace to faster 10.0 min/mile
    fireEvent.change(paceInput, { target: { value: '10.0' } });

    // Estimated time should decrease (40.2*10 + 108 = 510 min = 8.5 hrs)
    expect(within(statusRegion).getAllByText(/8.5 hrs/i).length).toBeGreaterThan(0);
  });

  it('tracks gear packing progress with live counter and checkboxes', () => {
    render(<TrailRunningHub />);

    const counter = screen.getByTestId('trail-running-gear-counter');
    expect(counter.textContent).toBe('0 of 6 packed');

    const vestCheck = screen.getByLabelText(/Hydration vest/i);
    const bivyCheck = screen.getByLabelText(/Ultralight emergency bivy/i);
    const microspikesCheck = screen.getByLabelText(/Running microspikes/i);

    expect(vestCheck).not.toBeChecked();
    fireEvent.click(vestCheck);
    expect(vestCheck).toBeChecked();
    expect(counter.textContent).toBe('1 of 6 packed');

    fireEvent.click(bivyCheck);
    fireEvent.click(microspikesCheck);
    expect(counter.textContent).toBe('3 of 6 packed');

    // Uncheck one
    fireEvent.click(bivyCheck);
    expect(counter.textContent).toBe('2 of 6 packed');
  });
});
