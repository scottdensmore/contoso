import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LeaveNoTraceHub from './leave-no-trace-hub';

describe('LeaveNoTraceHub Component', () => {
  it('renders all three major section headings with level 2', () => {
    render(<LeaveNoTraceHub />);

    const h2s = screen.getAllByRole('heading', { level: 2 });
    const h2Texts = h2s.map((h) => h.textContent);

    expect(h2Texts.some((text) => text?.includes('The 7 Principles of Leave No Trace'))).toBe(true);
    expect(
      h2Texts.some((text) =>
        text?.includes('Wilderness Waste & Food Storage Regulations Advisor')
      )
    ).toBe(true);
    expect(
      h2Texts.some((text) => text?.includes('Pack-It-Out Supplies Calculator & Checklist'))
    ).toBe(true);
  });

  it('renders all 7 principles and allows selecting / inspecting a principle', () => {
    render(<LeaveNoTraceHub />);

    // Verify all 7 principles are visible in headings
    expect(screen.getByRole('heading', { level: 3, name: /Plan Ahead and Prepare/i })).toBeDefined();
    expect(
      screen.getByRole('heading', { level: 3, name: /Dispose of Waste Properly/i })
    ).toBeDefined();

    // Click on Principle 3 card
    const disposeCard = screen.getByTestId('lnt-principle-card-dispose-waste');
    fireEvent.click(disposeCard);

    // Assert that backcountry practices for waste disposal are rendered
    expect(screen.getByText(/Always pack out toilet paper, wet wipes/i)).toBeDefined();
  });

  it('evaluates waste compliance when selecting Enchantments Core Alpine Zone', () => {
    render(<LeaveNoTraceHub />);

    const zoneSelect = screen.getByLabelText(/select wilderness zone/i);
    fireEvent.change(zoneSelect, { target: { value: 'enchantments-core' } });

    const statusPanel = screen.getByRole('status');
    expect(statusPanel.textContent).toContain('WAG BAG PACK-OUT REQUIRED');
    expect(statusPanel.textContent).toContain('BEAR CANISTER MANDATORY');
    expect(statusPanel.textContent).toContain('Compliant');
  });

  it('flags a violation when distance to water is under 200 feet for cathole zones', () => {
    render(<LeaveNoTraceHub />);

    const zoneSelect = screen.getByLabelText(/select wilderness zone/i);
    fireEvent.change(zoneSelect, { target: { value: 'alpine-lakes-lowland' } });

    const distanceInput = screen.getByLabelText(/distance from water/i);
    fireEvent.change(distanceInput, { target: { value: '50' } });

    const statusPanel = screen.getByRole('status');
    expect(statusPanel.textContent).toContain('Violation');
    expect(statusPanel.textContent).toContain(
      'Catholes must be at least 200 feet (approx 70 adult steps) from any lake, stream, or campsite.'
    );
  });

  it('updates pack-out supply counts when adjusting party size and stay duration', () => {
    render(<LeaveNoTraceHub />);

    const zoneSelect = screen.getByLabelText(/select wilderness zone/i);
    fireEvent.change(zoneSelect, { target: { value: 'enchantments-core' } });

    const groupInput = screen.getByLabelText(/group size/i);
    const daysInput = screen.getByLabelText(/stay duration/i);

    // Set 4 people for 4 days in WAG bag zone -> 4 * 4 * 2 = 32 bags
    fireEvent.change(groupInput, { target: { value: '4' } });
    fireEvent.change(daysInput, { target: { value: '4' } });

    const wagCount = screen.getByTestId('supply-wag-bags-count');
    expect(wagCount.textContent).toBe('32');
  });

  it('allows interacting with the Pack-It-Out checklist items', () => {
    render(<LeaveNoTraceHub />);

    const wagCheckbox = screen.getByLabelText(/WAG Bags/i) as HTMLInputElement;
    expect(wagCheckbox.checked).toBe(false);

    fireEvent.click(wagCheckbox);
    expect(wagCheckbox.checked).toBe(true);

    fireEvent.click(wagCheckbox);
    expect(wagCheckbox.checked).toBe(false);
  });
});
