import ProductGallery from "@/components/ImageSlider/imageslider";
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
  Heart,
  MinusIcon,
  PlusIcon,
  ShoppingCart,
  StoreIcon,
  Truck,
  ShieldCheck,
  Star,
  PackageCheck,
  ChevronRight,
} from "lucide-react";

import { IoWallet } from "react-icons/io5";
import { FaCheck } from "react-icons/fa";

import type { Params } from "next/dist/server/request/params";
import Image from "next/image";
import Link from "next/link";

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

/* =========================================================
   WOOCOMMERCE AUTH
========================================================= */

const username = process.env.WC_KEY;
const password = process.env.WC_SECRET;

const auth = Buffer.from(`${username}:${password}`).toString(
  "base64"
);

const API_URL =
  "https://www.i-techegypt.com/wp-json/wc/v3/products";

/* =========================================================
   PAGE
========================================================= */

export default async function Page({
  params,
}: {
  params: Params;
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
    throw new Error("Failed to fetch product");
  }

  const product: ProductWithRating =
    await response.json();

  /* =======================================================
     PRODUCT DATA
  ======================================================= */

  const brand = product.brands?.[0];

  const isInStock =
    product.stock_status === "instock";

  const rating = Number(
    product.rating?.average || 0
  );

  const reviewCount =
    product.rating?.count || 0;

  const hasRating = rating > 0;

  /* =======================================================
     RELATED PRODUCTS

     Same category
     Exclude current product
     ONLY IN STOCK
  ======================================================= */

  const categoryIds =
    product.categories
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
      relatedProducts =
        await relatedResponse.json();
    }
  }

  /*
   * Extra protection:
   * Make sure only products with stock_status = instock
   * are displayed.
   */

  relatedProducts = relatedProducts
    .filter(
      (item) =>
        item.stock_status === "instock"
    )
    .filter((item) =>
      item.images?.some(
        (image) => Boolean(image?.src)
      )
    )
    .slice(0, 12);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="container mx-auto px-4 py-6 md:py-10">

      {/* =====================================================
          BREADCRUMB
      ===================================================== */}

      <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">

        <Link
          href="/"
          className="transition hover:text-[#0497D8]"
        >
          Home
        </Link>

        <ChevronRight size={15} />

        <Link
          href="/products"
          className="transition hover:text-[#0497D8]"
        >
          Products
        </Link>

        <ChevronRight size={15} />

        <span className="line-clamp-1 text-gray-900">
          {product.name}
        </span>

      </div>

      {/* =====================================================
          PRODUCT
      ===================================================== */}

      <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">

        {/* ===================================================
            GALLERY
        =================================================== */}

        <div className="min-w-0">

          <div
            className="
              overflow-hidden
              rounded-3xl
              border
              bg-white
              p-3
              shadow-sm
            "
          >
            <ProductGallery product={product} />
          </div>

        </div>

        {/* ===================================================
            DETAILS
        =================================================== */}

        <div
          className="
            flex
            flex-col
            gap-5
            rounded-3xl
            border
            bg-white
            p-5
            shadow-sm
            md:p-7
          "
        >

          {/* BRAND */}

          {brand?.name && (
            <div>

              <span
                className="
                  inline-flex
                  rounded-full
                  bg-[#0497D8]/10
                  px-3
                  py-1
                  text-xs
                  font-bold
                  uppercase
                  tracking-wider
                  text-[#0497D8]
                "
              >
                {brand.name}
              </span>

            </div>
          )}

          {/* TITLE */}

          <div>

            <h1
              className="
                text-2xl
                font-bold
                leading-tight
                md:text-3xl
              "
            >
              {product.name}
            </h1>

            {/* RATING */}

            <div className="mt-3 flex items-center gap-3">

              {hasRating ? (
                <>
                  <div
                    className="
                      flex
                      items-center
                      gap-1.5
                      rounded-lg
                      bg-yellow-50
                      px-2.5
                      py-1.5
                    "
                  >

                    <Star
                      size={16}
                      className="fill-yellow-400 text-yellow-400"
                    />

                    <span className="font-bold">
                      {rating.toFixed(1)}
                    </span>

                  </div>

                  <span className="text-sm text-gray-500">
                    {reviewCount}{" "}
                    {reviewCount === 1
                      ? "review"
                      : "reviews"}
                  </span>
                </>
              ) : (
                <span className="text-sm text-gray-500">
                  No reviews yet
                </span>
              )}

            </div>

          </div>

          {/* SKU / BRAND */}

          <div className="flex flex-wrap gap-2">

            {product.sku && (
              <div
                className="
                  rounded-lg
                  bg-gray-50
                  px-3
                  py-2
                  text-sm
                "
              >
                <span className="text-gray-500">
                  SKU:
                </span>{" "}
                <span className="font-semibold">
                  {product.sku}
                </span>
              </div>
            )}

            {brand?.name && (
              <div
                className="
                  rounded-lg
                  bg-gray-50
                  px-3
                  py-2
                  text-sm
                "
              >
                <span className="text-gray-500">
                  Brand:
                </span>{" "}
                <span className="font-semibold">
                  {brand.name}
                </span>
              </div>
            )}

          </div>

          {/* PRICE */}

          <div
            className="
              flex
              flex-wrap
              items-center
              gap-3
              border-y
              py-5
            "
          >

            <span
              className="
                text-3xl
                font-extrabold
                text-[#0497D8]
              "
            >
              {product.price} EGP
            </span>

            {product.on_sale &&
              product.regular_price && (
                <span
                  className="
                    text-base
                    text-gray-400
                    line-through
                  "
                >
                  {product.regular_price} EGP
                </span>
              )}

            {product.on_sale && (
              <span
                className="
                  rounded-full
                  bg-red-50
                  px-3
                  py-1
                  text-xs
                  font-bold
                  text-red-500
                "
              >
                SALE
              </span>
            )}

          </div>

          {/* STOCK */}

          <div>

            {isInStock ? (
              <div
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  bg-green-50
                  px-3
                  py-1.5
                  text-sm
                  font-semibold
                  text-green-600
                "
              >

                <span
                  className="
                    flex
                    h-5
                    w-5
                    items-center
                    justify-center
                    rounded-full
                    bg-green-100
                  "
                >
                  <FaCheck size={10} />
                </span>

                In Stock

              </div>
            ) : (
              <div
                className="
                  inline-flex
                  rounded-full
                  bg-red-50
                  px-3
                  py-1.5
                  text-sm
                  font-semibold
                  text-red-500
                "
              >
                Out of Stock
              </div>
            )}

          </div>

          {/* =================================================
              ATTRIBUTES
          ================================================= */}

          {product.attributes &&
            product.attributes.length > 0 && (

              <div className="space-y-5">

                <h3 className="text-lg font-bold">
                  Choose Options
                </h3>

                {product.attributes.map(
                  (attribute) => {

                    if (
                      !attribute.options?.length
                    ) {
                      return null;
                    }

                    return (
                      <div
                        key={attribute.id}
                        className="space-y-2"
                      >

                        <p className="text-sm font-semibold">
                          {attribute.name}
                        </p>

                        <div className="flex flex-wrap gap-2">

                          {attribute.options.map(
                            (option) => (

                              <button
                                key={option}
                                type="button"
                                className="
                                  rounded-xl
                                  border
                                  bg-white
                                  px-4
                                  py-2
                                  text-sm
                                  font-medium
                                  transition
                                  hover:border-[#0497D8]
                                  hover:bg-[#0497D8]/5
                                  hover:text-[#0497D8]
                                "
                              >
                                {option}
                              </button>

                            )
                          )}

                        </div>

                      </div>
                    );
                  }
                )}

              </div>
            )}

          {/* QUANTITY */}

          <div className="space-y-2">

            <p className="text-sm font-bold">
              Quantity
            </p>

            <div
              className="
                flex
                w-fit
                items-center
                rounded-xl
                border
                bg-gray-50
              "
            >

              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl"
              >
                <MinusIcon size={17} />
              </Button>

              <span className="min-w-10 text-center font-semibold">
                1
              </span>

              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl"
              >
                <PlusIcon size={17} />
              </Button>

            </div>

          </div>

          {/* ACTIONS */}

          <div className="flex gap-3">

            <Button
              disabled={!isInStock}
              className="
                h-12
                flex-1
                rounded-xl
                bg-[#0497D8]
                text-white
                shadow-sm
                transition
                hover:bg-[#0389c4]
                hover:shadow-md
              "
            >

              <ShoppingCart size={19} />

              {isInStock
                ? "Add to Cart"
                : "Out of Stock"}

            </Button>

            <Button
              variant="outline"
              size="icon"
              className="
                h-12
                w-12
                shrink-0
                rounded-xl
                transition
                hover:border-red-300
                hover:bg-red-50
                hover:text-red-500
              "
            >
              <Heart size={20} />
            </Button>

          </div>

          {/* SERVICES */}

          <div
            className="
              grid
              grid-cols-1
              gap-4
              border-t
              pt-5
              sm:grid-cols-3
            "
          >

            <div className="flex items-center gap-3">

              <div className="rounded-lg bg-[#0497D8]/10 p-2">
                <Truck
                  size={18}
                  className="text-[#0497D8]"
                />
              </div>

              <div>
                <p className="text-xs font-bold">
                  Fast Delivery
                </p>

                <p className="text-[11px] text-gray-500">
                  Across Egypt
                </p>
              </div>

            </div>

            <div className="flex items-center gap-3">

              <div className="rounded-lg bg-[#0497D8]/10 p-2">
                <ShieldCheck
                  size={18}
                  className="text-[#0497D8]"
                />
              </div>

              <div>
                <p className="text-xs font-bold">
                  Secure Payment
                </p>

                <p className="text-[11px] text-gray-500">
                  Paymob supported
                </p>
              </div>

            </div>

            <div className="flex items-center gap-3">

              <div className="rounded-lg bg-[#0497D8]/10 p-2">
                <PackageCheck
                  size={18}
                  className="text-[#0497D8]"
                />
              </div>

              <div>
                <p className="text-xs font-bold">
                  Easy Tracking
                </p>

                <p className="text-[11px] text-gray-500">
                  Track with Bosta
                </p>
              </div>

            </div>

          </div>

          {/* EXTRA ACTIONS */}

          <div className="flex flex-wrap gap-3 border-t pt-5">

            {/* INSTALLMENT */}

            <Drawer>

              <DrawerTrigger
                render={
                  <Button
                    variant="outline"
                    className="rounded-xl"
                  />
                }
              >
                <IoWallet />
                Plan Installment
              </DrawerTrigger>

              <DrawerContent>

                <DrawerHeader>
                  <DrawerTitle>
                    Buy Now Pay Later
                  </DrawerTitle>
                </DrawerHeader>

                <div className="px-4">

                  <Table>

                    <TableBody>

                      {[
                        ["6 Months", "3,667"],
                        ["12 Months", "1,005.22"],
                        ["18 Months", "709.62"],
                        ["24 Months", "562.63"],
                        ["36 Months", "430.43"],
                      ].map(
                        ([months, price]) => (

                          <TableRow key={months}>

                            <TableCell className="font-semibold">
                              {months}
                            </TableCell>

                            <TableCell className="text-right">
                              {price} / Month
                            </TableCell>

                          </TableRow>

                        )
                      )}

                    </TableBody>

                  </Table>

                </div>

                <DrawerFooter>

                  <DrawerClose
                    render={
                      <Button variant="outline" />
                    }
                  >
                    Close
                  </DrawerClose>

                </DrawerFooter>

              </DrawerContent>

            </Drawer>

            {/* STORE */}

            <Drawer>

              <DrawerTrigger
                render={
                  <Button
                    variant="outline"
                    className="rounded-xl"
                  />
                }
              >
                <StoreIcon />
                Pick From Store
              </DrawerTrigger>

              <DrawerContent>

                <DrawerHeader>

                  <DrawerTitle>
                    Pick Up From Store
                  </DrawerTitle>

                </DrawerHeader>

                <div className="p-6">

                  <div
                    className="
                      rounded-2xl
                      border
                      bg-gray-50
                      p-5
                    "
                  >

                    <p className="font-bold">
                      I-Technology Store
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Check product availability
                      at our store.
                    </p>

                  </div>

                </div>

                <DrawerFooter>

                  <DrawerClose
                    render={
                      <Button variant="outline" />
                    }
                  >
                    Close
                  </DrawerClose>

                </DrawerFooter>

              </DrawerContent>

            </Drawer>

          </div>

        </div>

      </section>

      {/* =====================================================
          DESCRIPTION / SPECIFICATIONS TABS
      ===================================================== */}

      <section className="mt-10">

        <div
          className="
            overflow-hidden
            rounded-3xl
            border
            bg-white
            shadow-sm
          "
        >

          <Tabs
            defaultValue="description"
            className="w-full"
          >

            {/* TABS HEADER */}

            <div className="border-b px-4 md:px-7">

              <TabsList
                className="
                  h-14
                  w-full
                  justify-start
                  gap-6
                  rounded-none
                  bg-transparent
                  p-0
                "
              >

                <TabsTrigger
                  value="description"
                  className="
                    relative
                    h-14
                    rounded-none
                    border-b-2
                    border-transparent
                    bg-transparent
                    px-1
                    font-semibold
                    text-gray-500
                    shadow-none
                    data-[state=active]:border-[#0497D8]
                    data-[state=active]:text-[#0497D8]
                    data-[state=active]:shadow-none
                  "
                >
                  Description
                </TabsTrigger>

                {product.attributes &&
                  product.attributes.length > 0 && (

                    <TabsTrigger
                      value="specifications"
                      className="
                        relative
                        h-14
                        rounded-none
                        border-b-2
                        border-transparent
                        bg-transparent
                        px-1
                        font-semibold
                        text-gray-500
                        shadow-none
                        data-[state=active]:border-[#0497D8]
                        data-[state=active]:text-[#0497D8]
                        data-[state=active]:shadow-none
                      "
                    >
                      Specifications
                    </TabsTrigger>

                  )}

              </TabsList>

            </div>

            {/* DESCRIPTION */}

            <TabsContent
              value="description"
              className="m-0 p-5 md:p-7"
            >

              <div
                className="
                  prose
                  max-w-none
                  text-sm
                  leading-7
                  text-gray-600
                "
                dangerouslySetInnerHTML={{
                  __html:
                    product.description ||
                    product.short_description ||
                    "No description available.",
                }}
              />

            </TabsContent>

            {/* SPECIFICATIONS */}

            {product.attributes &&
              product.attributes.length > 0 && (

                <TabsContent
                  value="specifications"
                  className="m-0 p-5 md:p-7"
                >

                  <div className="overflow-x-auto">

                    <Table>

                      <TableBody>

                        {product.attributes.map(
                          (attribute) => (

                            <TableRow
                              key={attribute.id}
                              className="hover:bg-gray-50"
                            >

                              <TableCell
                                className="
                                  w-1/3
                                  font-semibold
                                  text-gray-900
                                "
                              >
                                {attribute.name}
                              </TableCell>

                              <TableCell className="text-gray-600">
                                {attribute.options.join(
                                  ", "
                                )}
                              </TableCell>

                            </TableRow>

                          )
                        )}

                      </TableBody>

                    </Table>

                  </div>

                </TabsContent>

              )}

          </Tabs>

        </div>

      </section>

      {/* =====================================================
          RELATED PRODUCTS
          ONLY IN STOCK
      ===================================================== */}

      {relatedProducts.length > 0 && (

        <section className="mt-14">

          {/* HEADER */}

          <div className="mb-6 flex items-end justify-between">

            <div>

              <p
                className="
                  mb-1
                  text-sm
                  font-bold
                  uppercase
                  tracking-wider
                  text-[#0497D8]
                "
              >
                You May Also Like
              </p>

              <h2
                className="
                  text-2xl
                  font-extrabold
                  md:text-3xl
                "
              >
                Related Products
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Similar products available in stock
              </p>

            </div>

          </div>

          {/* CAROUSEL */}

          <Carousel
            opts={{
              align: "start",
              loop: relatedProducts.length > 4,
            }}
            className="relative"
          >

            <CarouselContent className="-ml-3">

              {relatedProducts.map(
                (relatedProduct) => {

                  const image =
                    relatedProduct.images?.find(
                      (item) =>
                        Boolean(item?.src)
                    );

                  if (!image?.src) {
                    return null;
                  }

                  const relatedRating =
                    Number(
                      relatedProduct.rating
                        ?.average || 0
                    );

                  return (
                    <CarouselItem
                      key={relatedProduct.id}
                      className="
                        basis-[85%]
                        pl-3
                        sm:basis-1/2
                        lg:basis-1/4
                      "
                    >

                      <Link
                        href={`/products/detail/${relatedProduct.id}`}
                        className="block h-full"
                      >

                        <div
                          className="
                            group
                            h-full
                            overflow-hidden
                            rounded-2xl
                            border
                            bg-white
                            transition
                            duration-300
                            hover:-translate-y-1
                            hover:shadow-xl
                          "
                        >

                          {/* IMAGE */}

                          <div
                            className="
                              relative
                              flex
                              h-64
                              items-center
                              justify-center
                              overflow-hidden
                              bg-gray-50
                            "
                          >

                            {relatedProduct.on_sale && (
                              <span
                                className="
                                  absolute
                                  left-3
                                  top-3
                                  z-10
                                  rounded-full
                                  bg-red-500
                                  px-2.5
                                  py-1
                                  text-[10px]
                                  font-bold
                                  text-white
                                "
                              >
                                SALE
                              </span>
                            )}

                            <Image
                              src={image.src}
                              alt={
                                image.alt ||
                                relatedProduct.name
                              }
                              width={500}
                              height={500}
                              className="
                                h-full
                                w-full
                                object-contain
                                p-5
                                transition
                                duration-500
                                group-hover:scale-105
                              "
                            />

                          </div>

                          {/* INFO */}

                          <div className="p-4">

                            {/* BRAND */}

                            {relatedProduct.brands?.[0]
                              ?.name && (

                              <p
                                className="
                                  mb-1
                                  text-[11px]
                                  font-bold
                                  uppercase
                                  tracking-wider
                                  text-[#0497D8]
                                "
                              >
                                {
                                  relatedProduct
                                    .brands[0]
                                    .name
                                }
                              </p>

                            )}

                            {/* TITLE */}

                            <h3
                              className="
                                line-clamp-2
                                min-h-10
                                text-sm
                                font-semibold
                                leading-5
                              "
                            >
                              {relatedProduct.name}
                            </h3>

                            {/* RATING */}

                            <div className="mt-2 flex items-center gap-1">

                              <Star
                                size={14}
                                className={
                                  relatedRating > 0
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }
                              />

                              <span className="text-xs font-semibold">
                                {relatedRating > 0
                                  ? relatedRating.toFixed(
                                      1
                                    )
                                  : "New"}
                              </span>

                              {relatedProduct.rating
                                ?.count ? (
                                <span className="text-[11px] text-gray-400">
                                  (
                                  {
                                    relatedProduct
                                      .rating
                                      .count
                                  }
                                  )
                                </span>
                              ) : null}

                            </div>

                            {/* PRICE */}

                            <div className="mt-3 flex items-center gap-2">

                              <span
                                className="
                                  text-lg
                                  font-extrabold
                                  text-[#0497D8]
                                "
                              >
                                {
                                  relatedProduct.price
                                }{" "}
                                EGP
                              </span>

                              {relatedProduct.on_sale &&
                                relatedProduct.regular_price && (

                                  <span
                                    className="
                                      text-xs
                                      text-gray-400
                                      line-through
                                    "
                                  >
                                    {
                                      relatedProduct
                                        .regular_price
                                    }{" "}
                                    EGP
                                  </span>

                                )}

                            </div>

                            {/* STOCK */}

                            <div className="mt-3 flex items-center gap-1.5">

                              <span className="h-2 w-2 rounded-full bg-green-500" />

                              <span
                                className="
                                  text-xs
                                  font-semibold
                                  text-green-600
                                "
                              >
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

            <CarouselPrevious
              className="
                left-2
                hidden
                h-10
                w-10
                border
                bg-white
                shadow-md
                hover:bg-[#0497D8]
                hover:text-white
                sm:flex
              "
            />

            <CarouselNext
              className="
                right-2
                hidden
                h-10
                w-10
                border
                bg-white
                shadow-md
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