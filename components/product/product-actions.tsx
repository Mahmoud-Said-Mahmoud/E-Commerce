"use client";

import * as React from "react";
import {
  Check,
  Minus,
  Plus,
  ShoppingCart,
  Zap,
} from "lucide-react";
import { useCart } from "@/context/CartContext";

/* =========================================================
   TYPES
========================================================= */

type ProductAttribute = {
  id?: number;
  name: string;
  slug?: string;
  options?: string[];
  variation?: boolean;
  visible?: boolean;
};

type VariationAttribute = {
  id?: number;
  name?: string;
  slug?: string;
  option?: string;
};

type ProductVariation = {
  id: number;
  attributes?: VariationAttribute[];
  price?: string;
  regular_price?: string;
  sale_price?: string;
  stock_status?: string;
  stock_quantity?: number | null;
};

type ProductActionProduct = {
  id: number;
  name: string;
  type?: string;
  price?: string;
  stock_status?: string;
  stock_quantity?: number | null;
  image?: string;
  images?: {
    id?: number;
    src?: string;
    alt?: string;
  }[];
  attributes?: ProductAttribute[];
};

type ProductActionsProps = {
  product: ProductActionProduct;
  variations?: ProductVariation[];
  disabled?: boolean;
};

/* =========================================================
   HELPERS
========================================================= */

function normalizeAttributeName(value?: string) {
  return (value || "")
    .trim()
    .toLowerCase()
    .replace(/^attribute_/i, "")
    .replace(/^pa_/i, "")
    .replace(/[-_]/g, " ");
}

function getAttributeKey(attribute: {
  name?: string;
  slug?: string;
}) {
  return normalizeAttributeName(
    attribute.name || attribute.slug
  );
}

function formatAttributeValue(value: string) {
  return value
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

/* =========================================================
   COMPONENT
========================================================= */

export default function ProductActions({
  product,
  variations = [],
  disabled = false,
}: ProductActionsProps) {
  /* =======================================================
     STATE
  ======================================================= */

  const [quantity, setQuantity] =
    React.useState(1);

  const [
    selectedAttributes,
    setSelectedAttributes,
  ] = React.useState<Record<string, string>>(
    {}
  );

  const [adding, setAdding] =
    React.useState(false);

  const [added, setAdded] =
    React.useState(false);

  const [message, setMessage] =
    React.useState("");

  const { cart, addToCart: addCartItem } = useCart();

  /* =======================================================
     PRODUCT TYPE
  ======================================================= */

  const isVariable =
    product.type === "variable" ||
    variations.length > 0;

  /* =======================================================
     PRODUCT IMAGE
  ======================================================= */

  const productImage =
    product.image ||
    product.images?.[0]?.src ||
    "";

  /* =======================================================
     BUILD AVAILABLE ATTRIBUTES FROM VARIATIONS
  ======================================================= */

  const variationAttributes =
    React.useMemo(() => {
      const map = new Map<
        string,
        {
          name: string;
          slug: string;
          options: Set<string>;
        }
      >();

      variations.forEach((variation) => {
        variation.attributes?.forEach(
          (attribute) => {
            const key =
              getAttributeKey(attribute);

            if (
              !key ||
              !attribute.option
            ) {
              return;
            }

            if (!map.has(key)) {
              map.set(key, {
                name:
                  attribute.name ||
                  formatAttributeValue(
                    key
                  ),
                slug:
                  attribute.slug || key,
                options: new Set<string>(),
              });
            }

            map
              .get(key)!
              .options.add(
                attribute.option
              );
          }
        );
      });

      return Array.from(map.values()).map(
        (attribute) => ({
          ...attribute,
          options: Array.from(
            attribute.options
          ),
        })
      );
    }, [variations]);

  /* =======================================================
     FALLBACK PRODUCT ATTRIBUTES
  ======================================================= */

  const productAttributes =
    React.useMemo(() => {
      if (
        variationAttributes.length > 0
      ) {
        return variationAttributes;
      }

      return (
        product.attributes
          ?.filter(
            (attribute) =>
              attribute.visible !== false &&
              attribute.options &&
              attribute.options.length > 0
          )
          .map((attribute) => ({
            name: attribute.name,
            slug:
              attribute.slug ||
              attribute.name,
            options:
              attribute.options || [],
          })) || []
      );
    }, [
      product.attributes,
      variationAttributes,
    ]);

  /* =======================================================
     FIND SELECTED VARIATION
  ======================================================= */

  const selectedVariation =
    React.useMemo(() => {
      if (
        !isVariable ||
        variations.length === 0
      ) {
        return undefined;
      }

      return variations.find(
        (variation) => {
          return variation.attributes?.every(
            (attribute) => {
              const key =
                getAttributeKey(attribute);

              const selected =
                selectedAttributes[key];

              /*
               * Empty variation attributes mean
               * WooCommerce allows any value.
               */
              if (!attribute.option) {
                return true;
              }

              return (
                selected &&
                normalizeAttributeName(
                  selected
                ) ===
                  normalizeAttributeName(
                    attribute.option
                  )
              );
            }
          );
        }
      );
    }, [
      isVariable,
      variations,
      selectedAttributes,
    ]);

  /* =======================================================
     REQUIRED ATTRIBUTES
  ======================================================= */

  const requiredAttributes =
    variationAttributes.length > 0
      ? variationAttributes
      : [];

  const missingAttributes =
    requiredAttributes.filter(
      (attribute) =>
        !selectedAttributes[
          getAttributeKey(attribute)
        ]
    );

  /* =======================================================
     CART ID
  ======================================================= */

  const variationId =
    selectedVariation?.id;

  /* =======================================================
     CURRENT CART QUANTITY
  ======================================================= */

  const currentCartQuantity =
    cart.find((item) =>
      String(item.productId ?? item.id) === String(product.id) &&
      String(item.variation_id ?? item.variationId ?? "") === String(variationId ?? "")
    )?.quantity || 0;

  /* =======================================================
     AVAILABLE STOCK
  ======================================================= */

  /*
   * For variable products:
   * use the selected variation stock.
   *
   * For simple products:
   * use product stock.
   */

  const availableStock =
    selectedVariation?.stock_quantity ??
    product.stock_quantity ??
    null;

  /*
   * WooCommerce may return null when
   * stock management is not enabled.
   *
   * In that case we don't create
   * an artificial maximum.
   */

  const hasStockLimit =
    typeof availableStock === "number";

  /* =======================================================
     REMAINING STOCK
  ======================================================= */

  /*
   * Example:
   *
   * WooCommerce stock = 10
   * Already in cart = 4
   *
   * Remaining = 6
   */

  const remainingStock =
    hasStockLimit
      ? Math.max(
          0,
          availableStock -
            currentCartQuantity
        )
      : Infinity;

  /* =======================================================
     MAX QUANTITY
  ======================================================= */

  const maxQuantity =
    hasStockLimit
      ? remainingStock
      : Infinity;

  /* =======================================================
     QUANTITY STATUS
  ======================================================= */

  const isMaxQuantity =
    hasStockLimit &&
    quantity >= maxQuantity;

  const hasNoRemainingStock =
    hasStockLimit &&
    remainingStock <= 0;

  /* =======================================================
     PRODUCT STOCK STATUS
  ======================================================= */

  const isInStock =
    product.stock_status === "instock";

  const variationInStock =
    selectedVariation
      ? selectedVariation.stock_status ===
        "instock"
      : true;

  /* =======================================================
     HAS AVAILABLE STOCK
  ======================================================= */

  const hasAvailableStock =
    !hasStockLimit ||
    remainingStock > 0;

  /* =======================================================
     CAN ADD TO CART
  ======================================================= */

  const canAddToCart =
    !disabled &&
    isInStock &&
    variationInStock &&
    hasAvailableStock &&
    (!isVariable ||
      requiredAttributes.length === 0 ||
      (missingAttributes.length === 0 &&
        Boolean(selectedVariation)));

  /* =======================================================
     CURRENT PRICE
  ======================================================= */

  const currentPrice =
    selectedVariation?.price ||
    product.price ||
    "0";

  /* =======================================================
     SELECT ATTRIBUTE
  ======================================================= */

  function selectAttribute(
    attributeName: string,
    value: string
  ) {
    const key =
      normalizeAttributeName(
        attributeName
      );

    setSelectedAttributes(
      (previous) => ({
        ...previous,
        [key]: value,
      })
    );

    /*
     * Reset quantity whenever the variation
     * changes.
     */
    setQuantity(1);

    setAdded(false);
    setMessage("");
  }

  /* =======================================================
     QUANTITY
  ======================================================= */

  function increaseQuantity() {
    /*
     * Don't allow quantity above available stock.
     */

    if (hasStockLimit) {
      setQuantity((value) =>
        Math.min(
          value + 1,
          maxQuantity
        )
      );

      return;
    }

    /*
     * No stock limit from WooCommerce.
     */

    setQuantity(
      (value) => value + 1
    );
  }

  function decreaseQuantity() {
    setQuantity((value) =>
      Math.max(1, value - 1)
    );
  }

  /* =======================================================
     ADD TO CART
  ======================================================= */

  async function addToCart() {
    /* -------------------------------------------------------
       VALIDATION
    ------------------------------------------------------- */

    if (!canAddToCart) {
      if (
        missingAttributes.length > 0
      ) {
        setMessage(
          `Please select ${missingAttributes
            .map(
              (item) => item.name
            )
            .join(", ")}.`
        );

        return;
      }

      if (hasNoRemainingStock) {
        setMessage(
          "No more stock available."
        );

        return;
      }

      if (
        selectedVariation &&
        !variationInStock
      ) {
        setMessage(
          "This option is out of stock."
        );

        return;
      }

      return;
    }

    /* -------------------------------------------------------
       STOCK VALIDATION
    ------------------------------------------------------- */

    if (
      hasStockLimit &&
      quantity > remainingStock
    ) {
      setMessage(
        `Only ${remainingStock} ${
          remainingStock === 1
            ? "piece"
            : "pieces"
        } available.`
      );

      setQuantity(
        Math.max(
          1,
          remainingStock
        )
      );

      return;
    }

    setAdding(true);
    setMessage("");

    try {
      /* -----------------------------------------------------
         GET CURRENT CART
      ----------------------------------------------------- */

      const existingQuantity = Number(
        cart.find((item) =>
          String(item.productId ?? item.id) === String(product.id) &&
          String(item.variation_id ?? item.variationId ?? "") === String(variationId ?? "")
        )?.quantity || 0
      );

      /* -----------------------------------------------------
         FINAL QUANTITY
      ----------------------------------------------------- */

      const finalQuantity =
        existingQuantity + quantity;

      /* -----------------------------------------------------
         FINAL STOCK CHECK
      ----------------------------------------------------- */

      if (
        hasStockLimit &&
        finalQuantity >
          availableStock
      ) {
        const remaining =
          Math.max(
            0,
            availableStock -
              existingQuantity
          );

        setMessage(
          remaining > 0
            ? `Only ${remaining} ${
                remaining === 1
                  ? "piece"
                  : "pieces"
              } available.`
            : "No more stock available."
        );

        return;
      }

      const productForCart: Parameters<typeof addCartItem>[0] = {
        id: product.id,
        productId: product.id,
        variationId,
        name: product.name,
        slug: "",
        price: currentPrice,
        regular_price: currentPrice,
        sale_price: "",
        on_sale: false,
        stock_status: product.stock_status === "outofstock" ? "outofstock" : "instock",
        stockQuantity: availableStock,
        stockStatus: selectedVariation?.stock_status || product.stock_status || "instock",
        manageStock: hasStockLimit,
        purchasable: true,
        images: product.images?.map((image, index) => ({
          id: image.id ?? index,
          src: image.src ?? "",
          alt: image.alt,
        })) || (productImage ? [{ id: 0, src: productImage }] : []),
        categories: [],
        brands: [],
        attributes: selectedAttributes,
        image: productImage,
      };

      // CartContext owns both guest storage and authenticated persistence.
      for (let index = 0; index < quantity; index += 1) {
        await addCartItem(productForCart);
      }

      /* -----------------------------------------------------
         UI
      ----------------------------------------------------- */

      setAdded(true);

      setMessage(
        "Product added to your cart."
      );

      /*
       * Reset quantity after adding.
       *
       * If stock is limited, keep it at 1
       * so the user can add another unit.
       */

      setQuantity(1);
    } catch (error) {
      console.error(
        "Add to cart error:",
        error
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setAdding(false);
    }
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="mt-7 space-y-6">

      {/* =====================================================
          PRODUCT OPTIONS
      ===================================================== */}

      {isVariable &&
        productAttributes.length > 0 && (
          <div className="space-y-5">

            {productAttributes.map(
              (attribute) => {
                const key =
                  getAttributeKey(
                    attribute
                  );

                const selected =
                  selectedAttributes[
                    key
                  ];

                return (
                  <div
                    key={key}
                    className="space-y-3"
                  >

                    {/* ATTRIBUTE HEADER */}

                    <div className="flex items-center justify-between gap-3">

                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {attribute.name}
                        </p>

                        <p className="mt-0.5 text-[11px] text-gray-400">
                          {selected
                            ? `Selected: ${formatAttributeValue(
                                selected
                              )}`
                            : "Choose an option"}
                        </p>
                      </div>

                      {!selected && (
                        <span className="text-[10px] font-medium text-[#E53935]">
                          Required
                        </span>
                      )}

                    </div>

                    {/* OPTIONS */}

                    <div className="flex flex-wrap gap-2">

                      {attribute.options.map(
                        (option) => {
                          const isSelected =
                            normalizeAttributeName(
                              selected
                            ) ===
                            normalizeAttributeName(
                              option
                            );

                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() =>
                                selectAttribute(
                                  attribute.name,
                                  option
                                )
                              }
                              className={[
                                "min-h-10 rounded-xl border px-4 py-2 text-sm font-medium transition-all",

                                "focus:outline-none focus:ring-2 focus:ring-[#0497D8]/20",

                                isSelected
                                  ? "border-[#0497D8] bg-[#0497D8]/5 text-[#0497D8] shadow-sm"
                                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50",
                              ].join(
                                " "
                              )}
                            >
                              {formatAttributeValue(
                                option
                              )}
                            </button>
                          );
                        }
                      )}

                    </div>

                  </div>
                );
              }
            )}

          </div>
        )}

      {/* =====================================================
          SELECTED VARIATION STATUS
      ===================================================== */}

      {isVariable &&
        selectedVariation && (
          <div
            className={`rounded-xl border px-4 py-3 ${
              variationInStock &&
              hasAvailableStock
                ? "border-green-100 bg-green-50/70"
                : "border-red-100 bg-red-50/70"
            }`}
          >

            <div className="flex items-center gap-2">

              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full ${
                  variationInStock &&
                  hasAvailableStock
                    ? "bg-green-100"
                    : "bg-red-100"
                }`}
              >
                {variationInStock &&
                hasAvailableStock ? (
                  <Check
                    size={14}
                    className="text-green-600"
                  />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                )}
              </div>

              <div>

                <p
                  className={`text-xs font-semibold ${
                    variationInStock &&
                    hasAvailableStock
                      ? "text-green-800"
                      : "text-red-700"
                  }`}
                >
                  {variationInStock &&
                  hasAvailableStock
                    ? "Option available"
                    : "Option unavailable"}
                </p>

                <p
                  className={`text-[10px] ${
                    variationInStock &&
                    hasAvailableStock
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {!variationInStock
                    ? "This configuration is out of stock."
                    : hasStockLimit
                    ? `${remainingStock} ${
                        remainingStock ===
                        1
                          ? "piece"
                          : "pieces"
                      } available`
                    : "This configuration is available for purchase."}
                </p>

              </div>

            </div>

          </div>
        )}

      {/* =====================================================
          QUANTITY + ADD TO CART
      ===================================================== */}

      <div className="space-y-3">

        <div className="flex flex-col gap-3 sm:flex-row">

          {/* =================================================
              QUANTITY
          ================================================= */}

          <div className="space-y-2">

            <div className="flex h-14 shrink-0 items-center justify-between rounded-2xl border border-gray-200 bg-white p-1 sm:w-[145px]">

              {/* MINUS */}

              <button
                type="button"
                onClick={
                  decreaseQuantity
                }
                disabled={
                  quantity <= 1
                }
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-xl
                  text-gray-500
                  transition-colors
                  hover:bg-gray-50
                  hover:text-gray-900
                  disabled:cursor-not-allowed
                  disabled:opacity-30
                "
                aria-label="Decrease quantity"
              >
                <Minus size={17} />
              </button>

              {/* QUANTITY */}

              <span className="min-w-8 text-center text-sm font-bold text-gray-900">
                {quantity}
              </span>

              {/* PLUS */}

              <button
                type="button"
                onClick={
                  increaseQuantity
                }
                disabled={
                  isMaxQuantity ||
                  !hasAvailableStock
                }
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-xl
                  text-gray-500
                  transition-colors
                  hover:bg-gray-50
                  hover:text-gray-900
                  disabled:cursor-not-allowed
                  disabled:opacity-30
                "
                aria-label="Increase quantity"
              >
                <Plus size={17} />
              </button>

            </div>

            {/* AVAILABLE STOCK */}

            {/* {hasStockLimit && (
              <p
                className={`text-[11px] font-medium ${
                  hasNoRemainingStock
                    ? "text-[#E53935]"
                    : isMaxQuantity
                    ? "text-orange-500"
                    : "text-gray-400"
                }`}
              >
                {hasNoRemainingStock
                  ? "No more stock available"
                  : isMaxQuantity
                  ? `Maximum available: ${remainingStock} ${
                      remainingStock ===
                      1
                        ? "piece"
                        : "pieces"
                    }`
                  : `${remainingStock} ${
                      remainingStock ===
                      1
                        ? "piece"
                        : "pieces"
                    } available`}
              </p>
            )} */}

          </div>

          {/* =================================================
              ADD TO CART
          ================================================= */}

          <button
            type="button"
            onClick={addToCart}
            disabled={
              !canAddToCart ||
              adding
            }
            className="
              flex
              h-14
              min-w-0
              flex-1
              items-center
              justify-center
              gap-2.5
              rounded-2xl
              bg-[#0497D8]
              px-5
              text-sm
              font-bold
              text-white
              shadow-lg
              shadow-[#0497D8]/15
              transition-all
              hover:bg-[#0488c2]
              hover:shadow-xl
              hover:shadow-[#0497D8]/20
              disabled:cursor-not-allowed
              disabled:bg-gray-200
              disabled:text-gray-400
              disabled:shadow-none
              sm:px-7
            "
          >

            {adding ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />

                Adding...
              </>
            ) : added ? (
              <>
                <Check size={19} />

                Added to Cart
              </>
            ) : (
              <>
                <ShoppingCart
                  size={19}
                />

                Add to Cart
              </>
            )}

          </button>

        </div>

        {/* =====================================================
            BUY NOW
        ===================================================== */}

        <button
          type="button"
          disabled={
            !canAddToCart
          }
          className="
            flex
            h-12
            w-full
            items-center
            justify-center
            gap-2
            rounded-2xl
            border
            border-gray-200
            bg-white
            text-sm
            font-semibold
            text-gray-900
            transition-all
            hover:border-[#0497D8]
            hover:text-[#0497D8]
            disabled:cursor-not-allowed
            disabled:bg-gray-50
            disabled:text-gray-300
          "
        >
          <Zap size={16} />

          Buy Now
        </button>

        {/* =====================================================
            MESSAGE
        ===================================================== */}

        {message && (
          <p
            className={`text-center text-xs font-medium ${
              added
                ? "text-green-600"
                : "text-[#E53935]"
            }`}
          >
            {message}
          </p>
        )}

      </div>

    </div>
  );
}
