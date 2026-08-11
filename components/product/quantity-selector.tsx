"use client";

import { Button } from "@/components/ui/button";
import { MinusIcon, PlusIcon } from "lucide-react";
import { useState } from "react";

type QuantitySelectorProps = {
  max?: number;
  onChange?: (quantity: number) => void;
};

export default function QuantitySelector({
  max = 99,
  onChange,
}: QuantitySelectorProps) {
  const [quantity, setQuantity] = useState(1);

  const decrease = () => {
    setQuantity((prev) => {
      const next = Math.max(1, prev - 1);
      onChange?.(next);
      return next;
    });
  };

  const increase = () => {
    setQuantity((prev) => {
      const next = Math.min(max, prev + 1);
      onChange?.(next);
      return next;
    });
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-bold">
        Quantity
      </p>

      <div className="flex w-fit items-center overflow-hidden rounded-xl border bg-white">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={decrease}
          disabled={quantity <= 1}
          className="h-10 w-10 rounded-none"
        >
          <MinusIcon size={16} />
        </Button>

        <span className="flex h-10 min-w-12 items-center justify-center border-x text-sm font-bold">
          {quantity}
        </span>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={increase}
          disabled={quantity >= max}
          className="h-10 w-10 rounded-none"
        >
          <PlusIcon size={16} />
        </Button>
      </div>
    </div>
  );
}