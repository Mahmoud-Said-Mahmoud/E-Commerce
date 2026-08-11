import { NextRequest, NextResponse } from "next/server";

const username = process.env.WC_KEY!;
const password = process.env.WC_SECRET!;

const auth = Buffer.from(
  `${username}:${password}`
).toString("base64");

const BASE_URL =
  "https://www.i-techegypt.com/wp-json/wc/v3";

export async function GET(
  request: NextRequest
) {
  try {
    const searchParams =
      request.nextUrl.searchParams;

    /* =====================================================
       SEARCH
    ===================================================== */

    const search =
      searchParams
        .get("q")
        ?.trim() || "";

    /* =====================================================
       PAGINATION
    ===================================================== */

    const pageParam =
      Number(
        searchParams.get("page")
      );

    const perPageParam =
      Number(
        searchParams.get("per_page")
      );

    const page =
      Number.isInteger(pageParam) &&
      pageParam > 0
        ? pageParam
        : 1;

    const perPage =
      Number.isInteger(perPageParam) &&
      perPageParam > 0 &&
      perPageParam <= 100
        ? perPageParam
        : 24;

    /* =====================================================
       FILTERS
    ===================================================== */

    const categories =
      searchParams.get(
        "categories"
      );

    const brands =
      searchParams.get(
        "brands"
      );

    const minPrice =
      searchParams.get(
        "min_price"
      );

    const maxPrice =
      searchParams.get(
        "max_price"
      );

    const stockStatus =
      searchParams.get(
        "stock_status"
      );

    /* =====================================================
       EMPTY SEARCH
    ===================================================== */

    if (!search) {
      return NextResponse.json({
        products: [],
        total: 0,
        totalPages: 0,
        page: 1,
      });
    }

    /* =====================================================
       BUILD WOOCOMMERCE URL
    ===================================================== */

    const url = new URL(
      `${BASE_URL}/products`
    );

    url.searchParams.set(
      "search",
      search
    );

    url.searchParams.set(
      "page",
      page.toString()
    );

    url.searchParams.set(
      "per_page",
      perPage.toString()
    );

    url.searchParams.set(
      "status",
      "publish"
    );

    /* =====================================================
       CATEGORY
    ===================================================== */

    if (categories) {
      url.searchParams.set(
        "category",
        categories
      );
    }

    /* =====================================================
       BRAND
    ===================================================== */

    if (brands) {
      url.searchParams.set(
        "brand",
        brands
      );
    }

    /* =====================================================
       PRICE
    ===================================================== */

    if (minPrice) {
      url.searchParams.set(
        "min_price",
        minPrice
      );
    }

    if (maxPrice) {
      url.searchParams.set(
        "max_price",
        maxPrice
      );
    }

    /* =====================================================
       STOCK
    ===================================================== */

    if (stockStatus) {
      url.searchParams.set(
        "stock_status",
        stockStatus
      );
    }

    /* =====================================================
       FETCH
       
       Cache = 5 minutes
    ===================================================== */

    const response = await fetch(
      url.toString(),
      {
        headers: {
          Authorization: `Basic ${auth}`,
          Accept: "application/json",
        },

        next: {
          revalidate: 300,
        },
      }
    );

    /* =====================================================
       ERROR
    ===================================================== */

    if (!response.ok) {
      const errorText =
        await response.text();

      console.error(
        "Search Error:",
        errorText
      );

      return NextResponse.json(
        {
          error:
            "Failed to search products",
        },
        {
          status:
            response.status,
        }
      );
    }

    /* =====================================================
       DATA
    ===================================================== */

    const products =
      await response.json();

    /* =====================================================
       PAGINATION
    ===================================================== */

    const total =
      Number(
        response.headers.get(
          "x-wp-total"
        )
      ) || 0;

    const totalPages =
      Number(
        response.headers.get(
          "x-wp-totalpages"
        )
      ) || 0;

    /* =====================================================
       RESPONSE
    ===================================================== */

    return NextResponse.json(
      {
        products,
        total,
        totalPages,
        page,
      },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error(
      "SEARCH API ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}