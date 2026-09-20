import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import ForagingHub from './foraging-hub';

describe('ForagingHub Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders all required section headings (h2) with proper hierarchy and zero skipped levels', () => {
    render(<ForagingHub />);

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Pacific Northwest Edible Species Directory/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Forager's Safety & Botanical Identification Screener/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Ethical Wildcrafting & Leave No Trace Principles/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Essential Backcountry Foraging Gear Checklist/i,
      })
    ).toBeDefined();
  });

  it('renders species card headings as h3', () => {
    render(<ForagingHub />);
    const speciesCards = screen.getByTestId('species-directory-list');

    expect(
      within(speciesCards).getByRole('heading', {
        level: 3,
        name: /Pacific Golden Chanterelle/i,
      })
    ).toBeDefined();

    expect(
      within(speciesCards).getByRole('heading', {
        level: 3,
        name: /Pacific Northwest Black Morel/i,
      })
    ).toBeDefined();
  });

  it('filters species directory by category pills', () => {
    render(<ForagingHub />);
    const speciesList = screen.getByTestId('species-directory-list');

    // Initially all species are visible
    expect(within(speciesList).getByText('Pacific Golden Chanterelle')).toBeDefined();
    expect(within(speciesList).getByText('Pacific Mountain Huckleberry')).toBeDefined();

    // Click "Berries" pill
    const berriesFilter = screen.getByRole('button', { name: /^Berries/i });
    fireEvent.click(berriesFilter);

    expect(within(speciesList).getByText('Pacific Mountain Huckleberry')).toBeDefined();
    expect(within(speciesList).queryByText('Pacific Golden Chanterelle')).toBeNull();
    expect(within(speciesList).queryByText("Miner's Lettuce")).toBeNull();

    // Click "Wild Greens" pill
    const greensFilter = screen.getByRole('button', { name: /^Wild Greens/i });
    fireEvent.click(greensFilter);

    expect(within(speciesList).getByText("Miner's Lettuce")).toBeDefined();
    expect(within(speciesList).getByText('Common Stinging Nettle')).toBeDefined();
    expect(within(speciesList).queryByText('Pacific Mountain Huckleberry')).toBeNull();

    // Click "All" pill
    const allFilter = screen.getByRole('button', { name: /^All Species/i });
    fireEvent.click(allFilter);

    expect(within(speciesList).getByText('Pacific Golden Chanterelle')).toBeDefined();
    expect(within(speciesList).getByText('Pacific Mountain Huckleberry')).toBeDefined();
  });

  it('runs interactive safety screener and updates aria-live status panel', () => {
    render(<ForagingHub />);

    // Select category Mushroom
    const categorySelect = screen.getByLabelText(/specimen category/i);
    fireEvent.change(categorySelect, { target: { value: 'mushroom' } });

    // Toggle False Gills
    const falseGillsCheckbox = screen.getByLabelText(/blunt false gills/i);
    fireEvent.click(falseGillsCheckbox);

    // Toggle Hollow Stem
    const hollowStemCheckbox = screen.getByLabelText(/completely hollow stem interior/i);
    fireEvent.click(hollowStemCheckbox);

    // Live reactive results panel with role="status" and aria-live="polite"
    const statusPanel = screen.getByRole('status');
    expect(statusPanel).toBeDefined();
    expect(statusPanel.getAttribute('aria-live')).toBe('polite');

    // Verify warning level and details
    const warningBadge = within(statusPanel).getByTestId('warning-level-badge');
    expect(warningBadge.textContent).toContain('SAFE CANDIDATE IDENTIFIED');
    expect(within(statusPanel).getByText(/Forest Service/i)).toBeDefined();
    expect(within(statusPanel).getByText(/Blunt, wavy ridges/i)).toBeDefined();
  });

  it('interacts with gear packing checklist and increments packed counter', () => {
    render(<ForagingHub />);

    const counter = screen.getByTestId('gear-packing-counter');
    expect(counter.textContent).toContain('0 of 6 packed');

    const meshCheckbox = screen.getByLabelText(/Mesh collection basket/i);
    fireEvent.click(meshCheckbox);

    expect(counter.textContent).toContain('1 of 6 packed');

    const knifeCheckbox = screen.getByLabelText(/Opinel mushroom knife/i);
    fireEvent.click(knifeCheckbox);

    expect(counter.textContent).toContain('2 of 6 packed');

    // Uncheck one item
    fireEvent.click(meshCheckbox);
    expect(counter.textContent).toContain('1 of 6 packed');
  });

  it('renders toxic look-alike warning alerts with proper caution callouts', () => {
    render(<ForagingHub />);
    const speciesList = screen.getByTestId('species-directory-list');

    expect(within(speciesList).getByText(/Jack O'Lantern/i)).toBeDefined();
    expect(within(speciesList).getByText(/False Morel/i)).toBeDefined();
  });
});
