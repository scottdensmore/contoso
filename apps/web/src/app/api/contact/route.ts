import { NextResponse } from "next/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message, orderNumber } = body || {};

    if (
      !isValidString(name) ||
      !isValidString(email) ||
      !isValidString(subject) ||
      !isValidString(message)
    ) {
      return NextResponse.json(
        { message: "Please provide name, email, subject, and message." },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json(
        { message: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // Simulate backend processing
    console.log("Contact form submission received:", {
      name,
      email,
      subject,
      message,
      orderNumber,
    });

    // Mock a short delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return NextResponse.json(
      { message: "Contact inquiry submitted successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in contact API:", error);
    return NextResponse.json(
      { message: "Failed to submit contact inquiry." },
      { status: 500 }
    );
  }
}
