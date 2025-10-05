import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SignJWT } from 'jose';

const alg = 'HS256'
const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists." },
        { status: 409 }
      );
    }

    const hashedPassword = await new SignJWT({ password })
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(secret);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      { message: "User registered successfully.", user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
