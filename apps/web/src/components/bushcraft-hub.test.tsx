import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import BushcraftHub from './bushcraft-hub';

describe('BushcraftHub Component', () => {
  it('renders required h2 section headings and h3 project card headings without skipping levels', () => {
    render(<BushcraftHub />);

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Wilderness Fieldcraft & Primitive Projects/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Shelter Thermal Efficiency & Bushcraft Calculator/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Mandatory Wilderness Bushcraft Kit Checklist/i,
      })
    ).toBeDefined();

    // Verify h3 card headings for all 5 projects
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Boreal Forest Debris Hut & Insulated Raised Bed/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Northern White Cedar Bow Drill Friction Fire/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Basswood Inner Bark Two-Ply Reverse Wrap Cordage/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Mors Kochanski Polar Super Shelter/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Folded Birch Bark Cooking Pot & Stone Boiling/i,
      })
    ).toBeDefined();
  });

  it('filters project cards by discipline button pills', () => {
    render(<BushcraftHub />);

    // Initial state: All 5 projects visible
    expect(screen.getByRole('heading', { level: 3, name: /Boreal Forest Debris Hut/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Northern White Cedar Bow Drill/i })).toBeDefined();

    // Filter by Shelter Craft
    const shelterBtn = screen.getByRole('button', { name: /^Shelter Craft$/i });
    fireEvent.click(shelterBtn);

    expect(screen.getByRole('heading', { level: 3, name: /Boreal Forest Debris Hut/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Mors Kochanski Polar Super Shelter/i })).toBeDefined();
    expect(screen.queryByRole('heading', { level: 3, name: /Northern White Cedar Bow Drill/i })).toBeNull();
    expect(screen.queryByRole('heading', { level: 3, name: /Basswood Inner Bark/i })).toBeNull();

    // Filter by Friction Fire
    const fireBtn = screen.getByRole('button', { name: /^Friction Fire$/i });
    fireEvent.click(fireBtn);

    expect(screen.getByRole('heading', { level: 3, name: /Northern White Cedar Bow Drill/i })).toBeDefined();
    expect(screen.queryByRole('heading', { level: 3, name: /Boreal Forest Debris Hut/i })).toBeNull();

    // Filter by Cordage & Botany
    const cordageBtn = screen.getByRole('button', { name: /^Cordage & Botany$/i });
    fireEvent.click(cordageBtn);

    expect(screen.getByRole('heading', { level: 3, name: /Basswood Inner Bark/i })).toBeDefined();
    expect(screen.queryByRole('heading', { level: 3, name: /Northern White Cedar Bow Drill/i })).toBeNull();

    // Filter by Water & Foraging
    const waterBtn = screen.getByRole('button', { name: /^Water & Foraging$/i });
    fireEvent.click(waterBtn);

    expect(screen.getByRole('heading', { level: 3, name: /Folded Birch Bark Cooking Pot/i })).toBeDefined();
    expect(screen.queryByRole('heading', { level: 3, name: /Basswood Inner Bark/i })).toBeNull();

    // Reset to All Crafts
    const allBtn = screen.getByRole('button', { name: /^All Crafts$/i });
    fireEvent.click(allBtn);

    expect(screen.getByRole('heading', { level: 3, name: /Boreal Forest Debris Hut/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Northern White Cedar Bow Drill/i })).toBeDefined();
  });

  it('displays card details including region, difficulty, estimated hours, materials, tool, and highlights', () => {
    render(<BushcraftHub />);

    expect(screen.getByText(/Northwoods Boreal Forest, Ely, MN/i)).toBeDefined();
    expect(screen.getAllByText(/Intermediate Bushcraft/i).length).toBe(2);
    expect(screen.getByText(/4.5 hrs/i)).toBeDefined();
    expect(screen.getByText(/Deadfall ridgepole/i)).toBeDefined();
    expect(screen.getByText(/Full-tang carbon steel bushcraft knife & folding saw/i)).toBeDefined();
    expect(screen.getByText(/3-foot thick insulating leaf layer/i)).toBeDefined();
  });

  it('updates live calculator results panel when inputs are modified', () => {
    render(<BushcraftHub />);

    const statusRegion = screen.getByRole('status');
    expect(statusRegion).toBeDefined();

    // Check initial default calculation
    expect(within(statusRegion).getByText(/R-28.3/i)).toBeDefined();
    expect(within(statusRegion).getByText(/50°F/i)).toBeDefined();
    expect(within(statusRegion).getByText(/Adequate Survival Warmth/i)).toBeDefined();
    expect(within(statusRegion).queryByText(/conductive ground chill/i)).toBeNull();

    // Change project to Mors Kochanski Super Shelter
    const projectSelect = screen.getByLabelText(/Select Bushcraft Project/i);
    fireEvent.change(projectSelect, { target: { value: 'mors-kochanski-super-shelter' } });

    expect(within(statusRegion).getByText(/Mors Kochanski Polar Super Shelter/i)).toBeDefined();

    // Toggle fire reflector wall
    const reflectorToggle = screen.getByLabelText(/Fire Reflector Wall/i);
    fireEvent.click(reflectorToggle);

    // Reflector boost increases R-value and interior temperature
    expect(within(statusRegion).getByText(/Adequate Survival Warmth/i)).toBeDefined();
  });

  it('triggers ground conductive loss warning when bedding is below 4 inches', () => {
    render(<BushcraftHub />);

    const beddingInput = screen.getByLabelText(/Bedding Elevation/i);
    const statusRegion = screen.getByRole('status');

    // Reduce bedding to 0 inches
    fireEvent.change(beddingInput, { target: { value: '0' } });

    expect(within(statusRegion).getAllByText(/Critical conductive ground chill detected/i).length).toBeGreaterThan(0);
    expect(within(statusRegion).getAllByText(/Bedding is under 4 inches/i).length).toBeGreaterThan(0);

    // Increase bedding to 5 inches -> warning clears
    fireEvent.change(beddingInput, { target: { value: '5' } });
    expect(within(statusRegion).queryByText(/Critical conductive ground chill detected/i)).toBeNull();
  });

  it('updates gear checklist counter with data-testid="bushcraft-gear-counter"', () => {
    render(<BushcraftHub />);

    const counter = screen.getByTestId('bushcraft-gear-counter');
    expect(counter.textContent).toBe('0 of 6 packed');

    const knifeCheckbox = screen.getByLabelText(/High-Carbon Steel Full-Tang Bushcraft Knife/i);
    const sawCheckbox = screen.getByLabelText(/Aggressive Cross-Cut Folding Saw/i);
    const ferroCheckbox = screen.getByLabelText(/Heavy-Duty 1\/2-Inch Ferrocerium Rod/i);

    fireEvent.click(knifeCheckbox);
    expect(counter.textContent).toBe('1 of 6 packed');

    fireEvent.click(sawCheckbox);
    expect(counter.textContent).toBe('2 of 6 packed');

    fireEvent.click(ferroCheckbox);
    expect(counter.textContent).toBe('3 of 6 packed');

    fireEvent.click(knifeCheckbox);
    expect(counter.textContent).toBe('2 of 6 packed');
  });
});
