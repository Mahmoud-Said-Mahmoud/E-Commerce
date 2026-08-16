"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2, Clock, RefreshCw } from "lucide-react";
import { useCart } from "@/context/CartContext";

type PaymentState = "loading" | "success" | "failed" | "pending";

type OrderStatus = {
  success: boolean;
  orderId: number;
  orderNumber: string;
  status: string;
  paymentState: "success" | "failed" | "pending";
  total: string;
  currency: string;
  items: {
    id: number;
    name: string;
    quantity: number;
    total: string;
  }[];
  message?: string;
};

export default function PaymobReturnClient() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const orderId = searchParams.get("orderId");
  const initialStatus = searchParams.get("status") as PaymentState | null;

  const [state, setState] = React.useState<PaymentState>(
    initialStatus === "failed" || initialStatus === "pending" || initialStatus === "success"
      ? initialStatus
      : "loading"
  );
  const [order, setOrder] = React.useState<OrderStatus | null>(null);
  const [message, setMessage] = React.useState("");
  const clearedRef = React.useRef(false);

  React.useEffect(() => {
    const verifiedOrderId = orderId || "";

    if (!verifiedOrderId) {
      setState("failed");
      setMessage("We could not identify your order.");
      return;
    }

    let cancelled = false;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function loadStatus() {
      attempts += 1;

      try {
        const response = await fetch(`/api/checkout/status?orderId=${encodeURIComponent(verifiedOrderId)}`, {
          credentials: "include",
          cache: "no-store",
        });
        const result = (await response.json().catch(() => null)) as OrderStatus | null;

        if (cancelled) return;

        if (!response.ok || !result?.success) {
          throw new Error(result?.message || "Unable to verify payment status.");
        }

        setOrder(result);
        setState(result.paymentState);

        if (result.paymentState === "success" && !clearedRef.current) {
          clearedRef.current = true;
          await clearCart();
          try {
            localStorage.removeItem("checkout_draft");
            localStorage.removeItem("paymob_pending_order");
          } catch {}
          return;
        }

        if (result.paymentState === "pending" && attempts < 8) {
          timer = setTimeout(loadStatus, 3000);
        }
      } catch (error) {
        if (cancelled) return;
        setState("failed");
        setMessage(error instanceof Error ? error.message : "Unable to verify payment status.");
      }
    }

    loadStatus();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [clearCart, orderId]);

  const isSuccess = state === "success";
  const isPending = state === "pending" || state === "loading";
  const isFailed = state === "failed";

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-4 py-12">
      <section className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div
          className={[
            "mx-auto flex h-16 w-16 items-center justify-center rounded-full",
            isSuccess
              ? "bg-green-50 text-green-600"
              : isFailed
              ? "bg-red-50 text-red-600"
              : "bg-[#5ABBE6]/10 text-[#328fb6]",
          ].join(" ")}
        >
          {isSuccess ? (
            <CheckCircle2 size={34} />
          ) : isFailed ? (
            <AlertCircle size={34} />
          ) : state === "loading" ? (
            <RefreshCw size={30} className="animate-spin" />
          ) : (
            <Clock size={34} />
          )}
        </div>

        <h1 className="mt-6 text-2xl font-bold text-gray-950">
          {isSuccess ? "Payment confirmed" : isFailed ? "Payment was not completed" : "Payment is pending"}
        </h1>

        <p className="mt-3 text-sm leading-6 text-gray-500">
          {isSuccess
            ? "Your payment has been verified and your order is now being processed."
            : isFailed
            ? message || "Your cart is still saved, so you can retry checkout when ready."
            : "We are waiting for Paymob to confirm the transaction. This page will update automatically."}
        </p>

        {order?.orderNumber && (
          <div className="mt-5 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-700">
            <p className="font-semibold text-gray-950">Order #{order.orderNumber}</p>
            <p className="mt-1">
              {Number(order.total || 0).toFixed(2)} {order.currency || "EGP"}
            </p>
          </div>
        )}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {isSuccess ? (
            <Link
              href={order?.orderId ? `/checkout/success/${order.orderId}` : "/checkout/success"}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[#5ABBE6] px-5 text-sm font-semibold text-white transition hover:bg-[#45acd9]"
            >
              View Confirmation
            </Link>
          ) : (
            <Link
              href="/checkout"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[#5ABBE6] px-5 text-sm font-semibold text-white transition hover:bg-[#45acd9]"
            >
              Retry Checkout
            </Link>
          )}

          <Link
            href="/products"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-200 px-5 text-sm font-semibold text-gray-900 transition hover:border-[#5ABBE6] hover:text-[#328fb6]"
          >
            Continue Shopping
          </Link>
        </div>
      </section>
    </main>
  );
}
