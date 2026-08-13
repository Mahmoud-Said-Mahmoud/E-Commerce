import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const WC_URL = process.env.WC_URL;
const WC_KEY = process.env.WC_KEY;
const WC_SECRET = process.env.WC_SECRET;

const wcAuth = Buffer.from(
  `${WC_KEY}:${WC_SECRET}`
).toString("base64");

export async function GET() {
  try {
    // Get current logged-in user
    const session = await auth();

    // User is not logged in
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    // Current WooCommerce customer ID
    const customerId = session.user.id;

    console.log("Customer ID:", customerId);

    // Get customer orders
    const response = await fetch(
      `${WC_URL}/wp-json/wc/v3/orders?customer=${customerId}&per_page=50&orderby=date&order=desc`,
      {
        method: "GET",

        headers: {
          Authorization: `Basic ${wcAuth}`,
          "Content-Type": "application/json",
        },

        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorText =
        await response.text();

      console.error(
        "WooCommerce Orders Error:",
        response.status,
        errorText
      );

      return NextResponse.json(
        {
          message:
            "Failed to fetch orders",
        },
        {
          status: response.status,
        }
      );
    }

    const orders =
      await response.json();

    return NextResponse.json(
      orders
    );
  } catch (error) {
    console.error(
      "Orders API Error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}