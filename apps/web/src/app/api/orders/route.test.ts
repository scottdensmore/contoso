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

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

describe("POST /api/orders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
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

  it("returns 401 when session has no user id", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: {} } as any);
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

  it("returns 400 when request body contains invalid JSON", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "u1", email: "user@example.com" },
    } as any);

    const req = new Request("http://localhost/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "invalid-json{",
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Invalid JSON request body");
  });

  it("returns 400 when request body is null or not an object", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "u1", email: "user@example.com" },
    } as any);

    const req = new Request("http://localhost/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(null),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Cart items are required");
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

  it("returns 400 when an item in items array is null or non-object", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "u1", email: "user@example.com" },
    } as any);

    const req = new Request("http://localhost/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: [null] }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Invalid item payload");
  });

  it("returns 400 when an item has non-positive quantity or missing productId", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "u1", email: "user@example.com" },
    } as any);

    const req = new Request("http://localhost/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ productId: "p1", quantity: 0 }] }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Invalid item payload");
  });

  it("returns 400 when an item quantity is not an integer", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "u1", email: "user@example.com" },
    } as any);

    const req = new Request("http://localhost/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ productId: "p1", quantity: 2.5 }] }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Invalid item payload");
  });

  it("returns 400 when an item productId is empty or whitespace", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "u1", email: "user@example.com" },
    } as any);

    const req = new Request("http://localhost/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ productId: "   ", quantity: 1 }] }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Invalid item payload");
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

  it("returns 500 when database throws an unexpected error", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "u1", email: "user@example.com" },
    } as any);
    vi.mocked(prisma.product.findMany).mockRejectedValue(new Error("Database failure"));

    const req = new Request("http://localhost/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ productId: "p1", quantity: 1 }] }),
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toContain("Internal server error");
  });
});
