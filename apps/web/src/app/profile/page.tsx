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
        <main className="flex flex-col items-center justify-center gap-4 px-4 py-24 text-center">
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
        </main>
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
  ];

  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>
        
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
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
          </nav>
        </div>

        <div className="mt-6">
          {activeTab === "general" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">General Settings</h2>
              <AvatarUpload 
                initialAvatar={profileData?.avatar || session?.user?.image || ""} 
                onUpload={handleAvatarUpload} 
              />
            </div>
          )}
          {activeTab === "security" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Change Password</h2>
              <PasswordChangeForm />
            </div>
          )}
          {activeTab === "shipping" && (
            <div>
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
        </div>
      </div>
    </>
  );
}