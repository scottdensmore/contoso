"use client";

import { useState } from "react";
import { ACTION_BOUNDARY, ACTION_FOCUS, FIELD_BOUNDARY } from "@/lib/control-classes";
import {
  getNotificationPreferences,
  saveNotificationPreferences,
  resetNotificationPreferences,
  type NotificationPreferences,
} from "@/lib/notification-preferences";

export interface NotificationPreferencesFormProps {
  userId?: string;
  initialPhone?: string;
}

export function NotificationPreferencesForm({
  userId,
  initialPhone = "",
}: NotificationPreferencesFormProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>(() => {
    const loaded = getNotificationPreferences(userId);
    return {
      ...loaded,
      phoneNumber: loaded.phoneNumber || initialPhone || "",
    };
  });

  const [statusMessage, setStatusMessage] = useState<string>("");

  const handleCheckboxChange = (field: keyof Omit<NotificationPreferences, "phoneNumber">) => {
    setPreferences((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveNotificationPreferences(preferences, userId);
    setStatusMessage("Notification preferences saved successfully.");
  };

  const handleReset = () => {
    const defaults = resetNotificationPreferences(userId);
    setPreferences({
      ...defaults,
      phoneNumber: initialPhone || "",
    });
    setStatusMessage("Notification preferences reset to default values.");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-semibold mb-2">Notification Preferences</h2>
        <p className="text-sm text-gray-600">
          Manage how and when Contoso Outdoors contacts you about your orders, gear restocks, and exclusive deals.
        </p>
      </div>

      {statusMessage && (
        <p
          role="status"
          aria-live="polite"
          className="rounded-md bg-emerald-50 p-3 text-sm font-medium text-emerald-800 border border-emerald-200"
        >
          {statusMessage}
        </p>
      )}

      {/* Order & Shipping Alerts */}
      <fieldset className="border border-gray-200 rounded-lg p-5 bg-white shadow-xs space-y-4">
        <legend className="text-base font-semibold text-gray-900 px-1">
          Order & Shipping Alerts
        </legend>
        <div className="space-y-3">
          <div className="flex items-start">
            <div className="flex h-5 items-center">
              <input
                id="orderUpdatesEmail"
                type="checkbox"
                checked={preferences.orderUpdatesEmail}
                onChange={() => handleCheckboxChange("orderUpdatesEmail")}
                className={`h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 ${ACTION_FOCUS}`}
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="orderUpdatesEmail" className="font-medium text-gray-900">
                Email notifications for order confirmation and shipping updates
              </label>
              <p className="text-xs text-gray-500">
                Receive receipts, order tracking updates, and shipping delivery status via email.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex h-5 items-center">
              <input
                id="orderUpdatesSms"
                type="checkbox"
                checked={preferences.orderUpdatesSms}
                onChange={() => handleCheckboxChange("orderUpdatesSms")}
                className={`h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 ${ACTION_FOCUS}`}
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="orderUpdatesSms" className="font-medium text-gray-900">
                SMS notifications for delivery updates
              </label>
              <p className="text-xs text-gray-500">
                Receive text message updates when your package is out for delivery or delivered.
              </p>
            </div>
          </div>

          {preferences.orderUpdatesSms && (
            <div className="mt-3 ml-7">
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                id="phoneNumber"
                type="tel"
                value={preferences.phoneNumber || ""}
                placeholder="e.g. (555) 123-4567"
                onChange={(e) =>
                  setPreferences((prev) => ({ ...prev, phoneNumber: e.target.value }))
                }
                className={`block w-full max-w-xs rounded-md shadow-xs p-2 text-sm text-gray-900 focus:ring-indigo-600 focus-visible:outline-indigo-600 ${ACTION_FOCUS} ${FIELD_BOUNDARY}`}
              />
            </div>
          )}
        </div>
      </fieldset>

      {/* Gear & Inventory Alerts */}
      <fieldset className="border border-gray-200 rounded-lg p-5 bg-white shadow-xs space-y-4">
        <legend className="text-base font-semibold text-gray-900 px-1">
          Gear & Inventory Alerts
        </legend>
        <div className="space-y-3">
          <div className="flex items-start">
            <div className="flex h-5 items-center">
              <input
                id="restockAlerts"
                type="checkbox"
                checked={preferences.restockAlerts}
                onChange={() => handleCheckboxChange("restockAlerts")}
                className={`h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 ${ACTION_FOCUS}`}
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="restockAlerts" className="font-medium text-gray-900">
                Back-in-stock alerts for saved and wishlist items
              </label>
              <p className="text-xs text-gray-500">
                Get notified immediately when out-of-stock items on your wishlist become available.
              </p>
            </div>
          </div>
        </div>
      </fieldset>

      {/* News & Exclusive Offers */}
      <fieldset className="border border-gray-200 rounded-lg p-5 bg-white shadow-xs space-y-4">
        <legend className="text-base font-semibold text-gray-900 px-1">
          News & Exclusive Offers
        </legend>
        <div className="space-y-3">
          <div className="flex items-start">
            <div className="flex h-5 items-center">
              <input
                id="promotionsEmail"
                type="checkbox"
                checked={preferences.promotionsEmail}
                onChange={() => handleCheckboxChange("promotionsEmail")}
                className={`h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 ${ACTION_FOCUS}`}
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="promotionsEmail" className="font-medium text-gray-900">
                Promotional sales and member discounts
              </label>
              <p className="text-xs text-gray-500">
                Special offers, seasonal discount events, and member-only coupons.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex h-5 items-center">
              <input
                id="newsletterEmail"
                type="checkbox"
                checked={preferences.newsletterEmail}
                onChange={() => handleCheckboxChange("newsletterEmail")}
                className={`h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 ${ACTION_FOCUS}`}
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="newsletterEmail" className="font-medium text-gray-900">
                Weekly Contoso Outdoors gear guides and newsletters
              </label>
              <p className="text-xs text-gray-500">
                Expert trail reviews, seasonal gear guides, and community outdoor tips.
              </p>
            </div>
          </div>
        </div>
      </fieldset>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="submit"
          className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-xs text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus-visible:outline-indigo-600 ${ACTION_BOUNDARY}`}
        >
          Save Preferences
        </button>
        <button
          type="button"
          onClick={handleReset}
          className={`inline-flex justify-center py-2 px-4 border border-zinc-300 bg-white shadow-xs text-sm font-medium rounded-md text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 focus-visible:outline-indigo-600 ${ACTION_FOCUS}`}
        >
          Reset to Defaults
        </button>
      </div>
    </form>
  );
}

export default NotificationPreferencesForm;
