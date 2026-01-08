"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Header from "@/components/header";
import AvatarUpload from "@/components/avatar-upload";
import PasswordChangeForm from "@/components/password-change-form";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const [activeTab, setActiveTab] = useState("general");

  if (status === "loading") {
    return <div className="flex justify-center items-center h-screen"><p>Loading...</p></div>;
  }

  if (status === "unauthenticated") {
    return <div className="flex justify-center items-center h-screen"><p>Access Denied</p></div>;
  }

  const handleAvatarUpload = async (url: string) => {
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: url }),
      });
      if (response.ok) {
        await update();
      }
    } catch (err) {
      console.error("Failed to update avatar in DB", err);
    }
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
                initialAvatar={session?.user?.image || ""} 
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
              <p>Shipping address form will go here.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}