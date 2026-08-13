import { NextRequest, NextResponse } from "next/server";

const WC_KEY = process.env.WC_KEY;
const WC_SECRET = process.env.WC_SECRET;

export async function GET(request: NextRequest) {
  try {
    // =========================
    // CHECK CREDENTIALS
    // =========================

    if (!WC_KEY || !WC_SECRET) {
      console.error("WooCommerce credentials are missing");

      return NextResponse.json(
        {
          success: false,
          message: "WooCommerce credentials are missing",
        },
        { status: 500 }
      );
    }

    // =========================
    // WOOCOMMERCE URL
    // =========================

    const baseUrl = process.env.WC_URL;

    if (!baseUrl) {
      return NextResponse.json(
        {
          success: false,
          message: "WC_URL is missing",
        },
        { status: 500 }
      );
    }

    // =========================
    // QUERY PARAMETERS
    // =========================

    const searchParams = request.nextUrl.searchParams;

    const category = searchParams.get("category");
    const perPage = searchParams.get("per_page") || "8";
    const page = searchParams.get("page") || "1";

    // =========================
    // AUTH
    // =========================

    const auth = Buffer.from(
      `${WC_KEY}:${WC_SECRET}`
    ).toString("base64");

    // =========================
    // WOOCOMMERCE PARAMETERS
    // =========================

    const params = new URLSearchParams();

    // المنتجات اللي WooCommerce يعتبرها Sale
    params.set("on_sale", "true");

    // المنتجات الموجودة في المخزون فقط
    params.set("stock_status", "instock");

    // المنتجات المنشورة فقط
    params.set("status", "publish");

    // Pagination
    params.set("per_page", perPage);
    params.set("page", page);

    // Category optional
    if (category) {
      params.set("category", category);
    }

    // =========================
    // API URL
    // =========================

    const url =
      `${baseUrl}/wp-json/wc/v3/products?${params.toString()}`;

    console.log("Fetching sale products:", url);

    // =========================
    // FETCH PRODUCTS
    // =========================

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const data = await response.json();

    // =========================
    // API ERROR
    // =========================

    if (!response.ok) {
      console.error("WooCommerce API Error:", data);

      return NextResponse.json(
        {
          success: false,
          message:
            data?.message ||
            "WooCommerce API error",
          error: data,
        },
        { status: response.status }
      );
    }

    // =========================
    // SALE FILTER
    // =========================

    const products = Array.isArray(data)
      ? data.filter((product) => {
          const regularPrice = Number(
            product.regular_price
          );

          const salePrice = Number(
            product.sale_price
          );

          return (
            product.stock_status === "instock" &&
            regularPrice > 0 &&
            salePrice > 0 &&
            salePrice < regularPrice
          );
        })
      : [];

    // =========================
    // RESPONSE
    // =========================

    return NextResponse.json({
      success: true,
      products,

      pagination: {
        page: Number(page),
        per_page: Number(perPage),

        total: Number(
          response.headers.get("x-wp-total") || 0
        ),

        total_pages: Number(
          response.headers.get("x-wp-totalpages") || 0
        ),
      },
    });
  } catch (error) {
    console.error(
      "Sale Products API Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}