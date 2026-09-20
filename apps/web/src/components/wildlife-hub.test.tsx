import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import WildlifeHub from './wildlife-hub';

describe('WildlifeHub Component', () => {
  it('renders required section headings (h2) and card headings (h3) with no skipped levels', () => {
    render(<WildlifeHub />);

    // Section headings (h2)
    const h2Headings = screen.getAllByRole('heading', { level: 2 });
    expect(h2Headings.length).toBeGreaterThanOrEqual(4);

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Pacific Northwest & Rocky Mountain Apex Wildlife/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Wildlife Encounter Safety Screener/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Food Storage & Bear Canister Regulations/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Backcountry Wildlife Safety Gear Checklist/i,
      })
    ).toBeDefined();

    // Card headings (h3)
    const h3Headings = screen.getAllByRole('heading', { level: 3 });
    expect(h3Headings.length).toBeGreaterThanOrEqual(5);

    expect(screen.getByRole('heading', { level: 3, name: /Grizzly Bear/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /American Black Bear/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Mountain Lion \/ Cougar/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Shiras Moose/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Western Rattlesnake/i })).toBeDefined();
  });

  it('filters species cards using category and habitat pill buttons', () => {
    render(<WildlifeHub />);
    const speciesGrid = screen.getByTestId('species-grid');

    // Initially all 5 species are present
    expect(within(speciesGrid).getByText(/Grizzly Bear/i)).toBeDefined();
    expect(within(speciesGrid).getByText(/Shiras Moose/i)).toBeDefined();
    expect(within(speciesGrid).getByText(/Western Rattlesnake/i)).toBeDefined();

    // Filter by Large Ungulates
    const ungulateBtn = screen.getByRole('button', { name: /Large Ungulates/i });
    fireEvent.click(ungulateBtn);

    expect(within(speciesGrid).getByText(/Shiras Moose/i)).toBeDefined();
    expect(within(speciesGrid).queryByText(/Grizzly Bear/i)).toBeNull();
    expect(within(speciesGrid).queryByText(/American Black Bear/i)).toBeNull();
    expect(within(speciesGrid).queryByText(/Western Rattlesnake/i)).toBeNull();

    // Filter by Apex Carnivores
    const carnivoreBtn = screen.getByRole('button', { name: /Apex Carnivores/i });
    fireEvent.click(carnivoreBtn);

    expect(within(speciesGrid).getByText(/Grizzly Bear/i)).toBeDefined();
    expect(within(speciesGrid).getByText(/American Black Bear/i)).toBeDefined();
    expect(within(speciesGrid).getByText(/Mountain Lion \/ Cougar/i)).toBeDefined();
    expect(within(speciesGrid).queryByText(/Shiras Moose/i)).toBeNull();

    // Filter by High Desert
    const highDesertBtn = screen.getByRole('button', { name: /High Desert/i });
    fireEvent.click(highDesertBtn);

    expect(within(speciesGrid).getByText(/Western Rattlesnake/i)).toBeDefined();
    expect(within(speciesGrid).getByText(/Mountain Lion \/ Cougar/i)).toBeDefined();
    expect(within(speciesGrid).queryByText(/Grizzly Bear/i)).toBeNull();

    // Reset to All Species
    const allBtn = screen.getByRole('button', { name: /All Species/i });
    fireEvent.click(allBtn);

    expect(within(speciesGrid).getByText(/Grizzly Bear/i)).toBeDefined();
    expect(within(speciesGrid).getByText(/Shiras Moose/i)).toBeDefined();
  });

  it('displays morphological cues and bear identification differences', () => {
    render(<WildlifeHub />);

    expect(screen.getAllByText(/Dished \(concave\) facial profile/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Straight facial profile/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Prominent shoulder hump/i).length).toBeGreaterThanOrEqual(1);
  });

  it('runs the interactive encounter safety screener and updates live status panel', () => {
    render(<WildlifeHub />);

    const speciesSelect = screen.getByLabelText(/Select Encounter Species/i);
    const distanceInput = screen.getByLabelText(/Estimated Distance \(yards\)/i);
    const approachingCheckbox = screen.getByLabelText(/Animal is approaching/i);
    const cubsCheckbox = screen.getByLabelText(/Cubs or food carcass present/i);

    // Set Grizzly at 25 yards, approaching, cubs present
    fireEvent.change(speciesSelect, { target: { value: 'grizzly-bear' } });
    fireEvent.change(distanceInput, { target: { value: '25' } });
    fireEvent.click(approachingCheckbox);
    fireEvent.click(cubsCheckbox);

    const statusPanel = screen.getByRole('status');
    expect(statusPanel.getAttribute('aria-live')).toBe('polite');
    expect(within(statusPanel).getByText(/CRITICAL - IMMINENT CHARGE HAZARD/i)).toBeDefined();
    expect(within(statusPanel).getByText(/STAND YOUR GROUND/i)).toBeDefined();
    expect(within(statusPanel).getAllByText(/30-40 ft/i).length).toBeGreaterThanOrEqual(1);

    // Change to distant non-threatening observation
    fireEvent.change(distanceInput, { target: { value: '150' } });
    fireEvent.click(approachingCheckbox); // uncheck
    fireEvent.click(cubsCheckbox); // uncheck

    expect(within(statusPanel).getByText(/MONITOR & MAINTAIN DISTANCE/i)).toBeDefined();
    expect(within(statusPanel).getByText(/Maintain safe visual distance/i)).toBeDefined();
  });

  it('interacts with the wildlife safety gear checklist and asserts packing counter', () => {
    render(<WildlifeHub />);

    const counter = screen.getByTestId('wildlife-gear-counter');
    expect(counter.textContent).toBe('0 of 5 packed');

    const checkboxes = screen.getAllByRole('checkbox', { name: /Pack /i });
    expect(checkboxes.length).toBe(5);

    // Pack bear spray
    fireEvent.click(checkboxes[0]);
    expect(screen.getByTestId('wildlife-gear-counter').textContent).toBe('1 of 5 packed');

    // Pack bear canister
    fireEvent.click(checkboxes[1]);
    expect(screen.getByTestId('wildlife-gear-counter').textContent).toBe('2 of 5 packed');

    // Unpack bear spray
    fireEvent.click(checkboxes[0]);
    expect(screen.getByTestId('wildlife-gear-counter').textContent).toBe('1 of 5 packed');
  });
});
