import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SizeGuideModal from './size-guide-modal';

describe('SizeGuideModal component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders closed trigger button with accessible attributes', () => {
    render(<SizeGuideModal category="Hiking Clothing" productName="Summit Breeze Jacket" />);

    const triggerBtn = screen.getByRole('button', { name: /size guide/i });
    expect(triggerBtn).toBeDefined();
    expect(triggerBtn.getAttribute('aria-haspopup')).toBe('dialog');
    expect(triggerBtn.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('opens dialog when trigger button is clicked', async () => {
    render(<SizeGuideModal category="Hiking Clothing" productName="Summit Breeze Jacket" />);

    const triggerBtn = screen.getByRole('button', { name: /size guide/i });
    fireEvent.click(triggerBtn);

    expect(triggerBtn.getAttribute('aria-expanded')).toBe('true');
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeDefined();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-labelledby')).toBe('size-guide-modal-title');

    const title = document.getElementById('size-guide-modal-title');
    expect(title).toBeDefined();
    expect(title?.textContent).toMatch(/size guide/i);
  });

  it('closes dialog and restores focus when close button is clicked', async () => {
    render(<SizeGuideModal category="Hiking Clothing" productName="Summit Breeze Jacket" />);

    const triggerBtn = screen.getByRole('button', { name: /size guide/i });
    triggerBtn.focus();
    fireEvent.click(triggerBtn);

    const closeBtn = screen.getByRole('button', { name: /close size guide/i });
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    expect(triggerBtn.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(triggerBtn);
  });

  it('closes dialog when Escape key is pressed', async () => {
    render(<SizeGuideModal category="Tents" productName="TrailMaster X4 Tent" />);

    const triggerBtn = screen.getByRole('button', { name: /size guide/i });
    triggerBtn.focus();
    fireEvent.click(triggerBtn);

    expect(screen.getByRole('dialog')).toBeDefined();

    fireEvent.keyDown(window, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    expect(document.activeElement).toBe(triggerBtn);
  });

  it('closes dialog when backdrop is clicked', async () => {
    render(<SizeGuideModal category="Tents" productName="TrailMaster X4 Tent" />);

    const triggerBtn = screen.getByRole('button', { name: /size guide/i });
    fireEvent.click(triggerBtn);

    const backdrop = screen.getByTestId('size-guide-backdrop');
    fireEvent.click(backdrop);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  it('renders accessible tab list and switches between Size Chart and Fit Calculator', async () => {
    render(<SizeGuideModal category="Tents" productName="TrailMaster X4 Tent" />);

    fireEvent.click(screen.getByRole('button', { name: /size guide/i }));

    const chartTab = screen.getByRole('tab', { name: /size chart/i });
    const calcTab = screen.getByRole('tab', { name: /fit calculator/i });

    expect(chartTab.getAttribute('aria-selected')).toBe('true');
    expect(calcTab.getAttribute('aria-selected')).toBe('false');
    expect(screen.getByRole('tabpanel', { name: /size chart/i })).toBeDefined();

    // Switch to Fit Calculator tab
    fireEvent.click(calcTab);
    expect(chartTab.getAttribute('aria-selected')).toBe('false');
    expect(calcTab.getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('tabpanel', { name: /fit calculator/i })).toBeDefined();
  });

  it('supports arrow key navigation between tabs', async () => {
    render(<SizeGuideModal category="Tents" productName="TrailMaster X4 Tent" />);

    fireEvent.click(screen.getByRole('button', { name: /size guide/i }));

    const chartTab = screen.getByRole('tab', { name: /size chart/i });
    const calcTab = screen.getByRole('tab', { name: /fit calculator/i });

    chartTab.focus();
    fireEvent.keyDown(chartTab, { key: 'ArrowRight' });

    expect(calcTab.getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(calcTab);

    fireEvent.keyDown(calcTab, { key: 'ArrowLeft' });
    expect(chartTab.getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(chartTab);
  });

  it('toggles measurement units between inches and centimeters', async () => {
    render(<SizeGuideModal category="Hiking Clothing" productName="Summit Breeze Jacket" />);

    fireEvent.click(screen.getByRole('button', { name: /size guide/i }));

    const unitToggle = screen.getByRole('button', { name: /centimeters|metric|toggle unit/i });
    expect(unitToggle.getAttribute('aria-pressed')).toBe('false');
    expect(screen.getByText(/34-36"/)).toBeDefined();

    fireEvent.click(unitToggle);
    expect(unitToggle.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText(/86-91 cm/)).toBeDefined();
  });

  it('calculates recommended size and announces to screen reader via aria-live', async () => {
    render(<SizeGuideModal category="Hiking Clothing" productName="Summit Breeze Jacket" />);

    fireEvent.click(screen.getByRole('button', { name: /size guide/i }));

    // Switch to fit calculator tab
    fireEvent.click(screen.getByRole('tab', { name: /fit calculator/i }));

    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '43' } });

    const findBtn = screen.getByRole('button', { name: /find my size/i });
    fireEvent.click(findBtn);

    const liveRegion = screen.getByTestId('size-recommendation-live');
    expect(liveRegion.getAttribute('aria-live')).toBe('polite');
    expect(liveRegion.textContent).toContain('Large');
    expect(liveRegion.textContent).toContain('Size Large — recommended for comfortable layering');
  });

  it('traps focus inside modal while navigating with Tab key', async () => {
    render(<SizeGuideModal category="Hiking Clothing" productName="Summit Breeze Jacket" />);

    fireEvent.click(screen.getByRole('button', { name: /size guide/i }));

    const dialog = screen.getByRole('dialog');
    const focusable = dialog.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    expect(focusable.length).toBeGreaterThan(1);

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    // Shift-Tab on first element should wrap to last
    first.focus();
    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(last);

    // Tab on last element should wrap to first
    last.focus();
    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: false });
    expect(document.activeElement).toBe(first);
  });
});
