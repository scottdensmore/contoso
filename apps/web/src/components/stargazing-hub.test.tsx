import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StargazingHub from './stargazing-hub';

describe('StargazingHub component', () => {
  it('renders major section headings (h2) and subheadings (h3) with no skipped levels', () => {
    render(<StargazingHub />);

    const h2s = screen.getAllByRole('heading', { level: 2 });
    expect(h2s.length).toBeGreaterThanOrEqual(4);

    const h2Texts = h2s.map((h) => h.textContent);
    expect(h2Texts.some((t) => t?.includes('Dark Sky Observing Sites'))).toBe(true);
    expect(h2Texts.some((t) => t?.includes('Viewing Window & Seeing Quality Calculator'))).toBe(true);
    expect(h2Texts.some((t) => t?.includes('Annual Meteor Shower Calendar'))).toBe(true);
    expect(h2Texts.some((t) => t?.includes('Dark Sky Astronomy Packing Checklist'))).toBe(true);

    const h3s = screen.getAllByRole('heading', { level: 3 });
    expect(h3s.length).toBeGreaterThanOrEqual(5);
  });

  it('filters dark sky sites by Bortle class pills', () => {
    render(<StargazingHub />);

    // All sites initially visible
    expect(screen.getByText('John Day Fossil Beds - Painted Hills')).toBeDefined();
    expect(screen.getByText('Artist Point at Mount Baker')).toBeDefined();
    expect(screen.getByText('Copper Ridge Fire Lookout')).toBeDefined();

    // Filter to Pristine (Bortle 1-2)
    const pristineFilter = screen.getByRole('button', { name: /Pristine Dark Sky/i });
    fireEvent.click(pristineFilter);

    expect(screen.getByText('John Day Fossil Beds - Painted Hills')).toBeDefined();
    expect(screen.getByText('Copper Ridge Fire Lookout')).toBeDefined();
    expect(screen.queryByText('Artist Point at Mount Baker')).toBeNull();

    // Filter to Accessible (Bortle 3-4)
    const accessibleFilter = screen.getByRole('button', { name: /Accessible Dark Sky/i });
    fireEvent.click(accessibleFilter);

    expect(screen.getByText('Artist Point at Mount Baker')).toBeDefined();
    expect(screen.queryByText('John Day Fossil Beds - Painted Hills')).toBeNull();

    // Reset to All Sites
    const allFilter = screen.getByRole('button', { name: /All Sites/i });
    fireEvent.click(allFilter);
    expect(screen.getByText('John Day Fossil Beds - Painted Hills')).toBeDefined();
    expect(screen.getByText('Artist Point at Mount Baker')).toBeDefined();
  });

  it('interactively calculates viewing window conditions and displays optimal status for Copper Ridge', () => {
    render(<StargazingHub />);

    const siteSelect = screen.getByLabelText(/Select Observing Site/i);
    const moonSelect = screen.getByLabelText(/Select Moon Phase/i);
    const cloudInput = screen.getByLabelText(/Cloud Cover/i);
    const targetSelect = screen.getByLabelText(/Celestial Target/i);

    fireEvent.change(siteSelect, { target: { value: 'copper-ridge-cascades' } });
    fireEvent.change(moonSelect, { target: { value: 'new_moon' } });
    fireEvent.change(cloudInput, { target: { value: '0' } });
    fireEvent.change(targetSelect, { target: { value: 'deep_sky' } });

    const statusPanel = screen.getByRole('status');
    expect(statusPanel).toBeDefined();
    expect(statusPanel.textContent).toContain('OPTIMAL VIEWING');

    // Change cloud cover to 95%
    fireEvent.change(cloudInput, { target: { value: '95' } });
    expect(statusPanel.textContent).toContain('POOR VIEWING');
  });

  it('tracks packing checklist progress with data-testid counter', () => {
    render(<StargazingHub />);

    const counter = screen.getByTestId('stargazing-gear-counter');
    expect(counter.textContent).toBe('0 of 9 packed');

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBe(9);

    // Check first item
    fireEvent.click(checkboxes[0]);
    expect(counter.textContent).toBe('1 of 9 packed');

    // Check second item
    fireEvent.click(checkboxes[1]);
    expect(counter.textContent).toBe('2 of 9 packed');

    // Uncheck first item
    fireEvent.click(checkboxes[0]);
    expect(counter.textContent).toBe('1 of 9 packed');
  });
});
