import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AdventuresPage from './page';

// Mock Header and Block components
vi.mock('@/components/header', () => ({
  __esModule: true,
  default: () => <header data-testid="mock-header">Header</header>,
}));

vi.mock('@/components/block', () => ({
  __esModule: true,
  default: ({
    children,
    innerClassName,
    outerClassName,
  }: {
    children: React.ReactNode;
    innerClassName?: string;
    outerClassName?: string;
  }) => (
    <section data-testid="mock-block" className={`${outerClassName ?? ''} ${innerClassName ?? ''}`}>
      {children}
    </section>
  ),
}));

describe('AdventuresPage', () => {
  it('renders the adventures portal with required H1 and heading structure', () => {
    render(<AdventuresPage />);

    // Check Header
    expect(screen.getByTestId('mock-header')).toBeDefined();

    // Required H1
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toContain('Guided Outdoor Adventures & Skills Clinics');

    // Section H2s
    const h2Elements = screen.getAllByRole('heading', { level: 2 });
    const h2Texts = h2Elements.map((h) => h.textContent);
    expect(h2Texts.some((t) => t?.includes('Explore Adventures & Skills Clinics'))).toBe(true);
    expect(h2Texts.some((t) => t?.includes('Booking Intake & Cost Estimator'))).toBe(true);
    expect(h2Texts.some((t) => t?.includes('Certified Lead Guide Directory'))).toBe(true);

    // Cards should use H3s
    const h3Elements = screen.getAllByRole('heading', { level: 3 });
    expect(h3Elements.length).toBeGreaterThan(0);
  });

  it('filters adventures by category tabs', () => {
    render(<AdventuresPage />);

    // Initially all adventure card headings visible in grid
    expect(
      screen.getByRole('heading', { level: 3, name: 'Alpine Mountaineering & Glacier Travel' })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', { level: 3, name: 'Introduction to Outdoor Rock Climbing' })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', { level: 3, name: 'Backcountry Whitewater Rafting Expedition' })
    ).toBeDefined();

    // Click "Rock Climbing" tab
    const rockBtn = screen.getByRole('button', { name: /^Rock Climbing$/i });
    fireEvent.click(rockBtn);

    expect(
      screen.getByRole('heading', { level: 3, name: 'Introduction to Outdoor Rock Climbing' })
    ).toBeDefined();
    expect(
      screen.queryByRole('heading', { level: 3, name: 'Alpine Mountaineering & Glacier Travel' })
    ).toBeNull();
    expect(
      screen.queryByRole('heading', { level: 3, name: 'Backcountry Whitewater Rafting Expedition' })
    ).toBeNull();

    // Click "All" tab to restore
    const allBtn = screen.getByRole('button', { name: /^All$/i });
    fireEvent.click(allBtn);

    expect(
      screen.getByRole('heading', { level: 3, name: 'Alpine Mountaineering & Glacier Travel' })
    ).toBeDefined();
    expect(
      screen.getByRole('heading', { level: 3, name: 'Introduction to Outdoor Rock Climbing' })
    ).toBeDefined();
  });

  it('searches adventures and announces results in aria-live status', () => {
    render(<AdventuresPage />);

    const searchInput = screen.getByRole('searchbox', { name: /search adventures/i });
    expect(searchInput).toBeDefined();

    // Check aria-live polite status region
    const statusRegion = screen.getByRole('status');
    expect(statusRegion).toBeDefined();
    expect(statusRegion.getAttribute('aria-live')).toBe('polite');

    // Search for "Glacier"
    fireEvent.change(searchInput, { target: { value: 'Glacier' } });

    expect(
      screen.getByRole('heading', { level: 3, name: 'Alpine Mountaineering & Glacier Travel' })
    ).toBeDefined();
    expect(
      screen.queryByRole('heading', { level: 3, name: 'Introduction to Outdoor Rock Climbing' })
    ).toBeNull();
    expect(statusRegion.textContent).toMatch(/1 adventure found/i);
  });

  it('populates booking intake when "Book Adventure" is clicked and calculates pricing live', () => {
    render(<AdventuresPage />);

    // Click "Book Adventure" for "Introduction to Outdoor Rock Climbing"
    const rockTourCardBtn = screen.getByRole('button', {
      name: /Book Adventure: Introduction to Outdoor Rock Climbing/i,
    });
    fireEvent.click(rockTourCardBtn);

    // Selected tour in booking intake should be "Introduction to Outdoor Rock Climbing"
    const tourSelect = screen.getByLabelText(/Selected Adventure \/ Clinic/i) as HTMLSelectElement;
    expect(tourSelect.value).toBe('intro-rock-climbing-smith-rock');

    // Change participants to 2
    const participantsSelect = screen.getByLabelText(/Number of Participants/i) as HTMLSelectElement;
    fireEvent.change(participantsSelect, { target: { value: '2' } });

    // Verify base price: 2 * 175 = $350
    expect(screen.getByTestId('base-total-price').textContent).toContain('$350');
    expect(screen.getByTestId('total-price').textContent).toContain('$350');

    // Check gear rental toggle checkbox
    const gearCheckbox = screen.getByLabelText(/Include Contoso Technical Gear Rental Package/i);
    fireEvent.click(gearCheckbox);

    // Verify gear fee ($70) and total price ($420 = $350 + $70)
    expect(screen.getByTestId('gear-rental-total').textContent).toContain('$70');
    expect(screen.getByTestId('total-price').textContent).toContain('$420');
  });

  it('completes the booking form submission and displays confirmation banner with #ADV- number', () => {
    render(<AdventuresPage />);

    // Select tour
    const rockTourCardBtn = screen.getByRole('button', {
      name: /Book Adventure: Introduction to Outdoor Rock Climbing/i,
    });
    fireEvent.click(rockTourCardBtn);

    // Fill form
    const nameInput = screen.getByLabelText(/Lead Participant Full Name/i);
    const emailInput = screen.getByLabelText(/Contact Email Address/i);
    const notesInput = screen.getByLabelText(/Emergency Contact & Medical Notes/i);

    fireEvent.change(nameInput, { target: { value: 'Taylor Reed' } });
    fireEvent.change(emailInput, { target: { value: 'taylor.reed@example.com' } });
    fireEvent.change(notesInput, { target: { value: 'Emergency: Jane Reed (555) 234-5678, No allergies.' } });

    // Submit booking
    const submitBtn = screen.getByRole('button', { name: /Submit Adventure Booking Request/i });
    fireEvent.click(submitBtn);

    // Verify confirmation banner
    const banner = screen.getByTestId('booking-confirmation-banner');
    expect(banner).toBeDefined();
    expect(banner.textContent).toContain('Booking Request Received!');
    expect(banner.textContent).toMatch(/#ADV-\d+/);
  });

  it('renders certified lead guide directory with certifications and experience', () => {
    render(<AdventuresPage />);

    expect(screen.getAllByText('Sarah Jenkins').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Marcus Vance').length).toBeGreaterThan(0);
    expect(screen.getAllByText('David Chen').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Elena Rostova').length).toBeGreaterThan(0);

    // Check certifications badges
    expect(screen.getAllByText('AMGA Certified Alpine Guide').length).toBeGreaterThan(0);
    expect(screen.getAllByText('WFR').length).toBeGreaterThan(0);
    expect(screen.getAllByText('AMGA Rock Guide').length).toBeGreaterThan(0);
  });
});
