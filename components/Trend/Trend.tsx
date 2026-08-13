"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

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
} from "@/components/ui/carousel";

import { productApi } from "@/service/product";
import type { ProductI } from "@/interface/product";

import { LuShieldCheck } from "react-icons/lu";
import { FaShippingFast } from "react-icons/fa";
import Link from "next/link";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";

/* =========================================================
   TYPES
========================================================= */

interface CategoryTab {
  value: string;
  label: string;
  categoryId: number;
}

/* =========================================================
   CATEGORIES
========================================================= */

const categories: CategoryTab[] = [
  {
    value: "mobile",
    label: "Mobile",
    categoryId: 134,
  },
  {
    value: "laptops",
    label: "Laptops & PC",
    categoryId: 54,
  },
  {
    value: "home-appliances",
    label: "Home Appliances",
    categoryId: 1843,
  },
  {
    value: "accessories",
    label: "Accessories",
    categoryId: 131,
  },
];

/* =========================================================
   PAGE
========================================================= */

export default function Trend() {
  const [activeCategory, setActiveCategory] = useState(134);

  const [products, setProducts] = useState<ProductI[]>([]);

  const [loading, setLoading] = useState(true);

  /* =======================================================
     GET PRODUCTS
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function getProducts() {
      try {
        setLoading(true);

        /*
         * Get products for the selected category.
         *
         * We request only the first page.
         */
        const result = await productApi(1, {
          category: activeCategory.toString(),
        });

        if (cancelled) return;

        /*
         * Only products that have at least
         * one valid image.
         */
        const productsWithImages = (result.data || [])
          .filter((product: ProductI) =>
            product.images?.some(
              (image) => Boolean(image?.src)
            )
          )
          .slice(0, 12);

        setProducts(productsWithImages);
      } catch (error) {
        console.error(
          "Best Seller products error:",
          error
        );

        if (!cancelled) {
          setProducts([]);
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
  }, [activeCategory]);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <section className="container mx-auto py-10">
      {/* TITLE */}

      <div className="mb-6">
        <h2 className="text-lg font-extrabold">
          Best Seller
        </h2>
      </div>

      {/* TABS */}

      <Tabs
        defaultValue="mobile"
        onValueChange={(value) => {
          const category = categories.find(
            (item) => item.value === value
          );

          if (category) {
            setActiveCategory(category.categoryId);
          }
        }}
      >
        {/* =================================================
            TABS LIST
        ================================================= */}

        <TabsList className="mb-6 gap-2">
          {categories.map((category) => (
            <TabsTrigger
              key={category.value}
              value={category.value}
              className="
                cursor-pointer
                px-4
                py-3
                text-lg
                data-[state=active]:bg-[#0497D8]
                data-[state=active]:text-black/70
              "
            >
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* =================================================
            MOBILE
        ================================================= */}

        <TabsContent value="mobile">
          <ProductCarousel
            products={products}
            loading={loading}
          />
        </TabsContent>

        {/* =================================================
            LAPTOPS
        ================================================= */}

        <TabsContent value="laptops">
          <ProductCarousel
            products={products}
            loading={loading}
          />
        </TabsContent>

        {/* =================================================
            HOME APPLIANCES
        ================================================= */}

        <TabsContent value="home-appliances">
          <ProductCarousel
            products={products}
            loading={loading}
          />
        </TabsContent>

        {/* =================================================
            ACCESSORIES
        ================================================= */}

        <TabsContent value="accessories">
          <ProductCarousel
            products={products}
            loading={loading}
          />
        </TabsContent>
      </Tabs>
    </section>
  );
}

/* =========================================================
   PRODUCT CAROUSEL
========================================================= */

function ProductCarousel({
  products,
  loading,
}: {
  products: ProductI[];
  loading: boolean;
}) {
  const { addToCart } = useCart();

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-xl border"
          >
            <div className="h-64 animate-pulse bg-gray-100" />

            <div className="space-y-3 p-4">
              <div className="h-4 animate-pulse rounded bg-gray-100" />

              <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />

              <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  /* =======================================================
     NO PRODUCTS
  ======================================================= */

  if (products.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed">
        <p className="text-sm text-gray-500">
          No products available
        </p>
      </div>
    );
  }

  /* =======================================================
     CAROUSEL
  ======================================================= */

  return (
    <Carousel
      opts={{
        align: "start",
        loop: products.length > 5,
      }}
      className="w-full"
    >
      <CarouselContent className="-ml-3">
        {products.map((product) => {
          /*
           * Find first valid image.
           */
          const image = product.images?.find(
            (item) => Boolean(item?.src)
          );

          /*
           * Don't render products without images.
           */
          if (!image?.src) {
            return null;
          }

          return (
            <CarouselItem
              key={product.id}
              className="
                basis-1/2
                pl-3
                sm:basis-1/3
                lg:basis-1/5
              "
            >
              <Card
                className="
                  relative
                  mx-auto
                  w-full
                  overflow-hidden
                  pt-0
                  transition
                  duration-200
                  hover:-translate-y-1
                  hover:shadow-lg
                "
              >
                <Link href={"/products/detail/" + product.id}>
                  {/* IMAGE */}

                  <div className="overflow-hidden">
                    <Image
                      src={image.src}
                      alt={image.alt || product.name}
                      width={500}
                      height={500}
                      className="
                        h-75
                        w-full
                        cursor-pointer
                        object-contain
                        p-2
                        transition
                        duration-300
                        hover:scale-105
                      "
                    />
                  </div>

                  {/* INFO */}

                  <CardHeader className="h-35">
                    {/* PRODUCT NAME */}

                    <CardTitle className="line-clamp-2 font-light">
                      {product.name}
                    </CardTitle>

                    <CardDescription>
                      {/* PRICE */}

                      <div className="mt-2 flex items-center justify-between">
                        <p className="font-extrabold text-black">
                          {product.price} EGP
                        </p>

                        {product.on_sale &&
                          product.regular_price && (
                            <p className="text-xs text-gray-400 line-through">
                              {product.regular_price}
                            </p>
                          )}
                      </div>

                      {/* SHIPPING */}

                      <div className="mt-3 h-8 overflow-hidden">
                        <div className="animate-vertical-slide">
                          {/* PAYMOB */}

                          <div className="flex h-8 items-center gap-2 text-xs text-gray-500">
                            <LuShieldCheck className="shrink-0 text-[#0497D8]" />

                            <span>
                              Secure payment with Paymob
                            </span>
                          </div>

                          {/* BOSTA */}

                          <div className="flex h-8 items-center gap-2 text-xs text-gray-500">
                            <FaShippingFast className="shrink-0 text-[#0497D8]" />

                            <span>
                              Track and delivery with Bosta
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardDescription>
                  </CardHeader>
                </Link>

                {/* ADD TO CART */}

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    addToCart(product);
                  }}
                  className="
                    mx-3
                    mb-3
                    flex
                    w-[calc(100%-1.5rem)]
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
                >
                  <ShoppingCart size={16} />

                  Add to Cart
                </button>
              </Card>
            </CarouselItem>
          );
        })}
      </CarouselContent>

      {/* PREVIOUS */}

      <CarouselPrevious
        className="
          cursor-pointer
          p-5
          transition
          duration-200
          hover:bg-[#0497D8]
        "
      />

      {/* NEXT */}

      <CarouselNext
        className="
          cursor-pointer
          p-5
          transition
          duration-200
          hover:bg-[#0497D8]
        "
      />
    </Carousel>
  );
}