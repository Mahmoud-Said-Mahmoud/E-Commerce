import { NextResponse } from "next/server";

const username = process.env.WC_KEY;
const password = process.env.WC_SECRET;

const auth = Buffer.from(
  `${username}:${password}`
).toString("base64");

const API_URL =
  "https://www.i-techegypt.com/wp-json/wc/v3/products/categories";

export async function GET() {
  try {
    const response = await fetch(
      `${API_URL}?per_page=100&hide_empty=false`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
        next: {
          revalidate: 300,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Failed to fetch categories",
        },
        {
          status: response.status,
        }
      );
    }

    const categories = await response.json();

    return NextResponse.json(categories);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to fetch categories",
      },
      {
        status: 500,
      }
    );
  }
}