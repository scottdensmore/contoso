import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CryokarstSpeleologyHub from './cryokarst-speleology-hub';

describe('CryokarstSpeleologyHub', () => {
  it('renders section headings (h2) and site card headings (h3) without skipping levels', () => {
    render(<CryokarstSpeleologyHub />);

    const h2Elements = screen.getAllByRole('heading', { level: 2 });
    expect(h2Elements.length).toBe(3);
    expect(h2Elements[0].textContent).toContain('Iconic Cryokarst & Glacial Ice Cave Exploration Sites');
    expect(h2Elements[1].textContent).toContain('Cryokarst Dynamics, Anchor Creep & Outburst Risk Calculator');
    expect(h2Elements[2].textContent).toContain('Mandatory Technical Cryokarst Speleology Gear Checklist');

    const h3Elements = screen.getAllByRole('heading', { level: 3 });
    expect(h3Elements.length).toBe(5);
    expect(h3Elements[0].textContent).toContain('Matanuska Glacier Moulin Cathedral');
  });

  it('filters sites by conduit type', () => {
    render(<CryokarstSpeleologyHub />);

    expect(
      screen.getByRole('heading', { level: 3, name: /Matanuska Glacier Moulin Cathedral/i })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', { level: 3, name: /Mount Hood Palmer Glacier Fumarole/i })
    ).toBeDefined();

    // Click Volcanic Fumarole Melt Cave filter
    const fumaroleFilterBtn = screen.getByRole('button', { name: /^Volcanic Fumarole Melt Cave$/i });
    fireEvent.click(fumaroleFilterBtn);

    expect(
      screen.getByRole('heading', { level: 3, name: /Mount Hood Palmer Glacier Fumarole/i })
    ).toBeDefined();
    expect(
      screen.queryByRole('heading', { level: 3, name: /Matanuska Glacier Moulin Cathedral/i })
    ).toBeNull();

    // Reset to All Conduits
    const allBtn = screen.getByRole('button', { name: /^All Conduits$/i });
    fireEvent.click(allBtn);

    expect(
      screen.getByRole('heading', { level: 3, name: /Matanuska Glacier Moulin Cathedral/i })
    ).toBeDefined();
  });

  it('updates live calculator results when inputs change', () => {
    render(<CryokarstSpeleologyHub />);

    const resultPanel = screen.getByTestId('cryokarst-calculator-result');
    expect(resultPanel).toBeDefined();
    expect(resultPanel.textContent).toContain('Matanuska Glacier Moulin Cathedral');
    expect(resultPanel.textContent).toContain('1.4 mm/hr');
    expect(resultPanel.textContent).toContain('19 mm/day');
    expect(resultPanel.textContent).toContain('0.32');
    expect(resultPanel.textContent).toContain('Nominal: Stable Cold Ice');

    // Change site to Palmer Glacier
    const siteSelect = screen.getByLabelText(/Select Glacial Exploration Site/i);
    fireEvent.change(siteSelect, { target: { value: 'palmer-glacier-fumarole-ice-caves' } });

    expect(resultPanel.textContent).toContain('Mount Hood Palmer Glacier Fumarole Thermal Ice Caves');
    expect(resultPanel.textContent).toContain('Critical: Collapse & Ablation Danger');
  });

  it('interacts with the gear checklist and updates the counter', () => {
    render(<CryokarstSpeleologyHub />);

    const counter = screen.getByTestId('cryokarst-gear-counter');
    expect(counter.textContent).toBe('0 of 6 packed');

    const firstCheckbox = screen.getByLabelText(/Waterproof Cordura Glacial Caving Oversuit/i);
    fireEvent.click(firstCheckbox);
    expect(counter.textContent).toBe('1 of 6 packed');

    const secondCheckbox = screen.getByLabelText(/21cm Stainless Steel Reverse-Thread Ice Screws/i);
    fireEvent.click(secondCheckbox);
    expect(counter.textContent).toBe('2 of 6 packed');

    fireEvent.click(firstCheckbox);
    expect(counter.textContent).toBe('1 of 6 packed');
  });
});
