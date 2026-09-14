import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import InventoryBadge from "./inventory-badge";
import { ACTION_FOCUS, ACTION_BOUNDARY } from "@/lib/control-classes";

describe("InventoryBadge", () => {
  it("renders in-stock badge with role=status and accessible label", () => {
    // productId 3 resolves to in_stock
    render(<InventoryBadge productId={3} />);

    const badge = screen.getByRole("status");
    expect(badge).toBeDefined();
    expect(badge.getAttribute("aria-label")).toBe("Inventory status: In Stock");
    expect(badge.textContent).toContain("In Stock");
    expect(badge.className).toContain("bg-emerald-50");
    expect(badge.className).toContain("text-emerald-700");
    expect(badge.className).toContain("border-emerald-200");
  });

  it("renders low-stock badge with role=status, count, and amber styling", () => {
    // productId 1 resolves to low_stock (quantity 3)
    render(<InventoryBadge productId={1} />);

    const badge = screen.getByRole("status");
    expect(badge).toBeDefined();
    expect(badge.getAttribute("aria-label")).toBe(
      "Inventory status: Only 3 left in stock - order soon!"
    );
    expect(badge.textContent).toContain(
      "Only 3 left in stock - order soon!"
    );
    expect(badge.className).toContain("bg-amber-50");
    expect(badge.className).toContain("text-amber-800");
    expect(badge.className).toContain("border-amber-200");
  });

  it("renders out-of-stock badge with role=status and red styling", () => {
    // productId 12 resolves to out_of_stock
    render(<InventoryBadge productId={12} />);

    const badge = screen.getByRole("status");
    expect(badge).toBeDefined();
    expect(badge.getAttribute("aria-label")).toBe("Inventory status: Out of Stock");
    expect(badge.textContent).toContain("Out of Stock");
    expect(badge.className).toContain("bg-red-50");
    expect(badge.className).toContain("text-red-700");
    expect(badge.className).toContain("border-red-200");
  });

  it("includes visual status dot indicator with aria-hidden", () => {
    const { container } = render(<InventoryBadge productId={3} />);
    const dot = container.querySelector('[aria-hidden="true"]');
    expect(dot).toBeDefined();
    expect(dot?.className).toContain("rounded-full");
    expect(dot?.className).toContain("bg-emerald-500");
  });

  it("uses design tokens ACTION_FOCUS and border tokens from control-classes", () => {
    render(<InventoryBadge productId={3} />);
    const badge = screen.getByRole("status");

    expect(badge.className).toContain("border");
    expect(badge.className).toContain(ACTION_FOCUS);
    expect(badge.className).toContain(ACTION_BOUNDARY);
  });

  it("supports passing optional slug and custom className", () => {
    render(<InventoryBadge productId="custom-item" slug="custom-slug" className="custom-class" />);
    const badge = screen.getByRole("status");
    expect(badge.className).toContain("custom-class");
  });
});
