import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import FireSafetyHub from './fire-safety-hub';

describe('FireSafetyHub Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders all required section headings and LNT guidelines', () => {
    render(<FireSafetyHub />);

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Pacific Northwest Fire Zones & Danger Ratings/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Interactive Stove & Flame Compliance Checker/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Leave No Trace Campfire Guidelines & Etiquette/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Report Smoke, Hazard, or Unattended Campfire/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Recent Hazard & Incident Reports/i,
      })
    ).toBeDefined();

    // Verify LNT guidelines content
    expect(screen.getByText(/Drown-Stir-Feel Cold Test/i)).toBeDefined();
    expect(screen.getByText(/Wrist-Thick Rule/i)).toBeDefined();
    expect(screen.getByText(/Mound Fire Technique/i)).toBeDefined();
    expect(screen.getByText(/Campfire Permit Requirements/i)).toBeDefined();
  });

  it('filters zones by region pill buttons', () => {
    render(<FireSafetyHub />);
    const list = screen.getByTestId('fire-zones-list');

    // Initially all 5 zones appear
    expect(within(list).getByText(/Alpine Lakes Wilderness/i)).toBeDefined();
    expect(within(list).getByText(/Mount Rainier National Park/i)).toBeDefined();
    expect(within(list).getByText(/Olympic National Park Backcountry/i)).toBeDefined();

    // Filter by Cascades
    const cascadesPill = screen.getByRole('button', { name: /^Cascades/i });
    fireEvent.click(cascadesPill);

    expect(within(list).getByText(/Alpine Lakes Wilderness/i)).toBeDefined();
    expect(within(list).getByText(/Mount Baker-Snoqualmie National Forest/i)).toBeDefined();
    expect(within(list).queryByText(/Mount Rainier National Park/i)).toBeNull();
    expect(within(list).queryByText(/Olympic National Park Backcountry/i)).toBeNull();

    // Filter by Rainier
    const rainierPill = screen.getByRole('button', { name: /^Rainier/i });
    fireEvent.click(rainierPill);

    expect(within(list).getByText(/Mount Rainier National Park/i)).toBeDefined();
    expect(within(list).queryByText(/Alpine Lakes Wilderness/i)).toBeNull();

    // Reset to All
    const allPill = screen.getByRole('button', { name: /^All Regions/i });
    fireEvent.click(allPill);
    expect(within(list).getByText(/Alpine Lakes Wilderness/i)).toBeDefined();
    expect(within(list).getByText(/Olympic National Park Backcountry/i)).toBeDefined();
  });

  it('checks stove compliance dynamically with live PERMITTED and PROHIBITED feedback', () => {
    render(<FireSafetyHub />);

    const zoneSelect = screen.getByLabelText(/select wilderness zone/i);
    const stoveSelect = screen.getByLabelText(/select stove or flame type/i);

    // Select Alpine Lakes Wilderness and Alcohol Stove
    fireEvent.change(zoneSelect, { target: { value: 'alpine-lakes-wilderness' } });
    fireEvent.change(stoveSelect, { target: { value: 'alcohol_stove' } });

    const checkerResult = screen.getByTestId('stove-check-result');
    const badge = within(checkerResult).getByTestId('stove-compliance-badge');
    expect(badge.textContent).toBe('PROHIBITED');
    expect(checkerResult.textContent).toContain('prohibited');

    // Select Canister Stove with shutoff
    fireEvent.change(stoveSelect, { target: { value: 'canister_with_shutoff' } });
    expect(within(checkerResult).getByTestId('stove-compliance-badge').textContent).toBe('PERMITTED');
    expect(checkerResult.textContent).toContain('permitted');
  });

  it('preselects zone in stove checker when clicking "Check Stoves" on a zone card', () => {
    render(<FireSafetyHub />);

    const checkButtons = screen.getAllByRole('button', { name: /check stove rules/i });
    fireEvent.click(checkButtons[1]); // e.g. Mount Rainier

    const zoneSelect = screen.getByLabelText(/select wilderness zone/i) as HTMLSelectElement;
    expect(zoneSelect.value).toBe('mount-rainier-national-park');
  });

  it('validates required fields on fire report form', () => {
    render(<FireSafetyHub />);

    const submitBtn = screen.getByRole('button', { name: /submit hazard report/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/location description is required/i)).toBeDefined();
  });

  it('submits a fire hazard report and updates the live confirmation banner and reports feed', () => {
    render(<FireSafetyHub />);

    fireEvent.change(screen.getByLabelText(/incident zone/i), {
      target: { value: 'alpine-lakes-wilderness' },
    });
    fireEvent.change(screen.getByLabelText(/hazard report type/i), {
      target: { value: 'smoke_sighting' },
    });
    fireEvent.change(screen.getByLabelText(/specific location description/i), {
      target: { value: 'Near Robin Lakes ridge, visible white smoke plume rising' },
    });

    const submitBtn = screen.getByRole('button', { name: /submit hazard report/i });
    fireEvent.click(submitBtn);

    // Live confirmation banner
    const statusBanner = screen.getByRole('status');
    expect(statusBanner.textContent).toContain('Report Submitted Successfully');
    expect(statusBanner.textContent).toMatch(/FIR-\d{5}/);

    // Check feed
    const feed = screen.getByTestId('recent-reports-feed');
    expect(feed.textContent).toMatch(/FIR-\d{5}/);
    expect(feed.textContent).toContain('Near Robin Lakes ridge, visible white smoke plume rising');
  });
});
