import { NextRequest, NextResponse } from "next/server";

const username = process.env.WC_KEY!;
const password = process.env.WC_SECRET!;

const auth = Buffer.from(`${username}:${password}`).toString("base64");

const BASE_URL =
  "https://www.i-techegypt.com/wp-json/wc/v3";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    /* =========================================================
       PAGINATION
    ========================================================= */

    const pageParam = Number(searchParams.get("page"));
    const perPageParam = Number(searchParams.get("per_page"));

    const page =
      Number.isInteger(pageParam) && pageParam > 0
        ? pageParam
        : 1;

    const perPage =
      Number.isInteger(perPageParam) &&
      perPageParam > 0 &&
      perPageParam <= 100
        ? perPageParam
        : 24;

    /* =========================================================
       FILTERS
    ========================================================= */

    const category =
      searchParams.get("category")?.trim() || "";

    const brand =
      searchParams.get("brand")?.trim() || "";

    const minPrice =
      searchParams.get("min_price")?.trim() || "";

    const maxPrice =
      searchParams.get("max_price")?.trim() || "";

    const stockStatus =
      searchParams.get("stock_status")?.trim() || "";

    const search =
      searchParams.get("search")?.trim() || "";

    const sort =
      searchParams.get("sort")?.trim() || "relevance";

    /* =========================================================
       BUILD URL
    ========================================================= */

    const url = new URL(`${BASE_URL}/products`);

    url.searchParams.set("page", page.toString());
    url.searchParams.set("per_page", perPage.toString());

    /* =========================================================
       CATEGORY
    ========================================================= */

    if (category) {
      url.searchParams.set("category", category);
    }

    /* =========================================================
       BRAND
    ========================================================= */

    if (brand) {
      url.searchParams.set("brand", brand);
    }

    /* =========================================================
       PRICE
    ========================================================= */

    if (minPrice) {
      url.searchParams.set("min_price", minPrice);
    }

    if (maxPrice) {
      url.searchParams.set("max_price", maxPrice);
    }

    /* =========================================================
       STOCK
    ========================================================= */

    if (stockStatus) {
      url.searchParams.set("stock_status", stockStatus);
    }

    /* =========================================================
       SEARCH
    ========================================================= */

    if (search) {
      url.searchParams.set("search", search);
    }

    /* =========================================================
       SORT
    ========================================================= */

    switch (sort) {
      case "price-low":
        url.searchParams.set("orderby", "price");
        url.searchParams.set("order", "asc");
        break;

      case "price-high":
        url.searchParams.set("orderby", "price");
        url.searchParams.set("order", "desc");
        break;

      case "name":
        url.searchParams.set("orderby", "title");
        url.searchParams.set("order", "asc");
        break;

      case "date":
        url.searchParams.set("orderby", "date");
        url.searchParams.set("order", "desc");
        break;

      case "relevance":
      default:
        url.searchParams.set("orderby", "date");
        url.searchParams.set("order", "desc");
        break;
    }

    /* =========================================================
       FETCH WOOCOMMERCE
       
       Cache = 5 minutes
    ========================================================= */

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: "application/json",
      },

      next: {
        revalidate: 300,
      },
    });

    /* =========================================================
       ERROR
    ========================================================= */

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "WooCommerce Error:",
        errorText
      );

      return NextResponse.json(
        {
          error: "Failed to fetch products",
          details: errorText,
        },
        {
          status: response.status,
        }
      );
    }

    /* =========================================================
       DATA
    ========================================================= */

    const products = await response.json();

    /* =========================================================
       PAGINATION HEADERS
    ========================================================= */

    const totalProducts =
      Number(
        response.headers.get("x-wp-total")
      ) || 0;

    const totalPages =
      Number(
        response.headers.get("x-wp-totalpages")
      ) || 1;

    /* =========================================================
       RESPONSE
    ========================================================= */

    return NextResponse.json(
      {
        data: products,

        totalProducts,

        totalPages,

        page,

        perPage,

        filters: {
          category: category || undefined,
          brand: brand || undefined,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          stockStatus: stockStatus || undefined,
          search: search || undefined,
          sort,
        },
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
      "Products API Error:",
      error
    );

    return NextResponse.json(
      {
        error: "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}