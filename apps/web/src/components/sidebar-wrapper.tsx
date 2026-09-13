"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { getSidebarLinks, NavSection } from "@/lib/navigation";
import Sidebar, { CategoryStatus } from "./sidebar";

export interface Category {
  id: string;
  name: string;
  slug?: string;
}

interface SidebarWrapperProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SidebarWrapper({ isOpen, onClose }: SidebarWrapperProps) {
  const { data: session } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [status, setStatus] = useState<CategoryStatus>("idle");
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen && status === "failed") {
      setStatus("idle");
    }
  }

  useEffect(() => {
    if (!isOpen || status === "loaded" || status === "failed") {
      return;
    }

    let ignore = false;
    fetch("/api/categories")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        return response.json();
      })
      .then((data) => {
        if (!ignore) {
          setCategories(data);
          setStatus("loaded");
        }
      })
      .catch((error) => {
        if (!ignore) {
          console.error("Failed to fetch categories", error);
          setStatus("failed");
        }
      });

    return () => {
      ignore = true;
    };
  }, [isOpen, status]);

  const categoryStatus: CategoryStatus =
    isOpen && status === "idle" ? "loading" : status;

  const sections: NavSection[] = useMemo(
    () => getSidebarLinks(session, categories),
    [session, categories],
  );

  const handleRetry = () => {
    setStatus("idle");
  };

  return (
    <Sidebar 
      isOpen={isOpen} 
      onClose={onClose} 
      sections={sections}
      categoryStatus={categoryStatus}
      onRetryCategories={handleRetry}
    />
  );
}
