import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import FlyFishingHub from './fly-fishing-hub';

describe('FlyFishingHub', () => {
  it('renders all 3 required sections with heading level 2', () => {
    render(<FlyFishingHub />);

    const h2s = screen.getAllByRole('heading', { level: 2 });
    const headingsText = h2s.map((h) => h.textContent);

    expect(headingsText).toContain('Alpine & Freestone Angling Waters');
    expect(headingsText).toContain('Rod, Leader & Fly Match Advisor');
    expect(headingsText).toContain('Catch & Release Conservation Checklist');
  });

  it('renders initial fishing location cards with h3 headings', () => {
    render(<FlyFishingHub />);

    const watersGrid = screen.getByTestId('fishing-locations-grid');
    const h3s = within(watersGrid).getAllByRole('heading', { level: 3 });
    const cardTitles = h3s.map((h) => h.textContent);

    expect(cardTitles).toContain('Upper Yakima River Canyon');
    expect(cardTitles).toContain('Enchantments Crystal Tarns');
    expect(cardTitles).toContain('Lower Deschutes River');
    expect(cardTitles).toContain('Metolius River Springs');
    expect(cardTitles).toContain('Upper Snake River Headwaters');
  });

  it('filters fishing locations when water type filter pills are clicked', () => {
    render(<FlyFishingHub />);

    const watersGrid = screen.getByTestId('fishing-locations-grid');

    // Click Alpine Lake filter button
    const alpineBtn = screen.getByRole('button', { name: /filter by alpine lake/i });
    fireEvent.click(alpineBtn);

    // Enchantments should be visible
    expect(within(watersGrid).getByText('Enchantments Crystal Tarns')).toBeDefined();
    // Rivers should not be visible
    expect(within(watersGrid).queryByText('Upper Yakima River Canyon')).toBeNull();
    expect(within(watersGrid).queryByText('Lower Deschutes River')).toBeNull();

    // Click All Waters filter button
    const allBtn = screen.getByRole('button', { name: /filter by all waters/i });
    fireEvent.click(allBtn);

    expect(within(watersGrid).getByText('Upper Yakima River Canyon')).toBeDefined();
    expect(within(watersGrid).getByText('Enchantments Crystal Tarns')).toBeDefined();
  });

  it('updates live advisor results when inputs are changed and shows thermal warning for > 65°F', () => {
    render(<FlyFishingHub />);

    const locationSelect = screen.getByLabelText(/select fishing water/i);
    const tempInput = screen.getByLabelText(/water temperature/i);
    const timeSelect = screen.getByLabelText(/time of day/i);
    const surfaceSelect = screen.getByLabelText(/surface activity/i);

    // Initial state: default location, default 54°F, midday, rising
    const resultPanel = screen.getByTestId('angling-match-result');
    expect(resultPanel.getAttribute('role')).toBe('status');
    expect(resultPanel.getAttribute('aria-live')).toBe('polite');

    // Select Upper Yakima Canyon
    fireEvent.change(locationSelect, { target: { value: 'upper-yakima-canyon' } });
    expect(within(resultPanel).getByText(/Upper Yakima River Canyon/i)).toBeDefined();

    // Adjust temperature to 68°F (> 65°F)
    fireEvent.change(tempInput, { target: { value: '68' } });

    // Live panel should display Hoot Owl Alert
    expect(
      within(resultPanel).getByText(/Hoot Owl Alert: Water temperature exceeds 65°F/i)
    ).toBeDefined();

    // Change temperature back down to 52°F
    fireEvent.change(tempInput, { target: { value: '52' } });
    expect(
      within(resultPanel).queryByText(/Hoot Owl Alert: Water temperature exceeds 65°F/i)
    ).toBeNull();

    // Change time of day and surface activity
    fireEvent.change(timeSelect, { target: { value: 'evening' } });
    fireEvent.change(surfaceSelect, { target: { value: 'deep_pool' } });
    expect(within(resultPanel).getByText(/Conehead Woolly Bugger/i)).toBeDefined();
  });

  it('toggles checklist items and updates progress counter', () => {
    render(<FlyFishingHub />);

    const counter = screen.getByTestId('fly-fishing-gear-counter');
    expect(counter.textContent).toContain('0 of 6 packed');

    // Find and check the first item checkbox
    const netCheckbox = screen.getByLabelText(/knotless rubber mesh/i);
    fireEvent.click(netCheckbox);
    expect(counter.textContent).toContain('1 of 6 packed');

    // Check another item
    const forcepsCheckbox = screen.getByLabelText(/hemostats \/ forceps/i);
    fireEvent.click(forcepsCheckbox);
    expect(counter.textContent).toContain('2 of 6 packed');

    // Uncheck first item
    fireEvent.click(netCheckbox);
    expect(counter.textContent).toContain('1 of 6 packed');
  });

  it('ensures accessible form labels and controls', () => {
    render(<FlyFishingHub />);

    expect(screen.getByLabelText(/select fishing water/i)).toBeDefined();
    expect(screen.getByLabelText(/water temperature/i)).toBeDefined();
    expect(screen.getByLabelText(/time of day/i)).toBeDefined();
    expect(screen.getByLabelText(/surface activity/i)).toBeDefined();

    const gearCounter = screen.getByTestId('fly-fishing-gear-counter');
    expect(gearCounter).toBeDefined();
  });
});
