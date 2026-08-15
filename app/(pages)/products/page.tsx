"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type MouseEvent,
  type TouchEvent,
} from "react";

import {
  ChevronDown,
  Filter,
  Heart,
  SearchX,
  ShoppingCart,
  SlidersHorizontal,
  X,
} from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import {
  productApi,
  type ProductFilters,
} from "@/service/product";

import type {
  ProductI,
  Category,
} from "@/interface/product";

import type { BrandI } from "@/interface/brand";

import { FaShippingFast } from "react-icons/fa";
import { LuShieldCheck } from "react-icons/lu";

import { useWishlist } from "@/context/WishlistContext";

/* =========================================================
   TYPES
========================================================= */

interface FiltersResponse {
  categories: Category[];
  brands: BrandI[];
}

interface FilterProps {
  categories: Category[];
  brands: BrandI[];

  selectedCategories: string[];
  selectedBrands: string[];

  minPrice: string;
  maxPrice: string;

  filtersLoading: boolean;

  setMinPrice: (value: string) => void;
  setMaxPrice: (value: string) => void;

  toggleCategory: (id: number) => void;
  toggleBrand: (id: number) => void;

  applyPrice: () => void;

  clearFilters: () => void;

  hasFilters: boolean;
}

/* =========================================================
   PAGE
========================================================= */

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  /* =======================================================
     URL PAGE
  ======================================================= */

  const page = Math.max(
    1,
    Number(searchParams.get("page")) || 1
  );

  /* =======================================================
     CATEGORY
  ======================================================= */

  const selectedCategories = useMemo(() => {
    return (
      searchParams
        .get("category")
        ?.split(",")
        .filter(Boolean) || []
    );
  }, [searchParams]);

  /* =======================================================
     BRAND
  ======================================================= */

  const selectedBrands = useMemo(() => {
    return (
      searchParams
        .get("brand")
        ?.split(",")
        .filter(Boolean) || []
    );
  }, [searchParams]);

  /* =======================================================
     PRICE
  ======================================================= */

  const minPrice = searchParams.get("min_price") || "";
  const maxPrice = searchParams.get("max_price") || "";

  /* =======================================================
     SORT
  ======================================================= */

  const sort = searchParams.get("sort") || "relevance";

  /* =======================================================
     STATE
  ======================================================= */

  const [products, setProducts] = useState<ProductI[]>([]);

  const [totalProducts, setTotalProducts] = useState(0);

  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);

  const [filtersLoading, setFiltersLoading] =
    useState(true);

  const [categories, setCategories] = useState<Category[]>(
    []
  );

  const [brands, setBrands] = useState<BrandI[]>([]);

  const [mobileFilters, setMobileFilters] =
    useState(false);

  /* =======================================================
     LOCAL PRICE INPUTS
  ======================================================= */

  const [localMinPrice, setLocalMinPrice] =
    useState(minPrice);

  const [localMaxPrice, setLocalMaxPrice] =
    useState(maxPrice);

  /* =======================================================
     SYNC PRICE INPUTS WITH URL
  ======================================================= */

  useEffect(() => {
    setLocalMinPrice(minPrice);
    setLocalMaxPrice(maxPrice);
  }, [minPrice, maxPrice]);

  /* =======================================================
     GET FILTERS
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function getFilters() {
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

        if (cancelled) return;

        setCategories(data.categories || []);
        setBrands(data.brands || []);
      } catch (error) {
        console.error(
          "Filters error:",
          error
        );

        if (!cancelled) {
          setCategories([]);
          setBrands([]);
        }
      } finally {
        if (!cancelled) {
          setFiltersLoading(false);
        }
      }
    }

    getFilters();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =======================================================
     GET PRODUCTS
     
     IMPORTANT:
     We ALWAYS request IN-STOCK products.
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function getProducts() {
      try {
        setLoading(true);

        const filters: ProductFilters = {
          category:
            selectedCategories.length > 0
              ? selectedCategories.join(",")
              : undefined,

          brand:
            selectedBrands.length > 0
              ? selectedBrands.join(",")
              : undefined,

          minPrice:
            minPrice || undefined,

          maxPrice:
            maxPrice || undefined,

          /*
           * ALWAYS IN STOCK
           */
          stock: true,

          sort:
            sort !== "relevance"
              ? sort
              : undefined,
        };

        const result = await productApi(
          page,
          filters
        );

        if (cancelled) return;

        /*
         * Only display:
         *
         * 1. In-stock products
         * 2. Products with at least one image
         */

        const productsWithImages =
          (result.data || []).filter(
            (product) =>
              product.stock_status ===
                "instock" &&
              Array.isArray(
                product.images
              ) &&
              product.images.some(
                (image) => Boolean(image?.src)
              )
          );

        setProducts(productsWithImages);

        setTotalProducts(
          result.totalProducts || 0
        );

        setTotalPages(
          Math.max(
            1,
            result.totalPages || 1
          )
        );
      } catch (error) {
        console.error(
          "Products error:",
          error
        );

        if (!cancelled) {
          setProducts([]);
          setTotalProducts(0);
          setTotalPages(1);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    getProducts();

    return () => {
      cancelled = true;
    };
  }, [
    page,
    selectedCategories,
    selectedBrands,
    minPrice,
    maxPrice,
    sort,
  ]);

  /* =======================================================
     UPDATE URL
  ======================================================= */

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

    /*
     * Whenever a filter changes,
     * return to page 1.
     */
    params.set("page", "1");

    const query = params.toString();

    router.push(
      query
        ? `/products?${query}`
        : "/products"
    );
  };

  /* =======================================================
     CATEGORY
  ======================================================= */

  const toggleCategory = (
    id: number
  ) => {
    const categoryId =
      id.toString();

    const exists =
      selectedCategories.includes(
        categoryId
      );

    const next = exists
      ? selectedCategories.filter(
          (item) =>
            item !== categoryId
        )
      : [
          ...selectedCategories,
          categoryId,
        ];

    updateFilters({
      category:
        next.length > 0
          ? next.join(",")
          : null,
    });
  };

  /* =======================================================
     BRAND
  ======================================================= */

  const toggleBrand = (
    id: number
  ) => {
    const brandId =
      id.toString();

    const exists =
      selectedBrands.includes(
        brandId
      );

    const next = exists
      ? selectedBrands.filter(
          (item) =>
            item !== brandId
        )
      : [
          ...selectedBrands,
          brandId,
        ];

    updateFilters({
      brand:
        next.length > 0
          ? next.join(",")
          : null,
    });
  };

  /* =======================================================
     PRICE
  ======================================================= */

  const applyPrice = () => {
    const min =
      localMinPrice.trim();

    const max =
      localMaxPrice.trim();

    /*
     * Prevent negative values.
     */
    if (
      (min && Number(min) < 0) ||
      (max && Number(max) < 0)
    ) {
      return;
    }

    /*
     * Prevent min > max.
     */
    if (
      min &&
      max &&
      Number(min) > Number(max)
    ) {
      return;
    }

    updateFilters({
      min_price: min || null,
      max_price: max || null,
    });
  };

  /* =======================================================
     SORT
  ======================================================= */

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

  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  const clearFilters = () => {
    router.push("/products");

    setLocalMinPrice("");
    setLocalMaxPrice("");

    setMobileFilters(false);
  };

  /* =======================================================
     HAS FILTERS
  ======================================================= */

  const hasFilters =
    selectedCategories.length > 0 ||
    selectedBrands.length > 0 ||
    minPrice !== "" ||
    maxPrice !== "" ||
    sort !== "relevance";

  /* =======================================================
     PAGINATION
  ======================================================= */

  const changePage = (
    newPage: number
  ) => {
    if (
      newPage < 1 ||
      newPage > totalPages
    ) {
      return;
    }

    const params =
      new URLSearchParams(
        searchParams.toString()
      );

    params.set(
      "page",
      newPage.toString()
    );

    const query = params.toString();

    router.push(
      query
        ? `/products?${query}`
        : "/products"
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =======================================================
     PAGE NUMBERS
  ======================================================= */

  const pages: number[] = [];

  const startPage = Math.max(
    1,
    page - 2
  );

  const endPage = Math.min(
    totalPages,
    page + 2
  );

  for (
    let i = startPage;
    i <= endPage;
    i++
  ) {
    pages.push(i);
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-sm text-gray-500">
              Products
            </p>

            <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
              All Products
            </h1>

            {!loading && (
              <p className="mt-2 text-sm text-gray-500">
                {totalProducts}{" "}
                {totalProducts === 1
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
            className="
              flex
              items-center
              gap-2
              rounded-lg
              border
              px-4
              py-2
              text-sm
              font-medium
              lg:hidden
            "
          >
            <SlidersHorizontal
              size={17}
            />

            Filters
          </button>
        </div>

        {/* =================================================
            MAIN GRID
        ================================================= */}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">

          {/* =================================================
              DESKTOP FILTER
          ================================================= */}

          <aside className="hidden lg:block">
            <FilterContent
              categories={
                categories
              }
              brands={brands}
              selectedCategories={
                selectedCategories
              }
              selectedBrands={
                selectedBrands
              }
              minPrice={
                localMinPrice
              }
              maxPrice={
                localMaxPrice
              }
              filtersLoading={
                filtersLoading
              }
              setMinPrice={
                setLocalMinPrice
              }
              setMaxPrice={
                setLocalMaxPrice
              }
              toggleCategory={
                toggleCategory
              }
              toggleBrand={
                toggleBrand
              }
              applyPrice={
                applyPrice
              }
              clearFilters={
                clearFilters
              }
              hasFilters={
                hasFilters
              }
            />
          </aside>

          {/* =================================================
              PRODUCTS
          ================================================= */}

          <section className="min-w-0">

            {/* TOOLBAR */}

            <div className="mb-6 flex items-center justify-between border-b pb-4">

              <p className="text-sm text-gray-500">
                {loading
                  ? "Loading products..."
                  : `${totalProducts} products`}
              </p>

              {/* SORT */}

              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) =>
                    handleSort(
                      e.target.value
                    )
                  }
                  aria-label="Sort products"
                  className="
                    h-10
                    appearance-none
                    rounded-lg
                    border
                    bg-white
                    pl-3
                    pr-9
                    text-sm
                    outline-none
                    focus:border-[#0497D8]
                  "
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
                  className="
                    pointer-events-none
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-gray-500
                  "
                />
              </div>
            </div>

            {/* LOADING */}

            {loading ? (
              <ProductSkeleton />
            ) : products.length === 0 ? (
              <EmptyState
                hasFilters={
                  hasFilters
                }
                clearFilters={
                  clearFilters
                }
              />
            ) : (
              <>
                {/* PRODUCT GRID */}

                <div
                  className="
                    grid
                    grid-cols-2
                    gap-4
                    sm:grid-cols-3
                    xl:grid-cols-4
                  "
                >
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
                  <div className="mt-10">
                    <Pagination>
                      <PaginationContent>

                        {/* PREVIOUS */}

                        <PaginationItem>
                          <PaginationPrevious
                            href={
                              page > 1
                                ? buildPageUrl(
                                    searchParams,
                                    page - 1
                                  )
                                : "#"
                            }
                            className={
                              page <= 1
                                ? "pointer-events-none opacity-40"
                                : ""
                            }
                            onClick={(
                              e
                            ) => {
                              if (
                                page <=
                                1
                              ) {
                                e.preventDefault();
                                return;
                              }

                              e.preventDefault();

                              changePage(
                                page - 1
                              );
                            }}
                          />
                        </PaginationItem>

                        {/* PAGES */}

                        {pages.map(
                          (
                            pageNumber
                          ) => (
                            <PaginationItem
                              key={
                                pageNumber
                              }
                            >
                              <PaginationLink
                                href={buildPageUrl(
                                  searchParams,
                                  pageNumber
                                )}
                                isActive={
                                  page ===
                                  pageNumber
                                }
                                onClick={(
                                  e
                                ) => {
                                  e.preventDefault();

                                  changePage(
                                    pageNumber
                                  );
                                }}
                              >
                                {
                                  pageNumber
                                }
                              </PaginationLink>
                            </PaginationItem>
                          )
                        )}

                        {/* NEXT */}

                        <PaginationItem>
                          <PaginationNext
                            href={
                              page <
                              totalPages
                                ? buildPageUrl(
                                    searchParams,
                                    page + 1
                                  )
                                : "#"
                            }
                            className={
                              page >=
                              totalPages
                                ? "pointer-events-none opacity-40"
                                : ""
                            }
                            onClick={(
                              e
                            ) => {
                              if (
                                page >=
                                totalPages
                              ) {
                                e.preventDefault();
                                return;
                              }

                              e.preventDefault();

                              changePage(
                                page + 1
                              );
                            }}
                          />
                        </PaginationItem>

                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>

      {/* =================================================
          MOBILE FILTER DRAWER
      ================================================= */}

      {mobileFilters && (
        <div className="fixed inset-0 z-[100] lg:hidden">

          {/* OVERLAY */}

          <div
            className="
              absolute
              inset-0
              bg-black/30
            "
            onClick={() =>
              setMobileFilters(false)
            }
          />

          {/* DRAWER */}

          <div
            className="
              absolute
              bottom-0
              left-0
              right-0
              max-h-[90vh]
              overflow-y-auto
              rounded-t-2xl
              bg-white
              p-5
              shadow-2xl
            "
          >
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
                aria-label="Close filters"
                className="
                  rounded-full
                  p-2
                  hover:bg-gray-100
                "
              >
                <X size={20} />
              </button>
            </div>

            <FilterContent
              categories={
                categories
              }
              brands={brands}
              selectedCategories={
                selectedCategories
              }
              selectedBrands={
                selectedBrands
              }
              minPrice={
                localMinPrice
              }
              maxPrice={
                localMaxPrice
              }
              filtersLoading={
                filtersLoading
              }
              setMinPrice={
                setLocalMinPrice
              }
              setMaxPrice={
                setLocalMaxPrice
              }
              toggleCategory={
                toggleCategory
              }
              toggleBrand={
                toggleBrand
              }
              applyPrice={
                applyPrice
              }
              clearFilters={
                clearFilters
              }
              hasFilters={
                hasFilters
              }
            />

            <button
              type="button"
              onClick={() =>
                setMobileFilters(
                  false
                )
              }
              className="
                mt-8
                h-11
                w-full
                rounded-lg
                bg-[#0497D8]
                font-medium
                text-white
                hover:bg-[#0387c2]
              "
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

/* =========================================================
   FILTER CONTENT
========================================================= */

function FilterContent({
  categories,
  brands,
  selectedCategories,
  selectedBrands,
  minPrice,
  maxPrice,
  filtersLoading,
  setMinPrice,
  setMaxPrice,
  toggleCategory,
  toggleBrand,
  applyPrice,
  clearFilters,
  hasFilters,
}: FilterProps) {
  return (
    <div className="space-y-8">

      {/* FILTER TITLE */}

      <div className="flex items-center justify-between border-b pb-5">
        <div className="flex items-center gap-2">
          <Filter size={18} />

          <h2 className="font-semibold">
            Filters
          </h2>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={
              clearFilters
            }
            className="
              text-xs
              font-medium
              text-[#0497D8]
              hover:underline
            "
          >
            Clear all
          </button>
        )}
      </div>

      {/* CATEGORY */}

      <div>
        <h3 className="mb-4 text-sm font-semibold text-gray-900">
          Category
        </h3>

        {filtersLoading ? (
          <FilterSkeleton />
        ) : categories.length === 0 ? (
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
                    className="
                      flex
                      cursor-pointer
                      items-center
                      gap-3
                      text-sm
                      text-gray-600
                    "
                  >
                    <input
                      type="checkbox"
                      checked={
                        checked
                      }
                      onChange={() =>
                        toggleCategory(
                          category.id
                        )
                      }
                      className="
                        h-4
                        w-4
                        rounded
                        border-gray-300
                        text-[#0497D8]
                        focus:ring-[#0497D8]
                      "
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

      {/* BRAND */}

      <div>
        <h3 className="mb-4 text-sm font-semibold text-gray-900">
          Brand
        </h3>

        {filtersLoading ? (
          <FilterSkeleton />
        ) : brands.length === 0 ? (
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
                    key={
                      brand.id
                    }
                    className="
                      flex
                      cursor-pointer
                      items-center
                      gap-3
                      text-sm
                      text-gray-600
                    "
                  >
                    <input
                      type="checkbox"
                      checked={
                        checked
                      }
                      onChange={() =>
                        toggleBrand(
                          brand.id
                        )
                      }
                      className="
                        h-4
                        w-4
                        rounded
                        border-gray-300
                        text-[#0497D8]
                        focus:ring-[#0497D8]
                      "
                    />

                    <span className="flex-1">
                      {
                        brand.name
                      }
                    </span>
                  </label>
                );
              }
            )}
          </div>
        )}
      </div>

      {/* PRICE */}

      <div>
        <h3 className="mb-4 text-sm font-semibold text-gray-900">
          Price
        </h3>

        <div className="flex gap-2">

          <input
            type="number"
            min="0"
            value={minPrice}
            onChange={(
              e: ChangeEvent<HTMLInputElement>
            ) =>
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
            aria-label="Minimum price"
            className="
              h-10
              w-full
              rounded-lg
              border
              px-3
              text-sm
              outline-none
              focus:border-[#0497D8]
            "
          />

          <input
            type="number"
            min="0"
            value={maxPrice}
            onChange={(
              e: ChangeEvent<HTMLInputElement>
            ) =>
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
            aria-label="Maximum price"
            className="
              h-10
              w-full
              rounded-lg
              border
              px-3
              text-sm
              outline-none
              focus:border-[#0497D8]
            "
          />
        </div>

        <button
          type="button"
          onClick={
            applyPrice
          }
          className="
            mt-3
            w-full
            rounded-lg
            border
            border-[#0497D8]
            py-2
            text-sm
            font-medium
            text-[#0497D8]
            transition
            hover:bg-[#0497D8]
            hover:text-white
          "
        >
          Apply Price
        </button>
      </div>

      {/* AVAILABILITY */}

      <div>
        <h3 className="mb-4 text-sm font-semibold text-gray-900">
          Availability
        </h3>

        <div
          className="
            flex
            items-center
            gap-3
            text-sm
            text-gray-600
          "
        >
          <span
            className="
              h-2
              w-2
              rounded-full
              bg-green-500
            "
          />

          <span>
            In stock only
          </span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PRODUCT CARD
========================================================= */

function ProductCard({
  product,
}: {
  product: ProductI;
}) {
  const { addToCart } = useCart();

  /*
   * IMPORTANT:
   * Wishlist is now handled entirely
   * through WishlistContext.
   */
  const {
    toggleWishlist,
    isInWishlist,
  } = useWishlist();

  const liked = isInWishlist(
    product.id
  );

  /* =======================================================
     VALID IMAGES
  ======================================================= */

  const images =
    product.images?.filter(
      (image) => Boolean(image?.src)
    ) || [];

  /* =======================================================
     ACTIVE IMAGE
  ======================================================= */

  const [activeImage, setActiveImage] =
    useState(0);

  /* =======================================================
     HOVER
  ======================================================= */

  const [isHoveringImage, setIsHoveringImage] =
    useState(false);

  /* =======================================================
     TOUCH
  ======================================================= */

  const [touchStartX, setTouchStartX] =
    useState<number | null>(null);

  /* =======================================================
     NO IMAGES
  ======================================================= */

  if (!images.length) {
    return null;
  }

  /* =======================================================
     MOUSE ENTER
  ======================================================= */

  const handleMouseEnter = () => {
    setIsHoveringImage(true);
  };

  /* =======================================================
     MOUSE MOVE
     
     Mouse position controls
     the active product image.
  ======================================================= */

  const handleMouseMove = (
    e: MouseEvent<HTMLDivElement>
  ) => {
    if (images.length <= 1) {
      return;
    }

    const rect =
      e.currentTarget.getBoundingClientRect();

    const mouseX =
      e.clientX - rect.left;

    const percentage = Math.min(
      Math.max(
        mouseX / rect.width,
        0
      ),
      1
    );

    const imageIndex = Math.min(
      Math.floor(
        percentage *
          images.length
      ),
      images.length - 1
    );

    setActiveImage(
      (current) =>
        current === imageIndex
          ? current
          : imageIndex
    );
  };

  /* =======================================================
     MOUSE LEAVE
  ======================================================= */

  const handleMouseLeave = () => {
    setIsHoveringImage(false);
    setActiveImage(0);
  };

  /* =======================================================
     TOUCH START
  ======================================================= */

  const handleTouchStart = (
    e: TouchEvent<HTMLDivElement>
  ) => {
    setTouchStartX(
      e.touches[0].clientX
    );
  };

  /* =======================================================
     TOUCH MOVE
  ======================================================= */

  const handleTouchMove = (
    e: TouchEvent<HTMLDivElement>
  ) => {
    if (
      touchStartX === null ||
      images.length <= 1
    ) {
      return;
    }

    const currentX =
      e.touches[0].clientX;

    const difference =
      touchStartX - currentX;

    const threshold = 35;

    if (
      Math.abs(difference) >=
      threshold
    ) {
      setActiveImage(
        (current) => {
          if (difference > 0) {
            return Math.min(
              current + 1,
              images.length - 1
            );
          }

          return Math.max(
            current - 1,
            0
          );
        }
      );

      setTouchStartX(
        currentX
      );
    }
  };

  /* =======================================================
     TOUCH END
  ======================================================= */

  const handleTouchEnd = () => {
    setTouchStartX(null);
  };

  /* =======================================================
     WISHLIST
  ======================================================= */

  const handleWishlist = (
    e: MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    toggleWishlist(product);
  };

  /* =======================================================
     ADD TO CART
  ======================================================= */

  const handleAddToCart = (
    e: MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart(product);
  };

  return (
    <Card
      className="
        group
        relative
        overflow-hidden
        pt-0
        transition
        duration-200
        hover:-translate-y-1
        hover:shadow-lg
      "
    >
      <Link
        href={`/products/detail/${product.id}`}
      >
        {/* =================================================
            IMAGE
        ================================================= */}

        <div
          className="
            relative
            overflow-hidden
            bg-gray-50
            select-none
          "
          onMouseEnter={
            handleMouseEnter
          }
          onMouseMove={
            handleMouseMove
          }
          onMouseLeave={
            handleMouseLeave
          }
          onTouchStart={
            handleTouchStart
          }
          onTouchMove={
            handleTouchMove
          }
          onTouchEnd={
            handleTouchEnd
          }
        >

          {/* BADGES */}

          <div
            className="
              absolute
              left-3
              top-3
              z-20
              flex
              flex-col
              gap-2
            "
          >
            {/* SALE */}

            {product.on_sale && (
              <span
                className="
                  rounded-full
                  bg-[#E53935]
                  px-2.5
                  py-1
                  text-[10px]
                  font-bold
                  text-white
                  shadow-sm
                "
              >
                SALE
              </span>
            )}

            {/* NEW */}

            {isNewProduct(
              product
            ) && (
              <span
                className="
                  rounded-full
                  bg-[#0497D8]
                  px-2.5
                  py-1
                  text-[10px]
                  font-bold
                  text-white
                  shadow-sm
                "
              >
                NEW
              </span>
            )}
          </div>

          {/* =================================================
              WISHLIST
          ================================================= */}

          <button
            type="button"
            onClick={
              handleWishlist
            }
            aria-label={
              liked
                ? "Remove from wishlist"
                : "Add to wishlist"
            }
            aria-pressed={liked}
            className="
              absolute
              right-3
              top-3
              z-20
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              border
              border-gray-100
              bg-white/95
              shadow-sm
              backdrop-blur
              transition
              hover:scale-105
              hover:bg-white
            "
          >
            <Heart
              size={18}
              className={
                liked
                  ? "fill-red-500 text-red-500"
                  : "text-gray-500"
              }
            />
          </button>

          {/* IMAGE CONTAINER */}

          <div className="relative aspect-square w-full">

            <Image
              key={imageKey(
                images[activeImage]
              )}
              src={
                images[
                  activeImage
                ].src
              }
              alt={
                images[
                  activeImage
                ].alt ||
                product.name
              }
              fill
              sizes="
                (max-width: 640px) 50vw,
                (max-width: 1280px) 33vw,
                25vw
              "
              priority={false}
              className={`
                object-contain
                p-4
                transition-all
                duration-300
                ease-out
                ${
                  isHoveringImage
                    ? "scale-105"
                    : "scale-100"
                }
              `}
            />

            {/* IMAGE INDICATORS */}

            {images.length > 1 && (
              <div
                className="
                  absolute
                  bottom-3
                  left-1/2
                  z-20
                  flex
                  -translate-x-1/2
                  gap-1
                  rounded-full
                  bg-white/70
                  px-2
                  py-1
                  backdrop-blur-sm
                "
              >
                {images.map(
                  (
                    image,
                    index
                  ) => (
                    <span
                      key={
                        image.id ??
                        index
                      }
                      className={`
                        h-1
                        rounded-full
                        transition-all
                        duration-200
                        ${
                          index ===
                          activeImage
                            ? "w-5 bg-[#0497D8]"
                            : "w-1.5 bg-gray-300"
                        }
                      `}
                    />
                  )
                )}
              </div>
            )}

            {/* IMAGE COUNT */}

            {images.length > 1 &&
              isHoveringImage && (
                <div
                  className="
                    absolute
                    bottom-3
                    right-3
                    z-20
                    rounded-full
                    bg-black/60
                    px-2
                    py-1
                    text-[10px]
                    font-medium
                    text-white
                    backdrop-blur-sm
                  "
                >
                  {activeImage + 1}/
                  {images.length}
                </div>
              )}
          </div>
        </div>

        {/* =================================================
            PRODUCT INFO
        ================================================= */}

        <CardHeader className="min-h-[180px]">

          <CardTitle
            className="
              line-clamp-2
              text-sm
              font-medium
            "
          >
            {product.name}
          </CardTitle>

          <CardDescription>

            {/* PRICE */}

            <div
              className="
                mt-3
                flex
                items-center
                justify-between
              "
            >
              <span className="font-bold text-black">
                {product.price} EGP
              </span>

              {product.on_sale &&
                product.regular_price && (
                  <span
                    className="
                      text-xs
                      text-gray-400
                      line-through
                    "
                  >
                    {
                      product.regular_price
                    }
                  </span>
                )}
            </div>

            {/* STOCK */}

            <div className="mt-2">
              <span
                className="
                  text-xs
                  font-medium
                  text-green-600
                "
              >
                In stock
              </span>
            </div>

            {/* SHIPPING / PAYMENT */}

            <div className="mt-4 h-8 overflow-hidden">
              <div className="animate-vertical-slide">

                {/* PAYMOB */}

                <div
                  className="
                    flex
                    h-8
                    items-center
                    gap-2
                    text-xs
                    text-gray-500
                  "
                >
                  <LuShieldCheck
                    className="text-[#0497D8]"
                  />

                  <span>
                    Secure payment with Paymob
                  </span>
                </div>

                {/* BOSTA */}

                <div
                  className="
                    flex
                    h-8
                    items-center
                    gap-2
                    text-xs
                    text-gray-500
                  "
                >
                  <FaShippingFast
                    className="text-[#0497D8]"
                  />

                  <span>
                    Track and delivery with Bosta
                  </span>
                </div>

              </div>
            </div>

          </CardDescription>
        </CardHeader>
      </Link>

      {/* =================================================
          ADD TO CART
      ================================================= */}

      <button
        type="button"
        className="
          mx-4
          mb-4
          flex
          w-[calc(100%-2rem)]
          items-center
          justify-center
          gap-2
          rounded-xl
          bg-[#0497D8]
          py-2.5
          text-sm
          font-medium
          text-white
          transition
          hover:bg-[#0387c2]
          active:scale-[0.98]
        "
        onClick={
          handleAddToCart
        }
      >
        <ShoppingCart size={17} />

        Add to Cart
      </button>
    </Card>
  );
}

/* =========================================================
   NEW PRODUCT
========================================================= */

function isNewProduct(
  product: ProductI
) {
  if (
    !product.date_created
  ) {
    return false;
  }

  const createdDate =
    new Date(
      product.date_created
    );

  const now = new Date();

  const difference =
    now.getTime() -
    createdDate.getTime();

  const days =
    difference /
    (1000 *
      60 *
      60 *
      24);

  return (
    days >= 0 &&
    days <= 14
  );
}

/* =========================================================
   IMAGE KEY
========================================================= */

function imageKey(
  image: {
    id: number;
    src: string;
  }
) {
  return `${image.id}-${image.src}`;
}

/* =========================================================
   FILTER SKELETON
========================================================= */

function FilterSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({
        length: 5,
      }).map((_, index) => (
        <div
          key={index}
          className="
            flex
            items-center
            gap-3
          "
        >
          <div
            className="
              h-4
              w-4
              animate-pulse
              rounded
              bg-gray-100
            "
          />

          <div
            className="
              h-4
              w-24
              animate-pulse
              rounded
              bg-gray-100
            "
          />
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   PRODUCT SKELETON
========================================================= */

function ProductSkeleton() {
  return (
    <div
      className="
        grid
        grid-cols-2
        gap-4
        sm:grid-cols-3
        xl:grid-cols-4
      "
    >
      {Array.from({
        length: 8,
      }).map((_, index) => (
        <div
          key={index}
          className="
            overflow-hidden
            rounded-xl
            border
          "
        >
          <div
            className="
              aspect-square
              animate-pulse
              bg-gray-100
            "
          />

          <div className="space-y-3 p-4">

            <div
              className="
                h-4
                animate-pulse
                rounded
                bg-gray-100
              "
            />

            <div
              className="
                h-4
                w-3/4
                animate-pulse
                rounded
                bg-gray-100
              "
            />

            <div
              className="
                h-3
                w-1/2
                animate-pulse
                rounded
                bg-gray-100
              "
            />

            <div
              className="
                h-5
                w-1/3
                animate-pulse
                rounded
                bg-gray-100
              "
            />

          </div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  hasFilters,
  clearFilters,
}: {
  hasFilters: boolean;
  clearFilters: () => void;
}) {
  return (
    <div
      className="
        flex
        min-h-[400px]
        flex-col
        items-center
        justify-center
        rounded-2xl
        border
        border-dashed
        px-6
        text-center
      "
    >
      <div
        className="
          mb-4
          flex
          h-16
          w-16
          items-center
          justify-center
          rounded-full
          bg-gray-100
        "
      >
        <SearchX
          size={28}
          className="text-gray-400"
        />
      </div>

      <h2 className="text-lg font-semibold text-gray-900">
        No products found
      </h2>

      <p className="mt-2 max-w-md text-sm text-gray-500">
        There are no products matching your
        current filters.
      </p>

      <p className="mt-2 text-sm text-gray-400">
        Try changing the brand, category,
        price or filters.
      </p>

      {hasFilters && (
        <button
          type="button"
          onClick={
            clearFilters
          }
          className="
            mt-5
            rounded-lg
            bg-[#0497D8]
            px-5
            py-2.5
            text-sm
            font-medium
            text-white
            hover:bg-[#0387c2]
          "
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}

/* =========================================================
   PAGINATION URL
========================================================= */

function buildPageUrl(
  searchParams: URLSearchParams,
  page: number
) {
  const params =
    new URLSearchParams(
      searchParams.toString()
    );

  params.set(
    "page",
    page.toString()
  );

  return `/products?${params.toString()}`;
}