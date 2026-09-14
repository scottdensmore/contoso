import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import NotificationPreferencesForm, {
  NotificationPreferencesForm as NamedForm,
} from "./notification-preferences";
import * as prefsLib from "@/lib/notification-preferences";

describe("NotificationPreferencesForm", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("exports both default and named NotificationPreferencesForm", () => {
    expect(NotificationPreferencesForm).toBeDefined();
    expect(NamedForm).toBeDefined();
    expect(NotificationPreferencesForm).toBe(NamedForm);
  });

  it("renders default states and accessible fieldsets with legends", () => {
    render(<NotificationPreferencesForm userId="user-1" />);

    // Check fieldset legends
    expect(screen.getByText("Order & Shipping Alerts")).toBeDefined();
    expect(screen.getByText("Gear & Inventory Alerts")).toBeDefined();
    expect(screen.getByText("News & Exclusive Offers")).toBeDefined();

    // Check default checkbox states
    const orderEmailCheckbox = screen.getByLabelText(
      /Email notifications for order confirmation and shipping updates/i
    ) as HTMLInputElement;
    const orderSmsCheckbox = screen.getByLabelText(
      /SMS notifications for delivery updates/i
    ) as HTMLInputElement;
    const restockCheckbox = screen.getByLabelText(
      /Back-in-stock alerts for saved and wishlist items/i
    ) as HTMLInputElement;
    const promoCheckbox = screen.getByLabelText(
      /Promotional sales and member discounts/i
    ) as HTMLInputElement;
    const newsletterCheckbox = screen.getByLabelText(
      /Weekly Contoso Outdoors gear guides and newsletters/i
    ) as HTMLInputElement;

    expect(orderEmailCheckbox.checked).toBe(true);
    expect(orderSmsCheckbox.checked).toBe(false);
    expect(restockCheckbox.checked).toBe(true);
    expect(promoCheckbox.checked).toBe(false);
    expect(newsletterCheckbox.checked).toBe(true);

    // Phone input should not be shown when SMS is unchecked
    expect(screen.queryByLabelText(/Phone Number/i)).toBeNull();
  });

  it("shows and hides phone input based on SMS toggle", () => {
    render(<NotificationPreferencesForm userId="user-1" initialPhone="(555) 123-4567" />);

    // Initially SMS is unchecked so phone input is hidden
    expect(screen.queryByLabelText(/Phone Number/i)).toBeNull();

    // Toggle SMS on
    const orderSmsCheckbox = screen.getByLabelText(
      /SMS notifications for delivery updates/i
    );
    fireEvent.click(orderSmsCheckbox);

    // Phone input should now be visible
    const phoneInput = screen.getByLabelText(/Phone Number/i) as HTMLInputElement;
    expect(phoneInput).toBeDefined();
    expect(phoneInput.type).toBe("tel");
    expect(phoneInput.placeholder).toBe("e.g. (555) 123-4567");
    // Should inherit initialPhone when preference didn't have one set
    expect(phoneInput.value).toBe("(555) 123-4567");

    // Toggle SMS off again
    fireEvent.click(orderSmsCheckbox);
    expect(screen.queryByLabelText(/Phone Number/i)).toBeNull();
  });

  it("saves preferences and triggers accessible live status announcement", () => {
    const saveSpy = vi.spyOn(prefsLib, "saveNotificationPreferences");
    render(<NotificationPreferencesForm userId="user-1" initialPhone="(555) 000-0000" />);

    // Toggle promotional emails on
    const promoCheckbox = screen.getByLabelText(
      /Promotional sales and member discounts/i
    );
    fireEvent.click(promoCheckbox);

    // Toggle SMS on and type custom phone
    const orderSmsCheckbox = screen.getByLabelText(
      /SMS notifications for delivery updates/i
    );
    fireEvent.click(orderSmsCheckbox);

    const phoneInput = screen.getByLabelText(/Phone Number/i);
    fireEvent.change(phoneInput, { target: { value: "(555) 888-9999" } });

    // Click "Save Preferences"
    const saveButton = screen.getByRole("button", { name: /Save Preferences/i });
    fireEvent.click(saveButton);

    expect(saveSpy).toHaveBeenCalledWith(
      {
        orderUpdatesEmail: true,
        orderUpdatesSms: true,
        restockAlerts: true,
        promotionsEmail: true,
        newsletterEmail: true,
        phoneNumber: "(555) 888-9999",
      },
      "user-1"
    );

    // Live status announcement
    const statusMsg = screen.getByRole("status");
    expect(statusMsg).toBeDefined();
    expect(statusMsg.getAttribute("aria-live")).toBe("polite");
    expect(statusMsg.textContent).toContain("Notification preferences saved successfully.");
  });

  it("resets preferences to defaults when reset button is clicked", () => {
    const resetSpy = vi.spyOn(prefsLib, "resetNotificationPreferences");

    // Pre-populate storage with non-default preferences
    prefsLib.saveNotificationPreferences(
      {
        orderUpdatesEmail: false,
        orderUpdatesSms: true,
        restockAlerts: false,
        promotionsEmail: true,
        newsletterEmail: false,
        phoneNumber: "(555) 444-3333",
      },
      "user-1"
    );

    render(<NotificationPreferencesForm userId="user-1" />);

    // Verify initial values reflect stored custom preferences
    const orderEmailCheckbox = screen.getByLabelText(
      /Email notifications for order confirmation and shipping updates/i
    ) as HTMLInputElement;
    expect(orderEmailCheckbox.checked).toBe(false);

    const resetButton = screen.getByRole("button", { name: /Reset to Defaults/i });
    fireEvent.click(resetButton);

    expect(resetSpy).toHaveBeenCalledWith("user-1");

    // Verify form reverted to defaults
    expect(orderEmailCheckbox.checked).toBe(true);
    const orderSmsCheckbox = screen.getByLabelText(
      /SMS notifications for delivery updates/i
    ) as HTMLInputElement;
    expect(orderSmsCheckbox.checked).toBe(false);
    expect(screen.queryByLabelText(/Phone Number/i)).toBeNull();

    // Verify live status announcement for reset
    const statusMsg = screen.getByRole("status");
    expect(statusMsg).toBeDefined();
    expect(statusMsg.textContent).toMatch(/reset|default/i);
  });
});
