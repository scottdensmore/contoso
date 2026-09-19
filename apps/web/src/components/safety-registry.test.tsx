import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SafetyBeaconRegistry from './safety-beacon-registry';

describe('SafetyBeaconRegistry Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders registration form inputs, active registrations section, and protocols viewer', () => {
    render(<SafetyBeaconRegistry />);

    // Form inputs
    expect(screen.getByLabelText(/device type/i)).toBeDefined();
    expect(screen.getByLabelText(/device imei/i)).toBeDefined();
    expect(screen.getByLabelText(/owner name/i)).toBeDefined();
    expect(screen.getByLabelText(/owner phone/i)).toBeDefined();
    expect(screen.getByLabelText(/emergency contact name/i)).toBeDefined();
    expect(screen.getByLabelText(/emergency contact phone/i)).toBeDefined();
    expect(screen.getByLabelText(/backcountry zone|trip backcountry zone/i)).toBeDefined();
    expect(screen.getByLabelText(/departure date/i)).toBeDefined();
    expect(screen.getByLabelText(/return date/i)).toBeDefined();
    expect(screen.getByLabelText(/check-in frequency/i)).toBeDefined();
    expect(screen.getByLabelText(/medical notes/i)).toBeDefined();

    const submitBtn = screen.getByRole('button', {
      name: /register beacon & generate sar card/i,
    });
    expect(submitBtn).toBeDefined();

    // Section headings
    expect(
      screen.getByRole('heading', {
        name: /register satellite beacon & backcountry trip/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', {
        name: /active beacon registrations & sar response cards/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', {
        name: /wilderness emergency field protocols/i,
      })
    ).toBeDefined();
  });

  it('validates dates so return date cannot precede departure date', () => {
    render(<SafetyBeaconRegistry />);

    fireEvent.change(screen.getByLabelText(/owner name/i), {
      target: { value: 'Alex Honnold' },
    });
    fireEvent.change(screen.getByLabelText(/owner phone/i), {
      target: { value: '555-0199' },
    });
    fireEvent.change(screen.getByLabelText(/device imei/i), {
      target: { value: '300434061234560' },
    });
    fireEvent.change(screen.getByLabelText(/emergency contact name/i), {
      target: { value: 'Climbing Team' },
    });
    fireEvent.change(screen.getByLabelText(/emergency contact phone/i), {
      target: { value: '555-0198' },
    });
    fireEvent.change(screen.getByLabelText(/backcountry zone|trip backcountry zone/i), {
      target: { value: 'Cascades - Mount Rainier' },
    });

    // Inverted dates
    fireEvent.change(screen.getByLabelText(/departure date/i), {
      target: { value: '2026-10-10' },
    });
    fireEvent.change(screen.getByLabelText(/return date/i), {
      target: { value: '2026-10-05' },
    });

    fireEvent.click(
      screen.getByRole('button', {
        name: /register beacon & generate sar card/i,
      })
    );

    expect(
      screen.getByText(/return date cannot be earlier than departure date/i)
    ).toBeDefined();
  });

  it('submits registration, displays SAR response card with SBR- ID and ACTIVE_MONITORING badge', () => {
    render(<SafetyBeaconRegistry />);

    fireEvent.change(screen.getByLabelText(/device type/i), {
      target: { value: 'garmin_inreach' },
    });
    fireEvent.change(screen.getByLabelText(/device imei/i), {
      target: { value: '300434061234560' },
    });
    fireEvent.change(screen.getByLabelText(/owner name/i), {
      target: { value: 'Alex Honnold' },
    });
    fireEvent.change(screen.getByLabelText(/owner phone/i), {
      target: { value: '555-0199' },
    });
    fireEvent.change(screen.getByLabelText(/emergency contact name/i), {
      target: { value: 'Climbing Team' },
    });
    fireEvent.change(screen.getByLabelText(/emergency contact phone/i), {
      target: { value: '555-0198' },
    });
    fireEvent.change(screen.getByLabelText(/backcountry zone|trip backcountry zone/i), {
      target: { value: 'Cascades - Mount Rainier' },
    });
    fireEvent.change(screen.getByLabelText(/departure date/i), {
      target: { value: '2026-10-01' },
    });
    fireEvent.change(screen.getByLabelText(/return date/i), {
      target: { value: '2026-10-05' },
    });
    fireEvent.change(screen.getByLabelText(/medical notes/i), {
      target: { value: 'Carrying EpiPen' },
    });

    fireEvent.click(
      screen.getByRole('button', {
        name: /register beacon & generate sar card/i,
      })
    );

    // Verify card content
    const sbrElements = screen.getAllByText(/SBR-\d{5}/);
    expect(sbrElements.length).toBeGreaterThan(0);
    expect(screen.getByText('Alex Honnold')).toBeDefined();
    expect(screen.getByText(/300434061234560/)).toBeDefined();
    expect(screen.getByText(/Cascades - Mount Rainier/)).toBeDefined();
    expect(screen.getByText('ACTIVE_MONITORING')).toBeDefined();
    expect(screen.getByText(/Carrying EpiPen/)).toBeDefined();
  });

  it('records status check-in, updating status badge to CHECKED_IN and showing timestamp', () => {
    render(<SafetyBeaconRegistry />);

    // Register a beacon
    fireEvent.change(screen.getByLabelText(/device imei/i), {
      target: { value: '300434061234560' },
    });
    fireEvent.change(screen.getByLabelText(/owner name/i), {
      target: { value: 'Alex Honnold' },
    });
    fireEvent.change(screen.getByLabelText(/owner phone/i), {
      target: { value: '555-0199' },
    });
    fireEvent.change(screen.getByLabelText(/emergency contact name/i), {
      target: { value: 'Climbing Team' },
    });
    fireEvent.change(screen.getByLabelText(/emergency contact phone/i), {
      target: { value: '555-0198' },
    });
    fireEvent.change(screen.getByLabelText(/backcountry zone|trip backcountry zone/i), {
      target: { value: 'Cascades - Mount Rainier' },
    });
    fireEvent.change(screen.getByLabelText(/departure date/i), {
      target: { value: '2026-10-01' },
    });
    fireEvent.change(screen.getByLabelText(/return date/i), {
      target: { value: '2026-10-05' },
    });

    fireEvent.click(
      screen.getByRole('button', {
        name: /register beacon & generate sar card/i,
      })
    );

    expect(screen.getByText('ACTIVE_MONITORING')).toBeDefined();

    // Click "Submit Status Check-in: OK"
    const checkinBtn = screen.getByRole('button', {
      name: /submit status check-in: ok/i,
    });
    fireEvent.click(checkinBtn);

    expect(screen.getByText('CHECKED_IN')).toBeDefined();
    expect(screen.getByText(/last check-in:/i)).toBeDefined();
  });

  it('deregisters a beacon when clicking Deregister Beacon', () => {
    render(<SafetyBeaconRegistry />);

    fireEvent.change(screen.getByLabelText(/device imei/i), {
      target: { value: '300434061234560' },
    });
    fireEvent.change(screen.getByLabelText(/owner name/i), {
      target: { value: 'Alex Honnold' },
    });
    fireEvent.change(screen.getByLabelText(/owner phone/i), {
      target: { value: '555-0199' },
    });
    fireEvent.change(screen.getByLabelText(/emergency contact name/i), {
      target: { value: 'Climbing Team' },
    });
    fireEvent.change(screen.getByLabelText(/emergency contact phone/i), {
      target: { value: '555-0198' },
    });
    fireEvent.change(screen.getByLabelText(/backcountry zone|trip backcountry zone/i), {
      target: { value: 'Cascades - Mount Rainier' },
    });
    fireEvent.change(screen.getByLabelText(/departure date/i), {
      target: { value: '2026-10-01' },
    });
    fireEvent.change(screen.getByLabelText(/return date/i), {
      target: { value: '2026-10-05' },
    });

    fireEvent.click(
      screen.getByRole('button', {
        name: /register beacon & generate sar card/i,
      })
    );

    expect(screen.getByText('Alex Honnold')).toBeDefined();

    const deregisterBtn = screen.getByRole('button', {
      name: /deregister beacon/i,
    });
    fireEvent.click(deregisterBtn);

    expect(screen.queryByText('Alex Honnold')).toBeNull();
    expect(
      screen.getByText(/no active beacons registered/i)
    ).toBeDefined();
  });

  it('allows switching emergency protocol tabs to inspect steps, SAR signaling, and Dos/Donts', () => {
    render(<SafetyBeaconRegistry />);

    // Default tab is hypothermia
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Hypothermia & Cold Shock Protocol/i,
      })
    ).toBeDefined();
    expect(screen.getByText(/Severity: CRITICAL/i)).toBeDefined();
    expect(screen.getByText(/burrito/i)).toBeDefined();

    // Switch to Wildlife
    const wildlifeTab = screen.getByRole('tab', { name: /wildlife|grizzly/i });
    fireEvent.click(wildlifeTab);

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Grizzly \/ Black Bear & Cougar Protocol/i,
      })
    ).toBeDefined();
    expect(screen.getAllByText(/bear spray/i).length).toBeGreaterThan(0);

    // Switch to Lightning
    const lightningTab = screen.getByRole('tab', { name: /lightning/i });
    fireEvent.click(lightningTab);

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /High-Ridge Lightning Storm Protocol/i,
      })
    ).toBeDefined();
    expect(screen.getAllByText(/Lightning Crouch/i).length).toBeGreaterThan(0);

    // Switch to Altitude
    const altitudeTab = screen.getByRole('tab', { name: /mountain|ams|altitude/i });
    fireEvent.click(altitudeTab);

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /Acute Mountain Sickness \(AMS\) Protocol/i,
      })
    ).toBeDefined();
    expect(screen.getByText(/Gamow bag/i)).toBeDefined();
  });
});
