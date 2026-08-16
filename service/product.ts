import type { ProductI } from "@/interface/product";

/* =========================================================
   PRODUCT FILTERS
========================================================= */

export interface ProductFilters {
  category?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  stock?: boolean;
  sort?: string;
  search?: string;
}

/* =========================================================
   API RESPONSE
========================================================= */

export interface ProductApiResponse<T = ProductI> {
  data: T[];
  totalProducts: number;
  totalPages: number;
  page: number;
  perPage: number;

  filters?: {
    category?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    stockStatus?: string;
    search?: string;
    sort?: string;
  };
}

/* =========================================================
   PRODUCT API
========================================================= */

export async function productApi(
  page: number = 1,
  filters: ProductFilters | number = {}
): Promise<ProductApiResponse<ProductI>> {
  const params = new URLSearchParams();
  const normalizedFilters: ProductFilters =
    typeof filters === "number"
      ? { category: String(page) }
      : filters;
  const normalizedPage =
    typeof filters === "number" ? filters : page;

  /* =======================================================
     PAGINATION
  ======================================================= */

  params.set("page", normalizedPage.toString());
  params.set("per_page", "24");

  /* =======================================================
     CATEGORY
  ======================================================= */

  if (normalizedFilters.category) {
    params.set("category", normalizedFilters.category);
  }

  /* =======================================================
     BRAND
  ======================================================= */

  if (normalizedFilters.brand) {
    params.set("brand", normalizedFilters.brand);
  }

  /* =======================================================
     PRICE
  ======================================================= */

  if (normalizedFilters.minPrice) {
    params.set("min_price", normalizedFilters.minPrice);
  }

  if (normalizedFilters.maxPrice) {
    params.set("max_price", normalizedFilters.maxPrice);
  }

  /* =======================================================
     STOCK
  ======================================================= */

  if (normalizedFilters.stock) {
    params.set("stock_status", "instock");
  }

  /* =======================================================
     SORT
  ======================================================= */

  if (normalizedFilters.sort && normalizedFilters.sort !== "relevance") {
    params.set("sort", normalizedFilters.sort);
  }

  /* =======================================================
     SEARCH
  ======================================================= */

  if (normalizedFilters.search) {
    params.set("search", normalizedFilters.search);
  }

  /* =======================================================
     REQUEST
  ======================================================= */

  const response = await fetch(
    `/api/products?${params.toString()}`
  );

  /* =======================================================
     ERROR
  ======================================================= */

  if (!response.ok) {
    const errorText = await response.text();

    console.error("productApi:", errorText);

    throw new Error("Failed to fetch products");
  }

  /* =======================================================
     RESPONSE
  ======================================================= */

  return response.json();
}
