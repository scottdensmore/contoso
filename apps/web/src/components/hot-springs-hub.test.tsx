import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HotSpringsHub from './hot-springs-hub';

describe('HotSpringsHub Component', () => {
  it('renders required section headings (h2) and card headings (h3) without skipped levels', () => {
    render(<HotSpringsHub />);

    // Section headings (h2)
    const h2Elements = screen.getAllByRole('heading', { level: 2 });
    expect(h2Elements.length).toBeGreaterThanOrEqual(3);
    const h2Texts = h2Elements.map((h) => h.textContent?.toLowerCase() ?? '');
    expect(h2Texts.some((t) => t.includes('springs') || t.includes('directory'))).toBe(true);
    expect(h2Texts.some((t) => t.includes('planner'))).toBe(true);
    expect(h2Texts.some((t) => t.includes('checklist') || t.includes('kit') || t.includes('ethics'))).toBe(true);

    // Card headings (h3)
    const h3Elements = screen.getAllByRole('heading', { level: 3 });
    expect(h3Elements.length).toBe(5);
    const cardNames = h3Elements.map((h) => h.textContent);
    expect(cardNames).toContain('Scenic Hot Springs');
    expect(cardNames).toContain('Goldmyer Hot Springs');
    expect(cardNames).toContain('Bagby Hot Springs');
    expect(cardNames).toContain('Travertine Hot Springs');
    expect(cardNames).toContain('Kirkham Hot Springs');
  });

  it('filters hot springs when filter buttons are clicked', () => {
    render(<HotSpringsHub />);

    // All 5 are visible initially in the directory
    expect(screen.getByRole('heading', { level: 3, name: 'Scenic Hot Springs' })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: 'Goldmyer Hot Springs' })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: 'Bagby Hot Springs' })).toBeDefined();

    // Click "Rugged Backcountry"
    const ruggedBtn = screen.getByRole('button', { name: /rugged backcountry/i });
    fireEvent.click(ruggedBtn);

    expect(screen.getByRole('heading', { level: 3, name: 'Goldmyer Hot Springs' })).toBeDefined();
    expect(screen.queryByRole('heading', { level: 3, name: 'Scenic Hot Springs' })).toBeNull();
    expect(screen.queryByRole('heading', { level: 3, name: 'Bagby Hot Springs' })).toBeNull();
    expect(screen.queryByRole('heading', { level: 3, name: 'Travertine Hot Springs' })).toBeNull();
    expect(screen.queryByRole('heading', { level: 3, name: 'Kirkham Hot Springs' })).toBeNull();

    // Click "Easy Walk"
    const easyBtn = screen.getByRole('button', { name: /easy walk/i });
    fireEvent.click(easyBtn);

    expect(screen.getByRole('heading', { level: 3, name: 'Bagby Hot Springs' })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: 'Travertine Hot Springs' })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: 'Kirkham Hot Springs' })).toBeDefined();
    expect(screen.queryByRole('heading', { level: 3, name: 'Goldmyer Hot Springs' })).toBeNull();
    expect(screen.queryByRole('heading', { level: 3, name: 'Scenic Hot Springs' })).toBeNull();

    // Click "All Springs"
    const allBtn = screen.getByRole('button', { name: /all springs/i });
    fireEvent.click(allBtn);

    expect(screen.getByRole('heading', { level: 3, name: 'Scenic Hot Springs' })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: 'Goldmyer Hot Springs' })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: 'Bagby Hot Springs' })).toBeDefined();
  });

  it('updates live reactive results in soaking trip & temperature planner', () => {
    render(<HotSpringsHub />);

    const livePanel = screen.getByRole('status');
    expect(livePanel).toBeDefined();
    expect(livePanel.getAttribute('aria-live')).toBe('polite');

    const springSelect = screen.getByLabelText(/select hot spring/i);
    const partyInput = screen.getByLabelText(/party size/i);
    const durationInput = screen.getByLabelText(/duration/i);

    // Default values reflect calculation
    const initialText = livePanel.textContent ?? '';
    expect(initialText.toLowerCase()).toContain('safe');

    // Change to Scenic Hot Springs
    fireEvent.change(springSelect, { target: { value: 'scenic-hot-springs' } });
    fireEvent.change(partyInput, { target: { value: '4' } });
    fireEvent.change(durationInput, { target: { value: '60' } });

    const updatedText = livePanel.textContent ?? '';
    expect(updatedText).toContain('Scenic Hot Springs');
    // For 4 people, 60 min summer, hydration is 5.2 L
    expect(screen.getByTestId('calculated-hydration').textContent).toBe('5.2 L');
    // Safe single session limit for 104F is 30 mins
    expect(updatedText).toContain('30 min');
  });

  it('manages gear checklist and live progress counter correctly', () => {
    render(<HotSpringsHub />);

    const counter = screen.getByTestId('hot-springs-gear-counter');
    expect(counter.textContent).toBe('0 of 6 packed');

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(6);

    // Each checkbox has an associated label
    checkboxes.forEach((cb) => {
      const id = cb.getAttribute('id');
      expect(id).toBeTruthy();
      const label = document.querySelector(`label[for="${id}"]`);
      expect(label).toBeTruthy();
    });

    // Check first item
    fireEvent.click(checkboxes[0]);
    expect(counter.textContent).toBe('1 of 6 packed');

    // Check second item
    fireEvent.click(checkboxes[1]);
    expect(counter.textContent).toBe('2 of 6 packed');

    // Uncheck first item
    fireEvent.click(checkboxes[0]);
    expect(counter.textContent).toBe('1 of 6 packed');
  });
});
