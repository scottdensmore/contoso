export interface NotificationPreferences {
  orderUpdatesEmail: boolean;
  orderUpdatesSms: boolean;
  restockAlerts: boolean;
  promotionsEmail: boolean;
  newsletterEmail: boolean;
  phoneNumber?: string;
}

export const DEFAULT_PREFERENCES: NotificationPreferences = {
  orderUpdatesEmail: true,
  orderUpdatesSms: false,
  restockAlerts: true,
  promotionsEmail: false,
  newsletterEmail: true,
  phoneNumber: "",
};

function getStorageKey(userId?: string): string {
  return `contoso_notification_preferences_${userId || "default"}`;
}

function isLocalStorageAvailable(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  try {
    return typeof window.localStorage !== "undefined" && window.localStorage !== null;
  } catch {
    return false;
  }
}

export function getNotificationPreferences(userId?: string): NotificationPreferences {
  if (!isLocalStorageAvailable()) {
    return { ...DEFAULT_PREFERENCES };
  }

  try {
    const key = getStorageKey(userId);
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return { ...DEFAULT_PREFERENCES };
    }

    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) {
      return { ...DEFAULT_PREFERENCES };
    }

    return {
      orderUpdatesEmail:
        typeof parsed.orderUpdatesEmail === "boolean"
          ? parsed.orderUpdatesEmail
          : DEFAULT_PREFERENCES.orderUpdatesEmail,
      orderUpdatesSms:
        typeof parsed.orderUpdatesSms === "boolean"
          ? parsed.orderUpdatesSms
          : DEFAULT_PREFERENCES.orderUpdatesSms,
      restockAlerts:
        typeof parsed.restockAlerts === "boolean"
          ? parsed.restockAlerts
          : DEFAULT_PREFERENCES.restockAlerts,
      promotionsEmail:
        typeof parsed.promotionsEmail === "boolean"
          ? parsed.promotionsEmail
          : DEFAULT_PREFERENCES.promotionsEmail,
      newsletterEmail:
        typeof parsed.newsletterEmail === "boolean"
          ? parsed.newsletterEmail
          : DEFAULT_PREFERENCES.newsletterEmail,
      phoneNumber:
        typeof parsed.phoneNumber === "string"
          ? parsed.phoneNumber
          : DEFAULT_PREFERENCES.phoneNumber,
    };
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

export function saveNotificationPreferences(
  preferences: NotificationPreferences,
  userId?: string
): void {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    const key = getStorageKey(userId);
    window.localStorage.setItem(key, JSON.stringify(preferences));
  } catch (error) {
    console.error("Failed to save notification preferences to localStorage:", error);
  }
}

export function resetNotificationPreferences(userId?: string): NotificationPreferences {
  const defaults = { ...DEFAULT_PREFERENCES };
  saveNotificationPreferences(defaults, userId);
  return defaults;
}
