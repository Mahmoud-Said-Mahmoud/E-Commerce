"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  ArrowLeft,
  Loader2,
} from "lucide-react";

interface OrderProduct {
  id: number;
  name: string;
  quantity: number;
  total: string;
  price: number;
  image?: string;
}

interface Order {
  id: number;
  status: string;
  date_created: string;
  total: string;
  currency: string;
  payment_method_title: string;
  line_items: OrderProduct[];
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

function getStatusStyle(status: string) {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-700";

    case "processing":
      return "bg-blue-100 text-blue-700";

    case "pending":
      return "bg-yellow-100 text-yellow-700";

    case "cancelled":
    case "failed":
      return "bg-red-100 text-red-700";

    case "refunded":
      return "bg-purple-100 text-purple-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(
    []
  );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function getOrders() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/account/orders",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to load orders"
          );
        }

        setOrders(data);
      } catch (error) {
        console.error(
          "Orders error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load orders"
        );
      } finally {
        setLoading(false);
      }
    }

    getOrders();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">

        {/* HEADER */}

        <div className="mb-8 flex items-center gap-4">
          <Link
            href="/account"
            className="
              flex
              size-10
              items-center
              justify-center
              rounded-lg
              border
              bg-white
              transition
              hover:border-[#0497D8]
              hover:text-[#0497D8]
            "
          >
            <ArrowLeft className="size-5" />
          </Link>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              My Orders
            </h1>

            <p className="text-sm text-gray-500">
              View and manage your orders
            </p>
          </div>
        </div>

        {/* LOADING */}

        {loading && (
          <div
            className="
              flex
              min-h-[300px]
              items-center
              justify-center
              rounded-2xl
              border
              bg-white
            "
          >
            <div className="flex items-center gap-3 text-gray-500">
              <Loader2 className="size-5 animate-spin" />

              <span>
                Loading your orders...
              </span>
            </div>
          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div
            className="
              rounded-2xl
              border
              border-red-200
              bg-red-50
              p-6
              text-red-600
            "
          >
            {error}
          </div>
        )}

        {/* EMPTY */}

        {!loading &&
          !error &&
          orders.length === 0 && (
            <div
              className="
                flex
                min-h-[350px]
                flex-col
                items-center
                justify-center
                rounded-2xl
                border
                bg-white
                text-center
              "
            >
              <div
                className="
                  mb-4
                  flex
                  size-16
                  items-center
                  justify-center
                  rounded-full
                  bg-[#0497D8]/10
                "
              >
                <Package className="size-8 text-[#0497D8]" />
              </div>

              <h2 className="text-lg font-semibold text-gray-900">
                No orders yet
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                You haven't placed any orders yet.
              </p>

              <Link
                href="/products"
                className="
                  mt-5
                  rounded-lg
                  bg-[#0497D8]
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-[#0387c2]
                "
              >
                Start Shopping
              </Link>
            </div>
          )}

        {/* ORDERS */}

        {!loading &&
          !error &&
          orders.length > 0 && (
            <div className="space-y-5">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="
                    overflow-hidden
                    rounded-2xl
                    border
                    bg-white
                    shadow-sm
                  "
                >
                  {/* ORDER HEADER */}

                  <div
                    className="
                      flex
                      flex-col
                      gap-4
                      border-b
                      p-5
                      sm:flex-row
                      sm:items-center
                      sm:justify-between
                    "
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="font-semibold text-gray-900">
                          Order #{order.id}
                        </h2>

                        <span
                          className={`
                            rounded-full
                            px-2.5
                            py-1
                            text-xs
                            font-medium
                            capitalize
                            ${getStatusStyle(
                              order.status
                            )}
                          `}
                        >
                          {order.status}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-gray-500">
                        {formatDate(
                          order.date_created
                        )}
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-xs text-gray-500">
                        Total
                      </p>

                      <p className="text-lg font-bold text-gray-900">
                        {order.total}{" "}
                        {order.currency}
                      </p>
                    </div>
                  </div>

                  {/* PRODUCTS */}

                  <div className="divide-y">
                    {order.line_items.map(
                      (item) => (
                        <div
                          key={item.id}
                          className="
                            flex
                            items-center
                            justify-between
                            gap-4
                            p-5
                          "
                        >
                          <div className="min-w-0">
                            <h3
                              className="
                                truncate
                                font-medium
                                text-gray-900
                              "
                            >
                              {item.name}
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                              Quantity:{" "}
                              {item.quantity}
                            </p>
                          </div>

                          <p className="shrink-0 font-semibold text-gray-900">
                            {item.total}{" "}
                            {order.currency}
                          </p>
                        </div>
                      )
                    )}
                  </div>

                  {/* FOOTER */}

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      border-t
                      bg-gray-50
                      px-5
                      py-4
                    "
                  >
                    <span className="text-sm text-gray-500">
                      Payment
                    </span>

                    <span className="text-sm font-medium text-gray-900">
                      {order.payment_method_title ||
                        "N/A"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </main>
  );
}