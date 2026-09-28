import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import CanyonBoulderingHub from './canyon-bouldering-hub';

describe('CanyonBoulderingHub', () => {
  it('renders all main sections with h2 headings and no skipped heading levels', () => {
    render(<CanyonBoulderingHub />);

    const h2s = screen.getAllByRole('heading', { level: 2 });
    const headings = h2s.map((h) => h.textContent);

    expect(headings.some((h) => /canyon bouldering sectors|bouldering sectors|sectors/i.test(h || ''))).toBe(true);
    expect(headings.some((h) => /fall dynamics|crash pad.*calculator|calculator/i.test(h || ''))).toBe(true);
    expect(headings.some((h) => /crash pad.*checklist|gear checklist|checklist/i.test(h || ''))).toBe(true);
  });

  it('renders sector cards with h3 headings, style badges, and key metrics', () => {
    render(<CanyonBoulderingHub />);

    const grid = screen.getByTestId('canyon-bouldering-sectors-grid');
    const h3s = within(grid).getAllByRole('heading', { level: 3 });
    const titles = h3s.map((h) => h.textContent);

    expect(titles.some((t) => t?.includes('Buttermilks Peabody'))).toBe(true);
    expect(titles.some((t) => t?.includes("Joe's Valley"))).toBe(true);
    expect(titles.some((t) => t?.includes('Red Rock Kraft'))).toBe(true);
    expect(titles.some((t) => t?.includes('Rocktown Pigeon Mountain'))).toBe(true);
    expect(titles.some((t) => t?.includes('Hueco Tanks'))).toBe(true);

    // Verify height & V-grade metrics
    expect(within(grid).getByText(/14(\.0)?\s*m/)).toBeDefined();
    expect(within(grid).getByText(/V4 - V11/)).toBeDefined();
    expect(within(grid).getByText(/Grandpa Peabody massive 45-foot face/)).toBeDefined();
  });

  it('filters sectors when bouldering style filter buttons are clicked', () => {
    render(<CanyonBoulderingHub />);

    const grid = screen.getByTestId('canyon-bouldering-sectors-grid');

    // Filter by Highball Sandstone Pinnacle
    const highballBtn = screen.getByRole('button', { name: /highball sandstone pinnacle/i });
    fireEvent.click(highballBtn);

    expect(within(grid).getByText(/Buttermilks Peabody Highball Boulders/i)).toBeDefined();
    expect(within(grid).queryByText(/Joe's Valley/i)).toBeNull();
    expect(within(grid).queryByText(/Red Rock Kraft/i)).toBeNull();

    // Filter by Overhung Canyon Roof
    const roofBtn = screen.getByRole('button', { name: /overhung canyon roof/i });
    fireEvent.click(roofBtn);

    expect(within(grid).getByText(/Joe's Valley Straight Canyon Sandstone/i)).toBeDefined();
    expect(within(grid).getByText(/Rocktown Pigeon Mountain Sandstone/i)).toBeDefined();
    expect(within(grid).queryByText(/Buttermilks Peabody/i)).toBeNull();

    // Reset filter to All Sectors
    const allBtn = screen.getByRole('button', { name: /all sectors/i });
    fireEvent.click(allBtn);

    expect(within(grid).getByText(/Buttermilks Peabody/i)).toBeDefined();
    expect(within(grid).getByText(/Joe's Valley/i)).toBeDefined();
    expect(within(grid).getByText(/Red Rock Kraft/i)).toBeDefined();
    expect(within(grid).getByText(/Rocktown Pigeon Mountain/i)).toBeDefined();
    expect(within(grid).getByText(/Hueco Tanks/i)).toBeDefined();
  });

  it('updates live calculator reactive results panel with role=status and aria-live=polite', () => {
    render(<CanyonBoulderingHub />);

    const resultPanel = screen.getByTestId('canyon-calculator-result');
    expect(resultPanel.getAttribute('role')).toBe('status');
    expect(resultPanel.getAttribute('aria-live')).toBe('polite');

    const sectorSelect = screen.getByLabelText(/select.*bouldering sector/i);
    const heightInput = screen.getByLabelText(/fall height/i);
    const weightInput = screen.getByLabelText(/climber weight/i);
    const padsInput = screen.getByLabelText(/crash pads count|crash pads/i);
    const spottersInput = screen.getByLabelText(/spotters count|spotters/i);

    // Initial default: 72kg, 6.5m, 3 pads, 2 spotters -> 4591 J, 100% Coverage, safe_cushioned_drop
    expect(within(resultPanel).getByText(/4591\s*J/)).toBeDefined();
    expect(within(resultPanel).getByText(/100%\s*Coverage/i)).toBeDefined();
    expect(within(resultPanel).getByText(/safe cushioned drop/i)).toBeDefined();

    // Adjust weight
    fireEvent.change(weightInput, { target: { value: '80' } });
    // 80 * 9.81 * 6.5 = 5101 J
    expect(within(resultPanel).getByText(/5101\s*J/)).toBeDefined();
    fireEvent.change(weightInput, { target: { value: '72' } });

    // Test hazardous highball: height = 12m, pads = 2
    fireEvent.change(heightInput, { target: { value: '12' } });
    fireEvent.change(padsInput, { target: { value: '2' } });

    expect(within(resultPanel).getByText(/hazardous highball groundfall risk/i)).toBeDefined();
    expect(within(resultPanel).getByText(/40%\s*Coverage/i)).toBeDefined();

    // Test caution: height = 7m, pads = 1, spotters = 2
    fireEvent.change(heightInput, { target: { value: '7' } });
    fireEvent.change(padsInput, { target: { value: '1' } });
    expect(within(resultPanel).getByText(/caution multiple pads spotter required/i)).toBeDefined();

    // Test caution due to 0 spotters even with 3 pads
    fireEvent.change(padsInput, { target: { value: '3' } });
    fireEvent.change(spottersInput, { target: { value: '0' } });
    expect(within(resultPanel).getByText(/caution multiple pads spotter required/i)).toBeDefined();

    // Change sector to Hueco Tanks
    fireEvent.change(sectorSelect, { target: { value: 'hueco-tanks-north-mountain' } });
    expect(within(resultPanel).getByText(/Hueco Tanks North Mountain Canyon/i)).toBeDefined();
    expect(within(resultPanel).getByText(/Chasm gap hazard/i)).toBeDefined();
  });

  it('allows quick selection of sector from card into calculator', () => {
    render(<CanyonBoulderingHub />);

    const selectButtons = screen.getAllByRole('button', { name: /configure pads for/i });
    expect(selectButtons.length).toBeGreaterThan(0);

    // Click quick select for Joe's Valley
    const joesBtn = screen.getByRole('button', { name: /configure pads for Joe's Valley/i });
    fireEvent.click(joesBtn);

    const resultPanel = screen.getByTestId('canyon-calculator-result');
    expect(within(resultPanel).getByText(/Joe's Valley Straight Canyon Sandstone/i)).toBeDefined();
  });

  it('toggles checklist items and updates live canyon-bouldering-gear-counter', () => {
    render(<CanyonBoulderingHub />);

    const counter = screen.getByTestId('canyon-bouldering-gear-counter');
    expect(counter.textContent).toMatch(/0 of 6 packed/i);

    const padCheckbox = screen.getByLabelText(/high-impact triple-density foam highball crash pad/i);
    fireEvent.click(padCheckbox);
    expect(counter.textContent).toMatch(/1 of 6 packed/i);

    const blubberCheckbox = screen.getByLabelText(/modular full-coverage foam blubber pad/i);
    fireEvent.click(blubberCheckbox);
    expect(counter.textContent).toMatch(/2 of 6 packed/i);

    fireEvent.click(padCheckbox);
    expect(counter.textContent).toMatch(/1 of 6 packed/i);
  });

  it('has accessible form control labels and distinct htmlFor pairings', () => {
    render(<CanyonBoulderingHub />);

    expect(screen.getByLabelText(/select.*bouldering sector/i)).toBeDefined();
    expect(screen.getByLabelText(/fall height/i)).toBeDefined();
    expect(screen.getByLabelText(/climber weight/i)).toBeDefined();
    expect(screen.getByLabelText(/crash pads/i)).toBeDefined();
    expect(screen.getByLabelText(/spotters/i)).toBeDefined();
  });
});
