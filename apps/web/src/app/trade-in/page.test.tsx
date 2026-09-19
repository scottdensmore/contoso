import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TradeInPage from './page';

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

describe('TradeInPage', () => {
  it('renders the page with required H1 and strict H2 section headings', () => {
    render(<TradeInPage />);

    expect(screen.getByTestId('header')).toBeDefined();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toBe('Contoso Re-Gear: Used Gear Trade-in & Resale');

    const h2Elements = screen.getAllByRole('heading', { level: 2 });
    const h2Texts = h2Elements.map((h) => h.textContent);
    expect(h2Texts).toContain('Circular Economy & Environmental Impact');
    expect(h2Texts).toContain('Trade-In Valuation Calculator');
    expect(h2Texts).toContain('Trade-In Intake Request');
    expect(h2Texts).toContain('Eligible Brands & Tier Standards');
    expect(h2Texts).toContain('Program FAQ & Acceptance Guidelines');
  });

  it('renders live circular economy environmental impact metrics', () => {
    render(<TradeInPage />);

    expect(screen.getByText(/14,200\+\s*lbs diverted/i)).toBeDefined();
    expect(screen.getByText(/9,800\+\s*items refurbished/i)).toBeDefined();
  });

  it('updates baseline MSRP when category selection changes', () => {
    render(<TradeInPage />);

    const categorySelect = screen.getByRole('combobox', { name: /select category/i }) as HTMLSelectElement;
    const msrpInput = screen.getByRole('spinbutton', { name: /estimated original msrp/i }) as HTMLInputElement;

    // Default is Tents & Shelters ($400)
    expect(categorySelect.value).toBe('Tents & Shelters');
    expect(msrpInput.value).toBe('400');

    // Change to Technical Backpacks ($220)
    fireEvent.change(categorySelect, { target: { value: 'Technical Backpacks' } });
    expect(msrpInput.value).toBe('220');

    // Change to Footwear & Boots ($180)
    fireEvent.change(categorySelect, { target: { value: 'Footwear & Boots' } });
    expect(msrpInput.value).toBe('180');
  });

  it('calculates trade-in credit and CO2 avoided dynamically when changing condition', () => {
    render(<TradeInPage />);

    const categorySelect = screen.getByRole('combobox', { name: /select category/i });
    const msrpInput = screen.getByRole('spinbutton', { name: /estimated original msrp/i });

    fireEvent.change(categorySelect, { target: { value: 'Tents & Shelters' } });
    fireEvent.change(msrpInput, { target: { value: '400' } });

    // Excellent condition (50%) -> $200
    const excellentRadio = screen.getByRole('radio', { name: /excellent/i });
    fireEvent.click(excellentRadio);

    const creditDisplay = screen.getByTestId('trade-in-credit-amount');
    expect(creditDisplay.textContent).toContain('$200');

    const co2Display = screen.getByTestId('trade-in-co2-amount');
    expect(co2Display.textContent).toContain('15');

    // Very Good condition (40%) -> $160
    const veryGoodRadio = screen.getByRole('radio', { name: /very good/i });
    fireEvent.click(veryGoodRadio);

    expect(creditDisplay.textContent).toContain('$160');
    expect(co2Display.textContent).toContain('15');

    // Fair condition (25%) -> $100
    const fairRadio = screen.getByRole('radio', { name: /fair/i });
    fireEvent.click(fairRadio);

    expect(creditDisplay.textContent).toContain('$100');
  });

  it('submits intake form with fulfillment choice and displays confirmation banner with reference #TIN-', () => {
    render(<TradeInPage />);

    // QA checkboxes
    const cleanBox = screen.getByLabelText(/clean, odor-free/i);
    const zippersBox = screen.getByLabelText(/functional zippers/i);
    const tearsBox = screen.getByLabelText(/no structural tears/i);

    fireEvent.click(cleanBox);
    fireEvent.click(zippersBox);
    fireEvent.click(tearsBox);

    // Fulfillment method
    const mailInRadio = screen.getByRole('radio', { name: /free prepaid mail-in kit/i });
    fireEvent.click(mailInRadio);

    // Customer fields
    const nameInput = screen.getByLabelText(/customer name/i);
    const emailInput = screen.getByLabelText(/customer email/i);

    fireEvent.change(nameInput, { target: { value: 'Alex Mountain' } });
    fireEvent.change(emailInput, { target: { value: 'alex@outdoors.example' } });

    // Submit
    const submitBtn = screen.getByRole('button', { name: /submit trade-in request/i });
    fireEvent.click(submitBtn);

    const confirmationBanner = screen.getByTestId('trade-in-confirmation-banner');
    expect(confirmationBanner).toBeDefined();
    expect(confirmationBanner.textContent).toMatch(/#TIN-[A-Z0-9]+/);
    expect(confirmationBanner.textContent).toContain('Alex Mountain');
  });

  it('renders program FAQ and accepted brands', () => {
    render(<TradeInPage />);

    expect(screen.getByRole('heading', { level: 3, name: /Accepted Gear & Condition Criteria/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Inspection & Appraisal Process/i })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: /Trade-In Credit vs\. Repair Services/i })).toBeDefined();

    expect(screen.getByRole('heading', { level: 3, name: 'Contoso Outdoors' })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: 'Partner Technical Brands' })).toBeDefined();
    expect(screen.getByRole('heading', { level: 3, name: "Arc'teryx" })).toBeDefined();
  });
});
