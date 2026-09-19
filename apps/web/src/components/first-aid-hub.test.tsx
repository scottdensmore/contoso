import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import FirstAidHub from './first-aid-hub';

describe('FirstAidHub Component', () => {
  it('renders all required section headings and LZ evacuation checklist', () => {
    render(<FirstAidHub />);

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Backcountry Wilderness Medical Emergency Guide/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Interactive Wilderness Triage Assessment/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Custom First Aid Kit Expedition Calculator/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Satellite SOS & Helicopter Evacuation Protocols/i,
      })
    ).toBeDefined();

    // LZ Checklist content
    expect(screen.getByText(/100x100 ft flat obstacle-free zone/i)).toBeDefined();
    expect(screen.getByText(/Marking wind direction/i)).toBeDefined();
    expect(screen.getByText(/Securing loose tarps/i)).toBeDefined();
    expect(screen.getByText(/Shielding patient/i)).toBeDefined();
  });

  it('filters medical condition cards using category filter pills', () => {
    render(<FirstAidHub />);

    const conditionsList = screen.getByTestId('medical-conditions-list');
    expect(within(conditionsList).getByText(/Hypothermia \(Cold Exposure\)/i)).toBeDefined();
    expect(within(conditionsList).getByText(/Sprains, Strains & Extremity Fractures/i)).toBeDefined();
    expect(within(conditionsList).getByText(/Severe Allergic Reaction \(Anaphylaxis\)/i)).toBeDefined();

    // Click 'Environmental' filter pill
    const envPill = screen.getByRole('button', { name: /^Environmental/i });
    fireEvent.click(envPill);

    expect(within(conditionsList).getByText(/Hypothermia \(Cold Exposure\)/i)).toBeDefined();
    expect(within(conditionsList).getByText(/Heat Exhaustion & Heat Stroke/i)).toBeDefined();
    expect(within(conditionsList).queryByText(/Sprains, Strains & Extremity Fractures/i)).toBeNull();
    expect(within(conditionsList).queryByText(/Severe Allergic Reaction \(Anaphylaxis\)/i)).toBeNull();

    // Click 'Trauma' filter pill
    const traumaPill = screen.getByRole('button', { name: /^Trauma/i });
    fireEvent.click(traumaPill);

    expect(within(conditionsList).getByText(/Sprains, Strains & Extremity Fractures/i)).toBeDefined();
    expect(within(conditionsList).queryByText(/Hypothermia/i)).toBeNull();

    // Reset to 'All'
    const allPill = screen.getByRole('button', { name: /^All Conditions/i });
    fireEvent.click(allPill);
    expect(within(conditionsList).getByText(/Hypothermia \(Cold Exposure\)/i)).toBeDefined();
  });

  it('operates the interactive triage assessment tool dynamically', () => {
    render(<FirstAidHub />);

    const triageContainer = screen.getByTestId('triage-assessment-section');

    // Select injury / condition: Musculoskeletal Fracture
    const injurySelect = within(triageContainer).getByLabelText(/primary symptom or injury/i);
    fireEvent.change(injurySelect, { target: { value: 'musculoskeletal-fracture' } });

    // Toggle walking ability to "Cannot Walk"
    const cannotWalkBtn = within(triageContainer).getByRole('button', { name: /cannot walk/i });
    fireEvent.click(cannotWalkBtn);

    const triageResult = screen.getByTestId('triage-assessment-result');
    expect(triageResult.getAttribute('role')).toBe('status');
    expect(triageResult.getAttribute('aria-live')).toBe('polite');

    // Should indicate ASSISTED WALKOUT
    expect(within(triageResult).getByTestId('evacuation-badge').textContent).toContain('ASSISTED WALKOUT');

    // Toggle consciousness to "Unconscious / Unresponsive"
    const unconsciousBtn = within(triageContainer).getByRole('button', { name: /unconscious/i });
    fireEvent.click(unconsciousBtn);

    // Should escalate immediately to IMMEDIATE HELO
    expect(within(triageResult).getByTestId('evacuation-badge').textContent).toContain('IMMEDIATE HELO');
  });

  it('adjusts first aid kit calculator inputs and recalculates supplies', () => {
    render(<FirstAidHub />);

    const kitSection = screen.getByTestId('kit-calculator-section');
    const partyInput = within(kitSection).getByLabelText(/party size/i);
    const daysInput = within(kitSection).getByLabelText(/trip duration/i);

    const initialTotalEl = within(kitSection).getByTestId('total-kit-items-count');
    const initialTotal = parseInt(initialTotalEl.textContent || '0', 10);
    expect(initialTotal).toBeGreaterThan(0);

    // Increase party size to 4 and trip days to 5
    fireEvent.change(partyInput, { target: { value: '4' } });
    fireEvent.change(daysInput, { target: { value: '5' } });

    const updatedTotalEl = within(kitSection).getByTestId('total-kit-items-count');
    const updatedTotal = parseInt(updatedTotalEl.textContent || '0', 10);
    expect(updatedTotal).toBeGreaterThan(initialTotal);

    // Verify category groups are rendered
    expect(within(kitSection).getByText(/Wound Care/i)).toBeDefined();
    expect(within(kitSection).getByText(/Medications/i)).toBeDefined();
    expect(within(kitSection).getByText(/Splints & Ortho/i)).toBeDefined();
    expect(within(kitSection).getByText(/Emergency Tools/i)).toBeDefined();
    expect(within(kitSection).getByText(/Blister Care/i)).toBeDefined();
  });
});
