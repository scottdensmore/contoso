import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CompareButton from "./compare-button";
import { ComparisonProduct } from "@/lib/comparison-context";
import { ACTION_BOUNDARY, ACTION_FOCUS } from "@/lib/control-classes";

const mockAddItem = vi.fn();
const mockRemoveItem = vi.fn();
let mockIsInComparison = vi.fn((_id: string) => false);

vi.mock("@/lib/comparison-context", async () => {
  const actual = await vi.importActual<any>("@/lib/comparison-context");
  return {
    ...actual,
    useComparison: () => ({
      items: [],
      addItem: mockAddItem,
      removeItem: mockRemoveItem,
      isInComparison: mockIsInComparison,
      clearComparison: vi.fn(),
      isOpen: false,
      openComparison: vi.fn(),
      closeComparison: vi.fn(),
      announcement: "",
    }),
  };
});

describe("CompareButton", () => {
  const sampleProduct: ComparisonProduct = {
    id: "prod-101",
    name: "Summit Ridge Backpack",
    slug: "summit-ridge-backpack",
    price: 110,
    image: "/images/backpack.webp",
    categoryName: "Packs",
    brandName: "TrailPro",
    description: "Rugged backcountry pack.",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsInComparison = vi.fn((_id: string) => false);
  });

  it("renders with aria-label, aria-pressed=false, and design tokens when not in comparison", () => {
    render(<CompareButton product={sampleProduct} />);

    const button = screen.getByRole("button", {
      name: "Add Summit Ridge Backpack to comparison",
    });
    expect(button).toBeDefined();
    expect(button.getAttribute("aria-pressed")).toBe("false");
    expect(button.className).toContain(ACTION_FOCUS);
    expect(button.className).toContain(ACTION_BOUNDARY);
    expect(button.textContent).toContain("Compare");
  });

  it("calls addItem when clicked while not comparing", () => {
    render(<CompareButton product={sampleProduct} />);

    const button = screen.getByRole("button", {
      name: "Add Summit Ridge Backpack to comparison",
    });
    fireEvent.click(button);

    expect(mockAddItem).toHaveBeenCalledTimes(1);
    expect(mockAddItem).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "prod-101",
        name: "Summit Ridge Backpack",
      })
    );
  });

  it("renders with remove aria-label, aria-pressed=true, and Comparing state when product is in comparison", () => {
    mockIsInComparison = vi.fn((id: string) => id === "prod-101");

    render(<CompareButton product={sampleProduct} />);

    const button = screen.getByRole("button", {
      name: "Remove Summit Ridge Backpack from comparison",
    });
    expect(button).toBeDefined();
    expect(button.getAttribute("aria-pressed")).toBe("true");
    expect(button.textContent).toContain("Comparing");
  });

  it("calls removeItem with product id when clicked while comparing", () => {
    mockIsInComparison = vi.fn((id: string) => id === "prod-101");

    render(<CompareButton product={sampleProduct} />);

    const button = screen.getByRole("button", {
      name: "Remove Summit Ridge Backpack from comparison",
    });
    fireEvent.click(button);

    expect(mockRemoveItem).toHaveBeenCalledTimes(1);
    expect(mockRemoveItem).toHaveBeenCalledWith("prod-101");
  });

  it("applies custom className", () => {
    render(<CompareButton product={sampleProduct} className="custom-class" />);
    const button = screen.getByRole("button");
    expect(button.className).toContain("custom-class");
  });
});
