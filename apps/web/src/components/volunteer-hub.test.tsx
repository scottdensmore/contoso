import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import VolunteerHub from './volunteer-hub';

describe('VolunteerHub Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders all required section headings and initial impact metrics', () => {
    render(<VolunteerHub />);

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Community Stewardship Impact/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Find Trail Maintenance Workparties/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Register for a Workparty Crew/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Active Crew Registrations/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Tool Safety & Required Attire Checklist/i,
      })
    ).toBeDefined();

    // Stewardship impact metrics
    expect(screen.getByText(/4,280/)).toBeDefined();
    expect(screen.getByText(/342/)).toBeDefined();
    expect(screen.getByText(/128/)).toBeDefined();
    expect(screen.getByText(/315/)).toBeDefined();
  });

  it('filters workparties by difficulty rating', () => {
    render(<VolunteerHub />);

    // Initially Mailbox Peak (Strenuous) and Tiger Mountain (Moderate) are both rendered
    expect(screen.getByText('Mailbox Peak Drainage & Turnpike Restoration')).toBeDefined();
    expect(screen.getByText('Tiger Mountain Corridor Brushing & Tread Repair')).toBeDefined();

    // Filter by Strenuous
    const difficultySelect = screen.getByLabelText(/filter by difficulty/i);
    fireEvent.change(difficultySelect, { target: { value: 'Strenuous' } });

    expect(screen.getByText('Mailbox Peak Drainage & Turnpike Restoration')).toBeDefined();
    expect(screen.queryByText('Tiger Mountain Corridor Brushing & Tread Repair')).toBeNull();
  });

  it('filters workparties by region', () => {
    render(<VolunteerHub />);

    const regionSelect = screen.getByLabelText(/filter by region/i);
    fireEvent.change(regionSelect, { target: { value: 'Olympics' } });

    expect(screen.getByText('Olympic Hoh River Blowdown Clearing')).toBeDefined();
    expect(screen.queryByText('Mailbox Peak Drainage & Turnpike Restoration')).toBeNull();
  });

  it('selects a workparty when clicking "Join Crew"', () => {
    render(<VolunteerHub />);

    const joinButtons = screen.getAllByRole('button', { name: /join crew/i });
    // Click Join Crew on Mailbox Peak
    fireEvent.click(joinButtons[0]);

    const workpartySelect = screen.getByLabelText(/select workparty crew/i) as HTMLSelectElement;
    expect(workpartySelect.value).toBe('mailbox-drainage');
  });

  it('validates that safety waiver must be signed before submission', () => {
    render(<VolunteerHub />);

    fireEvent.change(screen.getByLabelText(/volunteer full name/i), {
      target: { value: 'Alex Honnold' },
    });
    fireEvent.change(screen.getByLabelText(/volunteer email/i), {
      target: { value: 'alex@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/volunteer phone/i), {
      target: { value: '555-0199' },
    });
    fireEvent.change(screen.getByLabelText(/emergency contact name/i), {
      target: { value: 'Climbing Team' },
    });
    fireEvent.change(screen.getByLabelText(/emergency contact phone/i), {
      target: { value: '555-0198' },
    });

    const submitBtn = screen.getByRole('button', {
      name: /complete volunteer registration/i,
    });
    fireEvent.submit(submitBtn.closest('form')!);

    // Waiver not checked, should show error message
    expect(screen.getByText(/must agree to the safety waiver/i)).toBeDefined();
  });

  it('completes registration, displays confirmation card, and lists registration in active crew list', () => {
    render(<VolunteerHub />);

    fireEvent.change(screen.getByLabelText(/volunteer full name/i), {
      target: { value: 'Alex Honnold' },
    });
    fireEvent.change(screen.getByLabelText(/volunteer email/i), {
      target: { value: 'alex@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/volunteer phone/i), {
      target: { value: '555-0199' },
    });
    fireEvent.change(screen.getByLabelText(/emergency contact name/i), {
      target: { value: 'Climbing Team' },
    });
    fireEvent.change(screen.getByLabelText(/emergency contact phone/i), {
      target: { value: '555-0198' },
    });
    fireEvent.click(screen.getByLabelText(/safety waiver/i));

    const submitBtn = screen.getByRole('button', {
      name: /complete volunteer registration/i,
    });
    fireEvent.click(submitBtn);

    // Confirmation card
    const confirmationCards = screen.getAllByText(/VOL-\d{5}/);
    expect(confirmationCards.length).toBeGreaterThan(0);
    expect(screen.getAllByText('Alex Honnold').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/confirmed/i).length).toBeGreaterThan(0);
  });

  it('cancels registration when clicking "Cancel Registration"', () => {
    render(<VolunteerHub />);

    // Fill and submit form
    fireEvent.change(screen.getByLabelText(/volunteer full name/i), {
      target: { value: 'Alex Honnold' },
    });
    fireEvent.change(screen.getByLabelText(/volunteer email/i), {
      target: { value: 'alex@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/volunteer phone/i), {
      target: { value: '555-0199' },
    });
    fireEvent.change(screen.getByLabelText(/emergency contact name/i), {
      target: { value: 'Climbing Team' },
    });
    fireEvent.change(screen.getByLabelText(/emergency contact phone/i), {
      target: { value: '555-0198' },
    });
    fireEvent.click(screen.getByLabelText(/safety waiver/i));

    fireEvent.click(
      screen.getByRole('button', {
        name: /complete volunteer registration/i,
      })
    );

    expect(screen.getAllByText(/confirmed/i).length).toBeGreaterThan(0);

    // Click Cancel Registration
    const cancelBtn = screen.getByRole('button', {
      name: /cancel registration/i,
    });
    fireEvent.click(cancelBtn);

    expect(screen.getAllByText(/cancelled/i).length).toBeGreaterThan(0);
  });

  it('displays the tool safety and required attire checklist items', () => {
    render(<VolunteerHub />);

    expect(screen.getByRole('heading', { level: 3, name: /sturdy boots/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /heavy-duty work gloves/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /eye protection/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /hydration & water/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /lunch/i })).toBeDefined();
  });
});
