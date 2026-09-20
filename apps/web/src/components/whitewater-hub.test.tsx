import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import WhitewaterHub from './whitewater-hub';

describe('WhitewaterHub', () => {
  it('renders all 3 required sections with heading level 2', () => {
    render(<WhitewaterHub />);

    const h2s = screen.getAllByRole('heading', { level: 2 });
    const headingsText = h2s.map((h) => h.textContent);

    expect(headingsText).toContain('Pacific Northwest Whitewater River Runs');
    expect(headingsText).toContain('River Flow & Paddler Safety Evaluator');
    expect(headingsText).toContain('Whitewater Essential Gear & Rapid Safety Protocols');
  });

  it('renders initial river run cards with h3 headings', () => {
    render(<WhitewaterHub />);

    const runsGrid = screen.getByTestId('river-runs-grid');
    const h3s = within(runsGrid).getAllByRole('heading', { level: 3 });
    const cardTitles = h3s.map((h) => h.textContent);

    expect(cardTitles).toContain('Wenatchee River — Tumwater Canyon');
    expect(cardTitles).toContain('Skykomish River — Sunset to Big Eddy');
    expect(cardTitles).toContain('White Salmon River — BZ Corner to Husum');
    expect(cardTitles).toContain('Middle Fork Snoqualmie — Mine Creek to Middlefield');
    expect(cardTitles).toContain('Lower Deschutes River — Warm Springs to Maupin');
  });

  it('filters river runs when class rating filter pills are clicked', () => {
    render(<WhitewaterHub />);

    const runsGrid = screen.getByTestId('river-runs-grid');

    // Click Class IV filter pill
    const classIVBtn = screen.getByRole('button', { name: /filter by class iv/i });
    fireEvent.click(classIVBtn);

    // Skykomish Boulder Drop should be present in grid
    expect(within(runsGrid).getByText('Skykomish River — Sunset to Big Eddy')).toBeDefined();
    // Tumwater Canyon (Class V) should not be visible in grid
    expect(within(runsGrid).queryByText('Wenatchee River — Tumwater Canyon')).toBeNull();

    // Click All filter pill to reset
    const allBtn = screen.getByRole('button', { name: /filter by all/i });
    fireEvent.click(allBtn);
    expect(within(runsGrid).getByText('Wenatchee River — Tumwater Canyon')).toBeDefined();
  });

  it('updates live safety evaluator when river run, craft, and skill are changed', () => {
    render(<WhitewaterHub />);

    const riverSelect = screen.getByLabelText(/select whitewater river run/i);
    const craftSelect = screen.getByLabelText(/select water craft/i);
    const skillSelect = screen.getByLabelText(/paddler skill level/i);

    // Select Wenatchee with intermediate skill
    fireEvent.change(riverSelect, { target: { value: 'wenatchee-tumwater' } });
    fireEvent.change(craftSelect, { target: { value: 'kayak' } });
    fireEvent.change(skillSelect, { target: { value: 'intermediate' } });

    // Result panel should show warning / danger / not recommended
    const resultPanel = screen.getByTestId('safety-assessment-result');
    expect(resultPanel.getAttribute('role')).toBe('status');
    expect(resultPanel.getAttribute('aria-live')).toBe('polite');

    const matches = within(resultPanel).getAllByText(/DANGER \/ PROHIBITED|NOT RECOMMENDED/i);
    expect(matches.length).toBeGreaterThan(0);

    // Water temp is 44°F so cold water immersion banner must be displayed
    expect(
      within(resultPanel).getByText(/cold water immersion warning/i)
    ).toBeDefined();

    // Change skill to expert
    fireEvent.change(skillSelect, { target: { value: 'expert' } });
    expect(within(resultPanel).getByText('RECOMMENDED')).toBeDefined();
  });

  it('toggles checklist items and updates verified gear count', () => {
    render(<WhitewaterHub />);

    const counter = screen.getByTestId('gear-checklist-counter');
    expect(counter.textContent).toContain('0 of');

    const pfdCheckbox = screen.getByLabelText(/type iii\/v whitewater pfd/i);
    fireEvent.click(pfdCheckbox);

    expect(counter.textContent).toContain('1 of');

    // Uncheck PFD
    fireEvent.click(pfdCheckbox);
    expect(counter.textContent).toContain('0 of');
  });

  it('includes proper accessible form labels and status roles', () => {
    render(<WhitewaterHub />);

    expect(screen.getByLabelText(/select whitewater river run/i)).toBeDefined();
    expect(screen.getByLabelText(/select water craft/i)).toBeDefined();
    expect(screen.getByLabelText(/paddler skill level/i)).toBeDefined();

    // Flow badges with role status
    const statusElements = screen.getAllByRole('status');
    expect(statusElements.length).toBeGreaterThan(0);
  });
});
