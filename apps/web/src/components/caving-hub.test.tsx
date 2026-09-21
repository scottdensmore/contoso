import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import CavingHub from './caving-hub';

describe('CavingHub Component', () => {
  it('renders all main sections with h2 headings', () => {
    render(<CavingHub />);

    const h2s = screen.getAllByRole('heading', { level: 2 });
    const headings = h2s.map((h) => h.textContent);

    expect(headings.some((h) => /caving|caves|routes/i.test(h || ''))).toBe(true);
    expect(headings.some((h) => /srt rigging|calculator/i.test(h || ''))).toBe(true);
    expect(headings.some((h) => /safety kit|checklist/i.test(h || ''))).toBe(true);
  });

  it('renders cave cards with h3 headings and key speleology metrics', () => {
    render(<CavingHub />);

    const grid = screen.getByTestId('caving-routes-grid');
    const h3s = within(grid).getAllByRole('heading', { level: 3 });
    const titles = h3s.map((h) => h.textContent);

    expect(titles.some((t) => t?.includes('Fantastic Pit'))).toBe(true);
    expect(titles.some((t) => t?.includes('Mammoth Cave'))).toBe(true);
    expect(titles.some((t) => t?.includes('Great X Pit'))).toBe(true);
    expect(titles.some((t) => t?.includes('Slaughter Canyon'))).toBe(true);
    expect(titles.some((t) => t?.includes('Tumbling Rock Cave'))).toBe(true);

    // Verify metrics in cards
    expect(within(grid).getByText(/325\s*m/)).toBeDefined();
    expect(within(grid).getByText(/179\s*m/)).toBeDefined();
    expect(within(grid).getByText(/8\.5\s*hrs/)).toBeDefined();
    expect(within(grid).getByText(/680000\s*m/)).toBeDefined();
  });

  it('filters caves when cave class filter buttons are clicked', () => {
    render(<CavingHub />);

    const grid = screen.getByTestId('caving-routes-grid');

    // Filter by Class 4 (Vertical SRT)
    const class4Btn = screen.getByRole('button', { name: /class 4.*vertical/i });
    fireEvent.click(class4Btn);

    expect(within(grid).getByRole('heading', { level: 3, name: /Fantastic Pit/i })).toBeDefined();
    expect(within(grid).queryByRole('heading', { level: 3, name: /Mammoth Cave/i })).toBeNull();
    expect(within(grid).queryByRole('heading', { level: 3, name: /Great X Pit/i })).toBeNull();

    // Filter by Class 5 (Complex Alpine)
    const class5Btn = screen.getByRole('button', { name: /class 5.*alpine/i });
    fireEvent.click(class5Btn);

    expect(within(grid).getByRole('heading', { level: 3, name: /Great X Pit/i })).toBeDefined();
    expect(within(grid).queryByRole('heading', { level: 3, name: /Fantastic Pit/i })).toBeNull();
    expect(within(grid).queryByRole('heading', { level: 3, name: /Mammoth Cave/i })).toBeNull();

    // Reset filter to All Caves
    const allBtn = screen.getByRole('button', { name: /all caves/i });
    fireEvent.click(allBtn);

    expect(within(grid).getByRole('heading', { level: 3, name: /Fantastic Pit/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /Mammoth Cave/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /Great X Pit/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /Slaughter Canyon/i })).toBeDefined();
    expect(within(grid).getByRole('heading', { level: 3, name: /Tumbling Rock Cave/i })).toBeDefined();
  });

  it('updates live SRT calculator reactive results panel with role="status" and aria-live="polite"', () => {
    render(<CavingHub />);

    const resultPanel = screen.getByTestId('srt-calculator-result');
    expect(resultPanel.getAttribute('role')).toBe('status');
    expect(resultPanel.getAttribute('aria-live')).toBe('polite');

    const caveSelect = screen.getByLabelText(/select.*cave/i);
    const pitchDepthInput = screen.getByLabelText(/pitch depth/i);
    const caverWeightInput = screen.getByLabelText(/caver weight/i);
    const packWeightInput = screen.getByLabelText(/pack weight/i);
    const ropeDiameterSelect = screen.getByLabelText(/rope diameter/i);
    const abrasionSelect = screen.getByLabelText(/abrasion risk/i);
    const rebelayToggle = screen.getByLabelText(/rebelay configured/i);

    // Select Fantastic Pit
    fireEvent.change(caveSelect, { target: { value: 'fantastic-pit-ellisons-cave' } });
    expect(within(resultPanel).getByRole('heading', { level: 3, name: /Fantastic Pit/i })).toBeDefined();

    // Adjust pitch depth to deep drop (>50m, e.g. 179m)
    fireEvent.change(pitchDepthInput, { target: { value: '179' } });
    expect(within(resultPanel).getByText(/Rappel Rack/i)).toBeDefined();

    // Severe rub point without rebelay
    fireEvent.change(abrasionSelect, { target: { value: 'severe_rub_point' } });
    expect(within(resultPanel).getByText(/critical rope shear risk/i)).toBeDefined();

    // Configure rebelay
    fireEvent.click(rebelayToggle);
    expect(within(resultPanel).getByText(/caution rope pad required/i)).toBeDefined();
    expect(within(resultPanel).getByText(/rebelay configured/i)).toBeDefined();

    // Clean drop
    fireEvent.change(abrasionSelect, { target: { value: 'none_clean_drop' } });
    expect(within(resultPanel).getByText(/approved safe hang/i)).toBeDefined();

    // Adjust caver weight, pack weight, and rope diameter
    fireEvent.change(caverWeightInput, { target: { value: '80' } });
    fireEvent.change(packWeightInput, { target: { value: '15' } });
    fireEvent.change(ropeDiameterSelect, { target: { value: '10.5' } });
    expect(within(resultPanel).getByText(/95\s*kg/i)).toBeDefined();
  });

  it('toggles checklist items and updates live caving-gear-counter', () => {
    render(<CavingHub />);

    const counter = screen.getByTestId('caving-gear-counter');
    expect(counter.textContent).toMatch(/0 of 6 packed/i);

    const helmetCheckbox = screen.getByLabelText(/en 12492 certified caving helmet/i);
    fireEvent.click(helmetCheckbox);
    expect(counter.textContent).toMatch(/1 of 6 packed/i);

    const backupHeadlampCheckbox = screen.getByLabelText(/independent 300\+ lumen backup headlamp/i);
    fireEvent.click(backupHeadlampCheckbox);
    expect(counter.textContent).toMatch(/2 of 6 packed/i);

    fireEvent.click(helmetCheckbox);
    expect(counter.textContent).toMatch(/1 of 6 packed/i);
  });

  it('has accessible form control labels and distinct htmlFor pairings', () => {
    render(<CavingHub />);

    expect(screen.getByLabelText(/select.*cave/i)).toBeDefined();
    expect(screen.getByLabelText(/pitch depth/i)).toBeDefined();
    expect(screen.getByLabelText(/caver weight/i)).toBeDefined();
    expect(screen.getByLabelText(/pack weight/i)).toBeDefined();
    expect(screen.getByLabelText(/rope diameter/i)).toBeDefined();
    expect(screen.getByLabelText(/abrasion risk/i)).toBeDefined();
    expect(screen.getByLabelText(/rebelay configured/i)).toBeDefined();
  });
});
