"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  ShoppingBag,
  Trash2,
  ShoppingCart,
} from "lucide-react";

import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

import type { ProductI } from "@/interface/product";

/* =========================================================
   PAGE
========================================================= */

export default function WishlistPage() {
  const {
    wishlist,
    removeFromWishlist,
    clearWishlist,
  } = useWishlist();

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-sm text-gray-500">
              Your Favorites
            </p>

            <div className="flex items-center gap-3">
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  bg-red-50
                "
              >
                <Heart
                  size={20}
                  className="fill-[#E53935] text-[#E53935]"
                />
              </div>

              <h1
                className="
                  text-2xl
                  font-semibold
                  text-gray-900
                  sm:text-3xl
                "
              >
                My Wishlist
              </h1>
            </div>

            {wishlist.length > 0 && (
              <p className="mt-2 text-sm text-gray-500">
                {wishlist.length}{" "}
                {wishlist.length === 1
                  ? "product"
                  : "products"}{" "}
                saved
              </p>
            )}
          </div>

          {/* =================================================
              CLEAR ALL
          ================================================= */}

          {wishlist.length > 0 && (
            <button
              type="button"
              onClick={clearWishlist}
              className="
                hidden
                items-center
                gap-2
                rounded-lg
                border
                px-4
                py-2
                text-sm
                font-medium
                text-gray-600
                transition
                hover:border-red-200
                hover:bg-red-50
                hover:text-[#E53935]
                sm:flex
              "
            >
              <Trash2 size={16} />

              Clear all
            </button>
          )}
        </div>

        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {wishlist.length === 0 ? (
          <EmptyWishlist />
        ) : (
          <>
            {/* =================================================
                MOBILE CLEAR
            ================================================= */}

            <div className="mb-5 flex justify-end sm:hidden">
              <button
                type="button"
                onClick={clearWishlist}
                className="
                  flex
                  items-center
                  gap-2
                  rounded-lg
                  border
                  px-3
                  py-2
                  text-xs
                  font-medium
                  text-gray-600
                  transition
                  hover:border-red-200
                  hover:bg-red-50
                  hover:text-[#E53935]
                "
              >
                <Trash2 size={14} />

                Clear all
              </button>
            </div>

            {/* =================================================
                PRODUCT GRID
            ================================================= */}

            <div
              className="
                grid
                grid-cols-2
                gap-4
                sm:grid-cols-3
                lg:grid-cols-4
              "
            >
              {wishlist.map((product) => (
                <WishlistCard
                  key={product.id}
                  product={product}
                  onRemove={() =>
                    removeFromWishlist(product.id)
                  }
                />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

/* =========================================================
   WISHLIST CARD
========================================================= */

function WishlistCard({
  product,
  onRemove,
}: {
  product: ProductI;
  onRemove: () => void;
}) {
  /* =======================================================
     CART
  ======================================================= */

  const { addToCart } = useCart();

  /* =======================================================
     PRODUCT IMAGE
  ======================================================= */

  const image = product.images?.find(
    (image) => image?.src
  );

  /* =======================================================
     ADD TO CART
  ======================================================= */

  const handleAddToCart = () => {
    addToCart(product);
  };

  return (
    <div
      className="
        group
        relative
        overflow-hidden
        rounded-xl
        border
        bg-white
        transition
        duration-200
        hover:-translate-y-1
        hover:shadow-lg
      "
    >
      {/* =================================================
          REMOVE FROM WISHLIST
      ================================================= */}

      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${product.name} from wishlist`}
        className="
          absolute
          right-3
          top-3
          z-30
          flex
          h-9
          w-9
          items-center
          justify-center
          rounded-full
          border
          border-gray-100
          bg-white/95
          text-[#E53935]
          shadow-sm
          backdrop-blur-sm
          transition
          hover:bg-red-50
          active:scale-95
        "
      >
        <Heart
          size={17}
          className="fill-[#E53935]"
        />
      </button>

      {/* =================================================
          PRODUCT LINK
      ================================================= */}

      <Link
        href={`/products/detail/${product.id}`}
        className="block"
      >
        {/* =================================================
            IMAGE
        ================================================= */}

        <div
          className="
            relative
            aspect-square
            overflow-hidden
            bg-gray-50
          "
        >
          {image?.src ? (
            <Image
              src={image.src}
              alt={
                image.alt ||
                product.name
              }
              fill
              sizes="
                (max-width: 640px) 50vw,
                (max-width: 1024px) 33vw,
                25vw
              "
              className="
                object-contain
                p-4
                transition
                duration-300
                group-hover:scale-105
              "
            />
          ) : (
            <div
              className="
                flex
                h-full
                items-center
                justify-center
                text-sm
                text-gray-400
              "
            >
              No image
            </div>
          )}
        </div>

        {/* =================================================
            PRODUCT INFO
        ================================================= */}

        <div className="p-4">
          <h2
            className="
              line-clamp-2
              min-h-[40px]
              text-sm
              font-medium
              text-gray-900
            "
          >
            {product.name}
          </h2>

          {/* =================================================
              PRICE
          ================================================= */}

          <div className="mt-3 flex items-center gap-2">
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
                  {product.regular_price} EGP
                </span>
              )}
          </div>

          {/* =================================================
              STOCK
          ================================================= */}

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
        </div>
      </Link>

      {/* =================================================
          ADD TO CART
      ================================================= */}

      <button
        type="button"
        onClick={handleAddToCart}
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
      >
        <ShoppingCart size={17} />

        Add to Cart
      </button>
    </div>
  );
}

/* =========================================================
   EMPTY WISHLIST
========================================================= */

function EmptyWishlist() {
  return (
    <div
      className="
        flex
        min-h-[500px]
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
      {/* =================================================
          ICON
      ================================================= */}

      <div
        className="
          mb-5
          flex
          h-20
          w-20
          items-center
          justify-center
          rounded-full
          bg-red-50
        "
      >
        <Heart
          size={34}
          className="text-[#E53935]"
        />
      </div>

      {/* =================================================
          TITLE
      ================================================= */}

      <h2
        className="
          text-xl
          font-semibold
          text-gray-900
        "
      >
        Your wishlist is empty
      </h2>

      {/* =================================================
          DESCRIPTION
      ================================================= */}

      <p
        className="
          mt-2
          max-w-md
          text-sm
          leading-6
          text-gray-500
        "
      >
        Save products you love to your
        wishlist and come back to them
        whenever you want.
      </p>

      {/* =================================================
          CTA
      ================================================= */}

      <Link
        href="/products"
        className="
          mt-6
          flex
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
          active:scale-[0.98]
        "
      >
        <ShoppingBag size={17} />

        Continue Shopping
      </Link>
    </div>
  );
}