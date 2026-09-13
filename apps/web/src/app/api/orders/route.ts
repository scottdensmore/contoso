import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body" },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object" || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: "Cart items are required to place an order" },
        { status: 400 }
      );
    }

    const itemsInput: OrderItemInput[] = body.items;

    // Validate structure and quantities
    for (const item of itemsInput) {
      if (
        !item ||
        typeof item !== "object" ||
        typeof item.productId !== "string" ||
        !item.productId.trim() ||
        typeof item.quantity !== "number" ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        return NextResponse.json(
          { error: "Invalid item payload: productId and positive integer quantity are required" },
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
