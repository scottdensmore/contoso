import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request?: Request) {
  if (process.env.NEXT_BUILD_SKIP_DB === "1") {
    return NextResponse.json([]);
  }

  try {
    let where: any = undefined;
    let take: number | undefined = undefined;

    if (request) {
      const { searchParams } = new URL(request.url);
      const search = searchParams.get("search") || searchParams.get("q");
      const limitParam = searchParams.get("limit");
      const limit = limitParam ? parseInt(limitParam, 10) : undefined;

      if (limit !== undefined && !isNaN(limit)) {
        take = limit;
      }

      if (search) {
        where = {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { category: { name: { contains: search, mode: "insensitive" } } },
            { brand: { name: { contains: search, mode: "insensitive" } } },
          ],
        };
      }
    }

    const products = await prisma.product.findMany({
      ...(where ? { where } : {}),
      ...(take !== undefined ? { take } : {}),
      include: { category: true, brand: true },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { message: "Error fetching products." },
      { status: 500 }
    );
  }
}
