"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  ArrowLeft,
  Lock,
} from "lucide-react";

import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const router = useRouter();

  const {
    cart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
  } = useCart();

  /*
   * =========================================================
   * CART
   * =========================================================
   *
   * CartContext هو المصدر الوحيد للـ cart.
   *
   * لا نقرأ localStorage هنا.
   */

  const cartItems = Array.isArray(cart) ? cart : [];

  /*
   * =========================================================
   * TOTAL ITEMS
   * =========================================================
   */

  const totalItems = cartItems.reduce(
    (total, item) =>
      total + Number(item.quantity || 0),
    0
  );

  /*
   * =========================================================
   * SUBTOTAL
   * =========================================================
   */

  const subtotal = cartItems.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) *
        Number(item.quantity || 0),
    0
  );

  /*
   * =========================================================
   * CHECKOUT
   * =========================================================
   */

  const handleCheckout = () => {
    router.push("/checkout");
  };

  /*
   * =========================================================
   * EMPTY CART
   * =========================================================
   */

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto flex max-w-xl flex-col items-center justify-center text-center">

            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
              <ShoppingCart
                size={34}
                className="text-gray-400"
              />
            </div>

            <h1 className="text-2xl font-semibold text-gray-900">
              Your cart is empty
            </h1>

            <p className="mt-3 text-sm text-gray-500">
              You haven't added any products to your cart yet.
            </p>

            <Link
              href="/products"
              className="
                mt-7
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-[#0497D8]
                px-6
                py-3
                text-sm
                font-medium
                text-white
                transition
                hover:bg-[#0387c2]
              "
            >
              <ArrowLeft size={17} />
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 sm:py-10">

        {/* HEADER */}

        <div className="mb-8">
          <p className="mb-2 text-sm text-gray-500">
            Shopping Cart
          </p>

          <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
            Your Cart
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {totalItems}{" "}
            {totalItems === 1 ? "item" : "items"}{" "}
            in your cart
          </p>
        </div>

        {/* MAIN */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">

          {/* PRODUCTS */}

          <section className="space-y-4">

            {cartItems.map((item) => {
              const itemTotal =
                Number(item.price || 0) *
                Number(item.quantity || 0);

              const imageSrc =
                item.image ||
                item.images?.[0]?.src ||
                "";

              return (
                <div
                  key={item.id}
                  className="
                    rounded-2xl
                    border
                    border-gray-100
                    bg-white
                    p-4
                    shadow-sm
                    sm:p-5
                  "
                >
                  <div className="flex gap-4">

                    {/* IMAGE */}

                    <Link
                      href={`/products/detail/${item.productId}`}
                      className="
                        relative
                        h-24
                        w-24
                        shrink-0
                        overflow-hidden
                        rounded-xl
                        bg-gray-50
                        sm:h-32
                        sm:w-32
                      "
                    >
                      {imageSrc ? (
                        <Image
                          src={imageSrc}
                          alt={item.name || "Product"}
                          fill
                          sizes="
                            (max-width: 640px) 96px,
                            128px
                          "
                          className="object-contain p-2"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ShoppingCart
                            size={28}
                            className="text-gray-300"
                          />
                        </div>
                      )}
                    </Link>

                    {/* INFO */}

                    <div className="min-w-0 flex-1">

                      {/* NAME + REMOVE */}

                      <div className="flex items-start justify-between gap-3">

                        <Link
                          href={`/products/detail/${item.productId}`}
                          className="
                            line-clamp-2
                            text-sm
                            font-medium
                            text-gray-900
                            transition
                            hover:text-[#0497D8]
                            sm:text-base
                          "
                        >
                          {item.name}
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            removeFromCart(item.id)
                          }
                          className="
                            shrink-0
                            rounded-lg
                            p-2
                            text-gray-400
                            transition
                            hover:bg-red-50
                            hover:text-red-500
                          "
                          aria-label="Remove product"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>

                      {/* PRICE */}

                      <p className="mt-2 text-sm font-semibold text-gray-900">
                        {Number(
                          item.price || 0
                        ).toLocaleString()}{" "}
                        EGP
                      </p>

                      {/* QUANTITY */}

                      <div className="mt-4 flex items-center justify-between">

                        <div
                          className="
                            flex
                            h-9
                            items-center
                            rounded-lg
                            border
                            border-gray-200
                            bg-white
                          "
                        >

                          {/* MINUS */}

                          <button
                            type="button"
                            onClick={() =>
                              decreaseQuantity(item.id)
                            }
                            disabled={item.quantity <= 1}
                            className="
                              flex
                              h-full
                              w-9
                              items-center
                              justify-center
                              text-gray-500
                              transition
                              hover:bg-gray-100
                              disabled:cursor-not-allowed
                              disabled:opacity-40
                            "
                            aria-label="Decrease quantity"
                          >
                            <Minus size={15} />
                          </button>

                          {/* QUANTITY */}

                          <span className="w-8 text-center text-sm font-medium text-gray-900">
                            {item.quantity}
                          </span>

                          {/* PLUS */}

                          <button
                            type="button"
                            onClick={() =>
                              increaseQuantity(item.id)
                            }
                            className="
                              flex
                              h-full
                              w-9
                              items-center
                              justify-center
                              text-gray-500
                              transition
                              hover:bg-gray-100
                            "
                            aria-label="Increase quantity"
                          >
                            <Plus size={15} />
                          </button>

                        </div>

                        {/* ITEM TOTAL */}

                        <p className="text-sm font-bold text-gray-900">
                          {itemTotal.toLocaleString()} EGP
                        </p>

                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* CONTINUE SHOPPING */}

            <Link
              href="/products"
              className="
                inline-flex
                items-center
                gap-2
                pt-2
                text-sm
                font-medium
                text-[#0497D8]
                transition
                hover:text-[#0387c2]
              "
            >
              <ArrowLeft size={16} />
              Continue Shopping
            </Link>
          </section>

          {/* ORDER SUMMARY */}

          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div
              className="
                rounded-2xl
                border
                border-gray-100
                bg-white
                p-5
                shadow-sm
                sm:p-6
              "
            >

              <h2 className="text-lg font-semibold text-gray-900">
                Order Summary
              </h2>

              <div className="mt-6 space-y-4">

                {/* ITEMS */}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    Items
                  </span>

                  <span className="font-medium text-gray-900">
                    {totalItems}
                  </span>
                </div>

                {/* SUBTOTAL */}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    Subtotal
                  </span>

                  <span className="font-medium text-gray-900">
                    {subtotal.toLocaleString()} EGP
                  </span>
                </div>

                {/* TOTAL */}

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">

                    <span className="font-semibold text-gray-900">
                      Total
                    </span>

                    <span className="text-xl font-bold text-[#0497D8]">
                      {subtotal.toLocaleString()} EGP
                    </span>

                  </div>
                </div>

              </div>

              {/* CHECKOUT */}

              <button
                type="button"
                onClick={handleCheckout}
                className="
                  mt-6
                  flex
                  h-12
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-[#0497D8]
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-[#0387c2]
                  active:scale-[0.99]
                "
              >
                <Lock size={17} />
                Checkout
              </button>

              {/* PAYMENT INFO */}

              <div className="mt-5 border-t pt-5">
                <div className="flex items-center gap-3">

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                    <Lock
                      size={15}
                      className="text-[#0497D8]"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-900">
                      Secure Checkout
                    </p>

                    <p className="text-[11px] text-gray-500">
                      Your payment is secure
                    </p>
                  </div>

                </div>
              </div>

            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}