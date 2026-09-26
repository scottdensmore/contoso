import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GoldProspectingHub from './gold-prospecting-hub';

describe('GoldProspectingHub', () => {
  it('renders all required section headings with correct h2 hierarchy', () => {
    render(<GoldProspectingHub />);

    const h2Headings = screen.getAllByRole('heading', { level: 2 });
    const texts = h2Headings.map((h) => h.textContent?.trim());

    expect(texts).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Iconic Placer Prospecting Sites'),
        expect.stringContaining('Sluice Flow & Placer Recovery Calculator'),
        expect.stringContaining('Mandatory Cold-Stream Prospecting Kit Checklist'),
      ]),
    );
  });

  it('renders site cards with h3 headings, stats, badges, and highlights', () => {
    render(<GoldProspectingHub />);

    const h3Headings = screen.getAllByRole('heading', { level: 3 });
    const h3Texts = h3Headings.map((h) => h.textContent?.trim());

    expect(h3Texts).toEqual(
      expect.arrayContaining([
        expect.stringContaining('South Fork American River & Coloma Shallows'),
        expect.stringContaining('Cache Creek Placer Basin & Granite Gulch'),
        expect.stringContaining('Pedro Creek & Tanana Valley Basin'),
        expect.stringContaining('Galice Creek & Rogue River Canyon'),
        expect.stringContaining('Swift River Glacial Placer Bed'),
      ]),
    );

    expect(screen.getByText(/230 m/i)).toBeDefined();
    expect(screen.getAllByText(/4.8 g\/ton/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Gold Discovery Park gravel shallows/i)).toBeDefined();
  });

  it('filters site catalog cards using deposit type filter tabs', () => {
    render(<GoldProspectingHub />);

    const grid = screen.getByTestId('gold-prospecting-sites-grid');
    expect(grid.textContent).toContain('South Fork American River & Coloma Shallows');
    expect(grid.textContent).toContain('Pedro Creek & Tanana Valley Basin');

    // Filter by Inside Bend Bar
    const insideBendBtn = screen.getByRole('button', { name: /inside bend/i });
    fireEvent.click(insideBendBtn);

    expect(grid.textContent).toContain('South Fork American River & Coloma Shallows');
    expect(grid.textContent).not.toContain('Pedro Creek & Tanana Valley Basin');
    expect(grid.textContent).not.toContain('Cache Creek Placer Basin');

    // Filter by Bedrock Crevice
    const bedrockBtn = screen.getByRole('button', { name: /bedrock crevice/i });
    fireEvent.click(bedrockBtn);

    expect(grid.textContent).toContain('Pedro Creek & Tanana Valley Basin');
    expect(grid.textContent).not.toContain('South Fork American River & Coloma Shallows');

    // Reset to All Sites
    const allBtn = screen.getByRole('button', { name: /all sites/i });
    fireEvent.click(allBtn);

    expect(grid.textContent).toContain('South Fork American River & Coloma Shallows');
    expect(grid.textContent).toContain('Pedro Creek & Tanana Valley Basin');
  });

  it('calculates placer recovery and updates status reactively', () => {
    render(<GoldProspectingHub />);

    const resultPanel = screen.getByTestId('gold-prospecting-calculator-result');
    expect(resultPanel).toBeDefined();
    expect(resultPanel.getAttribute('role')).toBe('status');
    expect(resultPanel.getAttribute('aria-live')).toBe('polite');

    // Default site is American River (yield 4.8), 5 buckets => 2.16g, slope 7, vel 3.5 => optimal
    expect(resultPanel.textContent).toContain('2.16');
    expect(resultPanel.textContent).toContain('92%');
    expect(resultPanel.textContent).toContain('7.28x');
    expect(resultPanel.textContent).toMatch(/optimal riffle recovery/i);

    // Adjust volume slider to 10 buckets => 10 * 0.45 * (4.8 / 5.0) = 4.32g
    const volumeInput = screen.getByLabelText(/gravel volume/i);
    fireEvent.change(volumeInput, { target: { value: '10' } });
    expect(resultPanel.textContent).toContain('4.32');

    // Adjust slope to 4 deg => underflow clogging risk
    const slopeInput = screen.getByLabelText(/sluice box slope/i);
    fireEvent.change(slopeInput, { target: { value: '4' } });
    expect(resultPanel.textContent).toMatch(/underflow clogging risk/i);
    expect(resultPanel.textContent).toContain('64%');

    // Reset slope to 7 deg and adjust velocity to 6.0 fps => scour blowout velocity
    fireEvent.change(slopeInput, { target: { value: '7' } });
    const velocityInput = screen.getByLabelText(/stream flow velocity/i);
    fireEvent.change(velocityInput, { target: { value: '6.0' } });
    expect(resultPanel.textContent).toMatch(/scour blowout velocity/i);
    expect(resultPanel.textContent).toContain('48%');
  });

  it('tracks gear packing progress with live counter and checkboxes', () => {
    render(<GoldProspectingHub />);

    const counter = screen.getByTestId('gold-prospecting-gear-counter');
    expect(counter.textContent).toContain('0 of 6 packed');

    const panCheckbox = screen.getByLabelText(/14-Inch Deep-Drop Dual Riffle Gravity Pan/i);
    fireEvent.click(panCheckbox);
    expect(counter.textContent).toContain('1 of 6 packed');

    const classifierCheckbox = screen.getByLabelText(/1\/2-Inch & 1\/4-Inch Stainless Classifier Sieve Set/i);
    fireEvent.click(classifierCheckbox);
    expect(counter.textContent).toContain('2 of 6 packed');

    fireEvent.click(panCheckbox);
    expect(counter.textContent).toContain('1 of 6 packed');
  });
});
