"use client";

import { useState } from "react";

import {
  Heart,
  Minus,
  Plus,
  ShoppingCart,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import type {
  ProductI,
  ProductAttribute,
} from "@/interface/product";

interface ProductPurchaseProps {
  product: ProductI;
  attributes: ProductAttribute[];
  isInStock: boolean;
}

export default function ProductPurchase({
  product,
  attributes,
  isInStock,
}: ProductPurchaseProps) {
  /* =======================================================
     QUANTITY
  ======================================================= */

  const [quantity, setQuantity] = useState(1);

  /* =======================================================
     SELECTED OPTIONS
  ======================================================= */

  const [selectedOptions, setSelectedOptions] =
    useState<Record<number, string>>({});

  /* =======================================================
     SELECT OPTION
  ======================================================= */

  function selectOption(
    attributeId: number,
    option: string
  ) {
    setSelectedOptions((previous) => ({
      ...previous,
      [attributeId]: option,
    }));
  }

  /* =======================================================
     QUANTITY
  ======================================================= */

  function increaseQuantity() {
    setQuantity((previous) => previous + 1);
  }

  function decreaseQuantity() {
    setQuantity((previous) =>
      Math.max(1, previous - 1)
    );
  }

  /* =======================================================
     ADD TO CART
     
     هنا مكان ربط Cart system بتاعك بعدين.
  ======================================================= */

  function handleAddToCart() {
    const cartItem = {
      productId: product.id,
      quantity,
      options: selectedOptions,
    };

    console.log(
      "Add to cart:",
      cartItem
    );
  }

  return (
    <div className="space-y-6">

      {/* =================================================
          ATTRIBUTES
      ================================================= */}

      {attributes.length > 0 && (
        <div className="space-y-5">

          {attributes.map((attribute) => {

            if (
              !attribute.options ||
              attribute.options.length === 0
            ) {
              return null;
            }

            const selected =
              selectedOptions[
                attribute.id
              ];

            return (
              <div
                key={attribute.id}
                className="space-y-3"
              >

                {/* ATTRIBUTE NAME */}

                <div className="flex items-center justify-between">

                  <p className="text-sm font-bold">
                    {attribute.name}
                  </p>

                  {selected && (
                    <span className="text-xs text-[#0497D8]">
                      {selected}
                    </span>
                  )}

                </div>

                {/* OPTIONS */}

                <div className="flex flex-wrap gap-2">

                  {attribute.options.map(
                    (option) => {

                      const isSelected =
                        selected === option;

                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() =>
                            selectOption(
                              attribute.id,
                              option
                            )
                          }
                          className={`
                            rounded-xl
                            border
                            px-4
                            py-2.5
                            text-sm
                            font-medium
                            transition
                            duration-200
                            cursor-pointer

                            ${
                              isSelected
                                ? `
                                  border-[#0497D8]
                                  bg-[#0497D8]
                                  text-white
                                  shadow-sm
                                `
                                : `
                                  border-gray-200
                                  bg-white
                                  hover:border-[#0497D8]
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
            );
          })}

        </div>
      )}

      {/* =================================================
          QUANTITY
      ================================================= */}

      <div className="space-y-2">

        <p className="text-sm font-bold">
          Quantity
        </p>

        <div className="flex w-fit items-center overflow-hidden rounded-xl border">

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={decreaseQuantity}
            disabled={quantity <= 1}
            className="rounded-none"
          >
            <Minus size={16} />
          </Button>

          <span className="flex min-w-12 justify-center font-bold">
            {quantity}
          </span>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={increaseQuantity}
            className="rounded-none"
          >
            <Plus size={16} />
          </Button>

        </div>

      </div>

      {/* =================================================
          ACTIONS
      ================================================= */}

      <div className="flex gap-3">

        <Button
          type="button"
          disabled={!isInStock}
          onClick={handleAddToCart}
          className="
            h-12
            flex-1
            rounded-xl
            bg-[#0497D8]
            font-bold
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
          type="button"
          variant="outline"
          size="icon"
          className="
            h-12
            w-12
            rounded-xl
            transition
            hover:border-red-400
            hover:text-red-500
          "
        >
          <Heart size={20} />
        </Button>

      </div>

      {/* =================================================
          SELECTED OPTIONS PREVIEW
      ================================================= */}

      {Object.keys(selectedOptions).length >
        0 && (
        <div className="rounded-xl bg-gray-50 p-3">

          <p className="mb-2 text-xs font-bold text-gray-500">
            Selected Options
          </p>

          <div className="flex flex-wrap gap-2">

            {attributes.map(
              (attribute) => {

                const value =
                  selectedOptions[
                    attribute.id
                  ];

                if (!value) return null;

                return (
                  <span
                    key={attribute.id}
                    className="rounded-lg bg-white px-2.5 py-1 text-xs"
                  >
                    {attribute.name}:{" "}
                    <strong>
                      {value}
                    </strong>
                  </span>
                );
              }
            )}

          </div>

        </div>
      )}

    </div>
  );
}