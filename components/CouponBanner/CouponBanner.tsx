"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingCart, Tag } from "lucide-react";

interface ProductImage {
  id: number;
  src: string;
  alt: string;
}

interface ProductCategory {
  id: number;
  name: string;
  slug: string;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  regular_price: string;
  sale_price: string;
  images: ProductImage[];
  categories: ProductCategory[];
  stock_status: string;
}

interface ProductsResponse {
  success: boolean;
  products: Product[];
  pagination?: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export default function SaleProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function getProducts() {
      try {
        const response = await fetch(
          `/api/product-coupon?per_page=8`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data: ProductsResponse = await response.json();

        if (!response.ok || !data.success) {
          console.error("Sale Products API Error:", data);

          throw new Error(
            "Failed to fetch sale products"
          );
        }

        if (mounted) {
          setProducts(
            Array.isArray(data.products)
              ? data.products
              : []
          );
        }
      } catch (error) {
        console.error("Sale products error:", error);

        if (mounted) {
          setProducts([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    getProducts();

    return () => {
      mounted = false;
    };
  }, []);

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <section className="w-full px-4 py-6">
        <div className="mx-auto max-w-[1400px]">

          <div className="mb-5">
            <div className="mb-2 h-7 w-52 animate-pulse rounded bg-gray-200" />

            <div className="h-4 w-72 animate-pulse rounded bg-gray-100" />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-[330px] animate-pulse rounded-2xl bg-gray-100"
              />
            ))}
          </div>

        </div>
      </section>
    );
  }

  // =========================
  // NO PRODUCTS
  // =========================

  if (!products.length) {
    return null;
  }

  return (
    <section className="container mx-auto w-full px-4 pb-8">
      <div className="mx-auto max-w-[1400px]">

        {/* =========================
            HEADER
        ========================= */}

        <div className="mb-5 flex items-end justify-between">

          <div>
            <div className="mb-1 flex items-center gap-2">

              <Tag className="size-5 text-[#E53935]" />

              <h2 className="text-xl font-bold text-gray-900">
                Special Offers
              </h2>

            </div>

            <p className="text-sm text-gray-500">
              Discover our latest sale products
            </p>
          </div>

          {/* VIEW ALL */}

          <Link
            href="/products?on_sale=true&stock_status=instock"
            className="
              hidden
              text-sm
              font-medium
              text-[#0497D8]
              transition
              hover:underline
              sm:block
            "
          >
            View All
          </Link>

        </div>

        {/* =========================
            PRODUCTS
        ========================= */}

        <div
          className="
            grid
            grid-cols-2
            gap-3
            sm:grid-cols-3
            md:grid-cols-4
          "
        >
          {products.map((product) => {

            const image = product.images?.[0]?.src;

            const price = Number(product.price);

            const regularPrice = Number(
              product.regular_price
            );

            return (
              <Link
                key={product.id}
                href={`/products/detail/${product.id}`}
                className="
                  group
                  overflow-hidden
                  rounded-2xl
                  border
                  border-gray-100
                  bg-white
                  transition-all
                  duration-200
                  hover:-translate-y-1
                  hover:border-[#0497D8]/30
                  hover:shadow-lg
                "
              >

                {/* =========================
                    IMAGE
                ========================= */}

                <div
                  className="
                    relative
                    flex
                    h-[190px]
                    items-center
                    justify-center
                    bg-gray-50
                    p-4
                  "
                >

                  {/* SALE BADGE */}

                  <div
                    className="
                      absolute
                      left-3
                      top-3
                      z-10
                      flex
                      items-center
                      gap-1
                      rounded-full
                      bg-[#E53935]
                      px-2.5
                      py-1
                      text-[11px]
                      font-bold
                      text-white
                    "
                  >
                    <Tag className="size-3" />

                    SALE
                  </div>

                  {/* IMAGE */}

                  {image ? (
                    <Image
                      src={image}
                      alt={
                        product.images?.[0]?.alt ||
                        product.name
                      }
                      width={220}
                      height={220}
                      className="
                        h-full
                        w-full
                        object-contain
                        transition-transform
                        duration-300
                        group-hover:scale-105
                      "
                    />
                  ) : (
                    <div className="text-sm text-gray-400">
                      No Image
                    </div>
                  )}

                </div>

                {/* =========================
                    INFO
                ========================= */}

                <div className="p-4">

                  {/* NAME */}

                  <h3
                    className="
                      mb-3
                      line-clamp-2
                      min-h-[40px]
                      text-sm
                      font-semibold
                      text-gray-900
                      transition
                      group-hover:text-[#0497D8]
                    "
                  >
                    {product.name}
                  </h3>

                  {/* PRICE */}

                  <div className="mb-3 flex items-center gap-2">

                    <span className="text-xs text-gray-400 line-through">
                      {regularPrice.toFixed(2)} EGP
                    </span>

                    <span className="text-lg font-bold text-[#0497D8]">
                      {price.toFixed(2)} EGP
                    </span>

                  </div>

                  {/* STOCK */}

                  <div className="mb-3 flex items-center gap-1.5">

                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />

                    <span className="text-[11px] font-medium text-gray-500">
                      In Stock
                    </span>

                  </div>

                  {/* BUTTON */}

                  <div
                    className="
                      flex
                      h-9
                      items-center
                      justify-center
                      gap-2
                      rounded-lg
                      bg-[#0497D8]/10
                      text-xs
                      font-semibold
                      text-[#0497D8]
                      transition
                      group-hover:bg-[#0497D8]
                      group-hover:text-white
                    "
                  >
                    <ShoppingCart className="size-4" />

                    Shop Now
                  </div>

                </div>

              </Link>
            );
          })}
        </div>

        {/* =========================
            MOBILE VIEW ALL
        ========================= */}

        <Link
          href="/products?on_sale=true&stock_status=instock"
          className="
            mt-5
            block
            text-center
            text-sm
            font-medium
            text-[#0497D8]
            sm:hidden
          "
        >
          View All Offers →
        </Link>

      </div>
    </section>
  );
}