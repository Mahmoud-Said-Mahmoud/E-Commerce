import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ProductI } from "@/interface/product";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

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
  PackageCheck,
  ShieldCheck,
  Star,
  StoreIcon,
  Truck,
} from "lucide-react";

import { IoWallet } from "react-icons/io5";

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

function getReviewRating(value?: number) {
  const rating = Number(value || 0);

  if (!Number.isFinite(rating)) {
    return 0;
  }

  return Math.min(Math.max(Math.round(rating), 0), 5);
}

/* =========================================================
   PAGE
========================================================= */

export default async function Page({
  params,
}: {
  params: Promise<{ productDetails: string }>;
}) {
  const { productDetails } = await params;

  /* =======================================================
     CURRENT PRODUCT
  ======================================================= */

  const response = await fetch(`${API_URL}/${productDetails}`, {
    headers: {
      Authorization: `Basic ${auth}`,
    },
    next: {
      revalidate: 300,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch product");
  }

  const product: ProductWithRating = await response.json();

  /* =======================================================
     PRODUCT DATA
  ======================================================= */

  const brand = product.brands?.[0];

  const isInStock = product.stock_status === "instock";

  const reviewCount = Number(product.rating?.count || 0);

  /* =======================================================
     PRODUCT IMAGES
  ======================================================= */

  const images =
    product.images
      ?.filter((image) => Boolean(image?.src))
      .map((image) => ({
        ...image,
        src: normalizeImageUrl(image.src),
      }))
      .filter((image) => Boolean(image.src)) || [];

  const productImage =
    images[0]?.src || "/placeholder-product.png";

  /* =======================================================
     PRODUCT REVIEWS
  ======================================================= */

  let reviews: ProductReview[] = [];

  try {
    const reviewsResponse = await fetch(
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
      reviews = await reviewsResponse.json();
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
    const reviewRating = getReviewRating(review.rating);

    if (reviewRating >= 1 && reviewRating <= 5) {
      reviewStats[
        reviewRating as keyof typeof reviewStats
      ]++;
    }
  });

  const totalReviews = reviews.length;

  const displayedReviewCount =
    totalReviews > 0 ? totalReviews : reviewCount;

  /* =======================================================
     REVIEW AVERAGE
  ======================================================= */

  const calculatedAverage =
    totalReviews > 0
      ? reviews.reduce(
          (sum, review) =>
            sum + Number(review.rating || 0),
          0
        ) / totalReviews
      : Number(product.rating?.average || 0);

  const reviewAverage = Number.isFinite(calculatedAverage)
    ? calculatedAverage
    : 0;

  /* =======================================================
     RELATED PRODUCTS
  ======================================================= */

  const categoryIds = product.categories
    ?.map((category) => category.id)
    .join(",");

  let relatedProducts: ProductWithRating[] = [];

  if (categoryIds) {
    const relatedResponse = await fetch(
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
      relatedProducts = await relatedResponse.json();
    }
  }

  /* =======================================================
     CLEAN RELATED PRODUCTS
  ======================================================= */

  relatedProducts = relatedProducts
    .filter(
      (item) => item.stock_status === "instock"
    )
    .map((item) => ({
      ...item,
      images:
        item.images
          ?.filter((image) => Boolean(image?.src))
          .map((image) => ({
            ...image,
            src: normalizeImageUrl(image.src),
          }))
          .filter((image) => Boolean(image.src)) || [],
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
    <main className="min-h-screen bg-white">

      {/* =====================================================
          TOP NAVIGATION / BREADCRUMB
      ===================================================== */}

      <div className="mx-auto max-w-[1440px] px-4 pt-6 sm:px-6 lg:px-8">

        <div className="flex items-center gap-2 text-xs text-gray-400">

          <Link
            href="/"
            className="transition-colors hover:text-[#0497D8]"
          >
            Home
          </Link>

          <ChevronRight size={14} />

          <Link
            href="/products"
            className="transition-colors hover:text-[#0497D8]"
          >
            Products
          </Link>

          <ChevronRight size={14} />

          <span className="max-w-[250px] truncate font-medium text-gray-700">
            {product.name}
          </span>

        </div>

      </div>

      {/* =====================================================
          PRODUCT HERO
      ===================================================== */}

      <section className="mx-auto max-w-[1440px] px-4 pb-12 pt-8 sm:px-6 lg:px-8 lg:pb-16 lg:pt-12">

        <div className="grid items-start gap-10 lg:grid-cols-[1.15fr_0.85fr] xl:gap-20">

          {/* =================================================
              LEFT - GALLERY
          ================================================= */}

          <div className="min-w-0">

            <div className="mb-5 flex items-center justify-between">

              <div>

                {brand?.name && (
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0497D8]">
                    {brand.name}
                  </p>
                )}

              </div>

              {product.on_sale && (
                <span className="rounded-full bg-[#E53935] px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white">
                  Sale
                </span>
              )}

            </div>

            <ProductGallery
              images={images}
              productName={product.name}
              productImage={productImage}
              onSale={false}
            />

          </div>

          {/* =================================================
              RIGHT - PRODUCT INFORMATION
          ================================================= */}

          <div className="lg:sticky lg:top-8">

            <div className="max-w-xl">

              {/* BRAND */}

              {brand?.name && (
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
                  {brand.name}
                </p>
              )}

              {/* TITLE */}

              <h1 className="text-3xl font-bold leading-[1.12] tracking-[-0.03em] text-gray-950 sm:text-4xl xl:text-5xl">
                {product.name}
              </h1>

              {/* SHORT DESCRIPTION */}

              {product.short_description && (
                <div
                  className="
                    mt-5
                    max-w-xl
                    text-sm
                    leading-7
                    text-gray-500
                  "
                  dangerouslySetInnerHTML={{
                    __html: product.short_description,
                  }}
                />
              )}

              {/* PRODUCT META */}

              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-gray-500">

                {product.sku && (
                  <span>
                    SKU{" "}
                    <span className="font-semibold text-gray-900">
                      {product.sku}
                    </span>
                  </span>
                )}

                {brand?.name && (
                  <span>
                    Brand{" "}
                    <span className="font-semibold text-gray-900">
                      {brand.name}
                    </span>
                  </span>
                )}

              </div>

              {/* PRICE */}

              <div className="mt-8 flex flex-wrap items-end gap-3">

                <span className="text-4xl font-extrabold tracking-tight text-gray-950 sm:text-5xl">
                  {product.price}
                  <span className="ml-1 text-lg font-semibold text-gray-500">
                    EGP
                  </span>
                </span>

                {product.on_sale &&
                  product.regular_price && (
                    <span className="mb-1 text-base text-gray-400 line-through">
                      {product.regular_price} EGP
                    </span>
                  )}

              </div>

              {/* STOCK */}

              <div className="mt-5">

                {isInStock ? (
                  <div className="inline-flex items-center gap-2 text-sm font-semibold text-green-600">

                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
                      <Check size={12} />
                    </span>

                    In Stock
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 text-sm font-semibold text-red-500">

                    <span className="h-2.5 w-2.5 rounded-full bg-red-500" />

                    Out of Stock
                  </div>
                )}

              </div>

              {/* DIVIDER */}

           

         

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          PRODUCT INFORMATION TABS
      ===================================================== */}

      <section className="border-y border-gray-100 bg-[#fafafa]">

        <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">

          <Tabs
            defaultValue="description"
            className="w-full"
          >

            {/* =================================================
                TABS NAVIGATION
            ================================================= */}

            <div className="mb-10 overflow-hidden">

              <TabsList
                className="
                  h-auto
                  w-full
                  justify-start
                  gap-8
                  rounded-none
                  border-b
                  border-gray-200
                  bg-transparent
                  p-0
                "
              >

                {/* DESCRIPTION */}

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
                    data-[state=active]:border-[#0497D8]
                    data-[state=active]:text-gray-950
                    data-[state=active]:shadow-none
                  "
                >
                  Description
                </TabsTrigger>

                {/* SPECIFICATIONS */}

                {product.attributes &&
                  product.attributes.length > 0 && (

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
                        data-[state=active]:border-[#0497D8]
                        data-[state=active]:text-gray-950
                        data-[state=active]:shadow-none
                      "
                    >
                      Specifications
                    </TabsTrigger>

                  )}

                {/* REVIEWS */}

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
                    data-[state=active]:border-[#0497D8]
                    data-[state=active]:text-gray-950
                    data-[state=active]:shadow-none
                  "
                >
                  Reviews

                  {displayedReviewCount > 0 && (
                    <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">
                      {displayedReviewCount}
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

              <div className="grid gap-10 lg:grid-cols-[220px_1fr]">

                <div>

                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0497D8]">
                    Product
                  </p>

                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-950">
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

            {product.attributes &&
              product.attributes.length > 0 && (

                <TabsContent
                  value="specifications"
                  className="m-0"
                >

                  <div className="grid gap-10 lg:grid-cols-[220px_1fr]">

                    <div>

                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0497D8]">
                        Details
                      </p>

                      <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-950">
                        Specifications
                      </h2>

                    </div>

                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">

                      <Table>

                        <TableBody>

                          {product.attributes.map(
                            (attribute, index) => (

                              <TableRow
                                key={`${attribute.id}-${index}`}
                                className="border-gray-100 hover:bg-gray-50"
                              >

                                <TableCell
                                  className="
                                    w-1/3
                                    px-5
                                    py-4
                                    text-sm
                                    font-semibold
                                    text-gray-900
                                  "
                                >
                                  {attribute.name}
                                </TableCell>

                                <TableCell
                                  className="
                                    px-5
                                    py-4
                                    text-sm
                                    text-gray-500
                                  "
                                >
                                  {attribute.options?.join(
                                    ", "
                                  )}
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

                {/* =================================================
                    REVIEW SIDEBAR
                ================================================= */}

                <div>

                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0497D8]">
                    Customer Feedback
                  </p>

                  <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
                    Ratings & Reviews
                  </h2>

                  {/* =================================================
                      RATING
                  ================================================= */}

                  {totalReviews > 0 || reviewAverage > 0 ? (

                    <div className="mt-7">

                      <div className="flex items-end gap-3">

                        <span className="text-5xl font-extrabold tracking-tight text-gray-950">
                          {reviewAverage.toFixed(1)}
                        </span>

                        <div className="mb-1">

                          <div className="flex items-center gap-1">

                            {[1, 2, 3, 4, 5].map(
                              (star) => (

                                <Star
                                  key={star}
                                  size={16}
                                  className={
                                    star <=
                                    Math.round(
                                      reviewAverage
                                    )
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }
                                />

                              )
                            )}

                          </div>

                          <p className="mt-1 text-xs text-gray-400">
                            Based on{" "}
                            {displayedReviewCount}{" "}
                            reviews
                          </p>

                        </div>

                      </div>

                      {/* RATING BARS */}

                      {totalReviews > 0 && (

                        <div className="mt-8 space-y-3">

                          {[5, 4, 3, 2, 1].map(
                            (star) => {

                              const count =
                                reviewStats[
                                  star as keyof typeof reviewStats
                                ];

                              const percentage =
                                totalReviews > 0
                                  ? Math.round(
                                      (count /
                                        totalReviews) *
                                        100
                                    )
                                  : 0;

                              return (

                                <div
                                  key={star}
                                  className="flex items-center gap-3"
                                >

                                  <div className="flex w-8 items-center gap-1 text-xs font-semibold text-gray-600">

                                    {star}

                                    <Star
                                      size={12}
                                      className="fill-yellow-400 text-yellow-400"
                                    />

                                  </div>

                                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">

                                    <div
                                      className="h-full rounded-full bg-yellow-400 transition-all duration-500"
                                      style={{
                                        width: `${percentage}%`,
                                      }}
                                    />

                                  </div>

                                  <span className="w-6 text-right text-[11px] text-gray-400">
                                    {count}
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
                        size={24}
                        className="text-gray-300"
                      />

                      <p className="mt-3 text-sm font-semibold text-gray-900">
                        No ratings yet
                      </p>

                      <p className="mt-1 text-xs leading-5 text-gray-400">
                        Be the first customer to review
                        this product.
                      </p>

                    </div>

                  )}

                </div>

                {/* =================================================
                    REVIEW CONTENT
                ================================================= */}

               

              </div>

            </TabsContent>

          </Tabs>

        </div>

      </section>

      {/* =====================================================
          RELATED PRODUCTS
      ===================================================== */}

      {relatedProducts.length > 0 && (

        <section className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">

          {/* HEADER */}

          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

            <div>

              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0497D8]">
                Continue Shopping
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
                You May Also Like
              </h2>

            </div>

            <Link
              href="/products"
              className="
                group
                inline-flex
                items-center
                gap-2
                text-sm
                font-semibold
                text-gray-500
                transition-colors
                hover:text-[#0497D8]
              "
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
              loop: relatedProducts.length > 4,
            }}
            className="relative"
          >

            <CarouselContent className="-ml-4">

              {relatedProducts.map(
                (relatedProduct, index) => {

                  const image =
                    relatedProduct.images?.find(
                      (item) =>
                        Boolean(item?.src)
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

                        {/* IMAGE */}

                        <div className="relative aspect-square overflow-hidden bg-gray-50">

                          {relatedProduct.on_sale && (
                            <span className="absolute left-3 top-3 z-10 rounded-full bg-[#E53935] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                              Sale
                            </span>
                          )}

                          <Image
                            src={image.src}
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

                        <div className="pt-4">

                          {relatedProduct.brands?.[0]
                            ?.name && (

                            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#0497D8]">
                              {
                                relatedProduct
                                  .brands[0].name
                              }
                            </p>

                          )}

                          <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-gray-900 transition-colors group-hover:text-[#0497D8]">
                            {relatedProduct.name}
                          </h3>

                          <div className="mt-3 flex items-center gap-2">

                            <span className="text-base font-extrabold text-gray-950">
                              {relatedProduct.price} EGP
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

                          <div className="mt-2 flex items-center gap-1.5">

                            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />

                            <span className="text-[11px] font-medium text-gray-500">
                              In Stock
                            </span>

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
                shadow-sm
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
                shadow-sm
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