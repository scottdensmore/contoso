import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import NordicSkiingHub from './nordic-skiing-hub';

describe('NordicSkiingHub Component', () => {
  it('renders required h2 section headings and h3 trail card headings without skipping levels', () => {
    render(<NordicSkiingHub />);

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Nordic Trail Systems & Grooming Network/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Kick Wax & Grooming Advisor/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Mandatory Nordic Safety Kit & Tuning Checklist/i,
      })
    ).toBeDefined();

    // Verify h3 card headings for all 5 trails
    expect(screen.getByRole('heading', { level: 3, name: /Methow Valley Community Trail/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Trapp Family Lodge Sugar Road/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Devil's Thumb Ranch High Lonesome Loop/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Royal Gorge Rainbow Ridge Scenic Rim/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Banadad Wilderness Backcountry Ski Trail/i })).toBeDefined();
  });

  it('filters trail cards by discipline button pills', () => {
    render(<NordicSkiingHub />);

    // Filter by Skate Skiing
    const skateButton = screen.getByRole('button', { name: /^Skate Skiing$/i });
    fireEvent.click(skateButton);

    expect(screen.getByRole('heading', { level: 3, name: /Devil's Thumb Ranch High Lonesome Loop/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Royal Gorge Rainbow Ridge Scenic Rim/i })).toBeDefined();
    expect(screen.queryByRole('heading', { level: 3, name: /Methow Valley Community Trail/i })).toBeNull();
    expect(screen.queryByRole('heading', { level: 3, name: /Banadad Wilderness Backcountry Ski Trail/i })).toBeNull();

    // Filter by Classic Track
    const classicButton = screen.getByRole('button', { name: /^Classic Track$/i });
    fireEvent.click(classicButton);

    expect(screen.getByRole('heading', { level: 3, name: /Methow Valley Community Trail/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Trapp Family Lodge Sugar Road/i })).toBeDefined();
    expect(screen.queryByRole('heading', { level: 3, name: /Devil's Thumb Ranch High Lonesome Loop/i })).toBeNull();

    // Filter by Backcountry Touring
    const backcountryButton = screen.getByRole('button', { name: /^Backcountry Touring$/i });
    fireEvent.click(backcountryButton);
    expect(screen.getByRole('heading', { level: 3, name: /Banadad Wilderness Backcountry Ski Trail/i })).toBeDefined();
    expect(screen.queryByRole('heading', { level: 3, name: /Methow Valley Community Trail/i })).toBeNull();

    // Filter by Light Touring (empty state)
    const lightButton = screen.getByRole('button', { name: /^Light Touring$/i });
    fireEvent.click(lightButton);
    expect(screen.getByText(/No groomed trails found for this discipline/i)).toBeDefined();

    // Reset to All Trails
    const allButton = screen.getByRole('button', { name: /^All Trails$/i });
    fireEvent.click(allButton);
    expect(screen.getByRole('heading', { level: 3, name: /Methow Valley Community Trail/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Devil's Thumb Ranch High Lonesome Loop/i })).toBeDefined();
  });

  it('displays grooming status, skate lane width, classic tracks, and trail highlights', () => {
    render(<NordicSkiingHub />);

    expect(screen.getAllByText(/Daily Groomed/i).length).toBe(4);
    expect(screen.getByText(/Ungroomed Wilderness/i)).toBeDefined();
    expect(screen.getByText(/4.5 m/i)).toBeDefined();
    expect(screen.getAllByText(/2 tracks/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Suspension bridge river crossing/i)).toBeDefined();
    expect(screen.getByText(/Off-grid yurt overnight checkpoints/i)).toBeDefined();
  });

  it('updates live wax recommendations and klister warning reactively in the status region', () => {
    render(<NordicSkiingHub />);

    const trailSelect = screen.getByLabelText(/Select Nordic Trail/i);
    const tempInput = screen.getByLabelText(/Air Temperature/i);
    const snowSelect = screen.getByLabelText(/Snow Condition/i);
    const baseSelect = screen.getByLabelText(/Ski Base Type/i);

    // Initial state: default 24°F, hardpack_groomed, waxable
    const status = screen.getByRole('status');
    expect(status).toBeDefined();
    expect(within(status).getByText(/Swix Blue Extra/i)).toBeDefined();
    expect(within(status).queryByText(/Klister Alert/i)).toBeNull();

    // Switch temperature to 10°F -> Swix Green
    fireEvent.change(tempInput, { target: { value: '10' } });
    expect(within(status).getByText(/Swix Green/i)).toBeDefined();

    // Switch to 38°F and wet slush -> Klister Required
    fireEvent.change(tempInput, { target: { value: '38' } });
    fireEvent.change(snowSelect, { target: { value: 'wet_slush' } });
    expect(within(status).getAllByText(/Klister/i).length).toBeGreaterThan(0);
    expect(within(status).getByText(/Klister Alert/i)).toBeDefined();

    // Switch ski base to skin_integrated -> No kick wax required
    fireEvent.change(baseSelect, { target: { value: 'skin_integrated' } });
    expect(within(status).getByText(/Mohair Skin Strip/i)).toBeDefined();
    expect(within(status).queryByText(/Klister Alert/i)).toBeNull();

    // Switch ski base to fishscale_waxless -> Patterned base
    fireEvent.change(baseSelect, { target: { value: 'fishscale_waxless' } });
    expect(within(status).getByText(/Patterned Mechanical Base/i)).toBeDefined();

    // Switch trail to Devil's Thumb Ranch
    fireEvent.change(trailSelect, { target: { value: 'devil-thumb-ranch-high-lonesome' } });
    expect(within(status).getAllByText(/Devil's Thumb Ranch High Lonesome Loop/i).length).toBeGreaterThan(0);
  });

  it('updates gear checklist counter with data-testid="nordic-gear-counter"', () => {
    render(<NordicSkiingHub />);

    const counter = screen.getByTestId('nordic-gear-counter');
    expect(counter.textContent).toBe('0 of 6 packed');

    const skisCheckbox = screen.getByLabelText(/NNN \/ Prolink \/ SNS Profil boot-binding compatible cross-country skis/i);
    const polesCheckbox = screen.getByLabelText(/High-modulus carbon composite cross-country ski poles/i);
    const jacketCheckbox = screen.getByLabelText(/Breathable windproof cross-country softshell jacket/i);

    fireEvent.click(skisCheckbox);
    expect(counter.textContent).toBe('1 of 6 packed');

    fireEvent.click(polesCheckbox);
    expect(counter.textContent).toBe('2 of 6 packed');

    fireEvent.click(jacketCheckbox);
    expect(counter.textContent).toBe('3 of 6 packed');

    fireEvent.click(skisCheckbox);
    expect(counter.textContent).toBe('2 of 6 packed');
  });
});
