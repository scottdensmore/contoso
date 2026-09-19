import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RepairPage from './page';

vi.mock('@/components/header', () => ({
  __esModule: true,
  default: () => <div data-testid="header" />,
}));

vi.mock('@/components/block', () => ({
  __esModule: true,
  default: ({
    children,
    innerClassName,
  }: {
    children: React.ReactNode;
    innerClassName?: string;
  }) => (
    <div data-testid="block" className={innerClassName}>
      {children}
    </div>
  ),
}));

describe('RepairPage', () => {
  it('renders the page with required H1 and structured H2 section headings', () => {
    render(<RepairPage />);

    expect(screen.getByTestId('header')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Gear Maintenance & Repair Services');

    const h2Elements = screen.getAllByRole('heading', { level: 2 });
    const h2Texts = h2Elements.map((h) => h.textContent);
    expect(h2Texts).toContain('Repair Service Packages');
    expect(h2Texts).toContain('Repair Intake & Cost Estimator');
    expect(h2Texts).toContain('Warranty & Preventative Care Guide');
  });

  it('filters repair services by category tabs', () => {
    render(<RepairPage />);

    // Click "Tents & Shelters"
    const tentsTab = screen.getByRole('button', { name: /^tents & shelters$/i });
    fireEvent.click(tentsTab);

    expect(screen.getByTestId('service-card-tent-seam-sealing')).toBeDefined();
    expect(screen.getByTestId('service-card-tent-zipper-replacement')).toBeDefined();
    expect(screen.queryByTestId('service-card-apparel-dwr-reproofing')).toBeNull();
    expect(screen.queryByTestId('service-card-winter-wax-edge-tune')).toBeNull();

    // Click "Winter Gear"
    const winterTab = screen.getByRole('button', { name: /^winter gear$/i });
    fireEvent.click(winterTab);

    expect(screen.getByTestId('service-card-winter-wax-edge-tune')).toBeDefined();
    expect(screen.getByTestId('service-card-winter-ptex-base-repair')).toBeDefined();
    expect(screen.queryByTestId('service-card-tent-seam-sealing')).toBeNull();

    // Click "All"
    const allTab = screen.getByRole('button', { name: /^all$/i });
    fireEvent.click(allTab);

    expect(screen.getByTestId('service-card-tent-seam-sealing')).toBeDefined();
    expect(screen.getByTestId('service-card-winter-wax-edge-tune')).toBeDefined();
  });

  it('searches repair services and announces result count in aria-live status region', () => {
    render(<RepairPage />);

    const searchInput = screen.getByRole('searchbox', {
      name: /search repair services/i,
    });
    expect(searchInput).toBeDefined();

    // Search for "zipper"
    fireEvent.change(searchInput, { target: { value: 'zipper' } });

    expect(screen.getByTestId('service-card-tent-zipper-replacement')).toBeDefined();
    expect(screen.getByTestId('service-card-apparel-zipper-replacement')).toBeDefined();
    expect(screen.getByTestId('service-card-pack-zipper-restitch')).toBeDefined();
    expect(screen.queryByTestId('service-card-winter-wax-edge-tune')).toBeNull();

    // Check aria-live status announcement
    const liveRegion = screen.getByRole('status');
    expect(liveRegion.textContent).toMatch(/found for "zipper"/i);
  });

  it('populates intake estimator when clicking "Select for Repair" on a service card', () => {
    render(<RepairPage />);

    const zipperSelectBtn = screen.getByTestId('select-service-tent-zipper-replacement');
    fireEvent.click(zipperSelectBtn);

    const serviceSelect = screen.getByRole('combobox', { name: /select repair service/i }) as HTMLSelectElement;
    expect(serviceSelect.value).toBe('tent-zipper-replacement');
  });

  it('toggles fulfillment method between In-Store ($0) and Mail-In ($10) and updates total price', () => {
    render(<RepairPage />);

    // Select $25 service
    const serviceSelect = screen.getByRole('combobox', { name: /select repair service/i });
    fireEvent.change(serviceSelect, { target: { value: 'tent-zipper-replacement' } });

    // In-store by default or toggle to in-store
    const inStoreRadio = screen.getByRole('radio', { name: /in-store drop-off/i });
    fireEvent.click(inStoreRadio);

    expect(screen.getByTestId('estimate-shipping-fee').textContent).toContain('$0');
    expect(screen.getByTestId('estimate-total-price').textContent).toContain('$25');

    // Toggle to Mail-In
    const mailInRadio = screen.getByRole('radio', { name: /prepaid mail-in box/i });
    fireEvent.click(mailInRadio);

    expect(screen.getByTestId('estimate-shipping-fee').textContent).toContain('$10');
    expect(screen.getByTestId('estimate-total-price').textContent).toContain('$35');
  });

  it('submits intake form and renders confirmation banner with confirmation number', () => {
    render(<RepairPage />);

    const serviceSelect = screen.getByRole('combobox', { name: /select repair service/i });
    fireEvent.change(serviceSelect, { target: { value: 'tent-zipper-replacement' } });

    const notesInput = screen.getByRole('textbox', { name: /repair notes/i });
    fireEvent.change(notesInput, { target: { value: 'Slider broke during mountain trip' } });

    const customerNameInput = screen.getByRole('textbox', { name: /customer name/i });
    fireEvent.change(customerNameInput, { target: { value: 'Alex Morgan' } });

    const customerEmailInput = screen.getByRole('textbox', { name: /customer email/i });
    fireEvent.change(customerEmailInput, { target: { value: 'alex@example.com' } });

    const submitBtn = screen.getByRole('button', { name: /submit repair request/i });
    fireEvent.click(submitBtn);

    const confirmationBanner = screen.getByTestId('repair-confirmation-banner');
    expect(confirmationBanner).toBeDefined();
    expect(confirmationBanner.textContent).toMatch(/Repair Request Submitted! Confirmation #REP-[A-Z0-9]+/);
    expect(screen.getByText('Alex Morgan')).toBeDefined();
    expect(screen.getByText(/Slider broke during mountain trip/)).toBeDefined();
  });

  it('renders Warranty & Care Guide with preventative care tips', () => {
    render(<RepairPage />);

    expect(screen.getByText(/DWR Wash-In & Reactivation/i)).toBeDefined();
    expect(screen.getByText(/Proper Tent Drying to Prevent Mildew/i)).toBeDefined();
    expect(screen.getByText(/Zipper Cleaning & Lubrication/i)).toBeDefined();
    expect(screen.getByText(/Off-Season Down Sleeping Bag Storage/i)).toBeDefined();

    expect(screen.getByText(/Manufacturer Warranty Coverage vs\. Tune-ups/i)).toBeDefined();
    expect(screen.getByText(/Eco-Friendly Maintenance & Gear Longevity/i)).toBeDefined();
  });
});
