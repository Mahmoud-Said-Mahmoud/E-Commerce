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
  filters: ProductFilters = {}
): Promise<ProductApiResponse<ProductI>> {
  const params = new URLSearchParams();

  /* =======================================================
     PAGINATION
  ======================================================= */

  params.set("page", page.toString());
  params.set("per_page", "24");

  /* =======================================================
     CATEGORY
  ======================================================= */

  if (filters.category) {
    params.set("category", filters.category);
  }

  /* =======================================================
     BRAND
  ======================================================= */

  if (filters.brand) {
    params.set("brand", filters.brand);
  }

  /* =======================================================
     PRICE
  ======================================================= */

  if (filters.minPrice) {
    params.set("min_price", filters.minPrice);
  }

  if (filters.maxPrice) {
    params.set("max_price", filters.maxPrice);
  }

  /* =======================================================
     STOCK
  ======================================================= */

  if (filters.stock) {
    params.set("stock_status", "instock");
  }

  /* =======================================================
     SORT
  ======================================================= */

  if (filters.sort && filters.sort !== "relevance") {
    params.set("sort", filters.sort);
  }

  /* =======================================================
     SEARCH
  ======================================================= */

  if (filters.search) {
    params.set("search", filters.search);
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