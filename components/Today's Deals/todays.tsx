"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";

import { productApi } from "@/service/product";
import type { ProductI } from "@/interface/product";

import { LuShieldCheck } from "react-icons/lu";
import { FaShippingFast } from "react-icons/fa";

import {
  ShoppingCart,
  Check,
  ArrowRight,
  Tag,
  Heart,
} from "lucide-react";

import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

const END_DATE = new Date(
  "2026-08-15T23:59:59"
).getTime();

export default function Todays() {
  const [products, setProducts] = useState<ProductI[]>([]);
  const [loading, setLoading] = useState(true);

  const [time, setTime] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  /* =========================================================
     GET SALE PRODUCTS
  ========================================================= */

  useEffect(() => {
    async function getProducts() {
      try {
        setLoading(true);

        const result = await productApi(1, {
          category: "134",
        });

        /*
         * ONLY PRODUCTS ON SALE
         * AND PRODUCTS THAT HAVE AN IMAGE
         */

        const filtered = (result.data || [])
          .filter(
            (product) =>
              product.on_sale &&
              product.images?.some(
                (image) => image?.src
              )
          )
          .slice(0, 8);

        setProducts(filtered);
      } catch (error) {
        console.error(
          "Today's deals error:",
          error
        );

        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    getProducts();
  }, []);

  /* =========================================================
     COUNTDOWN
  ========================================================= */

  useEffect(() => {
    const update = () => {
      const diff = END_DATE - Date.now();

      if (diff <= 0) {
        setTime({
          hours: 0,
          minutes: 0,
          seconds: 0,
        });

        return;
      }

      setTime({
        /*
         * TOTAL HOURS
         * We don't show Days anymore.
         */
        hours: Math.floor(diff / 3600000),

        minutes: Math.floor(
          (diff % 3600000) / 60000
        ),

        seconds: Math.floor(
          (diff % 60000) / 1000
        ),
      });
    };

    update();

    const timer = setInterval(update, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="container mx-auto py-10">
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">

        {/* =====================================================
            DEAL CARD
        ====================================================== */}

        <Card className="relative overflow-hidden border border-gray-200 bg-white shadow-sm">

          {/* BACKGROUND DECORATION */}

          <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#0497D8]/10 blur-2xl" />

          <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-red-500/10 blur-2xl" />

          <div className="relative flex h-full flex-col p-6">

            {/* TOP */}

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-2">

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
                  <Tag
                    size={16}
                    className="text-red-500"
                  />
                </div>

                <span className="text-xs font-semibold uppercase tracking-wide text-red-500">
                  Sale
                </span>

              </div>

              <span className="rounded-full bg-[#0497D8]/10 px-3 py-1 text-xs font-semibold text-[#0497D8]">
                Today
              </span>

            </div>

            {/* TITLE */}

            <div className="mt-6">

              <h2 className="text-3xl font-bold leading-tight text-gray-900">
                Today&apos;s
                <br />

                <span className="text-[#0497D8]">
                  Best Deals
                </span>
              </h2>

              <p className="mt-4 text-sm leading-6 text-gray-500">
                Grab the latest discounts before
                they&apos;re gone. Discover special
                prices on selected products.
              </p>

            </div>

            {/* OFFER IMAGE */}

            <div className="relative my-6 flex flex-1 items-center justify-center">

              <div className="absolute h-40 w-40 rounded-full bg-[#0497D8]/5" />

              <Image
                src="/Image/offers.png"
                width={500}
                height={400}
                alt="Today's Deals"
                className="relative z-10 h-44 w-full object-contain"
              />

            </div>

            {/* COUNTDOWN */}

            <div>

              <div className="mb-3 flex items-center justify-between">

                <p className="text-sm font-semibold text-gray-700">
                  Ends in
                </p>

                <span className="text-xs text-gray-400">
                  Limited time
                </span>

              </div>

              <div className="grid grid-cols-3 gap-3">

                <TimerBox
                  label="Hours"
                  value={time.hours}
                />

                <TimerBox
                  label="Min"
                  value={time.minutes}
                />

                <TimerBox
                  label="Sec"
                  value={time.seconds}
                />

              </div>

            </div>

            {/* BUTTON */}

            <Link
              href="/products"
              className="
                mt-5
                flex
                h-11
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-[#0497D8]
                text-sm
                font-semibold
                text-white
                transition-all
                hover:bg-[#0387c2]
                active:scale-[0.98]
              "
            >
              View All Products

              <ArrowRight size={16} />
            </Link>

          </div>
        </Card>

        {/* =====================================================
            PRODUCTS
        ====================================================== */}

        <div className="min-w-0">

          {/* HEADER */}

          <div className="mb-5 flex items-end justify-between">

            <div>

              <div className="flex items-center gap-2">

                <span className="h-2 w-2 rounded-full bg-red-500" />

                <p className="text-sm font-medium text-red-500">
                  Limited prices
                </p>

              </div>

              <h3 className="mt-1 text-2xl font-bold text-gray-900">
                Today&apos;s Deals
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Special offers available right now
              </p>

            </div>

            <Link
              href="/products"
              className="
                hidden
                items-center
                gap-1
                text-sm
                font-medium
                text-[#0497D8]
                transition
                hover:text-[#0387c2]
                sm:flex
              "
            >
              View all

              <ArrowRight size={15} />
            </Link>

          </div>

          {/* =================================================
              LOADING
          ================================================== */}

          {loading ? (

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

              {Array.from({ length: 4 }).map(
                (_, i) => (
                  <div
                    key={i}
                    className="
                      overflow-hidden
                      rounded-2xl
                      border
                      border-gray-100
                      bg-white
                    "
                  >

                    <div className="h-52 animate-pulse bg-gray-100" />

                    <div className="space-y-3 p-4">

                      <div className="h-4 animate-pulse rounded bg-gray-100" />

                      <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />

                      <div className="h-10 animate-pulse rounded-xl bg-gray-100" />

                    </div>

                  </div>
                )
              )}

            </div>

          ) : products.length === 0 ? (

            /* =================================================
               NO SALE PRODUCTS
            ================================================== */

            <div className="
              flex
              min-h-[400px]
              flex-col
              items-center
              justify-center
              rounded-2xl
              border
              border-dashed
              border-gray-200
              bg-gray-50
              px-6
              text-center
            ">

              <div className="
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-full
                bg-white
                shadow-sm
              ">

                <Tag
                  size={22}
                  className="text-gray-400"
                />

              </div>

              <h4 className="mt-4 font-semibold text-gray-900">
                No sale products right now
              </h4>

              <p className="mt-2 max-w-sm text-sm text-gray-500">
                Check back later for new discounts
                and special offers.
              </p>

              <Link
                href="/products"
                className="
                  mt-5
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-[#0497D8]
                  px-5
                  py-2.5
                  text-sm
                  font-medium
                  text-white
                  transition
                  hover:bg-[#0387c2]
                "
              >
                Shop Products

                <ArrowRight size={15} />
              </Link>

            </div>

          ) : (

            /* =================================================
               CAROUSEL
            ================================================== */

            <Carousel
              opts={{
                align: "start",
                loop: products.length > 4,
              }}
              className="w-full"
            >

              <CarouselContent className="-ml-4">

                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}

              </CarouselContent>

              <CarouselPrevious
                className="
                  left-2
                  h-9
                  w-9
                  border
                  bg-white
                  shadow-md
                  transition
                  hover:bg-[#0497D8]
                  hover:text-white
                "
              />

              <CarouselNext
                className="
                  right-2
                  h-9
                  w-9
                  border
                  bg-white
                  shadow-md
                  transition
                  hover:bg-[#0497D8]
                  hover:text-white
                "
              />

            </Carousel>

          )}

        </div>
      </div>
    </section>
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
   * =======================================================
   * WISHLIST
   * =======================================================
   */

  const {
    isInWishlist,
    toggleWishlist,
  } = useWishlist();

  const [added, setAdded] = useState(false);

  const image = product.images?.find(
    (item) => item?.src
  );

  if (!image?.src) return null;

  /* =======================================================
     DISCOUNT
  ======================================================= */

  const regularPrice = Number(
    product.regular_price || 0
  );

  const salePrice = Number(
    product.price || 0
  );

  const discount =
    regularPrice > 0 && salePrice > 0
      ? Math.round(
          ((regularPrice - salePrice) /
            regularPrice) *
            100
        )
      : 0;

  /* =======================================================
     ADD TO CART
  ======================================================= */

  const handleAddToCart = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {

    e.preventDefault();
    e.stopPropagation();

    addToCart(product);

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 1500);
  };

  /* =======================================================
     WISHLIST
  ======================================================= */

  const handleWishlist = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {

    e.preventDefault();
    e.stopPropagation();

    toggleWishlist(product);
  };

  const wishlistActive = isInWishlist(
    product.id
  );

  return (
    <CarouselItem
      className="
        basis-[82%]
        pl-4
        sm:basis-1/2
        lg:basis-1/4
      "
    >

      <Card
        className="
          group
          flex
          h-full
          flex-col
          overflow-hidden
          rounded-2xl
          border
          border-gray-200
          bg-white
          shadow-none
          transition-all
          duration-300
          hover:-translate-y-1
          hover:border-gray-300
          hover:shadow-lg
        "
      >

        {/* =================================================
            PRODUCT LINK
        ================================================== */}

        <Link
          href={`/products/detail/${product.id}`}
          className="block"
        >

          {/* IMAGE */}

          <div className="
            relative
            flex
            h-52
            items-center
            justify-center
            overflow-hidden
            bg-gray-50
          ">

            <Image
              src={image.src}
              alt={product.name}
              width={400}
              height={400}
              className="
                h-full
                w-full
                object-contain
                p-5
                transition-transform
                duration-500
                group-hover:scale-105
              "
            />

            {/* =================================================
                WISHLIST BUTTON
            ================================================== */}

            <button
              type="button"
              onClick={handleWishlist}
              aria-label={
                wishlistActive
                  ? "Remove from wishlist"
                  : "Add to wishlist"
              }
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
                bg-white
                shadow-md
                transition-all
                duration-200
                hover:scale-105
              "
            >

              <Heart
                size={18}
                className={
                  wishlistActive
                    ? "fill-red-500 text-red-500"
                    : "text-gray-500"
                }
              />

            </button>

            {/* SALE BADGE */}

            <div className="absolute left-3 top-3 flex items-center gap-1.5">

              <span className="
                rounded-full
                bg-red-500
                px-2.5
                py-1
                text-[11px]
                font-bold
                text-white
              ">
                SALE
              </span>

              {discount > 0 && (
                <span className="
                  rounded-full
                  bg-white
                  px-2.5
                  py-1
                  text-[11px]
                  font-bold
                  text-red-500
                  shadow-sm
                ">
                  -{discount}%
                </span>
              )}

            </div>

          </div>

          {/* INFO */}

          <CardHeader className="
            space-y-3
            px-4
            pb-3
            pt-4
          ">

            {/* PRODUCT NAME */}

            <CardTitle className="
              line-clamp-2
              min-h-10
              text-sm
              font-medium
              leading-5
              text-gray-900
            ">
              {product.name}
            </CardTitle>

            <CardDescription>

              {/* PRICE */}

              <div className="
                flex
                items-end
                justify-between
                gap-2
              ">

                <div className="flex flex-col">

                  <span className="
                    text-lg
                    font-bold
                    text-gray-900
                  ">
                    {product.price} EGP
                  </span>

                  {product.regular_price && (
                    <span className="
                      text-xs
                      text-gray-400
                      line-through
                    ">
                      {product.regular_price} EGP
                    </span>
                  )}

                </div>

                {discount > 0 && (
                  <span className="
                    mb-1
                    text-xs
                    font-semibold
                    text-red-500
                  ">
                    Save {discount}%
                  </span>
                )}

              </div>

              {/* FEATURES */}

              <div className="mt-4 space-y-2">

                <div className="
                  flex
                  items-center
                  gap-2
                  text-[11px]
                  text-gray-500
                ">

                  <LuShieldCheck
                    size={14}
                    className="shrink-0 text-[#0497D8]"
                  />

                  <span>
                    Secure payment with Paymob
                  </span>

                </div>

                <div className="
                  flex
                  items-center
                  gap-2
                  text-[11px]
                  text-gray-500
                ">

                  <FaShippingFast
                    size={13}
                    className="shrink-0 text-[#0497D8]"
                  />

                  <span>
                    Delivery with Bosta
                  </span>

                </div>

              </div>

            </CardDescription>

          </CardHeader>

        </Link>

        {/* =================================================
            ADD TO CART
        ================================================== */}

        <div className="mt-auto px-4 pb-4">

          <button
            type="button"
            onClick={handleAddToCart}
            className={`
              flex
              h-10
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              text-sm
              font-semibold
              transition-all
              duration-200
              active:scale-[0.98]
              ${
                added
                  ? "bg-green-500 text-white"
                  : "bg-[#0497D8] text-white hover:bg-[#0387c2]"
              }
            `}
          >

            {added ? (
              <>
                <Check size={16} />
                Added to Cart
              </>
            ) : (
              <>
                <ShoppingCart size={16} />
                Add to Cart
              </>
            )}

          </button>

        </div>

      </Card>

    </CarouselItem>
  );
}

/* =========================================================
   TIMER BOX
========================================================= */

function TimerBox({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="
      rounded-xl
      border
      border-gray-100
      bg-gray-50
      p-3
      text-center
      shadow-sm
    ">

      <p className="text-xl font-bold text-gray-900">
        {String(value).padStart(2, "0")}
      </p>

      <span className="text-[11px] font-medium text-gray-500">
        {label}
      </span>

    </div>
  );
}