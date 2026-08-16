import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default async function CheckoutSuccessPage({
  params,
}: {
  params: Promise<{ orderId?: string[] }>;
}) {
  const { orderId } = await params;
  const orderNumber = orderId?.[0];

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-4 py-12">
      <section className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600">
          <CheckCircle2 size={34} />
        </div>

        <h1 className="mt-6 text-2xl font-bold text-gray-950">
          Order received
        </h1>

        <p className="mt-3 text-sm leading-6 text-gray-500">
          Thank you. Your order has been created successfully.
        </p>

        {orderNumber && (
          <p className="mt-4 rounded-xl bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900">
            Order #{orderNumber}
          </p>
        )}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/products"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[#5ABBE6] px-5 text-sm font-semibold text-white transition hover:bg-[#45acd9]"
          >
            Continue Shopping
          </Link>

          <Link
            href="/account/orders"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-200 px-5 text-sm font-semibold text-gray-900 transition hover:border-[#5ABBE6] hover:text-[#328fb6]"
          >
            View Orders
          </Link>
        </div>
      </section>
    </main>
  );
}
