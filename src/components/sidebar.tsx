"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { NavSection } from "@/lib/navigation";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sections: NavSection[];
}

export default function Sidebar({ isOpen, onClose, sections }: SidebarProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm" 
        onClick={onClose}
      />

      {/* Sidebar Content */}
      <div className="relative flex w-full max-w-xs flex-col overflow-y-auto bg-white pb-12 shadow-xl animate-in slide-in-from-left duration-300" role="complementary">
        <div className="flex px-4 pb-2 pt-5">
          <button
            type="button"
            className="-m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400"
            onClick={onClose}
            aria-label="Close"
          >
            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {/* Links */}
        <div className="space-y-6 px-4 py-6">
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                {section.title}
              </h3>
              <ul role="list" className="mt-4 space-y-4">
                {section.links.map((link) => (
                  <li key={link.title} className="flow-root">
                    <Link
                      href={link.href}
                      className="-m-2 block p-2 text-gray-500 hover:text-gray-900"
                      onClick={onClose}
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
