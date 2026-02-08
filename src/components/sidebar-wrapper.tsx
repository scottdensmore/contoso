"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getSidebarLinks, NavSection } from "@/lib/navigation";
import Sidebar from "./sidebar";

interface SidebarWrapperProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SidebarWrapper({ isOpen, onClose }: SidebarWrapperProps) {
  const { data: session } = useSession();
  const [categories, setCategories] = useState([]);
  const [sections, setSections] = useState<NavSection[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    }

    fetchCategories();
  }, []);

  useEffect(() => {
    setSections(getSidebarLinks(session, categories));
  }, [session, categories]);

  return (
    <Sidebar 
      isOpen={isOpen} 
      onClose={onClose} 
      sections={sections} 
    />
  );
}
