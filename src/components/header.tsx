"use client";

import clsx from "clsx";
import { ReactNode } from "react";
import Image from "next/image";
import Block from "@/components/block";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { useSession, signOut, signIn } from "next-auth/react";
import Link from "next/link";

export const Header = ({
  params,
  searchParams,
}: {
  params?: { slug: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) => {
  const { data: session, status } = useSession();

  return (
    <Block
      outerClassName=""
      innerClassName="h-12 flex flex-row center items-center"
    >
      <div className="text-slate-800">
        <a href={`/${searchParams?.type ? "?type=" + searchParams.type : ""}`}>
          <Bars3Icon className="w-6" />
        </a>
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
  );
};

export default Header;