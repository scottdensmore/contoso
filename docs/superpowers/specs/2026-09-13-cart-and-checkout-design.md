# Design Spec: Add-to-Cart & Checkout Experience

**Date:** 2026-09-13  
**Status:** Approved  
**Target:** `apps/web`

---

## 1. Problem & Context

Contoso Outdoors features product browsing, detailed specification pages, customer reviews, and customer order history in the profile dashboard. However, there is currently no mechanism for shoppers to collect products into a cart or place an order through the web frontend.

This feature establishes an accessible, client-side shopping cart with a slide-over drawer interface, backed by an authoritative order placement API (`POST /api/orders`) that creates `Order` and `OrderItem` records in PostgreSQL via Prisma.

---

## 2. Architecture & Data Flow

### 2.1 Cart State Management
- **Cart Context (`apps/web/src/lib/cart-context.tsx`)**:
  - Encapsulates cart state: `items: CartItem[]`, `isOpen: boolean`, `openCart()`, `closeCart()`, `addItem()`, `updateQuantity()`, `removeItem()`, `clearCart()`, `totalItems`, and `subtotal`.
  - Persists to `localStorage` under key `contoso_cart`.
  - Hydrates gracefully on client mount to avoid server/client hydration mismatch.
  - Mounted inside `apps/web/src/components/providers.tsx`.

### 2.2 Order Placement API (`POST /api/orders`)
- **Route**: `apps/web/src/app/api/orders/route.ts`
- **Request Payload**:
  ```json
  {
    "items": [
      { "productId": "prod_1", "quantity": 2 }
    ]
  }
  ```
- **Execution Flow**:
  1. **Authentication Check**: Resolves session via `getServerSession(authOptions)`. Returns `401 Unauthorized` if unauthenticated.
  2. **Validation**: Verifies `items` is a non-empty array with positive integer quantities (`1 <= quantity <= 99`). Returns `400 Bad Request` on invalid inputs.
  3. **Authoritative Price Resolution**: Queries `prisma.product.findMany({ where: { id: { in: productIds } } })`. Rejects unknown product IDs with `404 Not Found`. Computes authoritative line prices and order total server-side:
     $$\text{total} = \sum (\text{dbProduct.price} \times \text{quantity})$$
  4. **Database Transaction**:
     Creates `Order` and associated `OrderItem` rows in a single atomic `prisma.order.create` call:
     ```typescript
     const order = await prisma.order.create({
       data: {
         userId: session.user.id,
         total,
         items: {
           create: validatedItems.map(item => ({
             productId: item.productId,
             quantity: item.quantity,
             price: item.authoritativePrice,
           })),
         },
       },
       include: { items: { include: { product: true } } },
     });
     ```
  5. **Response**: Returns `201 Created` with order summary (`id`, `total`, `date`, `items`).

---

## 3. Component Design & Accessibility

### 3.1 Header Cart Trigger (`apps/web/src/components/header.tsx`)
- Renders `ShoppingBagIcon` from `@heroicons/react/24/outline`.
- Displays dynamic badge counter indicating `totalItems` when > 0.
- Accessibility:
  - `aria-label={totalItems > 0 ? "Shopping cart, " + totalItems + " items" : "Shopping cart, empty"}`
  - `aria-expanded={isOpen}` and `aria-controls="cart-drawer"`
  - Retains focus ref and returns focus to this trigger upon drawer dismissal.

### 3.2 Product Add-to-Cart (`apps/web/src/components/add-to-cart.tsx`)
- Placed on `apps/web/src/app/products/[slug]/page.tsx` beneath the price.
- Quantity selector with decrement (`-`), increment (`+`), and numeric input.
- "Add to Cart" button styled with `${ACTION_BOUNDARY}` and `${ACTION_FOCUS}` design tokens.
- Clicking adds the item to `CartContext` and opens the cart drawer.
- Provides `aria-live="polite"` feedback for screen reader announcements.

### 3.3 Cart Slide-Over Drawer (`apps/web/src/components/cart-drawer.tsx`)
- Renders as a fixed slide-over dialog on the right edge of the viewport.
- Accessibility:
  - `role="dialog"`, `aria-modal="true"`, `id="cart-drawer"`, `aria-labelledby="cart-heading"`.
  - Focus trap keeps keyboard navigation inside the drawer.
  - Dismissable via `Escape` key, backdrop click, or Close button.
- **Empty State**: Friendly heading ("Your cart is empty") and "Continue Shopping" button closing the drawer.
- **Populated State**:
  - Scrollable item list showing image, product name (linked to slug), price, quantity adjustments, and remove action.
  - Sticky bottom footer displaying order subtotal, standard shipping note, and Checkout button.
  - **Signed In**: Displays "Place Order ($XX.XX)" with in-flight spinner. On success, clears cart, closes drawer, and redirects to `/profile`.
  - **Signed Out**: Displays "Sign in to Checkout" linking to `/login?callbackUrl=/products/[slug]`.

---

## 4. Error Handling & Security

1. **Price Tampering Prevention**: All pricing calculations are authoritative on the server by querying the database.
2. **Session Security**: Orders are strictly attached to the authenticated user ID from NextAuth.
3. **Resilience**: If the API call fails or encounters network errors, the drawer remains open, cart contents are preserved in `localStorage`, and an accessible error alert (`role="alert"`) displays with a retry action.

---

## 5. Testing Strategy (TDD)

- **`src/lib/cart-context.test.tsx`**: Tests cart operations (`addItem`, `removeItem`, `updateQuantity`, `clearCart`, totals calculation, and `localStorage` syncing).
- **`src/components/add-to-cart.test.tsx`**: Tests quantity selection limits and add-to-cart invocation.
- **`src/components/cart-drawer.test.tsx`**: Tests dialog semantics, keyboard focus trapping/restoration, empty/filled rendering, and checkout action.
- **`src/app/api/orders/route.test.ts`**: Tests auth requirement (401), validation (400), non-existent product handling (404), and successful order transaction creation (201).
