import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import CanoeExpeditionHub from './canoe-expedition-hub';

describe('CanoeExpeditionHub Component', () => {
  it('renders all required h2 section headings and h3 route card headings without skipping levels', () => {
    render(<CanoeExpeditionHub />);

    // Check h2 section headings
    const h2Elements = screen.getAllByRole('heading', { level: 2 });
    expect(h2Elements.length).toBeGreaterThanOrEqual(3);

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Iconic North American Canoe Expedition Routes/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Interactive Canoe Trim & Freeboard Calculator/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Mandatory Open Canoe Expedition Kit Checklist/i,
      })
    ).toBeDefined();

    // Check h3 card headings for all 5 routes
    const h3Elements = screen.getAllByRole('heading', { level: 3 });
    expect(h3Elements.length).toBeGreaterThanOrEqual(5);

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Allagash Wilderness Waterway Northern Canoe Traverse/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /South Nahanni River Grand Canyons & Virginia Falls/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Granite River International Border Canoe Route/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Missinaibi River Thunderhouse Falls to Moose Factory/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Rio Grande Wild & Scenic Lower Canyons Descent/i,
      })
    ).toBeDefined();
  });

  it('filters routes correctly using whitewater class filter buttons', () => {
    render(<CanoeExpeditionHub />);
    const routesGrid = screen.getByTestId('canoe-routes-grid');

    // Initially displays all 5 routes
    expect(
      within(routesGrid).getByRole('heading', { level: 3, name: /Allagash Wilderness Waterway/i })
    ).toBeDefined();
    expect(
      within(routesGrid).getByRole('heading', { level: 3, name: /South Nahanni River/i })
    ).toBeDefined();
    expect(
      within(routesGrid).getByRole('heading', { level: 3, name: /Missinaibi River/i })
    ).toBeDefined();
    expect(
      within(routesGrid).getByRole('heading', { level: 3, name: /Granite River/i })
    ).toBeDefined();
    expect(
      within(routesGrid).getByRole('heading', { level: 3, name: /Rio Grande Wild & Scenic/i })
    ).toBeDefined();

    // Filter by Class I (Easy)
    const classIBtn = screen.getByRole('button', { name: /Class I \(Easy\)/i });
    fireEvent.click(classIBtn);

    expect(
      within(routesGrid).getByRole('heading', { level: 3, name: /Granite River/i })
    ).toBeDefined();
    expect(
      within(routesGrid).queryByRole('heading', { level: 3, name: /Allagash Wilderness Waterway/i })
    ).toBeNull();
    expect(
      within(routesGrid).queryByRole('heading', { level: 3, name: /Missinaibi River/i })
    ).toBeNull();

    // Filter by Class IV (Expert)
    const classIVBtn = screen.getByRole('button', { name: /Class IV \(Expert\)/i });
    fireEvent.click(classIVBtn);

    expect(
      within(routesGrid).getByRole('heading', { level: 3, name: /Missinaibi River/i })
    ).toBeDefined();
    expect(
      within(routesGrid).queryByRole('heading', { level: 3, name: /Granite River/i })
    ).toBeNull();
    expect(
      within(routesGrid).queryByRole('heading', { level: 3, name: /South Nahanni River/i })
    ).toBeNull();

    // Return to All Routes
    const allBtn = screen.getByRole('button', { name: /All Routes/i });
    fireEvent.click(allBtn);

    expect(
      within(routesGrid).getByRole('heading', { level: 3, name: /Allagash Wilderness Waterway/i })
    ).toBeDefined();
    expect(
      within(routesGrid).getByRole('heading', { level: 3, name: /Missinaibi River/i })
    ).toBeDefined();
  });

  it('updates calculator when clicking route card select button', () => {
    render(<CanoeExpeditionHub />);
    const nahanniCardSelectBtn = screen.getByRole('button', {
      name: /Calculate Trim for South Nahanni River/i,
    });
    fireEvent.click(nahanniCardSelectBtn);

    const resultsPanel = screen.getByTestId('canoe-calculator-result');
    expect(resultsPanel.textContent).toContain('South Nahanni River');
  });

  it('reactively recalculates gross weight, freeboard, trim status, and swamping risk in calculator', () => {
    render(<CanoeExpeditionHub />);

    const resultsPanel = screen.getByTestId('canoe-calculator-result');
    expect(resultsPanel.getAttribute('role')).toBe('status');
    expect(resultsPanel.getAttribute('aria-live')).toBe('polite');

    const gearCargoInput = screen.getByLabelText(/Gear & Cargo Weight/i);
    const cargoPlacementSelect = screen.getByLabelText(/Cargo Weight Placement/i);
    const rapidLevelSelect = screen.getByLabelText(/River Whitewater Rapid Level/i);

    // Initial default check
    expect(resultsPanel.textContent).toContain('256 kg');
    expect(resultsPanel.textContent).toContain('7.4 in');
    expect(resultsPanel.textContent).toContain('18.9 cm');
    expect(resultsPanel.textContent).toContain('58%');

    // Change cargo weight to 120 kg
    fireEvent.change(gearCargoInput, { target: { value: '120' } });
    expect(resultsPanel.textContent).toContain('306 kg');

    // Change placement to forward
    fireEvent.change(cargoPlacementSelect, { target: { value: 'forward' } });
    expect(resultsPanel.textContent).toContain('Bow-Heavy');

    // Change rapid level to class_iv
    fireEvent.change(rapidLevelSelect, { target: { value: 'class_iv' } });
    expect(resultsPanel.textContent).toContain('Critical Hazard');
    expect(resultsPanel.textContent).toContain('Critical');
  });

  it('interacts with the mandatory kit checklist and updates the counter', () => {
    render(<CanoeExpeditionHub />);

    const counter = screen.getByTestId('canoe-gear-counter');
    expect(counter.textContent).toBe('0 of 6 packed');

    const firstCheckbox = screen.getByLabelText(
      /Full-Length Cordura Canoe Spray Deck Cover/i
    ) as HTMLInputElement;
    expect(firstCheckbox.checked).toBe(false);

    fireEvent.click(firstCheckbox);
    expect(firstCheckbox.checked).toBe(true);
    expect(counter.textContent).toBe('1 of 6 packed');

    const secondCheckbox = screen.getByLabelText(
      /3D End Flotation Air Bags with Nylon Lacing Cages/i
    ) as HTMLInputElement;
    fireEvent.click(secondCheckbox);
    expect(counter.textContent).toBe('2 of 6 packed');

    // Uncheck first
    fireEvent.click(firstCheckbox);
    expect(counter.textContent).toBe('1 of 6 packed');
  });
});
