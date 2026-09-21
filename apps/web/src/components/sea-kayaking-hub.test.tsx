import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import SeaKayakingHub from './sea-kayaking-hub';

describe('SeaKayakingHub Component', () => {
  it('renders all required section headings with correct h2 hierarchy', () => {
    render(<SeaKayakingHub />);

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Wilderness Sea Kayaking & Coastal Expedition Routes/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Tidal Window & Open Crossing Calculator/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Mandatory Coastal Safety Kit Checklist/i,
      })
    ).toBeDefined();
  });

  it('filters route catalog cards by water grade buttons', () => {
    render(<SeaKayakingHub />);

    // Initially all 5 routes should be visible
    expect(screen.getByRole('heading', { level: 3, name: /San Juan Islands Archipelago Traverse/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Prince William Sound Glaciated Fjords/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Maine Island Trail Penobscot Bay Passage/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Apostle Islands Sea Caves & Outer Islands/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Gwaii Haanas Coastal Wilderness Expedition/i })).toBeDefined();

    // Filter by Open Crossing (Grade 3)
    const openCrossingBtn = screen.getByRole('button', { name: /Open Crossing/i });
    fireEvent.click(openCrossingBtn);

    expect(screen.getByRole('heading', { level: 3, name: /Prince William Sound Glaciated Fjords/i })).toBeDefined();
    expect(screen.queryByRole('heading', { level: 3, name: /San Juan Islands Archipelago Traverse/i })).toBeNull();
    expect(screen.queryByRole('heading', { level: 3, name: /Gwaii Haanas Coastal Wilderness Expedition/i })).toBeNull();

    // Filter by Exposed Ocean (Grade 4)
    const exposedOceanBtn = screen.getByRole('button', { name: /Exposed Ocean/i });
    fireEvent.click(exposedOceanBtn);

    expect(screen.getByRole('heading', { level: 3, name: /Gwaii Haanas Coastal Wilderness Expedition/i })).toBeDefined();
    expect(screen.queryByRole('heading', { level: 3, name: /Prince William Sound Glaciated Fjords/i })).toBeNull();

    // Reset to All Routes
    const allRoutesBtn = screen.getByRole('button', { name: /All Routes/i });
    fireEvent.click(allRoutesBtn);
    expect(screen.getByRole('heading', { level: 3, name: /San Juan Islands Archipelago Traverse/i })).toBeDefined();
  });

  it('updates live calculator status panel when adjusting route, current, and wind', () => {
    render(<SeaKayakingHub />);

    const routeSelect = screen.getByLabelText(/Select Coastal Route/i);
    const skillSelect = screen.getByLabelText(/Paddler Skill Level/i);
    const currentInput = screen.getByLabelText(/Tidal Current Speed/i);
    const windInput = screen.getByLabelText(/Wind Speed/i);
    const windowSelect = screen.getByLabelText(/Crossing Window/i);

    // Select San Juan Islands
    fireEvent.change(routeSelect, { target: { value: 'san-juan-islands-crossing' } });
    fireEvent.change(skillSelect, { target: { value: 'intermediate' } });
    fireEvent.change(currentInput, { target: { value: '2.5' } });
    fireEvent.change(windInput, { target: { value: '12' } });
    fireEvent.change(windowSelect, { target: { value: '2' } });

    const statusPanel = screen.getByRole('status');
    expect(statusPanel).toBeDefined();

    expect(within(statusPanel).getAllByText(/caution/i).length).toBeGreaterThan(0);
    expect(within(statusPanel).getByText(/60°/i)).toBeDefined();
    expect(within(statusPanel).getByText(/2.9/i)).toBeDefined();
    expect(within(statusPanel).getAllByText(/16/).length).toBeGreaterThan(0);
    expect(within(statusPanel).getByText(/Active tidal currents/i)).toBeDefined();
  });

  it('renders checklist items with accessible labels and updates gear counter', () => {
    render(<SeaKayakingHub />);

    const counter = screen.getByTestId('sea-kayak-gear-counter');
    expect(counter.textContent).toBe('0 of 6 packed');

    const pfdCheckbox = screen.getByLabelText(/USCG\/Transport Canada Type III\/V/i);
    const drysuitCheckbox = screen.getByLabelText(/Waterproof breathable dry suit/i);
    const vhfCheckbox = screen.getByLabelText(/Marine VHF waterproof radio/i);

    expect(pfdCheckbox).not.toBeChecked();
    fireEvent.click(pfdCheckbox);
    expect(pfdCheckbox).toBeChecked();
    expect(counter.textContent).toBe('1 of 6 packed');

    fireEvent.click(drysuitCheckbox);
    expect(drysuitCheckbox).toBeChecked();
    expect(counter.textContent).toBe('2 of 6 packed');

    fireEvent.click(vhfCheckbox);
    expect(vhfCheckbox).toBeChecked();
    expect(counter.textContent).toBe('3 of 6 packed');

    // Uncheck one
    fireEvent.click(pfdCheckbox);
    expect(pfdCheckbox).not.toBeChecked();
    expect(counter.textContent).toBe('2 of 6 packed');
  });
});
