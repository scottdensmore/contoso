import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import PackBurroHub from './pack-burro-hub';

describe('PackBurroHub Component', () => {
  it('renders required h2 section headings and h3 course card headings without skipped levels', () => {
    render(<PackBurroHub />);

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Iconic Pack-Burro Racing Courses & Mountain Passes/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Pack-Burro Scree Descent & Regulation Weight Calculator/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /WPBR Regulation Race & Veterinary Kit Checklist/i,
      })
    ).toBeDefined();

    // Verify h3 card headings for all 5 courses
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Leadville Boom Days World Championship \(Mosquito Pass\)/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Fairplay World Championship Burro Race/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Buena Vista Gold Rush Pack-Burro Challenge/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Georgetown Silver Plume Mining District Run/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Idaho Springs Gold Digger Mile & Steeplechase/i,
      })
    ).toBeDefined();
  });

  it('filters courses by burro type filter buttons', () => {
    render(<PackBurroHub />);

    // Initial state: all courses visible
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Leadville Boom Days World Championship/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Georgetown Silver Plume Mining District Run/i,
      })
    ).toBeDefined();

    // Filter by Mammoth Donkey (800-1000 lbs)
    const mammothBtn = screen.getByRole('button', { name: /Mammoth Donkey/i });
    fireEvent.click(mammothBtn);

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Georgetown Silver Plume Mining District Run/i,
      })
    ).toBeDefined();
    expect(
      screen.queryByRole('heading', {
        level: 3,
        name: /Leadville Boom Days World Championship/i,
      })
    ).toBeNull();
    expect(
      screen.queryByRole('heading', {
        level: 3,
        name: /Fairplay World Championship Burro Race/i,
      })
    ).toBeNull();

    // Filter by Standard Burro (400-500 lbs)
    const standardBtn = screen.getByRole('button', { name: /Standard Burro/i });
    fireEvent.click(standardBtn);

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Leadville Boom Days World Championship/i,
      })
    ).toBeDefined();
    expect(
      screen.queryByRole('heading', {
        level: 3,
        name: /Georgetown Silver Plume Mining District Run/i,
      })
    ).toBeNull();

    // Reset to All Courses
    const allBtn = screen.getByRole('button', { name: /^All Courses$/i });
    fireEvent.click(allBtn);

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Leadville Boom Days World Championship/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Georgetown Silver Plume Mining District Run/i,
      })
    ).toBeDefined();
  });

  it('displays course details and allows loading into calculator', () => {
    render(<PackBurroHub />);

    // Check course metrics displayed
    expect(screen.getByText(/4019 m/i)).toBeDefined();
    expect(screen.getByText(/33.8 km/i)).toBeDefined();
    expect(screen.getByText(/24 %/i)).toBeDefined();
    expect(screen.getByText(/Ascent to 13,185 ft Mosquito Pass summit/i)).toBeDefined();

    // Quick select Georgetown
    const quickSelectButtons = screen.getAllByRole('button', { name: /load into calculator/i });
    expect(quickSelectButtons.length).toBeGreaterThan(0);
    fireEvent.click(quickSelectButtons[3]); // Georgetown

    const statusRegion = screen.getByRole('status');
    expect(within(statusRegion).getByText(/Georgetown Silver Plume Mining District Run/i)).toBeDefined();
  });

  it('updates live calculator results panel when inputs are adjusted', () => {
    render(<PackBurroHub />);

    const statusRegion = screen.getByRole('status');
    expect(statusRegion).toBeDefined();

    // Default state: 35 lbs, 18% grade -> Regulation Compliant, 16 lbs braking, Optimal Race Cadence
    expect(within(statusRegion).getByText(/Regulation Compliant \(>= 33 lbs\)/i)).toBeDefined();
    expect(within(statusRegion).getByText(/16 lbs/i)).toBeDefined();
    expect(within(statusRegion).getByText(/^Optimal Race Cadence$/i)).toBeDefined();
    expect(within(statusRegion).getByText(/62 % sea level O2/i)).toBeDefined();

    // Change pack weight to 28 lbs -> Disqualified: Underweight Pack
    const weightInput = screen.getByLabelText(/Pack Saddle Weight/i);
    fireEvent.change(weightInput, { target: { value: '28' } });

    expect(within(statusRegion).getByText(/Disqualified: Underweight Pack \(< 33 lbs\)/i)).toBeDefined();
    expect(within(statusRegion).getAllByText(/Disqualified: Underweight Pack/i).length).toBeGreaterThan(0);
    // 28 * 0.18 * 2.5 = 12.6 -> 13 lbs
    expect(within(statusRegion).getByText(/13 lbs/i)).toBeDefined();

    // Raise pack weight to 35 lbs and set grade to 15% -> Regulation Compliant & Optimal Race Cadence
    fireEvent.change(weightInput, { target: { value: '35' } });
    const gradeInput = screen.getByLabelText(/Descent Slope Gradient/i);
    fireEvent.change(gradeInput, { target: { value: '15' } });

    expect(within(statusRegion).getByText(/Regulation Compliant \(>= 33 lbs\)/i)).toBeDefined();
    expect(within(statusRegion).getByText(/^Optimal Race Cadence$/i)).toBeDefined();
    // 35 * 0.15 * 2.5 = 13.125 -> 13 lbs
    expect(within(statusRegion).getByText(/13 lbs/i)).toBeDefined();

    // Increase grade to 25% -> Caution: Steep Scree Braking
    fireEvent.change(gradeInput, { target: { value: '25' } });
    expect(within(statusRegion).getByText(/Caution: Steep Scree Braking/i)).toBeDefined();
    // 35 * 0.25 * 2.5 = 21.875 -> 22 lbs
    expect(within(statusRegion).getAllByText(/22 lbs/i).length).toBeGreaterThan(0);
  });

  it('tracks checklist progress and updates burro-gear-counter data-testid', () => {
    render(<PackBurroHub />);

    const counter = screen.getByTestId('burro-gear-counter');
    expect(counter.textContent).toBe('0 of 6 packed');

    const saddleCheckbox = screen.getByLabelText(/Regulation Wood Sawbuck Pack Saddle/i);
    const pickCheckbox = screen.getByLabelText(/Steel Mining Pick, Flat Shovel, & 14-Inch Steel Gold Pan/i);
    const ropeCheckbox = screen.getByLabelText(/15-Foot Heavy-Duty Braided Cotton Lead Rope/i);

    fireEvent.click(saddleCheckbox);
    expect(counter.textContent).toBe('1 of 6 packed');

    fireEvent.click(pickCheckbox);
    expect(counter.textContent).toBe('2 of 6 packed');

    fireEvent.click(ropeCheckbox);
    expect(counter.textContent).toBe('3 of 6 packed');

    // Uncheck one
    fireEvent.click(saddleCheckbox);
    expect(counter.textContent).toBe('2 of 6 packed');
  });
});
