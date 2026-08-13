import Image from "next/image";
import Link from "next/link";

import { ProductI } from "@/interface/product";

import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";

import {
  ArrowRight,
  Check,
  ChevronRight,
  ShieldCheck,
  Star,
  Truck,
  PackageCheck,
} from "lucide-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import ProductGallery from "@/components/productgallery/product-gallery";
import ProductActions from "@/components/product/product-actions";

/* =========================================================
   TYPES
========================================================= */

type ProductRating = {
  average?: string | number;
  count?: number;
};

type ProductWithRating = ProductI & {
  rating?: ProductRating;
};

type ProductReview = {
  id: number;
  reviewer: string;
  reviewer_email?: string;
  review: string;
  rating: number;
  date_created?: string;
};

/* =========================================================
   WOOCOMMERCE AUTH
========================================================= */

const username = process.env.WC_KEY;
const password = process.env.WC_SECRET;

const auth = Buffer.from(`${username}:${password}`).toString("base64");

const API_URL =
  "https://www.i-techegypt.com/wp-json/wc/v3/products";

/* =========================================================
   HELPERS
========================================================= */

function normalizeImageUrl(src?: string) {
  if (!src) return "";

  return src
    .trim()
    .replace(/^http:\/\//i, "https://")
    .replace(/^\/\//, "https://");
}

/* =========================================================
   ATTRIBUTE HELPERS
========================================================= */

/**
 * Makes WooCommerce attribute names cleaner.
 *
 * Examples:
 *
 * "ram"            -> "RAM"
 * "storage"        -> "Storage"
 * "screen_size"    -> "Screen Size"
 * "power_consumption" -> "Power Consumption"
 */
function formatAttributeName(name?: string) {
  if (!name) return "Specification";

  const cleaned = name
    .replace(/^pa_/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return "Specification";

  const upperCaseAttributes = new Set([
    "ram",
    "rom",
    "ssd",
    "hdd",
    "cpu",
    "gpu",
    "usb",
    "hdmi",
    "wifi",
    "wi fi",
    "bluetooth",
    "nfc",
    "ips",
    "led",
    "lcd",
    "oled",
    "qled",
    "uhd",
    "hdr",
    "fps",
    "hz",
    "gb",
    "tb",
    "mb",
    "inch",
    "kg",
    "mm",
    "cm",
    "v",
    "w",
  ]);

  const lower = cleaned.toLowerCase();

  if (upperCaseAttributes.has(lower)) {
    return lower.toUpperCase();
  }

  return cleaned
    .split(" ")
    .map((word) => {
      const lowerWord = word.toLowerCase();

      if (upperCaseAttributes.has(lowerWord)) {
        return lowerWord.toUpperCase();
      }

      return (
        lowerWord.charAt(0).toUpperCase() +
        lowerWord.slice(1)
      );
    })
    .join(" ");
}

/**
 * Removes duplicate values and empty values.
 */
function normalizeAttributeOptions(
  options?: unknown[]
) {
  if (!Array.isArray(options)) {
    return [];
  }

  return Array.from(
    new Set(
      options
        .map((option) =>
          String(option ?? "").trim()
        )
        .filter(Boolean)
    )
  );
}

/**
 * Normalizes WooCommerce attributes so the UI
 * can work with any product category.
 */
function normalizeAttributes(product: ProductWithRating) {
  if (
    !product.attributes ||
    !Array.isArray(product.attributes)
  ) {
    return [];
  }

  return product.attributes
    .map((attribute, index) => {
      const name = formatAttributeName(
        attribute.name
      );

      const options = normalizeAttributeOptions(
        attribute.options
      );

      return {
        ...attribute,
        id:
          attribute.id ??
          `attribute-${index}`,
        name,
        options,
      };
    })
    .filter(
      (attribute) =>
        attribute.name &&
        attribute.options.length > 0
    );
}

/* =========================================================
   ATTRIBUTE PRIORITY
========================================================= */

/**
 * Common product attributes are shown first.
 *
 * This does NOT remove other attributes.
 *
 * Example:
 *
 * RAM
 * Storage
 * Processor
 * ...
 *
 * But if an appliance has:
 *
 * Capacity
 * Power
 * Voltage
 *
 * those will also appear normally.
 */
const attributePriority: Record<
  string,
  number
> = {
  brand: 1,
  model: 2,
  ram: 3,
  memory: 4,
  storage: 5,
  processor: 6,
  cpu: 7,
  gpu: 8,
  "screen size": 9,
  display: 10,
  resolution: 11,
  refresh: 12,
  "refresh rate": 13,
  capacity: 14,
  power: 15,
  voltage: 16,
  connectivity: 17,
  compatibility: 18,
  platform: 19,
  material: 20,
  size: 21,
  color: 22,
  warranty: 23,
};

function sortAttributes<
  T extends { name: string }
>(attributes: T[]) {
  return [...attributes].sort((a, b) => {
    const aPriority =
      attributePriority[
        a.name.toLowerCase()
      ] ?? 100;

    const bPriority =
      attributePriority[
        b.name.toLowerCase()
      ] ?? 100;

    return aPriority - bPriority;
  });
}

/* =========================================================
   STARS
========================================================= */

function Stars({
  rating,
  size = 15,
}: {
  rating: number;
  size?: number;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={
            star <= Math.round(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }
        />
      ))}
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default async function Page({
  params,
}: {
  params: Promise<{
    productDetails: string;
  }>;
}) {
  const { productDetails } = await params;

  /* =======================================================
     CURRENT PRODUCT
  ======================================================= */

  const response = await fetch(
    `${API_URL}/${productDetails}`,
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
    throw new Error(
      "Failed to fetch product"
    );
  }

  const product: ProductWithRating =
    await response.json();

  /* =======================================================
     PRODUCT DATA
  ======================================================= */

  const brand = product.brands?.[0];

  const isInStock =
    product.stock_status === "instock";

  const reviewCount = Number(
    product.rating?.count || 0
  );

  /*
   * Normalize all WooCommerce attributes.
   *
   * This works for:
   *
   * Mobiles
   * Laptops
   * Gaming
   * Accessories
   * Home Appliances
   * Monitors
   * Network
   * etc.
   */
  const productAttributes =
    sortAttributes(
      normalizeAttributes(product)
    );

  /* =======================================================
     PRODUCT IMAGES
  ======================================================= */

  const images =
    product.images
      ?.filter((image) =>
        Boolean(image?.src)
      )
      .map((image) => ({
        ...image,
        src: normalizeImageUrl(image.src),
      }))
      .filter((image) =>
        Boolean(image.src)
      ) || [];

  const productImage =
    images[0]?.src ||
    "/placeholder-product.png";

  /* =======================================================
     PRODUCT REVIEWS
  ======================================================= */

  let reviews: ProductReview[] = [];

  try {
    const reviewsResponse =
      await fetch(
        `${API_URL}/reviews?product=${product.id}&per_page=100&status=approved`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
          next: {
            revalidate: 300,
          },
        }
      );

    if (reviewsResponse.ok) {
      reviews =
        await reviewsResponse.json();
    }
  } catch {
    reviews = [];
  }

  /* =======================================================
     REVIEW STATISTICS
  ======================================================= */

  const reviewStats = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  reviews.forEach((review) => {
    const rating = Math.min(
      Math.max(
        Math.round(
          Number(review.rating || 0)
        ),
        0
      ),
      5
    );

    if (
      rating >= 1 &&
      rating <= 5
    ) {
      reviewStats[
        rating as keyof typeof reviewStats
      ]++;
    }
  });

  const totalReviews =
    reviews.length;

  const displayedReviewCount =
    totalReviews > 0
      ? totalReviews
      : reviewCount;

  /* =======================================================
     REVIEW AVERAGE
  ======================================================= */

  const calculatedAverage =
    totalReviews > 0
      ? reviews.reduce(
          (sum, review) =>
            sum +
            Number(
              review.rating || 0
            ),
          0
        ) / totalReviews
      : Number(
          product.rating?.average || 0
        );

  const reviewAverage =
    Number.isFinite(
      calculatedAverage
    )
      ? calculatedAverage
      : 0;

  /* =======================================================
     RELATED PRODUCTS
  ======================================================= */

  const categoryIds =
    product.categories
      ?.map(
        (category) => category.id
      )
      .join(",");

  let relatedProducts: ProductWithRating[] =
    [];

  if (categoryIds) {
    const relatedResponse =
      await fetch(
        `${API_URL}?category=${categoryIds}&exclude=${product.id}&stock_status=instock&per_page=12&status=publish`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
          next: {
            revalidate: 300,
          },
        }
      );

    if (relatedResponse.ok) {
      relatedProducts =
        await relatedResponse.json();
    }
  }

  /* =======================================================
     CLEAN RELATED PRODUCTS
  ======================================================= */

  relatedProducts =
    relatedProducts
      .filter(
        (item) =>
          item.stock_status ===
          "instock"
      )
      .map((item) => ({
        ...item,

        images:
          item.images
            ?.filter((image) =>
              Boolean(image?.src)
            )
            .map((image) => ({
              ...image,
              src: normalizeImageUrl(
                image.src
              ),
            }))
            .filter((image) =>
              Boolean(image.src)
            ) || [],
      }))
      .filter(
        (item) =>
          item.images &&
          item.images.length > 0
      )
      .slice(0, 12);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="min-h-screen bg-white text-gray-950">

      {/* =====================================================
          BREADCRUMB
      ===================================================== */}

      <div className="border-b border-gray-100">
        <div className="mx-auto flex max-w-[1440px] items-center gap-2 px-4 py-4 text-xs sm:px-6 lg:px-8">

          <Link
            href="/"
            className="text-gray-400 transition-colors hover:text-[#0497D8]"
          >
            Home
          </Link>

          <ChevronRight
            size={13}
            className="text-gray-300"
          />

          <Link
            href="/products"
            className="text-gray-400 transition-colors hover:text-[#0497D8]"
          >
            Products
          </Link>

          <ChevronRight
            size={13}
            className="text-gray-300"
          />

          <span className="max-w-[220px] truncate font-medium text-gray-700">
            {product.name}
          </span>

        </div>
      </div>

      {/* =====================================================
          PRODUCT HERO
      ===================================================== */}

      <section className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">

        <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr] xl:gap-16">

          {/* =================================================
              GALLERY
          ================================================= */}

          <div className="min-w-0">

            <div className="mb-5 flex items-center justify-between">

              <div>
                {brand?.name && (
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0497D8]">
                    {brand.name}
                  </p>
                )}
              </div>

              {product.on_sale && (
                <span className="rounded-full bg-[#E53935] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-white">
                  Sale
                </span>
              )}

            </div>

            <div className="rounded-[28px] border border-gray-100 bg-[#f8fafc] p-3 shadow-[0_10px_40px_rgba(0,0,0,0.04)] sm:p-5">

              <ProductGallery
                images={images}
                productName={
                  product.name
                }
                productImage={
                  productImage
                }
                onSale={false}
              />

            </div>

          </div>

          {/* =================================================
              PRODUCT INFO
          ================================================= */}

          <div className="lg:sticky lg:top-6">

            <div className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-[0_15px_50px_rgba(0,0,0,0.06)] sm:p-8">

              {/* BRAND */}

              {brand?.name && (
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
                  {brand.name}
                </p>
              )}

              {/* TITLE */}

              <h1 className="text-3xl font-bold leading-[1.12] tracking-[-0.035em] text-gray-950 sm:text-4xl">
                {product.name}
              </h1>

              {/* RATING */}

              {(reviewAverage > 0 ||
                displayedReviewCount >
                  0) && (
                <div className="mt-5 flex flex-wrap items-center gap-3">

                  <Stars
                    rating={
                      reviewAverage
                    }
                  />

                  <span className="text-sm font-semibold text-gray-700">
                    {reviewAverage.toFixed(
                      1
                    )}
                  </span>

                  <span className="text-sm text-gray-400">
                    (
                    {
                      displayedReviewCount
                    }{" "}
                    {displayedReviewCount ===
                    1
                      ? "review"
                      : "reviews"}
                    )
                  </span>

                </div>
              )}

              {/* DESCRIPTION */}

              {product.short_description && (
                <div
                  className="
                    mt-6
                    text-sm
                    leading-7
                    text-gray-500
                    [&_p]:mb-2
                    [&_strong]:font-semibold
                    [&_strong]:text-gray-900
                  "
                  dangerouslySetInnerHTML={{
                    __html:
                      product.short_description,
                  }}
                />
              )}

              {/* META */}

              <div className="mt-6 flex flex-wrap gap-2">

                {product.sku && (
                  <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-[11px] text-gray-500">
                    SKU:

                    <span className="ml-1 font-semibold text-gray-900">
                      {product.sku}
                    </span>
                  </span>
                )}

                {brand?.name && (
                  <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-[11px] text-gray-500">
                    Brand:

                    <span className="ml-1 font-semibold text-gray-900">
                      {brand.name}
                    </span>
                  </span>
                )}

              </div>

              {/* DIVIDER */}

              <div className="my-7 h-px bg-gray-100" />

              {/* PRICE */}

              <div className="flex flex-wrap items-end gap-3">

                <span className="text-4xl font-extrabold tracking-tight text-gray-950 sm:text-5xl">

                  {product.price}

                  <span className="ml-2 text-base font-semibold text-gray-400">
                    EGP
                  </span>

                </span>

                {product.on_sale &&
                  product.regular_price && (
                    <span className="mb-1 text-sm text-gray-400 line-through">
                      {
                        product.regular_price
                      }{" "}
                      EGP
                    </span>
                  )}

              </div>

              {/* STOCK */}

              <div className="mt-5">

                {isInStock ? (
                  <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">

                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
                      <Check size={12} />
                    </span>

                    In Stock

                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600">

                    <span className="h-2 w-2 rounded-full bg-red-500" />

                    Out of Stock

                  </div>
                )}

              </div>

              {/* =================================================
                  PRODUCT ACTIONS
              ================================================= */}

              <div className="mt-7">

                <ProductActions
                  product={product}
                  disabled={!isInStock}
                />

              </div>

              {/* =================================================
                  BENEFITS
              ================================================= */}

              <div className="mt-7 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">

                {/* DELIVERY */}

                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">

                    <Truck
                      size={17}
                      className="text-[#0497D8]"
                    />

                  </div>

                  <div>

                    <p className="text-[11px] font-bold text-gray-900">
                      Fast Delivery
                    </p>

                    <p className="mt-0.5 text-[10px] text-gray-400">
                      Available nationwide
                    </p>

                  </div>

                </div>

                {/* SECURE PURCHASE */}

                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">

                    <ShieldCheck
                      size={17}
                      className="text-[#0497D8]"
                    />

                  </div>

                  <div>

                    <p className="text-[11px] font-bold text-gray-900">
                      Secure Purchase
                    </p>

                    <p className="mt-0.5 text-[10px] text-gray-400">
                      Trusted checkout
                    </p>

                  </div>

                </div>

                {/* QUALITY */}

                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">

                    <PackageCheck
                      size={17}
                      className="text-[#0497D8]"
                    />

                  </div>

                  <div>

                    <p className="text-[11px] font-bold text-gray-900">
                      Quality Product
                    </p>

                    <p className="mt-0.5 text-[10px] text-gray-400">
                      Original products
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          PRODUCT INFORMATION
      ===================================================== */}

      <section className="border-y border-gray-100 bg-[#fafafa]">

        <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8 lg:py-16">

          <Tabs
            defaultValue="description"
            className="w-full"
          >

            {/* =================================================
                TAB NAVIGATION
            ================================================= */}

            <div className="mb-10 overflow-x-auto">

              <TabsList
                className="
                  h-auto
                  w-max
                  min-w-full
                  justify-start
                  gap-8
                  rounded-none
                  border-b
                  border-gray-200
                  bg-transparent
                  p-0
                "
              >

                <TabsTrigger
                  value="description"
                  className="
                    relative
                    h-14
                    shrink-0
                    rounded-none
                    border-b-2
                    border-transparent
                    bg-transparent
                    px-0
                    text-sm
                    font-semibold
                    text-gray-400
                    shadow-none
                    transition-colors
                    data-[state=active]:border-[#0497D8]
                    data-[state=active]:text-gray-950
                    data-[state=active]:shadow-none
                  "
                >
                  Description
                </TabsTrigger>

                {productAttributes.length >
                  0 && (
                    <TabsTrigger
                      value="specifications"
                      className="
                        relative
                        h-14
                        shrink-0
                        rounded-none
                        border-b-2
                        border-transparent
                        bg-transparent
                        px-0
                        text-sm
                        font-semibold
                        text-gray-400
                        shadow-none
                        transition-colors
                        data-[state=active]:border-[#0497D8]
                        data-[state=active]:text-gray-950
                        data-[state=active]:shadow-none
                      "
                    >
                      Specifications
                    </TabsTrigger>
                  )}

                <TabsTrigger
                  value="reviews"
                  className="
                    relative
                    h-14
                    shrink-0
                    rounded-none
                    border-b-2
                    border-transparent
                    bg-transparent
                    px-0
                    text-sm
                    font-semibold
                    text-gray-400
                    shadow-none
                    transition-colors
                    data-[state=active]:border-[#0497D8]
                    data-[state=active]:text-gray-950
                    data-[state=active]:shadow-none
                  "
                >
                  Reviews

                  {displayedReviewCount >
                    0 && (
                    <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">
                      {
                        displayedReviewCount
                      }
                    </span>
                  )}

                </TabsTrigger>

              </TabsList>

            </div>

            {/* =================================================
                DESCRIPTION
            ================================================= */}

            <TabsContent
              value="description"
              className="m-0"
            >

              <div className="grid gap-10 lg:grid-cols-[240px_1fr]">

                <div>

                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0497D8]">
                    Product
                  </p>

                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
                    Description
                  </h2>

                </div>

                <div
                  className="
                    prose
                    max-w-none
                    text-sm
                    leading-8
                    text-gray-600
                    prose-headings:text-gray-950
                    prose-strong:text-gray-900
                    prose-a:text-[#0497D8]
                  "
                  dangerouslySetInnerHTML={{
                    __html:
                      product.description ||
                      product.short_description ||
                      "No description available.",
                  }}
                />

              </div>

            </TabsContent>

            {/* =================================================
                SPECIFICATIONS
            ================================================= */}

            {productAttributes.length >
              0 && (
              <TabsContent
                value="specifications"
                className="m-0"
              >

                <div className="grid gap-10 lg:grid-cols-[240px_1fr]">

                  <div>

                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0497D8]">
                      Details
                    </p>

                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
                      Specifications
                    </h2>

                    <p className="mt-3 max-w-[220px] text-xs leading-6 text-gray-400">
                      Product specifications
                      provided by the
                      manufacturer.
                    </p>

                  </div>

                  <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

                    <Table>

                      <TableBody>

                        {productAttributes.map(
                          (
                            attribute,
                            index
                          ) => (

                            <TableRow
                              key={`${attribute.id}-${index}`}
                              className="border-gray-100 transition-colors hover:bg-gray-50"
                            >

                              <TableCell
                                className="
                                  w-1/3
                                  px-5
                                  py-4
                                  text-sm
                                  font-semibold
                                  text-gray-900
                                  sm:px-6
                                "
                              >
                                {
                                  attribute.name
                                }
                              </TableCell>

                              <TableCell
                                className="
                                  px-5
                                  py-4
                                  text-sm
                                  text-gray-500
                                  sm:px-6
                                "
                              >

                                <div className="flex flex-wrap gap-2">

                                  {attribute.options.map(
                                    (
                                      option,
                                      optionIndex
                                    ) => (

                                      <span
                                        key={`${attribute.id}-${optionIndex}`}
                                        className="
                                          inline-flex
                                          items-center
                                          rounded-lg
                                          border
                                          border-gray-200
                                          bg-gray-50
                                          px-2.5
                                          py-1
                                          text-xs
                                          font-medium
                                          text-gray-700
                                        "
                                      >
                                        {
                                          option
                                        }
                                      </span>

                                    )
                                  )}

                                </div>

                              </TableCell>

                            </TableRow>

                          )
                        )}

                      </TableBody>

                    </Table>

                  </div>

                </div>

              </TabsContent>
            )}

            {/* =================================================
                REVIEWS
            ================================================= */}

            <TabsContent
              value="reviews"
              className="m-0"
            >

              <div className="grid gap-12 lg:grid-cols-[300px_1fr]">

                {/* REVIEW SUMMARY */}

                <div>

                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0497D8]">
                    Customer Feedback
                  </p>

                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
                    Ratings & Reviews
                  </h2>

                  {totalReviews > 0 ||
                  reviewAverage > 0 ? (

                    <div className="mt-7 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                      <div className="flex items-end gap-4">

                        <span className="text-5xl font-extrabold tracking-tight text-gray-950">
                          {reviewAverage.toFixed(
                            1
                          )}
                        </span>

                        <div className="mb-1">

                          <Stars
                            rating={
                              reviewAverage
                            }
                            size={16}
                          />

                          <p className="mt-2 text-xs text-gray-400">
                            Based on{" "}
                            {
                              displayedReviewCount
                            }{" "}
                            reviews
                          </p>

                        </div>

                      </div>

                      {/* RATING BARS */}

                      {totalReviews >
                        0 && (
                        <div className="mt-7 space-y-3">

                          {[5, 4, 3, 2, 1].map(
                            (star) => {

                              const count =
                                reviewStats[
                                  star as keyof typeof reviewStats
                                ];

                              const percentage =
                                totalReviews >
                                0
                                  ? Math.round(
                                      (count /
                                        totalReviews) *
                                        100
                                    )
                                  : 0;

                              return (
                                <div
                                  key={
                                    star
                                  }
                                  className="flex items-center gap-3"
                                >

                                  <div className="flex w-8 items-center gap-1 text-xs font-semibold text-gray-600">

                                    {
                                      star
                                    }

                                    <Star
                                      size={
                                        11
                                      }
                                      className="fill-yellow-400 text-yellow-400"
                                    />

                                  </div>

                                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">

                                    <div
                                      className="h-full rounded-full bg-yellow-400 transition-all duration-500"
                                      style={{
                                        width: `${percentage}%`,
                                      }}
                                    />

                                  </div>

                                  <span className="w-6 text-right text-[11px] text-gray-400">
                                    {
                                      count
                                    }
                                  </span>

                                </div>
                              );
                            }
                          )}

                        </div>
                      )}

                    </div>

                  ) : (

                    <div className="mt-7 rounded-2xl border border-dashed border-gray-200 bg-white p-6">

                      <Star
                        size={25}
                        className="text-gray-300"
                      />

                      <p className="mt-3 text-sm font-semibold text-gray-900">
                        No ratings yet
                      </p>

                      <p className="mt-1 text-xs leading-5 text-gray-400">
                        Be the first customer to
                        review this product.
                      </p>

                    </div>

                  )}

                </div>

                {/* REVIEWS LIST */}

                <div className="space-y-4">

                  {reviews.length >
                  0 ? (

                    reviews.map(
                      (review) => (

                        <article
                          key={
                            review.id
                          }
                          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6"
                        >

                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                            <div>

                              <div className="flex items-center gap-3">

                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0497D8]/10 text-xs font-bold text-[#0497D8]">
                                  {review.reviewer
                                    ?.charAt(
                                      0
                                    )
                                    ?.toUpperCase()}
                                </div>

                                <div>

                                  <p className="text-sm font-semibold text-gray-900">
                                    {
                                      review.reviewer
                                    }
                                  </p>

                                  {review.date_created && (
                                    <p className="mt-0.5 text-[11px] text-gray-400">
                                      {new Date(
                                        review.date_created
                                      ).toLocaleDateString(
                                        "en-US",
                                        {
                                          year: "numeric",
                                          month: "short",
                                          day: "numeric",
                                        }
                                      )}
                                    </p>
                                  )}

                                </div>

                              </div>

                            </div>

                            <Stars
                              rating={
                                review.rating
                              }
                              size={14}
                            />

                          </div>

                          <div
                            className="
                              mt-5
                              text-sm
                              leading-7
                              text-gray-600
                              [&_strong]:font-semibold
                              [&_strong]:text-gray-900
                            "
                            dangerouslySetInnerHTML={{
                              __html:
                                review.review,
                            }}
                          />

                        </article>

                      )
                    )

                  ) : (

                    <div className="flex min-h-[250px] items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center">

                      <div>

                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">

                          <Star
                            size={22}
                            className="text-gray-300"
                          />

                        </div>

                        <p className="mt-4 text-sm font-semibold text-gray-900">
                          No reviews yet
                        </p>

                        <p className="mt-1 max-w-sm text-xs leading-5 text-gray-400">
                          There are no customer reviews
                          for this product yet.
                        </p>

                      </div>

                    </div>

                  )}

                </div>

              </div>

            </TabsContent>

          </Tabs>

        </div>

      </section>

      {/* =====================================================
          RELATED PRODUCTS
      ===================================================== */}

      {relatedProducts.length >
        0 && (

        <section className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">

          {/* HEADER */}

          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

            <div>

              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0497D8]">
                Continue Shopping
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
                You May Also Like
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                More products you might be interested in
              </p>

            </div>

            <Link
              href="/products"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition-colors hover:text-[#0497D8]"
            >
              View all

              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>

          </div>

          {/* CAROUSEL */}

          <Carousel
            opts={{
              align: "start",
              loop:
                relatedProducts.length >
                4,
            }}
            className="relative"
          >

            <CarouselContent className="-ml-4">

              {relatedProducts.map(
                (
                  relatedProduct,
                  index
                ) => {

                  const image =
                    relatedProduct.images?.find(
                      (item) =>
                        Boolean(
                          item?.src
                        )
                    );

                  if (!image?.src) {
                    return null;
                  }

                  return (

                    <CarouselItem
                      key={`${relatedProduct.id}-${index}`}
                      className="
                        basis-[82%]
                        pl-4
                        sm:basis-1/2
                        md:basis-1/3
                        lg:basis-1/4
                      "
                    >

                      <Link
                        href={`/products/detail/${relatedProduct.id}`}
                        className="group block"
                      >

                        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">

                          {/* IMAGE */}

                          <div className="relative aspect-square overflow-hidden bg-[#f8fafc]">

                            {relatedProduct.on_sale && (
                              <span className="absolute left-3 top-3 z-10 rounded-full bg-[#E53935] px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-white">
                                Sale
                              </span>
                            )}

                            <Image
                              src={
                                image.src
                              }
                              alt={
                                image.alt ||
                                relatedProduct.name
                              }
                              fill
                              sizes="
                                (max-width: 640px) 82vw,
                                (max-width: 768px) 50vw,
                                (max-width: 1024px) 33vw,
                                25vw
                              "
                              className="
                                object-contain
                                p-8
                                transition-transform
                                duration-500
                                group-hover:scale-105
                              "
                            />

                          </div>

                          {/* INFO */}

                          <div className="p-4">

                            {relatedProduct.brands?.[0]
                              ?.name && (
                              <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-[#0497D8]">
                                {
                                  relatedProduct
                                    .brands[0]
                                    .name
                                }
                              </p>
                            )}

                            <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-gray-900 transition-colors group-hover:text-[#0497D8]">
                              {
                                relatedProduct.name
                              }
                            </h3>

                            <div className="mt-4 flex flex-wrap items-center gap-2">

                              <span className="text-base font-extrabold text-gray-950">
                                {
                                  relatedProduct.price
                                }{" "}
                                EGP
                              </span>

                              {relatedProduct.on_sale &&
                                relatedProduct.regular_price && (
                                  <span className="text-xs text-gray-400 line-through">
                                    {
                                      relatedProduct.regular_price
                                    }{" "}
                                    EGP
                                  </span>
                                )}

                            </div>

                            <div className="mt-3 flex items-center gap-1.5">

                              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />

                              <span className="text-[10px] font-medium text-gray-400">
                                In Stock
                              </span>

                            </div>

                          </div>

                        </div>

                      </Link>

                    </CarouselItem>

                  );
                }
              )}

            </CarouselContent>

            {/* PREVIOUS */}

            <CarouselPrevious
              className="
                left-2
                hidden
                h-10
                w-10
                border-gray-200
                bg-white
                shadow-md
                transition-all
                hover:border-[#0497D8]
                hover:bg-[#0497D8]
                hover:text-white
                sm:flex
              "
            />

            {/* NEXT */}

            <CarouselNext
              className="
                right-2
                hidden
                h-10
                w-10
                border-gray-200
                bg-white
                shadow-md
                transition-all
                hover:border-[#0497D8]
                hover:bg-[#0497D8]
                hover:text-white
                sm:flex
              "
            />

          </Carousel>

        </section>

      )}

    </main>
  );
}