"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Header from "@/components/header";
import AvatarUpload from "@/components/avatar-upload";
import PasswordChangeForm from "@/components/password-change-form";
import ShippingAddressForm from "@/components/shipping-address-form";
import { ACTION_BOUNDARY } from "@/lib/control-classes";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const [activeTab, setActiveTab] = useState("general");
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [orders, setOrders] = useState<any[] | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/profile")
        .then((res) => res.json())
        .then((data) => {
          setProfileData(data);
          setIsLoadingProfile(false);
        })
        .catch((err) => {
          console.error("Failed to fetch profile", err);
          setIsLoadingProfile(false);
        });
    }
  }, [status]);

  useEffect(() => {
    if (status === "authenticated" && activeTab === "orders" && orders === null) {
      fetch("/api/profile/orders")
        .then((res) => res.json())
        .then((data) => {
          setOrders(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
          console.error("Failed to fetch orders", err);
          setOrders([]);
        });
    }
  }, [status, activeTab, orders]);

  // `!profileData` and not `status === "loading"` on its own. `update()` puts
  // the session back into `loading` every time it refreshes, and this branch
  // then replaced the whole page — tabs, heading and all — with the first-load
  // spinner. Measured after a successful avatar save: the page blanked for
  // ~35ms, `AvatarUpload` unmounted mid-save so its "Picture saved." was set on
  // a component that no longer existed and never rendered, and focus fell from
  // the file input to `body`. A keyboard user saved their picture and was
  // returned to the top of the document with no confirmation.
  //
  // This is the first load only: nothing to show yet. A refresh behind a page
  // that already has its data leaves that page alone.
  if (
    (status === "loading" && !profileData) ||
    (status === "authenticated" && isLoadingProfile)
  ) {
    // role=status so the wait is announced rather than being a silent blank
    // screen for anyone not watching the pixels.
    return (
      <div
        role="status"
        className="flex justify-center items-center h-screen"
      >
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    // Was a bare "Access Denied" paragraph on an otherwise empty page: no
    // heading for heading navigation to land on, and no route forward, so a
    // signed-out visitor had to work out where to go on their own.
    return (
      <>
        <Header />
        <div className="flex flex-col items-center justify-center gap-4 px-4 py-24 text-center">
          <h1 className="text-4xl font-semibold text-zinc-800">
            Sign in to view your profile
          </h1>
          <p className="max-w-prose text-lg text-zinc-600">
            Your profile is only visible while you are signed in.
          </p>
          <Link
            href="/login"
            className={`rounded-md bg-zinc-800 px-6 py-2 text-lg text-zinc-100 hover:bg-zinc-700 focus-visible:outline-indigo-600 ${ACTION_BOUNDARY}`}
          >
            Sign in to continue
          </Link>
        </div>
      </>
    );
  }

  // Throws when the picture was not stored, and does not catch what `fetch`
  // throws. Both are the contract `AvatarUpload` needs: it shows the new
  // picture as soon as it is chosen, so a failure it is not told about leaves
  // the visitor looking at a change that did not happen. This used to do
  // nothing at all on a non-ok response and send a thrown error to the console.
  const handleAvatarUpload = async (url: string) => {
    const response = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatar: url }),
    });
    if (!response.ok) {
      throw new Error(`The server did not save the avatar (${response.status})`);
    }
    await update();
    setProfileData({ ...profileData, avatar: url });
  };

  const tabs = [
    { id: "general", name: "General" },
    { id: "security", name: "Security" },
    { id: "shipping", name: "Shipping" },
    { id: "orders", name: "Orders" },
  ];

  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>
        
        <div className="border-b border-gray-200 mb-6">
          <div role="tablist" aria-label="Profile sections" className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id.toLowerCase()}`}
                id={`tab-${tab.id.toLowerCase()}`}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}
                `}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          {activeTab === "general" && (
            <div
              role="tabpanel"
              id="panel-general"
              aria-labelledby="tab-general"
              tabIndex={0}
            >
              <h2 className="text-xl font-semibold mb-4">General Settings</h2>
              <AvatarUpload 
                initialAvatar={profileData?.avatar || session?.user?.image || ""} 
                onUpload={handleAvatarUpload} 
              />
            </div>
          )}
          {activeTab === "security" && (
            <div
              role="tabpanel"
              id="panel-security"
              aria-labelledby="tab-security"
              tabIndex={0}
            >
              <h2 className="text-xl font-semibold mb-4">Change Password</h2>
              <PasswordChangeForm />
            </div>
          )}
          {activeTab === "shipping" && (
            <div
              role="tabpanel"
              id="panel-shipping"
              aria-labelledby="tab-shipping"
              tabIndex={0}
            >
              <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
              <ShippingAddressForm initialAddress={{
                name: profileData?.name || session?.user?.name || "",
                addressLine1: profileData?.addressLine1 || "",
                addressLine2: profileData?.addressLine2 || "",
                city: profileData?.city || "",
                state: profileData?.state || "",
                zipCode: profileData?.zipCode || "",
                country: profileData?.country || "",
                phoneNumber: profileData?.phoneNumber || "",
              }} />
            </div>
          )}
          {activeTab === "orders" && (
            <div
              role="tabpanel"
              id="panel-orders"
              aria-labelledby="tab-orders"
              tabIndex={0}
            >
              <h2 className="text-xl font-semibold mb-4">Order History</h2>
              {orders === null ? (
                <p role="status">Loading orders...</p>
              ) : orders.length === 0 ? (
                <p className="text-gray-500">No orders placed yet</p>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => {
                    const formattedDate = new Date(order.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    });
                    const formattedTotal = new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(order.total);
                    const statusText = order.status || "Completed";

                    return (
                      <div
                        key={order.id}
                        className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm"
                      >
                        <div className="flex flex-wrap justify-between items-center border-b border-gray-100 pb-4 mb-4 gap-2">
                          <div>
                            <p className="text-sm text-gray-500">Order Placed</p>
                            <p className="font-medium text-gray-900">{formattedDate}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Total</p>
                            <p className="font-medium text-gray-900">{formattedTotal}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Status</p>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {statusText}
                            </span>
                          </div>
                          <div>
                            <Link
                              href={`/profile/orders/${order.id}`}
                              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 hover:underline"
                            >
                              View Details & Receipt
                            </Link>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h3 className="text-sm font-semibold text-gray-700">Items</h3>
                          <ul className="divide-y divide-gray-100">
                            {order.items?.map((item: any) => (
                              <li
                                key={item.id}
                                className="py-2 flex justify-between items-center text-sm"
                              >
                                <div>
                                  <p className="font-medium text-gray-800">
                                    {item.product?.name || `Product #${item.productId}`}
                                  </p>
                                  <p className="text-gray-500">Quantity: {item.quantity}</p>
                                </div>
                                <p className="font-medium text-gray-900">
                                  {new Intl.NumberFormat("en-US", {
                                    style: "currency",
                                    currency: "USD",
                                  }).format(item.price)}
                                </p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
