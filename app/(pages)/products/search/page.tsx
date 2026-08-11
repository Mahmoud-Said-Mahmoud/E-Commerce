"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  SearchX,
  SlidersHorizontal,
  X,
} from "lucide-react";

// غير المسار حسب مكان interface عندك
import type { ProductI, Category } from "@/interface/product";
import type { BrandI } from "@/interface/brand";

interface SearchResponse {
  products: ProductI[];
  total: number;
  totalPages: number;
  page: number;
}

interface FiltersResponse {
  categories: Category[];
  brands: BrandI[];
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const query = searchParams.get("q") || "";

  const currentPage =
    Number(searchParams.get("page")) || 1;

  const selectedCategories =
    searchParams.get("category")?.split(",").filter(Boolean) || [];

  const selectedBrands =
    searchParams.get("brand")?.split(",").filter(Boolean) || [];

  const urlMinPrice =
    searchParams.get("min_price") || "";

  const urlMaxPrice =
    searchParams.get("max_price") || "";

  const stock =
    searchParams.get("stock") === "instock";

  const sort =
    searchParams.get("sort") || "relevance";

  /* ========================================================= */
  /* STATE */
  /* ========================================================= */

  const [products, setProducts] = useState<ProductI[]>(
    []
  );

  const [total, setTotal] = useState(0);

  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(true);

  const [filtersLoading, setFiltersLoading] =
    useState(true);

  const [categories, setCategories] = useState<
    Category[]
  >([]);

  const [brands, setBrands] = useState<Brand[]>(
    []
  );

  const [mobileFilters, setMobileFilters] =
    useState(false);

  const [minPrice, setMinPrice] =
    useState(urlMinPrice);

  const [maxPrice, setMaxPrice] =
    useState(urlMaxPrice);
const [inStock, setInStock] = useState(false);
  /* ========================================================= */
  /* GET CATEGORIES + BRANDS */
  /* ========================================================= */

  useEffect(() => {
    const getFilters = async () => {
      try {
        setFiltersLoading(true);

        const response = await fetch(
          "/api/search/filters",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch filters"
          );
        }

        const data: FiltersResponse =
          await response.json();

        setCategories(data.categories || []);
        setBrands(data.brands || []);
      } catch (error) {
        console.error(
          "Filters error:",
          error
        );

        setCategories([]);
        setBrands([]);
      } finally {
        setFiltersLoading(false);
      }
    };

    getFilters();
  }, []);

  /* ========================================================= */
  /* GET PRODUCTS */
  /* ========================================================= */

  useEffect(() => {
    if (!query) {
      setProducts([]);
      setTotal(0);
      setTotalPages(0);
      setLoading(false);

      return;
    }

    const controller =
      new AbortController();

    const getProducts = async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams();

        params.set("q", query);

        params.set(
          "page",
          currentPage.toString()
        );

        params.set("per_page", "24");

        if (selectedCategories.length > 0) {
          params.set(
            "category",
            selectedCategories.join(",")
          );
        }

        if (selectedBrands.length > 0) {
          params.set(
            "brand",
            selectedBrands.join(",")
          );
        }

        if (urlMinPrice) {
          params.set(
            "min_price",
            urlMinPrice
          );
        }

        if (urlMaxPrice) {
          params.set(
            "max_price",
            urlMaxPrice
          );
        }

        if (stock) {
          params.set(
            "stock",
            "instock"
          );
        }

        if (sort !== "relevance") {
          params.set("sort", sort);
        }

        const response = await fetch(
          `/api/search?${params.toString()}`,
          {
            cache: "no-store",
            signal:
              controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch products"
          );
        }

        const data: SearchResponse =
          await response.json();

        setProducts(data.products || []);
        setTotal(data.total || 0);
        setTotalPages(
          data.totalPages || 0
        );
      } catch (error: any) {
        if (
          error?.name ===
          "AbortError"
        ) {
          return;
        }

        console.error(error);

        setProducts([]);
        setTotal(0);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    };

    getProducts();

    return () => {
      controller.abort();
    };
  }, [
    query,
    currentPage,
    selectedCategories.join(","),
    selectedBrands.join(","),
    urlMinPrice,
    urlMaxPrice,
    stock,
    sort,
  ]);

  /* ========================================================= */
  /* UPDATE URL */
  /* ========================================================= */

  const updateFilters = (
    updates: Record<
      string,
      string | null
    >
  ) => {
    const params =
      new URLSearchParams(
        searchParams.toString()
      );

    Object.entries(updates).forEach(
      ([key, value]) => {
        if (
          value === null ||
          value === ""
        ) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
    );

    // أي filter جديد يرجع للصفحة الأولى
    params.set("page", "1");

    router.push(
      `/products/search?${params.toString()}`
    );
  };

  /* ========================================================= */
  /* CATEGORY */
  /* ========================================================= */

  const toggleCategory = (
    categoryId: number
  ) => {
    const id =
      categoryId.toString();

    const exists =
      selectedCategories.includes(id);

    const next = exists
      ? selectedCategories.filter(
          (item) => item !== id
        )
      : [
          ...selectedCategories,
          id,
        ];

    updateFilters({
      category:
        next.length > 0
          ? next.join(",")
          : null,
    });
  };

  /* ========================================================= */
  /* BRAND */
  /* ========================================================= */

  const toggleBrand = (
    brandId: number
  ) => {
    const id =
      brandId.toString();

    const exists =
      selectedBrands.includes(id);

    const next = exists
      ? selectedBrands.filter(
          (item) => item !== id
        )
      : [
          ...selectedBrands,
          id,
        ];

    updateFilters({
      brand:
        next.length > 0
          ? next.join(",")
          : null,
    });
  };

  /* ========================================================= */
  /* PRICE */
  /* ========================================================= */

  const applyPrice = () => {
    updateFilters({
      min_price: minPrice || null,
      max_price: maxPrice || null,
    });
  };

  /* ========================================================= */
  /* STOCK */
  /* ========================================================= */

  const toggleStock = () => {
    updateFilters({
      stock: stock
        ? null
        : "instock",
    });
  };

  /* ========================================================= */
  /* SORT */
  /* ========================================================= */

  const handleSort = (
    value: string
  ) => {
    updateFilters({
      sort:
        value === "relevance"
          ? null
          : value,
    });
  };

  /* ========================================================= */
  /* PAGINATION */
  /* ========================================================= */

  const changePage = (
    page: number
  ) => {
    if (
      page < 1 ||
      page > totalPages
    ) {
      return;
    }

    const params =
      new URLSearchParams(
        searchParams.toString()
      );

    params.set(
      "page",
      page.toString()
    );

    router.push(
      `/products/search?${params.toString()}`
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* ========================================================= */
  /* DISPLAY */
  /* ========================================================= */

  const showingText = useMemo(() => {
    if (loading) {
      return "Searching...";
    }

    return `${total} ${
      total === 1
        ? "product"
        : "products"
    }`;
  }, [loading, total]);

  /* ========================================================= */
  /* RENDER */
  /* ========================================================= */

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto min-h-screen w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="mb-8">
          <div className="flex flex-wrap items-end justify-between gap-4">

            <div>
              <p className="mb-2 text-sm text-gray-500">
                Search results
              </p>

              <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                Results for{" "}
                <span className="text-[#0497D8]">
                  "{query}"
                </span>
              </h1>

              {!loading && (
                <p className="mt-2 text-sm text-gray-500">
                  {total}{" "}
                  {total === 1
                    ? "product"
                    : "products"}{" "}
                  found
                </p>
              )}
            </div>

            {/* MOBILE FILTER */}

            <button
              type="button"
              onClick={() =>
                setMobileFilters(true)
              }
              className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium lg:hidden"
            >
              <SlidersHorizontal
                size={17}
              />

              Filters
            </button>
          </div>
        </div>

        {/* ================================================= */}
        {/* MAIN */}
        {/* ================================================= */}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">

          {/* ================================================= */}
          {/* DESKTOP FILTER */}
          {/* ================================================= */}

          <aside className="hidden lg:block">
            <FilterContent
              categories={categories}
              brands={brands}
              selectedCategories={
                selectedCategories
              }
              selectedBrands={
                selectedBrands
              }
              minPrice={minPrice}
              maxPrice={maxPrice}
              stock={stock}
              filtersLoading={
                filtersLoading
              }
              setMinPrice={
                setMinPrice
              }
              setMaxPrice={
                setMaxPrice
              }
              toggleCategory={
                toggleCategory
              }
              toggleBrand={
                toggleBrand
              }
              toggleStock={
                toggleStock
              }
              applyPrice={
                applyPrice
              }
            />
          </aside>

          {/* ================================================= */}
          {/* PRODUCTS */}
          {/* ================================================= */}

          <section className="min-w-0">

            {/* TOOLBAR */}

            <div className="mb-6 flex items-center justify-between border-b pb-4">

              <div className="text-sm text-gray-500">
                {showingText}
              </div>

              <div className="relative">

                <select
                  value={sort}
                  onChange={(e) =>
                    handleSort(
                      e.target.value
                    )
                  }
                  className="h-10 appearance-none rounded-lg border bg-white pl-3 pr-9 text-sm outline-none transition focus:border-[#0497D8]"
                >
                  <option value="relevance">
                    Relevance
                  </option>

                  <option value="price-low">
                    Price: Low to High
                  </option>

                  <option value="price-high">
                    Price: High to Low
                  </option>

                  <option value="name">
                    Name
                  </option>
                </select>

                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                />

              </div>
            </div>

            {/* LOADING */}

            {loading ? (
              <ProductSkeleton />
            ) : products.length ===
              0 ? (
              <EmptyState
                query={query}
              />
            ) : (
              <>
                {/* GRID */}

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">

                  {products.map(
                    (product) => (
                      <ProductCard
                        key={
                          product.id
                        }
                        product={
                          product
                        }
                      />
                    )
                  )}

                </div>

                {/* PAGINATION */}

                {totalPages > 1 && (
                  <Pagination
                    currentPage={
                      currentPage
                    }
                    totalPages={
                      totalPages
                    }
                    changePage={
                      changePage
                    }
                  />
                )}
              </>
            )}
          </section>
        </div>
      </div>

      {/* =================================================== */}
      {/* MOBILE DRAWER */}
      {/* =================================================== */}

      {mobileFilters && (
        <div className="fixed inset-0 z-[100] lg:hidden">

          {/* OVERLAY */}

          <div
            className="absolute inset-0 bg-black/30"
            onClick={() =>
              setMobileFilters(
                false
              )
            }
          />

          {/* DRAWER */}

          <div className="absolute bottom-0 left-0 right-0 max-h-[90vh] overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl">

            <div className="mb-6 flex items-center justify-between">

              <h2 className="text-lg font-semibold">
                Filters
              </h2>

              <button
                type="button"
                onClick={() =>
                  setMobileFilters(
                    false
                  )
                }
                className="rounded-full p-2 hover:bg-gray-100"
              >
                <X size={20} />
              </button>

            </div>

            <FilterContent
              categories={categories}
              brands={brands}
              selectedCategories={
                selectedCategories
              }
              selectedBrands={
                selectedBrands
              }
              minPrice={minPrice}
              maxPrice={maxPrice}
              stock={stock}
              filtersLoading={
                filtersLoading
              }
              setMinPrice={
                setMinPrice
              }
              setMaxPrice={
                setMaxPrice
              }
              toggleCategory={
                toggleCategory
              }
              toggleBrand={
                toggleBrand
              }
              toggleStock={
                toggleStock
              }
              applyPrice={
                applyPrice
              }
            />

            <button
              type="button"
              onClick={() =>
                setMobileFilters(
                  false
                )
              }
              className="mt-8 h-11 w-full rounded-lg bg-[#0497D8] font-medium text-white transition hover:bg-[#0387c2]"
            >
              Apply Filters
            </button>

          </div>
        </div>
      )}
    </main>
  );
}

/* ========================================================= */
/* FILTER CONTENT */
/* ========================================================= */

interface FilterProps {
  categories: Category[];
  brands: Brand[];

  selectedCategories: string[];
  selectedBrands: string[];

  minPrice: string;
  maxPrice: string;

  stock: boolean;

  filtersLoading: boolean;

  setMinPrice: (
    value: string
  ) => void;

  setMaxPrice: (
    value: string
  ) => void;

  toggleCategory: (
    id: number
  ) => void;

  toggleBrand: (
    id: number
  ) => void;

  toggleStock: () => void;

  applyPrice: () => void;
}

function FilterContent({
  categories,
  brands,
  selectedCategories,
  selectedBrands,
  minPrice,
  maxPrice,
  stock,
  filtersLoading,
  setMinPrice,
  setMaxPrice,
  toggleCategory,
  toggleBrand,
  toggleStock,
  applyPrice,
}: FilterProps) {
  return (
    <div className="space-y-8">

      {/* TITLE */}

      <div className="flex items-center gap-2 border-b pb-5">
        <Filter size={18} />

        <h2 className="font-semibold">
          Filters
        </h2>
      </div>

      {/* ================================================= */}
      {/* CATEGORY */}
      {/* ================================================= */}

      <div>
        <h3 className="mb-4 text-sm font-semibold text-gray-900">
          Category
        </h3>

        {filtersLoading ? (
          <FilterSkeleton />
        ) : categories.length ===
          0 ? (
          <p className="text-sm text-gray-400">
            No categories found
          </p>
        ) : (
          <div className="max-h-64 space-y-3 overflow-y-auto pr-1">

            {categories.map(
              (category) => {
                const checked =
                  selectedCategories.includes(
                    category.id.toString()
                  );

                return (
                  <label
                    key={
                      category.id
                    }
                    className="flex cursor-pointer items-center gap-3 text-sm text-gray-600"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        toggleCategory(
                          category.id
                        )
                      }
                      className="h-4 w-4 rounded border-gray-300 text-[#0497D8] focus:ring-[#0497D8]"
                    />

                    <span className="flex-1">
                      {
                        category.name
                      }
                    </span>
                  </label>
                );
              }
            )}

          </div>
        )}
      </div>

      {/* ================================================= */}
      {/* BRAND */}
      {/* ================================================= */}

      <div>
        <h3 className="mb-4 text-sm font-semibold text-gray-900">
          Brand
        </h3>

        {filtersLoading ? (
          <FilterSkeleton />
        ) : brands.length ===
          0 ? (
          <p className="text-sm text-gray-400">
            No brands found
          </p>
        ) : (
          <div className="max-h-64 space-y-3 overflow-y-auto pr-1">

            {brands.map(
              (brand) => {
                const checked =
                  selectedBrands.includes(
                    brand.id.toString()
                  );

                return (
                  <label
                    key={brand.id}
                    className="flex cursor-pointer items-center gap-3 text-sm text-gray-600"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        toggleBrand(
                          brand.id
                        )
                      }
                      className="h-4 w-4 rounded border-gray-300 text-[#0497D8] focus:ring-[#0497D8]"
                    />

                    <span className="flex-1">
                      {brand.name}
                    </span>
                  </label>
                );
              }
            )}

          </div>
        )}
      </div>

      {/* ================================================= */}
      {/* PRICE */}
      {/* ================================================= */}

      <div>
        <h3 className="mb-4 text-sm font-semibold text-gray-900">
          Price
        </h3>

        <div className="flex gap-2">

          <input
            type="number"
            min="0"
            value={minPrice}
            onChange={(e) =>
              setMinPrice(
                e.target.value
              )
            }
            onKeyDown={(e) => {
              if (
                e.key === "Enter"
              ) {
                applyPrice();
              }
            }}
            placeholder="Min"
            className="h-11 w-full rounded-lg border px-3 text-sm outline-none transition focus:border-[#0497D8] focus:ring-1 focus:ring-[#0497D8]"
          />

          <input
            type="number"
            min="0"
            value={maxPrice}
            onChange={(e) =>
              setMaxPrice(
                e.target.value
              )
            }
            onKeyDown={(e) => {
              if (
                e.key === "Enter"
              ) {
                applyPrice();
              }
            }}
            placeholder="Max"
            className="h-11 w-full rounded-lg border px-3 text-sm outline-none transition focus:border-[#0497D8] focus:ring-1 focus:ring-[#0497D8]"
          />

        </div>

        <button
          type="button"
          onClick={applyPrice}
          className="mt-3 w-full rounded-lg border border-[#0497D8] py-2 text-sm font-medium text-[#0497D8] transition hover:bg-[#0497D8] hover:text-white"
        >
          Apply Price
        </button>
      </div>

      {/* ================================================= */}
      {/* AVAILABILITY */}
      {/* ================================================= */}

      <div>
        <h3 className="mb-4 text-sm font-semibold text-gray-900">
          Availability
        </h3>

        <label className="flex cursor-pointer items-center gap-3 text-sm text-gray-600">

          <input
            type="checkbox"
            checked={stock}
            onChange={toggleStock}
            className="h-4 w-4 rounded border-gray-300 text-[#0497D8] focus:ring-[#0497D8]"
          />

          In stock

        </label>
      </div>

    </div>
  );
}

/* ========================================================= */
/* FILTER SKELETON */
/* ========================================================= */

function FilterSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({
        length: 5,
      }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3"
        >
          <div className="h-4 w-4 animate-pulse rounded bg-gray-100" />

          <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
        </div>
      ))}
    </div>
  );
}

/* ========================================================= */
/* PRODUCT CARD */
/* ========================================================= */

function ProductCard({
  product,
}: {
  product: ProductI;
}) {
  const image =
    product.images?.[0];

  return (
    <Link
      href={`/products/detail/${product.id}`}
      className="group overflow-hidden rounded-xl border bg-white transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"
    >

      {/* IMAGE */}

      <div className="relative aspect-square overflow-hidden bg-gray-50">

        {image?.src ? (
          <Image
            src={image.src}
            alt={
              image.alt ||
              product.name
            }
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-contain p-5 transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            No image
          </div>
        )}

        {/* SALE */}

        {product.on_sale && (
          <span className="absolute left-3 top-3 rounded-md bg-[#E53935] px-2 py-1 text-xs font-medium text-white">
            Sale
          </span>
        )}

      </div>

      {/* INFO */}

      <div className="p-4">

        <h2 className="line-clamp-2 min-h-[40px] text-sm font-medium leading-5 text-gray-900">
          {product.name}
        </h2>

        {product.sku && (
          <p className="mt-2 truncate text-xs text-gray-500">
            SKU: {product.sku}
          </p>
        )}

        {/* PRICE */}

        <div className="mt-3">

          {product.on_sale &&
          product.sale_price ? (
            <div className="flex items-center gap-2">

              <span className="font-semibold text-gray-900">
                {product.sale_price}
              </span>

              {product.regular_price && (
                <span className="text-xs text-gray-400 line-through">
                  {
                    product.regular_price
                  }
                </span>
              )}

            </div>
          ) : (
            <span className="font-semibold text-gray-900">
              {product.price}
            </span>
          )}

        </div>

        {/* STOCK */}

        <div className="mt-2">

          {product.stock_status ===
          "instock" ? (
            <span className="text-xs text-green-600">
              In stock
            </span>
          ) : (
            <span className="text-xs text-gray-500">
              Out of stock
            </span>
          )}

        </div>

      </div>
    </Link>
  );
}

/* ========================================================= */
/* PAGINATION */
/* ========================================================= */

function Pagination({
  currentPage,
  totalPages,
  changePage,
}: {
  currentPage: number;
  totalPages: number;
  changePage: (
    page: number
  ) => void;
}) {
  const pages: number[] = [];

  const start = Math.max(
    1,
    currentPage - 2
  );

  const end = Math.min(
    totalPages,
    currentPage + 2
  );

  for (
    let i = start;
    i <= end;
    i++
  ) {
    pages.push(i);
  }

  return (
    <div className="mt-10 flex items-center justify-center gap-2">

      {/* PREVIOUS */}

      <button
        type="button"
        disabled={
          currentPage === 1
        }
        onClick={() =>
          changePage(
            currentPage - 1
          )
        }
        className="flex h-9 w-9 items-center justify-center rounded-lg border transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft size={17} />
      </button>

      {/* PAGES */}

      {pages.map((page) => (
        <button
          key={page}
          type="button"
          onClick={() =>
            changePage(page)
          }
          className={`h-9 min-w-9 rounded-lg px-3 text-sm ${
            page === currentPage
              ? "bg-[#0497D8] text-white"
              : "border hover:bg-gray-50"
          }`}
        >
          {page}
        </button>
      ))}

      {/* NEXT */}

      <button
        type="button"
        disabled={
          currentPage ===
          totalPages
        }
        onClick={() =>
          changePage(
            currentPage + 1
          )
        }
        className="flex h-9 w-9 items-center justify-center rounded-lg border transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronRight size={17} />
      </button>

    </div>
  );
}

/* ========================================================= */
/* EMPTY STATE */
/* ========================================================= */

function EmptyState({
  query,
}: {
  query: string;
}) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed px-6 text-center">

      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
        <SearchX
          size={28}
          className="text-gray-400"
        />
      </div>

      <h2 className="text-lg font-semibold text-gray-900">
        No products found
      </h2>

      <p className="mt-2 max-w-md text-sm text-gray-500">
        We couldn't find any
        products matching{" "}
        <span className="font-medium text-gray-700">
          "{query}"
        </span>
        .
      </p>

      <p className="mt-2 text-sm text-gray-400">
        Try another product name,
        SKU, category or brand.
      </p>

    </div>
  );
}

/* ========================================================= */
/* PRODUCT SKELETON */
/* ========================================================= */

function ProductSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">

      {Array.from({
        length: 8,
      }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-xl border"
        >

          <div className="aspect-square animate-pulse bg-gray-100" />

          <div className="space-y-3 p-4">

            <div className="h-4 animate-pulse rounded bg-gray-100" />

            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />

            <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />

            <div className="h-5 w-1/3 animate-pulse rounded bg-gray-100" />

          </div>
        </div>
      ))}

    </div>
  );
}