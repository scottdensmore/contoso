import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  if (process.env.NEXT_BUILD_SKIP_DB === "1") {
    return NextResponse.json([]);
  }

  try {
    const brands = await prisma.brand.findMany();
    return NextResponse.json(brands);
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json(
      { message: "Error fetching brands." },
      { status: 500 }
    );
  }
}
