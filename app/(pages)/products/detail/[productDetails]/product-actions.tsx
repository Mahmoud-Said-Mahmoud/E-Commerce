"use client";

import { useEffect, useState } from "react";
import {
  Heart,
  MinusIcon,
  PlusIcon,
  ShoppingCart,
  Star,
  Truck,
  ShieldCheck,
  PackageCheck,
  StoreIcon,
} from "lucide-react";

import { IoWallet } from "react-icons/io5";
import { FaCheck } from "react-icons/fa";

import { Button } from "@/components/ui/button";

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

/* =========================================================
   TYPES
========================================================= */

type ProductAttribute = {
  id: number;
  name: string;
  options: string[];
  variation?: boolean;
};

type VariationAttribute = {
  id: number;
  name: string;
  option: string;
};

type ProductVariation = {
  id: number;
  price: string;
  regular_price: string;
  sale_price: string;
  stock_status: "instock" | "outofstock" | "onbackorder";
  image?: {
    id: number;
    src: string;
    alt: string;
  };
  attributes: VariationAttribute[];
};

type Product = {
  id: number;
  name: string;
  price: string;
  regular_price?: string;
  sale_price?: string;

  sku?: string;

  type?: string;

  stock_status:
    | "instock"
    | "outofstock"
    | "onbackorder";

  on_sale?: boolean;

  images?: {
    id: number;
    src: string;
    alt?: string;
  }[];

  attributes?: ProductAttribute[];

  description?: string;
  short_description?: string;
};

type Props = {
  product: Product;

  variations?: ProductVariation[];

  initialRating: number;
  reviewCount: number;
};

/* =========================================================
   COMPONENT
========================================================= */

export default function ProductActions({
  product,
  variations = [],
  initialRating,
  reviewCount,
}: Props) {
  /* =====================================================
     STATE
  ===================================================== */

  const [quantity, setQuantity] = useState(1);

  const [wishlist, setWishlist] = useState(false);

  const [selectedOptions, setSelectedOptions] =
    useState<Record<string, string>>({});

  const [selectedVariation, setSelectedVariation] =
    useState<ProductVariation | null>(null);

  const [userRating, setUserRating] = useState(0);

  const [review, setReview] = useState("");

  const [submittingReview, setSubmittingReview] =
    useState(false);

  const [reviewMessage, setReviewMessage] =
    useState("");

  const [activeTab, setActiveTab] =
    useState<"reviews" | "services">("reviews");

  /* =====================================================
     WISHLIST
  ===================================================== */

  useEffect(() => {
    const savedWishlist = JSON.parse(
      localStorage.getItem("wishlist") || "[]"
    );

    setWishlist(savedWishlist.includes(product.id));
  }, [product.id]);

  function toggleWishlist() {
    const savedWishlist: number[] = JSON.parse(
      localStorage.getItem("wishlist") || "[]"
    );

    let updatedWishlist: number[];

    if (savedWishlist.includes(product.id)) {
      updatedWishlist = savedWishlist.filter(
        (id) => id !== product.id
      );

      setWishlist(false);
    } else {
      updatedWishlist = [
        ...savedWishlist,
        product.id,
      ];

      setWishlist(true);
    }

    localStorage.setItem(
      "wishlist",
      JSON.stringify(updatedWishlist)
    );

    window.dispatchEvent(
      new Event("wishlistUpdated")
    );
  }

  /* =====================================================
     VARIATION ATTRIBUTES
  ===================================================== */

  const variationAttributes =
    product.attributes?.filter(
      (attribute) =>
        attribute.variation !== false &&
        attribute.options?.length
    ) || [];

  /* =====================================================
     SELECT OPTION
  ===================================================== */

  function selectOption(
    attributeName: string,
    option: string
  ) {
    setSelectedOptions((previous) => ({
      ...previous,
      [attributeName]: option,
    }));
  }

  /* =====================================================
     FIND SELECTED VARIATION
  ===================================================== */

  useEffect(() => {
    if (!variations.length) {
      setSelectedVariation(null);
      return;
    }

    const allSelected =
      variationAttributes.every(
        (attribute) =>
          selectedOptions[attribute.name]
      );

    if (!allSelected) {
      setSelectedVariation(null);
      return;
    }

    const variation = variations.find(
      (variation) => {
        return variation.attributes.every(
          (attribute) => {
            const selected =
              selectedOptions[attribute.name];

            /*
             * WooCommerce:
             * empty option = any value
             */

            if (!attribute.option) {
              return true;
            }

            return (
              selected?.toLowerCase() ===
              attribute.option.toLowerCase()
            );
          }
        );
      }
    );

    setSelectedVariation(
      variation || null
    );
  }, [
    selectedOptions,
    variations,
    variationAttributes,
  ]);

  /* =====================================================
     CURRENT DATA
  ===================================================== */

  const currentPrice =
    selectedVariation?.price ||
    product.price;

  const currentImage =
    selectedVariation?.image?.src ||
    product.images?.[0]?.src ||
    "/placeholder-product.png";

  const currentStock =
    selectedVariation?.stock_status ||
    product.stock_status;

  const isInStock =
    currentStock === "instock";

  const isVariable =
    product.type === "variable" &&
    variations.length > 0;

  /* =====================================================
     ADD TO CART
  ===================================================== */

  function addToCart() {
    if (!isInStock) {
      return;
    }

    /*
     * Variable product
     */

    if (
      isVariable &&
      !selectedVariation
    ) {
      alert(
        "Please select all product options."
      );

      return;
    }

    const cartItem = {
      productId: product.id,

      variationId:
        selectedVariation?.id || null,

      name: product.name,

      price: currentPrice,

      image: currentImage,

      quantity,

      attributes: selectedOptions,
    };

    const currentCart = JSON.parse(
      localStorage.getItem("cart") || "[]"
    );

    const existingIndex =
      currentCart.findIndex(
        (item: any) =>
          item.productId === product.id &&
          item.variationId ===
            cartItem.variationId
      );

    if (existingIndex !== -1) {
      currentCart[existingIndex].quantity +=
        quantity;
    } else {
      currentCart.push(cartItem);
    }

    localStorage.setItem(
      "cart",
      JSON.stringify(currentCart)
    );

    window.dispatchEvent(
      new Event("cartUpdated")
    );
  }

  /* =====================================================
     SUBMIT REVIEW
  ===================================================== */

  async function submitReview() {
    if (!userRating) {
      setReviewMessage(
        "Please select a rating."
      );

      return;
    }

    if (!review.trim()) {
      setReviewMessage(
        "Please write your review."
      );

      return;
    }

    setSubmittingReview(true);
    setReviewMessage("");

    try {
      const response = await fetch(
        "/api/reviews",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            productId: product.id,
            rating: userRating,
            review: review.trim(),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to submit review"
        );
      }

      setReview("");
      setUserRating(0);

      setReviewMessage(
        "Your review has been submitted successfully."
      );
    } catch (error) {
      setReviewMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setSubmittingReview(false);
    }
  }

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="space-y-5">

      {/* =================================================
          PRODUCT OPTIONS
      ================================================= */}

      {variationAttributes.length > 0 && (
        <div className="rounded-2xl border bg-white p-5">
          <div className="mb-5">
            <h3 className="text-lg font-bold">
              Choose Options
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Select the options you want
            </p>
          </div>

          <div className="space-y-5">
            {variationAttributes.map(
              (attribute) => (
                <div
                  key={attribute.id}
                  className="space-y-2"
                >
                  <p className="text-sm font-semibold">
                    {attribute.name}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {attribute.options.map(
                      (option) => {
                        const selected =
                          selectedOptions[
                            attribute.name
                          ] === option;

                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() =>
                              selectOption(
                                attribute.name,
                                option
                              )
                            }
                            className={`
                              rounded-xl
                              border
                              px-4
                              py-2
                              text-sm
                              font-medium
                              transition

                              ${
                                selected
                                  ? `
                                    border-[#0497D8]
                                    bg-[#0497D8]
                                    text-white
                                  `
                                  : `
                                    bg-white
                                    hover:border-[#0497D8]
                                    hover:bg-[#0497D8]/5
                                    hover:text-[#0497D8]
                                  `
                              }
                            `}
                          >
                            {option}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              )
            )}
          </div>

          {/* SELECTED VARIATION */}

          {isVariable && (
            <div
              className={`
                mt-5
                rounded-xl
                border
                p-3
                text-sm

                ${
                  selectedVariation
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-yellow-200 bg-yellow-50 text-yellow-700"
                }
              `}
            >
              {selectedVariation ? (
                <div className="flex items-center gap-2">
                  <span>
                    <FaCheck size={11} />
                  </span>

                  <span>
                    Variation selected
                  </span>

                  <span className="font-semibold">
                    #{selectedVariation.id}
                  </span>
                </div>
              ) : (
                "Please select all options."
              )}
            </div>
          )}
        </div>
      )}

      {/* =================================================
          PURCHASE
      ================================================= */}

      <div className="rounded-2xl border bg-white p-5">

  

        {/* QUANTITY */}

        <div className="mb-5">
          <p className="mb-2 text-sm font-bold">
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
              disabled={quantity <= 1}
              onClick={() =>
                setQuantity(
                  Math.max(
                    1,
                    quantity - 1
                  )
                )
              }
              className="rounded-xl"
            >
              <MinusIcon size={17} />
            </Button>

            <span className="min-w-10 text-center font-semibold">
              {quantity}
            </span>

            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setQuantity(
                  quantity + 1
                )
              }
              className="rounded-xl"
            >
              <PlusIcon size={17} />
            </Button>
          </div>
        </div>

        {/* ACTIONS */}

        <div className="flex gap-3">

          <Button
            disabled={
              !isInStock ||
              (isVariable &&
                !selectedVariation)
            }
            onClick={addToCart}
            className="
              h-12
              flex-1
              rounded-xl
              bg-[#0497D8]
              text-white
              transition
              hover:bg-[#0389c4]
            "
          >
            <ShoppingCart size={19} />

            {!isInStock
              ? "Out of Stock"
              : isVariable &&
                  !selectedVariation
              ? "Select Options"
              : "Add to Cart"}
          </Button>

          {/* WISHLIST */}

          <Button
            variant="outline"
            size="icon"
            onClick={toggleWishlist}
            className={`
              h-12
              w-12
              shrink-0
              rounded-xl
              transition

              ${
                wishlist
                  ? `
                    border-red-300
                    bg-red-50
                    text-red-500
                  `
                  : `
                    hover:border-red-300
                    hover:bg-red-50
                    hover:text-red-500
                  `
              }
            `}
          >
            <Heart
              size={20}
              className={
                wishlist
                  ? "fill-red-500"
                  : ""
              }
            />
          </Button>
        </div>
      </div>

      {/* =================================================
          EXTRA ACTIONS
      ================================================= */}

      <div className="flex flex-wrap gap-3">

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
                      <TableRow
                        key={months}
                      >
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

      {/* =================================================
          TABS
      ================================================= */}

      <div className="overflow-hidden rounded-2xl border bg-white">

        {/* TAB HEADER */}

        <div className="flex border-b">

          <button
            type="button"
            onClick={() =>
              setActiveTab("reviews")
            }
            className={`
              flex-1
              px-5
              py-4
              text-sm
              font-semibold
              transition

              ${
                activeTab === "reviews"
                  ? `
                    border-b-2
                    border-[#0497D8]
                    text-[#0497D8]
                  `
                  : `
                    text-gray-500
                    hover:text-gray-900
                  `
              }
            `}
          >
            Reviews

            <span className="ml-2 text-xs text-gray-400">
              ({reviewCount})
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveTab("services")
            }
            className={`
              flex-1
              px-5
              py-4
              text-sm
              font-semibold
              transition

              ${
                activeTab === "services"
                  ? `
                    border-b-2
                    border-[#0497D8]
                    text-[#0497D8]
                  `
                  : `
                    text-gray-500
                    hover:text-gray-900
                  `
              }
            `}
          >
            Services
          </button>

        </div>

        {/* =================================================
            REVIEWS TAB
        ================================================= */}

        {activeTab === "reviews" && (
          <div className="p-5">

            {/* RATING SUMMARY */}

            <div className="rounded-2xl bg-gray-50 p-5">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

                <div>
                  <p className="text-4xl font-extrabold">
                    {initialRating > 0
                      ? initialRating.toFixed(1)
                      : "0.0"}
                  </p>

                  <div className="mt-1 flex gap-1">
                    {[1, 2, 3, 4, 5].map(
                      (star) => (
                        <Star
                          key={star}
                          size={17}
                          className={
                            star <= initialRating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }
                        />
                      )
                    )}
                  </div>

                  <p className="mt-1 text-xs text-gray-500">
                    {reviewCount} reviews
                  </p>
                </div>

                <div className="h-px flex-1 bg-gray-200 sm:h-12 sm:w-px" />

                <div>
                  <p className="text-sm font-semibold">
                    Customer Reviews
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Share your experience with
                    other customers.
                  </p>
                </div>

              </div>

            </div>

            {/* WRITE REVIEW */}

            <div className="mt-6">

              <h3 className="text-lg font-bold">
                Write a Review
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                How was your experience with
                this product?
              </p>

              {/* USER RATING */}

              <div className="mt-4">

                <p className="mb-2 text-sm font-semibold">
                  Your Rating
                </p>

                <div className="flex gap-1">

                  {[1, 2, 3, 4, 5].map(
                    (star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          setUserRating(star)
                        }
                        className="
                          transition
                          hover:scale-110
                        "
                      >
                        <Star
                          size={27}
                          className={
                            star <= userRating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }
                        />
                      </button>
                    )
                  )}

                </div>

              </div>

              {/* REVIEW TEXT */}

              <textarea
                value={review}
                onChange={(event) =>
                  setReview(
                    event.target.value
                  )
                }
                placeholder="Write your review..."
                rows={4}
                className="
                  mt-4
                  w-full
                  resize-none
                  rounded-xl
                  border
                  p-3
                  text-sm
                  outline-none
                  transition
                  focus:border-[#0497D8]
                  focus:ring-2
                  focus:ring-[#0497D8]/10
                "
              />

              {/* SUBMIT */}

              <Button
                onClick={submitReview}
                disabled={submittingReview}
                className="
                  mt-3
                  rounded-xl
                  bg-[#0497D8]
                  px-6
                  hover:bg-[#0389c4]
                "
              >
                {submittingReview
                  ? "Submitting..."
                  : "Submit Review"}
              </Button>

              {reviewMessage && (
                <p className="mt-3 text-sm text-gray-500">
                  {reviewMessage}
                </p>
              )}

            </div>
          </div>
        )}

        {/* =================================================
            SERVICES TAB
        ================================================= */}

        {activeTab === "services" && (
          <div className="grid gap-5 p-5 sm:grid-cols-3">

            <Service
              icon={<Truck size={19} />}
              title="Fast Delivery"
              description="Across Egypt"
            />

            <Service
              icon={<ShieldCheck size={19} />}
              title="Secure Payment"
              description="Paymob supported"
            />

            <Service
              icon={<PackageCheck size={19} />}
              title="Easy Tracking"
              description="Track with Bosta"
            />

          </div>
        )}

      </div>
    </div>
  );
}

/* =========================================================
   SERVICE
========================================================= */

function Service({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-3
        rounded-xl
        border
        p-4
      "
    >
      <div
        className="
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-[#0497D8]/10
          text-[#0497D8]
        "
      >
        {icon}
      </div>

      <div>
        <p className="text-sm font-bold">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-gray-500">
          {description}
        </p>
      </div>
    </div>
  );
}