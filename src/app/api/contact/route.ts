import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message, orderNumber } = body;

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
