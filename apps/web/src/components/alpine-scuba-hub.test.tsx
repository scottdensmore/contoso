import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AlpineScubaHub from './alpine-scuba-hub';

describe('AlpineScubaHub component', () => {
  it('renders required h2 section headings and h3 card headings without skipped levels', () => {
    render(<AlpineScubaHub />);

    const h2s = screen.getAllByRole('heading', { level: 2 });
    expect(h2s.length).toBeGreaterThanOrEqual(3);

    const h3s = screen.getAllByRole('heading', { level: 3 });
    expect(h3s.length).toBe(5); // 5 iconic dive site cards

    const h2Texts = h2s.map((h) => h.textContent);
    expect(
      h2Texts.some((t) => t?.includes('Iconic High-Altitude & Alpine Ice Diving Sites'))
    ).toBe(true);
    expect(
      h2Texts.some((t) => t?.includes('High-Altitude Decompression & Cold Water Calculator'))
    ).toBe(true);
    expect(
      h2Texts.some((t) => t?.includes('Mandatory Cold Water & Ice Safety Checklist'))
    ).toBe(true);
  });

  it('filters sites when water type buttons are clicked', () => {
    render(<AlpineScubaHub />);

    // Initially all 5 sites are displayed
    expect(screen.getByRole('heading', { level: 3, name: /Rubicon Wall & Emerald Bay/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Wizard Island & Cleetwood Cove/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Emerald Lake & Burgess Shale/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Lac aux Américains Glacial Cirque/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Homestake Reservoir & Gold Dredge/i })).toBeDefined();

    // Click Glacial Melt Ice filter
    const glacialBtn = screen.getByRole('button', { name: /glacial melt ice/i });
    fireEvent.click(glacialBtn);

    expect(screen.getByRole('heading', { level: 3, name: /Emerald Lake & Burgess Shale/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Lac aux Américains Glacial Cirque/i })).toBeDefined();
    expect(screen.queryByRole('heading', { level: 3, name: /Rubicon Wall & Emerald Bay/i })).toBeNull();
    expect(screen.queryByRole('heading', { level: 3, name: /Wizard Island & Cleetwood Cove/i })).toBeNull();
    expect(screen.queryByRole('heading', { level: 3, name: /Homestake Reservoir & Gold Dredge/i })).toBeNull();

    // Click Freshwater Alpine filter
    const freshwaterBtn = screen.getByRole('button', { name: /freshwater alpine/i });
    fireEvent.click(freshwaterBtn);

    expect(screen.getByRole('heading', { level: 3, name: /Rubicon Wall & Emerald Bay/i })).toBeDefined();
    expect(screen.queryByRole('heading', { level: 3, name: /Emerald Lake & Burgess Shale/i })).toBeNull();

    // Click High-Elevation Crater filter
    const craterBtn = screen.getByRole('button', { name: /high-elevation crater/i });
    fireEvent.click(craterBtn);

    expect(screen.getByRole('heading', { level: 3, name: /Wizard Island & Cleetwood Cove/i })).toBeDefined();
    expect(screen.queryByRole('heading', { level: 3, name: /Rubicon Wall & Emerald Bay/i })).toBeNull();

    // Click Alpine Quarry filter
    const quarryBtn = screen.getByRole('button', { name: /alpine quarry/i });
    fireEvent.click(quarryBtn);

    expect(screen.getByRole('heading', { level: 3, name: /Homestake Reservoir & Gold Dredge/i })).toBeDefined();
    expect(screen.queryByRole('heading', { level: 3, name: /Wizard Island & Cleetwood Cove/i })).toBeNull();

    // Click All Sites
    const allBtn = screen.getByRole('button', { name: /all sites/i });
    fireEvent.click(allBtn);

    expect(screen.getByRole('heading', { level: 3, name: /Rubicon Wall & Emerald Bay/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Emerald Lake & Burgess Shale/i })).toBeDefined();
  });

  it('updates decompression & cold water calculation reactively with accessible live region', () => {
    render(<AlpineScubaHub />);

    const liveStatus = screen.getByRole('status');
    expect(liveStatus).toBeDefined();
    expect(liveStatus.getAttribute('aria-live')).toBe('polite');

    const siteSelect = screen.getByLabelText(/select dive site/i);
    const depthInput = screen.getByLabelText(/target dive depth/i);
    const bottomTimeInput = screen.getByLabelText(/bottom time/i);
    const waterTempInput = screen.getByLabelText(/water temperature/i);

    // Select Lake Tahoe
    fireEvent.change(siteSelect, { target: { value: 'lake-tahoe-rubicon-wall' } });
    fireEvent.change(depthInput, { target: { value: '30' } });
    fireEvent.change(bottomTimeInput, { target: { value: '25' } });
    fireEvent.change(waterTempInput, { target: { value: '1' } });

    expect(liveStatus.textContent).toContain('Rubicon Wall & Emerald Bay');
    expect(liveStatus.textContent).toContain('0.8 bar');
    expect(liveStatus.textContent).toContain('37.5 m');
    expect(liveStatus.textContent).toContain('7 min');
    expect(liveStatus.textContent?.toLowerCase()).toContain('decompression required');
    expect(liveStatus.textContent?.toLowerCase()).toContain('critical');
    expect(liveStatus.textContent).toContain('24 hours');
  });

  it('toggles checklist items and updates progress counter', () => {
    render(<AlpineScubaHub />);

    const counter = screen.getByTestId('alpine-scuba-gear-counter');
    expect(counter.textContent).toBe('0 of 6 packed');

    const regulatorCheckbox = screen.getByLabelText(/Dual Balanced Diaphragm Coldwater Regulators/i);
    fireEvent.click(regulatorCheckbox);
    expect(counter.textContent).toBe('1 of 6 packed');

    const drysuitCheckbox = screen.getByLabelText(/Kevlar-Reinforced Crushed Neoprene Drysuit/i);
    fireEvent.click(drysuitCheckbox);
    expect(counter.textContent).toBe('2 of 6 packed');

    // Uncheck regulator
    fireEvent.click(regulatorCheckbox);
    expect(counter.textContent).toBe('1 of 6 packed');
  });
});
