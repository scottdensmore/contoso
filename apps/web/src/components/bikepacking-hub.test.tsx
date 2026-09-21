import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import BikepackingHub from './bikepacking-hub';

describe('BikepackingHub Component', () => {
  it('renders all required h2 section headings and h3 card headings without skipping levels', () => {
    render(<BikepackingHub />);

    // Check h2 section headings
    const h2Elements = screen.getAllByRole('heading', { level: 2 });
    expect(h2Elements.length).toBeGreaterThanOrEqual(3);

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Iconic Wilderness Bikepacking Routes/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Interactive Rig & Bag Capacity Calculator/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Mandatory Trailside Repair & Gear Checklist/i,
      })
    ).toBeDefined();

    // Check h3 card headings for routes
    const h3Elements = screen.getAllByRole('heading', { level: 3 });
    expect(h3Elements.length).toBeGreaterThanOrEqual(5);
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Cross-Washington Mountain Bike Route \(XWA\)/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Oregon Outback Gravel Epic/i,
      })
    ).toBeDefined();
  });

  it('filters routes correctly using terrain category filter buttons', () => {
    render(<BikepackingHub />);
    const routesContainer = screen.getByTestId('bikepacking-routes-grid');

    // Initially displays all 5 routes
    expect(
      within(routesContainer).getByText(/Cross-Washington Mountain Bike Route \(XWA\)/i)
    ).toBeDefined();
    expect(
      within(routesContainer).getByText(/Oregon Outback Gravel Epic/i)
    ).toBeDefined();
    expect(
      within(routesContainer).getByText(/Olympic Discovery & Adventure Singletrack/i)
    ).toBeDefined();

    // Filter by "Rugged Singletrack"
    const singletrackBtn = screen.getByRole('button', {
      name: /^Rugged Singletrack/i,
    });
    fireEvent.click(singletrackBtn);

    // Only Olympic Adventure Trail should remain
    expect(
      within(routesContainer).getByText(/Olympic Discovery & Adventure Singletrack/i)
    ).toBeDefined();
    expect(
      within(routesContainer).queryByText(/Oregon Outback Gravel Epic/i)
    ).toBeNull();
    expect(
      within(routesContainer).queryByText(/Cross-Washington Mountain Bike Route \(XWA\)/i)
    ).toBeNull();

    // Filter by "All Routes"
    const allBtn = screen.getByRole('button', { name: /^All Routes/i });
    fireEvent.click(allBtn);

    expect(
      within(routesContainer).getByText(/Oregon Outback Gravel Epic/i)
    ).toBeDefined();
    expect(
      within(routesContainer).getByText(/Olympic Discovery & Adventure Singletrack/i)
    ).toBeDefined();
  });

  it('reactively recalculates tire pressure, bag volume, and demands in the rig calculator', () => {
    render(<BikepackingHub />);

    const routeSelect = screen.getByLabelText(/Select Route/i);
    const durationInput = screen.getByLabelText(/Trip Duration \(Days\)/i);
    const shelterSelect = screen.getByLabelText(/Shelter System/i);
    const weightInput = screen.getByLabelText(/Rider Weight \(lbs\)/i);

    const resultsPanel = screen.getByRole('status');
    expect(resultsPanel.getAttribute('aria-live')).toBe('polite');

    // Select Oregon Outback
    fireEvent.change(routeSelect, { target: { value: 'oregon-outback' } });
    fireEvent.change(durationInput, { target: { value: '4' } });
    fireEvent.change(shelterSelect, { target: { value: 'bikepacking_tent' } });
    fireEvent.change(weightInput, { target: { value: '180' } });

    expect(resultsPanel.textContent).toContain('Oregon Outback Gravel Epic');
    expect(resultsPanel.textContent).toContain('PSI');
    expect(resultsPanel.textContent).toContain('Liters');
    expect(resultsPanel.textContent).toContain('kcal');

    // Change rider weight and verify tire pressure updates
    const initialText = resultsPanel.textContent || '';
    fireEvent.change(weightInput, { target: { value: '240' } });
    const updatedText = resultsPanel.textContent || '';
    expect(updatedText).not.toBe(initialText);
  });

  it('interacts with the mandatory repair checklist and updates the gear counter', () => {
    render(<BikepackingHub />);

    const counter = screen.getByTestId('bikepacking-gear-counter');
    expect(counter.textContent).toBe('0 of 6 packed');

    // Check first item
    const firstCheckbox = screen.getByLabelText(
      /Multi-tool with integrated chain breaker/i
    ) as HTMLInputElement;
    expect(firstCheckbox.checked).toBe(false);

    fireEvent.click(firstCheckbox);
    expect(firstCheckbox.checked).toBe(true);
    expect(counter.textContent).toBe('1 of 6 packed');

    // Check second item
    const secondCheckbox = screen.getByLabelText(/Tubeless plug puncture kit/i);
    fireEvent.click(secondCheckbox);
    expect(counter.textContent).toBe('2 of 6 packed');

    // Uncheck first item
    fireEvent.click(firstCheckbox);
    expect(counter.textContent).toBe('1 of 6 packed');
  });
});
