import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  DEFAULT_PREFERENCES,
  getNotificationPreferences,
  saveNotificationPreferences,
  resetNotificationPreferences,
  type NotificationPreferences,
} from "./notification-preferences";

describe("notification-preferences lib", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("returns default preferences when storage is empty", () => {
    const prefs = getNotificationPreferences();
    expect(prefs).toEqual(DEFAULT_PREFERENCES);
    expect(prefs).toEqual({
      orderUpdatesEmail: true,
      orderUpdatesSms: false,
      restockAlerts: true,
      promotionsEmail: false,
      newsletterEmail: true,
      phoneNumber: "",
    });
  });

  it("returns defaults when window or localStorage is unavailable (SSR)", () => {
    const originalLocalStorage = window.localStorage;
    Object.defineProperty(window, "localStorage", {
      value: undefined,
      configurable: true,
      writable: true,
    });

    try {
      const prefs = getNotificationPreferences("user-1");
      expect(prefs).toEqual(DEFAULT_PREFERENCES);
    } finally {
      Object.defineProperty(window, "localStorage", {
        value: originalLocalStorage,
        configurable: true,
        writable: true,
      });
    }
  });

  it("handles corrupted or invalid JSON gracefully and returns defaults", () => {
    localStorage.setItem("contoso_notification_preferences_default", "invalid-json{{");
    const prefs = getNotificationPreferences();
    expect(prefs).toEqual(DEFAULT_PREFERENCES);
  });

  it("merges partial saved preferences with defaults", () => {
    const partial = {
      orderUpdatesSms: true,
      phoneNumber: "(555) 000-1111",
    };
    localStorage.setItem(
      "contoso_notification_preferences_user-123",
      JSON.stringify(partial)
    );

    const prefs = getNotificationPreferences("user-123");
    expect(prefs).toEqual({
      ...DEFAULT_PREFERENCES,
      orderUpdatesSms: true,
      phoneNumber: "(555) 000-1111",
    });
  });

  it("saves notification preferences and retrieves them correctly", () => {
    const customPrefs: NotificationPreferences = {
      orderUpdatesEmail: false,
      orderUpdatesSms: true,
      restockAlerts: false,
      promotionsEmail: true,
      newsletterEmail: false,
      phoneNumber: "(555) 987-6543",
    };

    saveNotificationPreferences(customPrefs, "user-456");
    const storedRaw = localStorage.getItem("contoso_notification_preferences_user-456");
    expect(storedRaw).toBeTruthy();
    expect(JSON.parse(storedRaw!)).toEqual(customPrefs);

    const retrieved = getNotificationPreferences("user-456");
    expect(retrieved).toEqual(customPrefs);
  });

  it("isolates preferences by userId", () => {
    const user1Prefs: NotificationPreferences = {
      ...DEFAULT_PREFERENCES,
      promotionsEmail: true,
    };
    const user2Prefs: NotificationPreferences = {
      ...DEFAULT_PREFERENCES,
      promotionsEmail: false,
      orderUpdatesSms: true,
      phoneNumber: "(555) 111-2222",
    };

    saveNotificationPreferences(user1Prefs, "user-1");
    saveNotificationPreferences(user2Prefs, "user-2");

    expect(getNotificationPreferences("user-1")).toEqual(user1Prefs);
    expect(getNotificationPreferences("user-2")).toEqual(user2Prefs);
    expect(getNotificationPreferences()).toEqual(DEFAULT_PREFERENCES);
  });

  it("resets preferences to defaults", () => {
    const customPrefs: NotificationPreferences = {
      orderUpdatesEmail: false,
      orderUpdatesSms: true,
      restockAlerts: false,
      promotionsEmail: true,
      newsletterEmail: false,
      phoneNumber: "(555) 987-6543",
    };

    saveNotificationPreferences(customPrefs, "user-reset");
    expect(getNotificationPreferences("user-reset")).toEqual(customPrefs);

    const resetResult = resetNotificationPreferences("user-reset");
    expect(resetResult).toEqual(DEFAULT_PREFERENCES);
    expect(getNotificationPreferences("user-reset")).toEqual(DEFAULT_PREFERENCES);
  });
});
