import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import PrimitiveTrappingHub from './primitive-trapping-hub';

describe('PrimitiveTrappingHub Component', () => {
  it('renders required h2 section headings and h3 mechanism card headings without skipping levels', () => {
    render(<PrimitiveTrappingHub />);

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Primitive Trigger Mechanisms Catalog/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Deadfall Weight Ratio & Trigger Sensitivity Calculator/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Primitive Trapping & Bushcraft Safety Kit Checklist/i,
      })
    ).toBeDefined();

    // Verify h3 card headings for all 5 mechanisms
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Classic All-Wood Figure-4 Deadfall/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Paiute Deadfall with Cordage & Hair-Trigger Toggle/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Promontory Peg Interlocking Cordage Snare/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Tensioned Sapling Spring-Pole Toggle Snare/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Heavy Timber Rolling Log & Lever Deadfall/i,
      })
    ).toBeDefined();
  });

  it('filters mechanism cards by category filter button pills', () => {
    render(<PrimitiveTrappingHub />);

    // Initial state: all mechanisms visible
    expect(screen.getByRole('heading', { level: 3, name: /Classic All-Wood Figure-4 Deadfall/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Promontory Peg Interlocking Cordage Snare/i })).toBeDefined();

    // Filter by Deadfall Traps
    const deadfallBtn = screen.getByRole('button', { name: /^Deadfall Traps$/i });
    fireEvent.click(deadfallBtn);

    expect(screen.getByRole('heading', { level: 3, name: /Classic All-Wood Figure-4 Deadfall/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Paiute Deadfall with Cordage & Hair-Trigger Toggle/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Heavy Timber Rolling Log & Lever Deadfall/i })).toBeDefined();
    expect(screen.queryByRole('heading', { level: 3, name: /Promontory Peg Interlocking Cordage Snare/i })).toBeNull();
    expect(screen.queryByRole('heading', { level: 3, name: /Tensioned Sapling Spring-Pole Toggle Snare/i })).toBeNull();

    // Filter by Snare Systems
    const snareBtn = screen.getByRole('button', { name: /^Snare Systems$/i });
    fireEvent.click(snareBtn);

    expect(screen.getByRole('heading', { level: 3, name: /Promontory Peg Interlocking Cordage Snare/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Tensioned Sapling Spring-Pole Toggle Snare/i })).toBeDefined();
    expect(screen.queryByRole('heading', { level: 3, name: /Classic All-Wood Figure-4 Deadfall/i })).toBeNull();
    expect(screen.queryByRole('heading', { level: 3, name: /Paiute Deadfall/i })).toBeNull();

    // Reset to All Mechanisms
    const allBtn = screen.getByRole('button', { name: /^All Mechanisms$/i });
    fireEvent.click(allBtn);

    expect(screen.getByRole('heading', { level: 3, name: /Classic All-Wood Figure-4 Deadfall/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Promontory Peg Interlocking Cordage Snare/i })).toBeDefined();
  });

  it('displays card details including category, cordage requirement, sensitivity, quarry, and quick select button', () => {
    render(<PrimitiveTrappingHub />);

    expect(screen.getByText(/Cottontail, ground squirrel, small mammals/i)).toBeDefined();
    expect(screen.getByText(/Interlocking three-stick geometry/i)).toBeDefined();
    expect(screen.getAllByText(/All Wood - No Cordage/i).length).toBe(2);
    expect(screen.getAllByText(/Cordage Required/i).length).toBe(3);

    // Test quick select button
    const quickSelectButtons = screen.getAllByRole('button', { name: /load into calculator/i });
    expect(quickSelectButtons.length).toBeGreaterThan(0);
    fireEvent.click(quickSelectButtons[1]); // Paiute Deadfall

    const statusRegion = screen.getByRole('status');
    expect(within(statusRegion).getByText(/Paiute Deadfall with Cordage & Hair-Trigger Toggle/i)).toBeDefined();
  });

  it('updates live calculator results panel when inputs are modified', () => {
    render(<PrimitiveTrappingHub />);

    const statusRegion = screen.getByRole('status');
    expect(statusRegion).toBeDefined();

    // Default Figure-4, Snowshoe Hare (3.5 lbs), Deadfall 15 lbs -> ratio 4.3x -> Sufficient
    expect(within(statusRegion).getByText(/4.3x/i)).toBeDefined();
    expect(within(statusRegion).getByText(/Sufficient/i)).toBeDefined();
    expect(within(statusRegion).getByText(/Optimal Sensitivity/i)).toBeDefined();
    expect(within(statusRegion).getByText(/3.2 oz/i)).toBeDefined();
    expect(within(statusRegion).getByText(/Primitive deadfalls and snares are strictly regulated/i)).toBeDefined();

    // Set lightweight deadfall (5 lbs) -> ratio 5 / 3.5 = 1.4x -> Underweight - Cruelty Risk
    const weightInput = screen.getByLabelText(/Deadfall Stone\/Log Weight/i);
    fireEvent.change(weightInput, { target: { value: '5' } });

    expect(within(statusRegion).getByText(/1.4x/i)).toBeDefined();
    expect(within(statusRegion).getByText(/Underweight - Cruelty Risk/i)).toBeDefined();

    // Raise weight to 20 lbs -> ratio 20 / 3.5 = 5.7x -> Humane Instant Dispatch
    fireEvent.change(weightInput, { target: { value: '20' } });
    expect(within(statusRegion).getByText(/5.7x/i)).toBeDefined();
    expect(within(statusRegion).getByText(/Humane Instant Dispatch/i)).toBeDefined();

    // Test notch depth sensitivity: 2 mm -> Hair Trigger - Premature Release
    const notchInput = screen.getByLabelText(/Trigger Notch Depth/i);
    fireEvent.change(notchInput, { target: { value: '2' } });
    expect(within(statusRegion).getByText(/Hair Trigger - Premature Release/i)).toBeDefined();

    // Test notch depth sensitivity: 8 mm -> Overly Stiff - Miss Risk
    fireEvent.change(notchInput, { target: { value: '8' } });
    expect(within(statusRegion).getByText(/Overly Stiff - Miss Risk/i)).toBeDefined();

    // Test quarry select
    const quarrySelect = screen.getByLabelText(/Quarry Species/i);
    fireEvent.change(quarrySelect, { target: { value: 'ground_squirrel' } });
    expect(within(statusRegion).getByText(/Ground Squirrel/i)).toBeDefined();
  });

  it('updates gear checklist counter with data-testid="trapping-gear-counter"', () => {
    render(<PrimitiveTrappingHub />);

    const counter = screen.getByTestId('trapping-gear-counter');
    expect(counter.textContent).toBe('0 of 6 packed');

    const knifeCheckbox = screen.getByLabelText(/High-Carbon Fixed Blade Woodcarving Knife/i);
    const lineCheckbox = screen.getByLabelText(/#36 Tarred Braided Bank Line/i);
    const pegCheckbox = screen.getByLabelText(/Hardwood Split Inert Practice Pegs/i);

    fireEvent.click(knifeCheckbox);
    expect(counter.textContent).toBe('1 of 6 packed');

    fireEvent.click(lineCheckbox);
    expect(counter.textContent).toBe('2 of 6 packed');

    fireEvent.click(pegCheckbox);
    expect(counter.textContent).toBe('3 of 6 packed');

    fireEvent.click(knifeCheckbox);
    expect(counter.textContent).toBe('2 of 6 packed');
  });
});
