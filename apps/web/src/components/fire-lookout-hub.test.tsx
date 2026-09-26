import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import FireLookoutHub from './fire-lookout-hub';

describe('FireLookoutHub Component', () => {
  it('renders section headings (h2) and card headings (h3) without skipping heading levels', () => {
    render(<FireLookoutHub />);

    const h2Elements = screen.getAllByRole('heading', { level: 2 });
    expect(h2Elements.length).toBeGreaterThanOrEqual(3);

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Iconic Backcountry Fire Lookout Towers/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Osborne Sighting & Plume Triangulation Calculator/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Remote Lookout Observer Kit Checklist/i,
      })
    ).toBeDefined();

    const h3Elements = screen.getAllByRole('heading', { level: 3 });
    expect(h3Elements.length).toBeGreaterThanOrEqual(5);
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Winchester Mountain Lookout \(L-4 Cab\)/i,
      })
    ).toBeDefined();
  });

  it('filters towers using structure filter buttons', () => {
    render(<FireLookoutHub />);
    const list = screen.getByTestId('fire-lookout-towers-list');

    expect(within(list).getByText(/Winchester Mountain Lookout/i)).toBeDefined();
    expect(within(list).getByText(/Desolation Peak Fire Lookout/i)).toBeDefined();
    expect(within(list).getByText(/Mount Cammerer Octagonal Stone Lookout/i)).toBeDefined();
    expect(within(list).getByText(/Black Elk Peak Stone Tower/i)).toBeDefined();
    expect(within(list).getByText(/Sundance Mountain Steel Tower/i)).toBeDefined();

    // Filter by Steel Skeletal
    const steelBtn = screen.getByRole('button', { name: /^Steel Skeletal/i });
    fireEvent.click(steelBtn);

    expect(within(list).getByText(/Sundance Mountain Steel Tower/i)).toBeDefined();
    expect(within(list).queryByText(/Winchester Mountain Lookout/i)).toBeNull();
    expect(within(list).queryByText(/Mount Cammerer Octagonal Stone Lookout/i)).toBeNull();

    // Filter by Stone Cupola
    const stoneBtn = screen.getByRole('button', { name: /^Stone Cupola/i });
    fireEvent.click(stoneBtn);

    expect(within(list).getByText(/Mount Cammerer Octagonal Stone Lookout/i)).toBeDefined();
    expect(within(list).getByText(/Black Elk Peak Stone Tower/i)).toBeDefined();
    expect(within(list).queryByText(/Sundance Mountain Steel Tower/i)).toBeNull();

    // Filter by L-4 Cab
    const l4Btn = screen.getByRole('button', { name: /^L-4 Cab/i });
    fireEvent.click(l4Btn);

    expect(within(list).getByText(/Winchester Mountain Lookout/i)).toBeDefined();
    expect(within(list).getByText(/Desolation Peak Fire Lookout/i)).toBeDefined();
    expect(within(list).queryByText(/Black Elk Peak Stone Tower/i)).toBeNull();

    // Reset to All Towers
    const allBtn = screen.getByRole('button', { name: /^All Towers/i });
    fireEvent.click(allBtn);

    expect(within(list).getByText(/Winchester Mountain Lookout/i)).toBeDefined();
    expect(within(list).getByText(/Sundance Mountain Steel Tower/i)).toBeDefined();
  });

  it('updates live triangulation results reactively when query parameters change', () => {
    render(<FireLookoutHub />);

    const resultPanel = screen.getByTestId('fire-lookout-calculator-result');
    expect(resultPanel.getAttribute('role')).toBe('status');
    expect(resultPanel.getAttribute('aria-live')).toBe('polite');

    // Initial default: Winchester (id: winchester-mountain-lookout), azimuth 45, dist 15, vert -1.5, wispy, wind 12
    expect(resultPanel.textContent).toContain('45° (NE) | Dist: 15 km | Vert: -1.5°');
    expect(resultPanel.textContent).toContain('OBSERVATION WATCH');

    // Change azimuth to 180°
    const azimuthInput = screen.getByLabelText(/azimuth bearing/i);
    fireEvent.change(azimuthInput, { target: { value: '180' } });

    expect(resultPanel.textContent).toContain('180° (S)');
    expect(resultPanel.textContent).toContain('Osborne Triangulation: Sighting cross-bearing verified at 180°');

    // Change smoke behavior to pyrocumulus_pulsing
    const smokeSelect = screen.getByLabelText(/smoke behavior/i);
    fireEvent.change(smokeSelect, { target: { value: 'pyrocumulus_pulsing' } });

    expect(resultPanel.textContent).toContain('EXTREME BLOWUP EVACUATION');
    expect(resultPanel.textContent).toContain('95%');

    // Change wind speed to 45 mph
    const windInput = screen.getByLabelText(/wind speed/i);
    fireEvent.change(windInput, { target: { value: '45' } });

    expect(resultPanel.textContent).toContain('ACTIVE LIGHTNING STORM HAZARD');
  });

  it('manages remote observer kit checklist and updates gear counter accurately', () => {
    render(<FireLookoutHub />);

    const counter = screen.getByTestId('fire-lookout-gear-counter');
    expect(counter.textContent).toBe('0 of 6 packed');

    const alidadeCheckbox = screen.getByLabelText(/Brass Osborne Fire Finder Peep Sights/i);
    const binocularsCheckbox = screen.getByLabelText(/10x50 Waterproof ED High-Transmission Spotting Binoculars/i);

    fireEvent.click(alidadeCheckbox);
    expect(counter.textContent).toBe('1 of 6 packed');

    fireEvent.click(binocularsCheckbox);
    expect(counter.textContent).toBe('2 of 6 packed');

    fireEvent.click(alidadeCheckbox);
    expect(counter.textContent).toBe('1 of 6 packed');
  });
});
