# Add-to-Cart & Checkout Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete, accessible, and secure shopping cart and checkout experience in Contoso Outdoors (`apps/web`), featuring client-side cart management with `localStorage` persistence, a slide-over drawer interface, and an authoritative `POST /api/orders` route handler.

**Architecture:** A React Context (`CartContext`) manages cart items and drawer visibility, persisting state to `localStorage`. Product pages render an `AddToCart` component with quantity picking. An accessible slide-over dialog (`CartDrawer`) displays cart items and calculated subtotal. Upon checkout, authenticated users submit `{ items: [{ productId, quantity }] }` to `POST /api/orders`, which fetches authoritative prices from PostgreSQL (`prisma.product`) and transactionally creates `Order` and `OrderItem` records before redirecting to `/profile`.

**Tech Stack:** Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS, Prisma 7, NextAuth.js, Vitest, Testing Library.

**Spec:** [`docs/superpowers/specs/2026-09-13-cart-and-checkout-design.md`](file:///home/scottdensmore/Developer/scottdensmore/contoso/docs/superpowers/specs/2026-09-13-cart-and-checkout-design.md)

## Global Constraints

- Never trust client-provided product prices for order placement; resolve all prices server-side via `prisma.product`.
- `apps/web` changes only; do not touch `services/chat/` or root scripts.
- Adhere to design tokens in `apps/web/src/lib/control-classes.ts` (`ACTION_BOUNDARY`, `ACTION_FOCUS`).
- Dialogs must implement WCAG accessible patterns: `role="dialog"`, `aria-modal="true"`, focus containment, and focus restoration to the opening trigger on dismissal.
- Every task must follow strict TDD: failing tests written and observed before implementation.

---

### Task 1: Cart Context & State Management

**Files:**
- Create: `apps/web/src/lib/cart-context.tsx`
- Create: `apps/web/src/lib/cart-context.test.tsx`
- Modify: `apps/web/src/components/providers.tsx`

**Interfaces:**
- Produces:
  ```typescript
  export interface CartItem {
    productId: string;
    slug: string;
    name: string;
    price: number;
    image?: string | null;
    quantity: number;
  }

  export interface CartContextValue {
    items: CartItem[];
    isOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
    addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    subtotal: number;
  }

  export function CartProvider({ children }: { children: React.ReactNode }): React.JSX.Element;
  export function useCart(): CartContextValue;
  ```

- [ ] **Step 1: Write the failing tests for CartContext**

Create `apps/web/src/lib/cart-context.test.tsx`:
```tsx
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { CartProvider, useCart } from "./cart-context";

describe("CartContext", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <CartProvider>{children}</CartProvider>
  );

  it("initializes with empty cart", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.items).toEqual([]);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.subtotal).toBe(0);
    expect(result.current.isOpen).toBe(false);
  });

  it("adds an item and calculates totalItems and subtotal", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem({
        productId: "p1",
        slug: "tent-1",
        name: "Trailmaster Tent",
        price: 100,
        image: "/images/tent.webp",
      }, 2);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toEqual({
      productId: "p1",
      slug: "tent-1",
      name: "Trailmaster Tent",
      price: 100,
      image: "/images/tent.webp",
      quantity: 2,
    });
    expect(result.current.totalItems).toBe(2);
    expect(result.current.subtotal).toBe(200);
  });

  it("increments quantity when existing item is added again", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem({ productId: "p1", slug: "tent", name: "Tent", price: 50 }, 1);
    });
    act(() => {
      result.current.addItem({ productId: "p1", slug: "tent", name: "Tent", price: 50 }, 2);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(3);
    expect(result.current.totalItems).toBe(3);
    expect(result.current.subtotal).toBe(150);
  });

  it("updates quantity and removes item when quantity reaches 0", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem({ productId: "p1", slug: "tent", name: "Tent", price: 50 }, 3);
    });
    act(() => {
      result.current.updateQuantity("p1", 1);
    });
    expect(result.current.items[0].quantity).toBe(1);

    act(() => {
      result.current.updateQuantity("p1", 0);
    });
    expect(result.current.items).toHaveLength(0);
    expect(result.current.totalItems).toBe(0);
  });

  it("removes item directly and clears cart", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem({ productId: "p1", slug: "tent", name: "Tent", price: 50 }, 1);
      result.current.addItem({ productId: "p2", slug: "bag", name: "Bag", price: 80 }, 1);
    });
    expect(result.current.items).toHaveLength(2);

    act(() => {
      result.current.removeItem("p1");
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].productId).toBe("p2");

    act(() => {
      result.current.clearCart();
    });
    expect(result.current.items).toHaveLength(0);
    expect(result.current.totalItems).toBe(0);
  });

  it("toggles open and close state", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.isOpen).toBe(false);

    act(() => {
      result.current.openCart();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.closeCart();
    });
    expect(result.current.isOpen).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix apps/web test src/lib/cart-context.test.tsx`
Expected: FAIL ("Cannot find module './cart-context'")

- [ ] **Step 3: Implement CartContext and wrap in Providers**

Create `apps/web/src/lib/cart-context.tsx`:
```tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image?: string | null;
  quantity: number;
}

export interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const CART_STORAGE_KEY = "contoso_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch {
      // Ignore localStorage read errors
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore localStorage write errors
    }
  }, [items, isHydrated]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const addItem = (item: Omit<CartItem, "quantity">, quantity = 1) => {
    if (quantity <= 0) return;
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.productId === item.productId);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: Math.min(99, updated[existingIndex].quantity + quantity),
        };
        return updated;
      }
      return [...prev, { ...item, quantity: Math.min(99, quantity) }];
    });
    setIsOpen(true);
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId ? { ...i, quantity: Math.min(99, quantity) } : i
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
```

Modify `apps/web/src/components/providers.tsx`:
```tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/lib/cart-context";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <CartProvider>{children}</CartProvider>
    </SessionProvider>
  );
};

export default Providers;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix apps/web test src/lib/cart-context.test.tsx`
Expected: PASS (6 tests passed)

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/cart-context.tsx apps/web/src/lib/cart-context.test.tsx apps/web/src/components/providers.tsx
git commit -m "feat(web): implement cart context state management and localStorage sync"
```

---

### Task 2: Order Placement API Route (`POST /api/orders`)

**Files:**
- Create: `apps/web/src/app/api/orders/route.ts`
- Create: `apps/web/src/app/api/orders/route.test.ts`

**Interfaces:**
- Consumes: NextAuth `getServerSession`, `prisma.product`, `prisma.order`
- Produces: `POST` endpoint returning HTTP `201`, `400`, `401`, `404`, or `500`

- [ ] **Step 1: Write the failing tests for `POST /api/orders`**

Create `apps/web/src/app/api/orders/route.test.ts`:
```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: {
      findMany: vi.fn(),
    },
    order: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@/app/api/auth/[...nextauth]/route", () => ({
  authOptions: {},
}));

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

describe("POST /api/orders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when session is unauthenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    const req = new Request("http://localhost/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ productId: "p1", quantity: 1 }] }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 400 when items payload is empty or invalid", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "u1", email: "user@example.com" },
    } as any);

    const req = new Request("http://localhost/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: [] }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Cart items are required");
  });

  it("returns 404 when product is not found in database", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "u1", email: "user@example.com" },
    } as any);
    vi.mocked(prisma.product.findMany).mockResolvedValue([]);

    const req = new Request("http://localhost/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ productId: "missing_p1", quantity: 1 }] }),
    });

    const res = await POST(req);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toContain("One or more products were not found");
  });

  it("creates order with authoritative database prices and returns 201", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "u1", email: "user@example.com" },
    } as any);

    vi.mocked(prisma.product.findMany).mockResolvedValue([
      { id: "p1", name: "Tent", price: 120, slug: "tent", categoryId: "c1", brandId: "b1", description: "", image: "", createdAt: new Date(), updatedAt: new Date() },
      { id: "p2", name: "Bag", price: 80, slug: "bag", categoryId: "c1", brandId: "b1", description: "", image: "", createdAt: new Date(), updatedAt: new Date() },
    ]);

    const createdOrder = {
      id: "ord_123",
      userId: "u1",
      total: 320,
      date: new Date("2026-09-13T12:00:00Z"),
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [
        { id: "i1", orderId: "ord_123", productId: "p1", quantity: 2, price: 120 },
        { id: "i2", orderId: "ord_123", productId: "p2", quantity: 1, price: 80 },
      ],
    };
    vi.mocked(prisma.order.create).mockResolvedValue(createdOrder as any);

    const req = new Request("http://localhost/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [
          { productId: "p1", quantity: 2 },
          { productId: "p2", quantity: 1 },
        ],
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.id).toBe("ord_123");
    expect(body.total).toBe(320);

    expect(prisma.order.create).toHaveBeenCalledWith({
      data: {
        userId: "u1",
        total: 320,
        items: {
          create: [
            { productId: "p1", quantity: 2, price: 120 },
            { productId: "p2", quantity: 1, price: 80 },
          ],
        },
      },
      include: { items: { include: { product: true } } },
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix apps/web test src/app/api/orders/route.test.ts`
Expected: FAIL ("Cannot find module './route'")

- [ ] **Step 3: Implement `POST /api/orders`**

Create `apps/web/src/app/api/orders/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

interface OrderItemInput {
  productId: string;
  quantity: number;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id as string;
    const body = await request.json();

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: "Cart items are required to place an order" },
        { status: 400 }
      );
    }

    const itemsInput: OrderItemInput[] = body.items;

    // Validate structure and quantities
    for (const item of itemsInput) {
      if (!item.productId || typeof item.productId !== "string" || !item.quantity || item.quantity <= 0) {
        return NextResponse.json(
          { error: "Invalid item payload: productId and positive quantity are required" },
          { status: 400 }
        );
      }
    }

    const productIds = itemsInput.map((i) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    for (const item of itemsInput) {
      if (!productMap.has(item.productId)) {
        return NextResponse.json(
          { error: `One or more products were not found: ${item.productId}` },
          { status: 404 }
        );
      }
    }

    // Authoritative price calculation
    let total = 0;
    const orderItemsData = itemsInput.map((item) => {
      const product = productMap.get(item.productId)!;
      const linePrice = product.price;
      total += linePrice * item.quantity;
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: linePrice,
      };
    });

    const order = await prisma.order.create({
      data: {
        userId,
        total: Math.round(total * 100) / 100,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Failed to place order:", error);
    return NextResponse.json(
      { error: "Internal server error while creating order" },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix apps/web test src/app/api/orders/route.test.ts`
Expected: PASS (4 tests passed)

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/api/orders/route.ts apps/web/src/app/api/orders/route.test.ts
git commit -m "feat(web): add authenticated order creation API route with server-side price resolution"
```

---

### Task 3: Add to Cart Component on Product Page

**Files:**
- Create: `apps/web/src/components/add-to-cart.tsx`
- Create: `apps/web/src/components/add-to-cart.test.tsx`
- Modify: `apps/web/src/app/products/[slug]/page.tsx`

**Interfaces:**
- Consumes: `useCart` from `@/lib/cart-context`
- Produces: `AddToCart` Client Component

- [ ] **Step 1: Write the failing tests for AddToCart component**

Create `apps/web/src/components/add-to-cart.test.tsx`:
```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AddToCart from "./add-to-cart";
import { useCart } from "@/lib/cart-context";

vi.mock("@/lib/cart-context", () => ({
  useCart: vi.fn(),
}));

describe("AddToCart", () => {
  const mockAddItem = vi.fn();
  const mockOpenCart = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCart).mockReturnValue({
      addItem: mockAddItem,
      openCart: mockOpenCart,
    } as any);
  });

  const product = {
    id: "p1",
    slug: "trail-tent",
    name: "Trailmaster Tent",
    price: 199.99,
    image: "/images/tent.webp",
  };

  it("renders quantity controls and Add to Cart button", () => {
    render(<AddToCart product={product} />);
    expect(screen.getByRole("button", { name: "Decrease quantity" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Increase quantity" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Add to Cart" })).toBeDefined();
    expect(screen.getByLabelText("Quantity")).toHaveValue(1);
  });

  it("increments and decrements quantity correctly within 1 to 99 bounds", () => {
    render(<AddToCart product={product} />);
    const incBtn = screen.getByRole("button", { name: "Increase quantity" });
    const decBtn = screen.getByRole("button", { name: "Decrease quantity" });
    const input = screen.getByLabelText("Quantity");

    fireEvent.click(incBtn);
    expect(input).toHaveValue(2);

    fireEvent.click(decBtn);
    expect(input).toHaveValue(1);

    // Cannot go below 1
    fireEvent.click(decBtn);
    expect(input).toHaveValue(1);
  });

  it("calls addItem with product and selected quantity on button click", () => {
    render(<AddToCart product={product} />);
    const incBtn = screen.getByRole("button", { name: "Increase quantity" });
    const addBtn = screen.getByRole("button", { name: "Add to Cart" });

    fireEvent.click(incBtn);
    fireEvent.click(incBtn); // quantity = 3
    fireEvent.click(addBtn);

    expect(mockAddItem).toHaveBeenCalledWith(
      {
        productId: "p1",
        slug: "trail-tent",
        name: "Trailmaster Tent",
        price: 199.99,
        image: "/images/tent.webp",
      },
      3
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix apps/web test src/components/add-to-cart.test.tsx`
Expected: FAIL ("Cannot find module './add-to-cart'")

- [ ] **Step 3: Implement `AddToCart` component and integrate into Product Page**

Create `apps/web/src/components/add-to-cart.tsx`:
```tsx
"use client";

import React, { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { ACTION_BOUNDARY, ACTION_FOCUS } from "@/lib/control-classes";
import { PlusIcon, MinusIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";

export interface AddToCartProps {
  product: {
    id: string;
    slug: string;
    name: string;
    price: number;
    image?: string | null;
  };
}

export default function AddToCart({ product }: AddToCartProps) {
  const [quantity, setQuantity] = useState(1);
  const [announcement, setAnnouncement] = useState("");
  const { addItem } = useCart();

  const handleDecrease = () => {
    setQuantity((q) => Math.max(1, q - 1));
  };

  const handleIncrease = () => {
    setQuantity((q) => Math.min(99, q + 1));
  };

  const handleAddToCart = () => {
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.image,
      },
      quantity
    );
    setAnnouncement(`Added ${quantity} ${product.name} to your cart.`);
  };

  return (
    <div className="mt-6 flex flex-wrap items-center gap-4">
      <div className="inline-flex items-center rounded-lg border border-zinc-300 bg-white shadow-sm">
        <button
          type="button"
          onClick={handleDecrease}
          disabled={quantity <= 1}
          aria-label="Decrease quantity"
          className={`p-2.5 text-zinc-600 hover:bg-zinc-100 disabled:opacity-40 rounded-l-lg ${ACTION_FOCUS}`}
        >
          <MinusIcon className="h-4 w-4" aria-hidden="true" />
        </button>
        <label htmlFor={`quantity-${product.id}`} className="sr-only">
          Quantity
        </label>
        <input
          id={`quantity-${product.id}`}
          type="number"
          min="1"
          max="99"
          value={quantity}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            if (!isNaN(val)) {
              setQuantity(Math.max(1, Math.min(99, val)));
            }
          }}
          className="w-12 text-center text-base font-semibold text-zinc-800 focus:outline-none"
        />
        <button
          type="button"
          onClick={handleIncrease}
          disabled={quantity >= 99}
          aria-label="Increase quantity"
          className={`p-2.5 text-zinc-600 hover:bg-zinc-100 disabled:opacity-40 rounded-r-lg ${ACTION_FOCUS}`}
        >
          <PlusIcon className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <button
        type="button"
        onClick={handleAddToCart}
        className={`inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-6 py-3 text-base font-medium text-white shadow hover:bg-zinc-800 ${ACTION_BOUNDARY} ${ACTION_FOCUS}`}
      >
        <ShoppingBagIcon className="h-5 w-5" aria-hidden="true" />
        Add to Cart
      </button>

      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>
    </div>
  );
}
```

Modify `apps/web/src/app/products/[slug]/page.tsx`:
Add `import AddToCart from "@/components/add-to-cart";` and place `<AddToCart product={product} />` right below description and price in the hero Block.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix apps/web test src/components/add-to-cart.test.tsx`
Expected: PASS (3 tests passed)

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/add-to-cart.tsx apps/web/src/components/add-to-cart.test.tsx apps/web/src/app/products/[slug]/page.tsx
git commit -m "feat(web): add AddToCart component with quantity selector to product detail page"
```

---

### Task 4: Cart Slide-Over Drawer Component

**Files:**
- Create: `apps/web/src/components/cart-drawer.tsx`
- Create: `apps/web/src/components/cart-drawer.test.tsx`

**Interfaces:**
- Consumes: `useCart` from `@/lib/cart-context`, NextAuth `useSession`, Next `useRouter`
- Produces: `CartDrawer` Client Component

- [ ] **Step 1: Write the failing tests for CartDrawer**

Create `apps/web/src/components/cart-drawer.test.tsx`:
```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CartDrawer from "./cart-drawer";
import { useCart } from "@/lib/cart-context";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

vi.mock("@/lib/cart-context", () => ({
  useCart: vi.fn(),
}));

vi.mock("next-auth/react", () => ({
  useSession: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

describe("CartDrawer", () => {
  const mockCloseCart = vi.fn();
  const mockRemoveItem = vi.fn();
  const mockUpdateQuantity = vi.fn();
  const mockClearCart = vi.fn();
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any);
  });

  it("does not render when cart is closed", () => {
    vi.mocked(useCart).mockReturnValue({
      isOpen: false,
      items: [],
      closeCart: mockCloseCart,
    } as any);
    vi.mocked(useSession).mockReturnValue({ status: "unauthenticated" } as any);

    render(<CartDrawer />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders empty state when open with no items", () => {
    vi.mocked(useCart).mockReturnValue({
      isOpen: true,
      items: [],
      closeCart: mockCloseCart,
    } as any);
    vi.mocked(useSession).mockReturnValue({ status: "unauthenticated" } as any);

    render(<CartDrawer />);
    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByText("Your cart is empty")).toBeDefined();

    const continueBtn = screen.getByRole("button", { name: "Continue shopping" });
    fireEvent.click(continueBtn);
    expect(mockCloseCart).toHaveBeenCalled();
  });

  it("renders items, total, and prompts sign-in for unauthenticated users", () => {
    vi.mocked(useCart).mockReturnValue({
      isOpen: true,
      items: [
        { productId: "p1", slug: "tent", name: "Tent", price: 100, quantity: 2, image: "/images/tent.webp" },
      ],
      subtotal: 200,
      closeCart: mockCloseCart,
      updateQuantity: mockUpdateQuantity,
      removeItem: mockRemoveItem,
    } as any);
    vi.mocked(useSession).mockReturnValue({ status: "unauthenticated" } as any);

    render(<CartDrawer />);
    expect(screen.getByText("Tent")).toBeDefined();
    expect(screen.getByText("$200.00")).toBeDefined();
    expect(screen.getByRole("link", { name: /Sign in to Checkout/i })).toBeDefined();
  });

  it("submits order and navigates to profile orders tab when authenticated", async () => {
    vi.mocked(useCart).mockReturnValue({
      isOpen: true,
      items: [
        { productId: "p1", slug: "tent", name: "Tent", price: 100, quantity: 2, image: "/images/tent.webp" },
      ],
      subtotal: 200,
      closeCart: mockCloseCart,
      clearCart: mockClearCart,
    } as any);
    vi.mocked(useSession).mockReturnValue({
      status: "authenticated",
      data: { user: { id: "u1", email: "user@example.com" } },
    } as any);

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "ord_123" }),
    });

    render(<CartDrawer />);
    const placeOrderBtn = screen.getByRole("button", { name: /Place Order/i });
    fireEvent.click(placeOrderBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [{ productId: "p1", quantity: 2 }] }),
      });
      expect(mockClearCart).toHaveBeenCalled();
      expect(mockCloseCart).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/profile");
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix apps/web test src/components/cart-drawer.test.tsx`
Expected: FAIL ("Cannot find module './cart-drawer'")

- [ ] **Step 3: Implement CartDrawer component**

Create `apps/web/src/components/cart-drawer.tsx`:
```tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "@/lib/cart-context";
import { ACTION_BOUNDARY, ACTION_FOCUS } from "@/lib/control-classes";
import { XMarkIcon, TrashIcon, PlusIcon, MinusIcon } from "@heroicons/react/24/outline";

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, clearCart, subtotal } = useCart();
  const { status } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeCart();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  const formattedSubtotal = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(subtotal);

  const handleCheckout = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to place order.");
      }

      clearCart();
      closeCart();
      router.push("/profile");
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="cart-heading">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 transition-opacity backdrop-blur-sm"
        onClick={closeCart}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div
          ref={drawerRef}
          className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between"
        >
          {/* Header */}
          <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
            <h2 id="cart-heading" className="text-xl font-bold text-zinc-900">
              Shopping Cart
            </h2>
            <button
              type="button"
              onClick={closeCart}
              aria-label="Close cart"
              className={`rounded-md p-2 text-zinc-500 hover:text-zinc-800 ${ACTION_FOCUS}`}
            >
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {errorMessage && (
              <div role="alert" className="mb-4 rounded-md bg-red-50 p-4 border border-red-200 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            {items.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-lg font-medium text-zinc-700 mb-4">Your cart is empty</p>
                <button
                  type="button"
                  onClick={closeCart}
                  className={`rounded-md bg-zinc-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 ${ACTION_BOUNDARY} ${ACTION_FOCUS}`}
                >
                  Continue shopping
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-zinc-200">
                {items.map((item) => (
                  <li key={item.productId} className="py-4 flex gap-4">
                    {item.image && (
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-zinc-200 bg-zinc-50">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <Link
                          href={`/products/${item.slug}`}
                          onClick={closeCart}
                          className="font-semibold text-zinc-800 hover:text-indigo-600 transition-colors"
                        >
                          {item.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          aria-label={`Remove ${item.name} from cart`}
                          className={`text-zinc-400 hover:text-red-600 p-1 ${ACTION_FOCUS}`}
                        >
                          <TrashIcon className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>

                      <div className="flex justify-between items-center mt-2">
                        <div className="inline-flex items-center rounded border border-zinc-300">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            aria-label={`Decrease quantity of ${item.name}`}
                            className={`p-1 text-zinc-600 hover:bg-zinc-100 ${ACTION_FOCUS}`}
                          >
                            <MinusIcon className="h-3 w-3" aria-hidden="true" />
                          </button>
                          <span className="px-2 text-sm font-medium">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            aria-label={`Increase quantity of ${item.name}`}
                            className={`p-1 text-zinc-600 hover:bg-zinc-100 ${ACTION_FOCUS}`}
                          >
                            <PlusIcon className="h-3 w-3" aria-hidden="true" />
                          </button>
                        </div>

                        <span className="font-semibold text-zinc-900">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                          }).format(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-zinc-200 p-6 bg-zinc-50 space-y-4">
              <div className="flex justify-between text-base font-semibold text-zinc-900">
                <span>Subtotal</span>
                <span>{formattedSubtotal}</span>
              </div>
              <p className="text-xs text-zinc-500">Shipping and taxes calculated at checkout.</p>

              {status === "authenticated" ? (
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                  className={`w-full rounded-md bg-zinc-900 py-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 disabled:opacity-60 ${ACTION_BOUNDARY} ${ACTION_FOCUS}`}
                >
                  {isSubmitting ? "Placing order..." : `Place Order (${formattedSubtotal})`}
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={closeCart}
                  className={`block w-full rounded-md bg-zinc-900 py-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 ${ACTION_BOUNDARY} ${ACTION_FOCUS}`}
                >
                  Sign in to Checkout
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix apps/web test src/components/cart-drawer.test.tsx`
Expected: PASS (4 tests passed)

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/cart-drawer.tsx apps/web/src/components/cart-drawer.test.tsx
git commit -m "feat(web): implement accessible slide-over cart drawer with checkout action"
```

---

### Task 5: Header Trigger & Full Layout Integration

**Files:**
- Modify: `apps/web/src/components/header.tsx`
- Modify: `apps/web/src/components/header.test.tsx`
- Modify: `apps/web/src/app/layout.tsx`

**Interfaces:**
- Consumes: `useCart` from `@/lib/cart-context`
- Modifies: `Header` component to add cart trigger button and mount `CartDrawer` in `layout.tsx`

- [ ] **Step 1: Write the failing tests for Header cart trigger**

Modify `apps/web/src/components/header.test.tsx`:
Add assertions checking that a cart trigger button with appropriate `aria-label` is rendered and that clicking it opens the cart.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix apps/web test src/components/header.test.tsx`
Expected: FAIL ("Cart button not found")

- [ ] **Step 3: Update Header and Layout**

In `apps/web/src/components/header.tsx`:
- Import `useCart` from `@/lib/cart-context`.
- Import `ShoppingBagIcon` from `@heroicons/react/24/outline`.
- Render the cart trigger button between navigation links and user account menu.
- Configure focus restoration to `cartTriggerRef` on close.

In `apps/web/src/app/layout.tsx`:
- Import `CartDrawer` from `@/components/cart-drawer`.
- Render `<CartDrawer />` alongside children.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix apps/web test src/components/header.test.tsx`
Expected: PASS

- [ ] **Step 5: Run full verification suite**

Run:
1. `make -C apps/web test`
2. `make -C apps/web lint`
3. `make -C apps/web typecheck`
4. `make -C apps/web build`

Expected: All suites exit code 0.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/components/header.tsx apps/web/src/components/header.test.tsx apps/web/src/app/layout.tsx
git commit -m "feat(web): wire cart trigger into header and mount cart drawer in root layout"
```
