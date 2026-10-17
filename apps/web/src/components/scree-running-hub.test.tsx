import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ScreeRunningHub from './scree-running-hub';

describe('ScreeRunningHub', () => {
  it('renders section headings and site cards with proper heading hierarchy', () => {
    render(<ScreeRunningHub />);

    const h2s = screen.getAllByRole('heading', { level: 2 });
    expect(h2s.map((h) => h.textContent)).toEqual([
      'Premier High-Altitude Alpine Scree Running Corridors',
      'Scree Slope Descent Kinematics & Impact Calculator',
      'Mandatory Scree Running & Talus Protection Checklist',
    ]);

    const h3s = screen.getAllByRole('heading', { level: 3 });
    expect(h3s.length).toBeGreaterThanOrEqual(6);
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Mount Sneffels Lavender Col & South Scree Gully/i,
      })
    ).toBeDefined();
  });

  it('filters scree running sites when grading filter buttons are clicked', () => {
    render(<ScreeRunningHub />);

    // Filter to Fine Shale Pea Scree
    const fineShaleBtn = screen.getByRole('button', {
      name: /^Fine Shale Pea Scree$/i,
    });
    expect(fineShaleBtn.getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(fineShaleBtn);
    expect(fineShaleBtn.getAttribute('aria-pressed')).toBe('true');

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Mount Teide Montaña Blanca Pumice & Cinder Scree Fan/i,
      })
    ).toBeDefined();
    expect(
      screen.queryByRole('heading', {
        level: 3,
        name: /Mount Sneffels Lavender Col & South Scree Gully/i,
      })
    ).toBeNull();

    // Filter to Medium Slate Gravel Scree
    const mediumSlateBtn = screen.getByRole('button', {
      name: /^Medium Slate Gravel Scree$/i,
    });
    fireEvent.click(mediumSlateBtn);

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Mount Stephen Burgess Shale & Fossil Scree Slope/i,
      })
    ).toBeDefined();
    expect(
      screen.queryByRole('heading', {
        level: 3,
        name: /Mount Teide Montaña Blanca Pumice & Cinder Scree Fan/i,
      })
    ).toBeNull();

    // Reset to All Scree Gradings
    const allBtn = screen.getByRole('button', { name: /^All Scree Gradings$/i });
    fireEvent.click(allBtn);

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Mount Sneffels Lavender Col & South Scree Gully/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Mount Teide Montaña Blanca Pumice & Cinder Scree Fan/i,
      })
    ).toBeDefined();
  });

  it('updates live calculator result when controls are adjusted', () => {
    render(<ScreeRunningHub />);

    const resultPanel = screen.getByTestId('scree-running-calculator-result');
    expect(resultPanel.getAttribute('role')).toBe('status');
    expect(resultPanel.textContent).toContain(
      'Mount Sneffels Lavender Col & South Scree Gully'
    );

    // Switch site to Mount Teide
    const siteSelect = screen.getByLabelText(/select scree corridor/i);
    fireEvent.change(siteSelect, {
      target: { value: 'mount-teide-volcanic-cinder-scree' },
    });

    expect(resultPanel.textContent).toContain(
      'Mount Teide Montaña Blanca Pumice & Cinder Scree Fan'
    );

    // Increase slope angle and runner weight
    const slopeInput = screen.getByLabelText(/slope angle/i);
    fireEvent.change(slopeInput, { target: { value: '39' } });

    const weightInput = screen.getByLabelText(/runner weight/i);
    fireEvent.change(weightInput, { target: { value: '95' } });

    expect(resultPanel.textContent).toContain('Braking Technique Advisory');
    expect(resultPanel.textContent).toContain('Gaiter & Protection Protocol');
  });

  it('toggles gear checklist items and updates the packed gear counter', () => {
    render(<ScreeRunningHub />);

    const counter = screen.getByTestId('scree-running-gear-counter');
    expect(counter.textContent).toBe('0 of 6 packed');

    const gaitersCheckbox = screen.getByLabelText(
      /High-Cuff Cordura Scree & Volcanic Dust Gaiters/i
    );
    fireEvent.click(gaitersCheckbox);
    expect(counter.textContent).toBe('1 of 6 packed');

    const helmetCheckbox = screen.getByLabelText(
      /Ultra-Light EN 12492 Hybrid Polycarbonate Scree Helmet/i
    );
    fireEvent.click(helmetCheckbox);
    expect(counter.textContent).toBe('2 of 6 packed');

    fireEvent.click(gaitersCheckbox);
    expect(counter.textContent).toBe('1 of 6 packed');
  });
});
