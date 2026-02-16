"use client";

import { useState } from "react";
import Block from "@/components/block";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import SidebarWrapper from "./sidebar-wrapper";
import { Suspense } from "react";

export const Header = () => {
  const { data: session, status } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <Block
        outerClassName=""
        innerClassName="h-12 flex flex-row center items-center"
      >
        <div className="text-slate-800">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="grow">&nbsp;</div>
        <div className="flex flex-row items-center gap-3">
          {status === "authenticated" ? (
            <>
              <Link href="/profile" className="flex flex-row items-center gap-3 hover:bg-gray-50 p-1 rounded-md transition-colors" title="Profile Settings">
                <div>
                  <div className="text-right font-semibold text-zinc-600">
                    {session.user?.name || session.user?.email}
                  </div>
                  <div className="text-right text-xs text-zinc-400">
                    {session.user?.email}
                  </div>
                </div>
                <div className="">
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      width={32}
                      height={32}
                      alt={session.user.name || "User"}
                      className="rounded-full h-8 w-8 object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                      {session.user?.name?.[0] || session.user?.email?.[0]}
                    </div>
                  )}
                </div>
              </Link>
              <button
                onClick={() => signOut()}
                className="ml-4 px-3 py-1.5 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-500"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="px-3 py-1.5 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-500">
                Sign In
              </Link>
              <Link href="/signup" className="ml-2 px-3 py-1.5 text-sm font-semibold text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50 hover:text-indigo-700">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </Block>

      <Suspense fallback={null}>
        <SidebarWrapper 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
      </Suspense>
    </>
  );
};

export default Header;
