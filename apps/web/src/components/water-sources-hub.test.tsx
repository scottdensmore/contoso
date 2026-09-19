import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import WaterSourcesHub from './water-sources-hub';

describe('WaterSourcesHub Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders all required section headings and guide information', () => {
    render(<WaterSourcesHub />);

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Find Water Sources & Flow Rates/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Hydration Carrying Capacity Calculator/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Report Field Water Condition/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Filtration & Pathogen Treatment Guide/i,
      })
    ).toBeDefined();

    // Verify pathogen safety guidance items
    expect(screen.getByText(/Giardia lamblia/i)).toBeDefined();
    expect(screen.getByText(/Cryptosporidium parvum/i)).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Bacteria/i })).toBeDefined();
  });

  it('filters water sources by reliability rating', () => {
    render(<WaterSourcesHub />);
    const list = screen.getByTestId('water-sources-list');

    // Initially Colchuck Creek (Year-round) and Asgard Pass (Seasonal) are displayed
    expect(within(list).getByText('Colchuck Creek Footbridge Crossing')).toBeDefined();
    expect(within(list).getByText('Asgard Pass Mid-Slope Melt Cascades')).toBeDefined();

    // Filter by Year-round
    const reliabilitySelect = screen.getByLabelText(/filter by reliability/i);
    fireEvent.change(reliabilitySelect, { target: { value: 'Year-round' } });

    expect(within(list).getByText('Colchuck Creek Footbridge Crossing')).toBeDefined();
    expect(within(list).queryByText('Asgard Pass Mid-Slope Melt Cascades')).toBeNull();
  });

  it('filters water sources by region', () => {
    render(<WaterSourcesHub />);
    const list = screen.getByTestId('water-sources-list');

    const regionSelect = screen.getByLabelText(/filter by region/i);
    fireEvent.change(regionSelect, { target: { value: 'Olympics' } });

    expect(within(list).getByText('Pyrites Creek Spring')).toBeDefined();
    expect(within(list).queryByText('Colchuck Creek Footbridge Crossing')).toBeNull();
  });

  it('filters water sources by search term', () => {
    render(<WaterSourcesHub />);
    const list = screen.getByTestId('water-sources-list');

    const searchInput = screen.getByLabelText(/search water sources/i);
    fireEvent.change(searchInput, { target: { value: 'Wonderland' } });

    expect(within(list).getByText('Panhandle Gap Tarn')).toBeDefined();
    expect(within(list).queryByText('Colchuck Creek Footbridge Crossing')).toBeNull();
  });

  it('updates live hydration calculation when distance and temperature change', () => {
    render(<WaterSourcesHub />);

    const distanceInput = screen.getByLabelText(/distance \(miles\)/i);
    const tempInput = screen.getByLabelText(/temperature \(°f\)/i);

    // Initial default value (e.g. 5 miles, 68F)
    const initialLiters = screen.getByTestId('calculated-liters').textContent;

    // Adjust to 10 miles and 80°F
    fireEvent.change(distanceInput, { target: { value: '10' } });
    fireEvent.change(tempInput, { target: { value: '80' } });

    const updatedLiters = screen.getByTestId('calculated-liters').textContent;
    expect(updatedLiters).not.toEqual(initialLiters);
    expect(Number(updatedLiters)).toBeGreaterThan(Number(initialLiters));
  });

  it('selects source in report form when clicking "Report Condition"', () => {
    render(<WaterSourcesHub />);

    const reportButtons = screen.getAllByRole('button', { name: /report condition/i });
    fireEvent.click(reportButtons[0]); // First card is Colchuck Creek

    const sourceSelect = screen.getByLabelText(/select water source/i) as HTMLSelectElement;
    expect(sourceSelect.value).toBe('colchuck-creek');
  });

  it('validates required fields before submitting report', () => {
    render(<WaterSourcesHub />);

    const submitBtn = screen.getByRole('button', { name: /submit water condition report/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/please provide your name/i)).toBeDefined();
  });

  it('successfully submits a report and updates recent reports feed with WTR- code', () => {
    render(<WaterSourcesHub />);

    fireEvent.change(screen.getByLabelText(/select water source/i), {
      target: { value: 'colchuck-creek' },
    });
    fireEvent.change(screen.getByLabelText(/reporter name/i), {
      target: { value: 'Alex Honnold' },
    });
    fireEvent.change(screen.getByLabelText(/flow status/i), {
      target: { value: 'Flowing Strong' },
    });
    fireEvent.change(screen.getByLabelText(/turbidity/i), {
      target: { value: 'Crystal Clear' },
    });
    fireEvent.change(screen.getByLabelText(/treatment method used/i), {
      target: { value: 'hollow_fiber' },
    });
    fireEvent.change(screen.getByLabelText(/field notes/i), {
      target: { value: 'Clean and cold fast flow' },
    });

    const submitBtn = screen.getByRole('button', { name: /submit water condition report/i });
    fireEvent.click(submitBtn);

    // Confirmation message appears
    expect(screen.getByText(/report submitted successfully/i)).toBeDefined();

    // New report code matches WTR-XXXXX in feed
    const reportFeed = screen.getByTestId('recent-reports-feed');
    expect(reportFeed.textContent).toContain('WTR-');
    expect(reportFeed.textContent).toContain('Alex Honnold');
    expect(reportFeed.textContent).toContain('Clean and cold fast flow');
  });
});
