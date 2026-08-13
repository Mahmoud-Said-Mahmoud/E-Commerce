import { NextRequest, NextResponse } from "next/server";

const WC_URL = process.env.WC_URL;
const WC_KEY = process.env.WC_KEY;
const WC_SECRET = process.env.WC_SECRET;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      firstName,
      lastName,
      email,
      username,
      password,
    } = body;

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        {
          message: "All required fields are required",
        },
        { status: 400 }
      );
    }

    const auth = Buffer.from(
      `${WC_KEY}:${WC_SECRET}`
    ).toString("base64");

    const response = await fetch(
      `${WC_URL}/wp-json/wc/v3/customers`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          first_name: firstName,
          last_name: lastName,
          username: username || undefined,
          password,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          message:
            data.message || "Failed to create account",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(
      {
        message: "Account created successfully",
        customer: {
          id: data.id,
          email: data.email,
          firstName: data.first_name,
          lastName: data.last_name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);

    return NextResponse.json(
      {
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}