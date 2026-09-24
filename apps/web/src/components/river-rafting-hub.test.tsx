import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RiverRaftingHub from './river-rafting-hub';

describe('RiverRaftingHub component', () => {
  it('renders required h2 section headings and h3 card headings without skipped levels', () => {
    render(<RiverRaftingHub />);

    const h2s = screen.getAllByRole('heading', { level: 2 });
    expect(h2s.length).toBeGreaterThanOrEqual(3);

    const h3s = screen.getAllByRole('heading', { level: 3 });
    expect(h3s.length).toBe(5); // 5 iconic river expedition cards

    const h2Texts = h2s.map((h) => h.textContent);
    expect(
      h2Texts.some((t) => t?.includes('Iconic Multi-Day Whitewater Expeditions'))
    ).toBe(true);
    expect(
      h2Texts.some((t) => t?.includes('Oar Leverage & Raft Dynamics Calculator'))
    ).toBe(true);
    expect(
      h2Texts.some((t) => t?.includes('Multi-Day Rafting & Groover Safety Checklist'))
    ).toBe(true);
  });

  it('filters expeditions when difficulty buttons are clicked', () => {
    render(<RiverRaftingHub />);

    // Initially all 5 expeditions are displayed
    expect(
      screen.getByRole('heading', { level: 3, name: /Colorado River — Grand Canyon Expedition/i })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', { level: 3, name: /Middle Fork of the Salmon River/i })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', { level: 3, name: /Rogue River Wilderness Wild & Scenic/i })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', { level: 3, name: /Selway River National Wilderness/i })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', { level: 3, name: /Green River — Gates of Lodore/i })
    ).toBeDefined();

    // Click Class V Expert filter
    const class5Btn = screen.getByRole('button', { name: /class v expert/i });
    fireEvent.click(class5Btn);

    expect(
      screen.getByRole('heading', { level: 3, name: /Colorado River — Grand Canyon Expedition/i })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', { level: 3, name: /Selway River National Wilderness/i })
    ).toBeDefined();
    expect(
      screen.queryByRole('heading', { level: 3, name: /Middle Fork of the Salmon River/i })
    ).toBeNull();
    expect(
      screen.queryByRole('heading', { level: 3, name: /Rogue River Wilderness Wild & Scenic/i })
    ).toBeNull();
    expect(
      screen.queryByRole('heading', { level: 3, name: /Green River — Gates of Lodore/i })
    ).toBeNull();

    // Click Class IV Advanced filter
    const class4Btn = screen.getByRole('button', { name: /class iv advanced/i });
    fireEvent.click(class4Btn);

    expect(
      screen.getByRole('heading', { level: 3, name: /Middle Fork of the Salmon River/i })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', { level: 3, name: /Rogue River Wilderness Wild & Scenic/i })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', { level: 3, name: /Green River — Gates of Lodore/i })
    ).toBeDefined();
    expect(
      screen.queryByRole('heading', { level: 3, name: /Colorado River — Grand Canyon Expedition/i })
    ).toBeNull();

    // Click Class III Moderate filter (0 matching items)
    const class3Btn = screen.getByRole('button', { name: /class iii moderate/i });
    fireEvent.click(class3Btn);

    expect(
      screen.getByText(/no river expeditions found matching this filter/i)
    ).toBeDefined();

    // Click All Expeditions filter
    const allBtn = screen.getByRole('button', { name: /all expeditions/i });
    fireEvent.click(allBtn);

    expect(
      screen.getByRole('heading', { level: 3, name: /Colorado River — Grand Canyon Expedition/i })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', { level: 3, name: /Green River — Gates of Lodore/i })
    ).toBeDefined();
  });

  it('updates raft dynamics calculation reactively with accessible live region', () => {
    render(<RiverRaftingHub />);

    const liveStatus = screen.getByRole('status');
    expect(liveStatus).toBeDefined();
    expect(liveStatus.getAttribute('aria-live')).toBe('polite');

    const expeditionSelect = screen.getByLabelText(/select river expedition/i);
    const raftLengthInput = screen.getByLabelText(/raft length/i);
    const payloadInput = screen.getByLabelText(/rigged payload weight/i);
    const oarLengthSelect = screen.getByLabelText(/oar length/i);
    const inboardInput = screen.getByLabelText(/inboard leverage/i);
    const speedInput = screen.getByLabelText(/entry speed/i);

    fireEvent.change(expeditionSelect, {
      target: { value: 'colorado-river-grand-canyon' },
    });
    fireEvent.change(raftLengthInput, { target: { value: '18' } });
    fireEvent.change(payloadInput, { target: { value: '650' } });
    fireEvent.change(oarLengthSelect, { target: { value: '10' } });
    fireEvent.change(inboardInput, { target: { value: '34' } });
    fireEvent.change(speedInput, { target: { value: '6' } });

    expect(liveStatus.textContent).toContain('Colorado River — Grand Canyon Expedition');
    expect(liveStatus.textContent).toContain('2.53');
    expect(liveStatus.textContent).toContain('834 L');
    expect(liveStatus.textContent).toContain('2451 N·s');
    expect(liveStatus.textContent?.toLowerCase()).toContain('punch clean');
    expect(liveStatus.textContent).toContain('71 / 100');
    expect(liveStatus.textContent).toContain('Oar leverage ratio too stiff!');
    expect(liveStatus.textContent).toContain('Heavy expedition rigging');
  });

  it('interacts with the multi-day rafting checklist and updates gear counter', () => {
    render(<RiverRaftingHub />);

    const counter = screen.getByTestId('river-rafting-gear-counter');
    expect(counter.textContent).toBe('0 of 6 packed');

    const frameCheckbox = screen.getByLabelText(
      /Extruded Modular Aluminum Oar Frame/i
    );
    fireEvent.click(frameCheckbox);
    expect(counter.textContent).toBe('1 of 6 packed');

    const oarsCheckbox = screen.getByLabelText(
      /Counterbalanced Carbon Oars/i
    );
    fireEvent.click(oarsCheckbox);
    expect(counter.textContent).toBe('2 of 6 packed');

    fireEvent.click(frameCheckbox);
    expect(counter.textContent).toBe('1 of 6 packed');
  });
});
