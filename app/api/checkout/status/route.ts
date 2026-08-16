import { NextResponse } from "next/server";
import { wooCommerceRequest } from "@/lib/woocommerce";

type WooOrder = {
  id: number;
  number?: string;
  status?: string;
  total?: string;
  currency?: string;
  payment_method?: string;
  payment_method_title?: string;
  billing?: {
    email?: string;
  };
  line_items?: {
    id: number;
    name: string;
    quantity: number;
    total?: string;
  }[];
};

function paymentState(status?: string) {
  if (status === "processing" || status === "completed") {
    return "success";
  }

  if (status === "failed" || status === "cancelled" || status === "refunded") {
    return "failed";
  }

  return "pending";
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const orderId = Number(url.searchParams.get("orderId"));

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Order ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const order = await wooCommerceRequest<WooOrder>(`/orders/${orderId}`);
    const state = paymentState(order.status);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.number || String(order.id),
      status: order.status || "pending",
      paymentState: state,
      paid: state === "success",
      pending: state === "pending",
      failed: state === "failed",
      total: order.total || "0",
      currency: order.currency || "EGP",
      paymentMethod: order.payment_method || "",
      paymentMethodTitle: order.payment_method_title || "",
      items:
        order.line_items?.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          total: item.total || "0",
        })) || [],
    });
  } catch (error) {
    console.error("GET /api/checkout/status error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unable to load order status.",
      },
      {
        status: 500,
      }
    );
  }
}
