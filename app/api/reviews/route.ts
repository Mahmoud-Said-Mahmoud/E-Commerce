import { NextRequest, NextResponse } from "next/server";

const username = process.env.WC_KEY;
const password = process.env.WC_SECRET;

const auth = Buffer.from(
  `${username}:${password}`
).toString("base64");

const API_URL =
  "https://www.i-techegypt.com/wp-json/wc/v3/products/reviews";

export async function POST(
  request: NextRequest
) {
  try {

    const body = await request.json();

    const {
      productId,
      rating,
      review,
    } = body;

    if (!productId) {
      return NextResponse.json(
        {
          message: "Product ID is required",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !rating ||
      rating < 1 ||
      rating > 5
    ) {
      return NextResponse.json(
        {
          message:
            "Rating must be between 1 and 5.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !review ||
      !review.trim()
    ) {
      return NextResponse.json(
        {
          message:
            "Review is required.",
        },
        {
          status: 400,
        }
      );
    }

    const response = await fetch(
      API_URL,
      {
        method: "POST",

        headers: {
          Authorization: `Basic ${auth}`,

          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          product: Number(productId),

          reviewer:
            "Website Customer",

          reviewer_email:
            "customer@i-techegypt.com",

          review: review.trim(),

          rating: Number(rating),

          status: "hold",
        }),
      }
    );

    const data =
      await response.json();

    if (!response.ok) {

      return NextResponse.json(
        {
          message:
            data?.message ||
            "Failed to submit review.",
        },
        {
          status: response.status,
        }
      );

    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Review submitted successfully.",
        review: data,
      }
    );

  } catch {

    return NextResponse.json(
      {
        message:
          "Something went wrong.",
      },
      {
        status: 500,
      }
    );

  }
}