"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/lib/cart-context";
import { WishlistProvider } from "@/lib/wishlist-context";
import { ComparisonProvider } from "@/lib/comparison-context";
import { RecentlyViewedProvider } from "@/lib/recently-viewed-context";
import ComparisonDrawer from "@/components/comparison-drawer";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <CartProvider>
        <WishlistProvider>
          <ComparisonProvider>
            <RecentlyViewedProvider>
              {children}
              <ComparisonDrawer />
            </RecentlyViewedProvider>
          </ComparisonProvider>
        </WishlistProvider>
      </CartProvider>
    </SessionProvider>
  );
};

export default Providers;
