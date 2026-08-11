import { NextRequest, NextResponse } from "next/server";

const username = process.env.WC_KEY!;
const password = process.env.WC_SECRET!;

const auth = Buffer.from(
  `${username}:${password}`
).toString("base64");

const WC_BASE_URL =
  "https://www.i-techegypt.com/wp-json/wc/v3";

const STORE_BASE_URL =
  "https://www.i-techegypt.com/wp-json/wc/store/v1";

/* =========================================================
   TYPES
========================================================= */

interface WooItem {
  id: number;
  name: string;
  slug: string;
  count?: number;
  parent?: number;
}

interface WooProduct {
  id: number;
  name: string;
  brands?: WooItem[];
}

/* =========================================================
   GET ALL PAGES
========================================================= */

async function getAllPages(
  baseUrl: string,
  endpoint: string,
  authenticated = true,
  extraParams?: Record<string, string>
): Promise<any[]> {
  const allItems: any[] = [];

  let page = 1;
  let totalPages = 1;

  do {
    const url = new URL(
      `${baseUrl}/${endpoint}`
    );

    url.searchParams.set(
      "page",
      page.toString()
    );

    url.searchParams.set(
      "per_page",
      "100"
    );

    /* =====================================================
       EXTRA PARAMETERS
    ===================================================== */

    if (extraParams) {
      Object.entries(extraParams).forEach(
        ([key, value]) => {
          url.searchParams.set(
            key,
            value
          );
        }
      );
    }

    /* =====================================================
       FETCH
       
       Cache = 5 minutes
    ===================================================== */

    const response = await fetch(
      url.toString(),
      {
        headers: authenticated
          ? {
              Authorization: `Basic ${auth}`,
              Accept: "application/json",
            }
          : {
              Accept: "application/json",
            },

        next: {
          revalidate: 300,
        },
      }
    );

    if (!response.ok) {
      const error =
        await response.text();

      console.error(
        `Failed ${endpoint}:`,
        response.status,
        error
      );

      throw new Error(
        `Failed to fetch ${endpoint}`
      );
    }

    const data =
      await response.json();

    if (Array.isArray(data)) {
      allItems.push(...data);
    }

    totalPages =
      Number(
        response.headers.get(
          "x-wp-totalpages"
        )
      ) || 1;

    page++;
  } while (page <= totalPages);

  return allItems;
}

/* =========================================================
   GET BRANDS
========================================================= */

async function getBrands(
  category?: string
) {
  /* =======================================================
     NO CATEGORY
     
     Get all brands
  ======================================================= */

  if (!category) {
    try {
      return await getAllPages(
        WC_BASE_URL,
        "products/brands",
        true,
        {
          hide_empty: "true",
        }
      );
    } catch (error) {
      console.warn(
        "WC v3 brands failed. Trying Store API..."
      );

      return await getAllPages(
        STORE_BASE_URL,
        "products/brands",
        false,
        {
          hide_empty: "true",
        }
      );
    }
  }

  /* =======================================================
     CATEGORY EXISTS
     
     Get products in category
  ======================================================= */

  const products =
    (await getAllPages(
      WC_BASE_URL,
      "products",
      true,
      {
        category,
        status: "publish",
      }
    )) as WooProduct[];

  /* =======================================================
     EXTRACT BRANDS
  ======================================================= */

  const brandsMap =
    new Map<number, WooItem>();

  products.forEach(
    (product) => {
      if (
        !Array.isArray(
          product.brands
        )
      ) {
        return;
      }

      product.brands.forEach(
        (brand) => {
          if (
            !brandsMap.has(
              brand.id
            )
          ) {
            brandsMap.set(
              brand.id,
              brand
            );
          }
        }
      );
    }
  );

  return Array.from(
    brandsMap.values()
  );
}

/* =========================================================
   GET FILTERS
========================================================= */

export async function GET(
  request: NextRequest
) {
  try {
    const { searchParams } =
      new URL(request.url);

    const category =
      searchParams.get(
        "category"
      )?.trim() || "";

    /* =====================================================
       CATEGORIES
    ===================================================== */

    const categories =
      await getAllPages(
        WC_BASE_URL,
        "products/categories",
        true,
        {
          hide_empty: "true",
        }
      );

    /* =====================================================
       BRANDS
    ===================================================== */

    const brands =
      await getBrands(
        category || undefined
      );

    /* =====================================================
       SORT
    ===================================================== */

    categories.sort(
      (a, b) =>
        a.name.localeCompare(
          b.name
        )
    );

    brands.sort(
      (a, b) =>
        a.name.localeCompare(
          b.name
        )
    );

    /* =====================================================
       RESPONSE
    ===================================================== */

    return NextResponse.json(
      {
        categories,
        brands,
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
      "FILTER API ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to load filters",

        categories: [],

        brands: [],
      },
      {
        status: 500,
      }
    );
  }
}