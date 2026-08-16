import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  StockValidationError,
  validateCartStock,
  wooCommerceRequest,
  type CartInputItem,
} from "@/lib/woocommerce";

type ShippingMethod = "bosta" | "branch";
type PaymentMethod = "cod" | "card" | "installment";

type CheckoutInput = {
  customer?: { firstName?: string; lastName?: string; email?: string; phone?: string };
  shipping?: {
    address_1?: string;
    address_2?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
  shippingMethod?: ShippingMethod;
  paymentMethod?: PaymentMethod;
  cart?: CartInputItem[];
};

const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY;
const PAYMOB_INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID;
const PAYMOB_IFRAME_ID = process.env.PAYMOB_IFRAME_ID;
const PAYMOB_RETURN_URL = process.env.PAYMOB_RETURN_URL;

function required(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

async function paymobRequest<T>(endpoint: string, body: unknown): Promise<T> {
  const response = await fetch(`https://accept.paymob.com/api${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      typeof data === "object" && data && "message" in data
        ? String(data.message)
        : "Unable to initialize Paymob payment."
    );
  }

  return data as T;
}

async function createPaymobPayment({
  orderId,
  amountCents,
  customer,
  shipping,
}: {
  orderId: number;
  amountCents: number;
  customer: NonNullable<CheckoutInput["customer"]>;
  shipping: NonNullable<CheckoutInput["shipping"]>;
}) {
  if (!PAYMOB_API_KEY || !PAYMOB_INTEGRATION_ID || !PAYMOB_IFRAME_ID) {
    throw new Error("Paymob is not configured.");
  }

  const authResult = await paymobRequest<{ token: string }>("/auth/tokens", {
    api_key: PAYMOB_API_KEY,
  });

  const orderResult = await paymobRequest<{ id: number }>("/ecommerce/orders", {
    auth_token: authResult.token,
    delivery_needed: false,
    amount_cents: amountCents,
    currency: "EGP",
    merchant_order_id: String(orderId),
    items: [],
  });

  const paymentKeyResult = await paymobRequest<{ token: string }>("/acceptance/payment_keys", {
    auth_token: authResult.token,
    amount_cents: amountCents,
    expiration: 3600,
    order_id: orderResult.id,
    billing_data: {
      apartment: shipping.address_2 || "NA",
      email: customer.email,
      floor: "NA",
      first_name: customer.firstName,
      street: shipping.address_1 || "NA",
      building: "NA",
      phone_number: customer.phone,
      shipping_method: "NA",
      postal_code: shipping.postcode || "NA",
      city: shipping.city || "NA",
      country: shipping.country || "EG",
      last_name: customer.lastName,
      state: shipping.state || "NA",
    },
    currency: "EGP",
    integration_id: Number(PAYMOB_INTEGRATION_ID),
    lock_order_when_paid: true,
    ...(PAYMOB_RETURN_URL ? { redirection_url: PAYMOB_RETURN_URL } : {}),
  });

  return {
    paymentUrl: `https://accept.paymob.com/api/acceptance/iframes/${PAYMOB_IFRAME_ID}?payment_token=${paymentKeyResult.token}`,
    paymobOrderId: orderResult.id,
  };
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const body = (await request.json()) as CheckoutInput;
    const customer = body.customer;
    const shipping = body.shipping;
    const paymentMethod = body.paymentMethod || "cod";

    if (
      !customer ||
      !shipping ||
      !required(customer.firstName) ||
      !required(customer.lastName) ||
      !required(customer.email) ||
      !required(customer.phone)
    ) {
      return NextResponse.json({ success: false, message: "Please complete all required checkout fields." }, { status: 400 });
    }

    if (session?.user?.email && customer.email.trim().toLowerCase() !== session.user.email.toLowerCase()) {
      customer.email = session.user.email;
    }

    if (!/^\S+@\S+\.\S+$/.test(customer.email)) {
      return NextResponse.json({ success: false, message: "Enter a valid email address." }, { status: 400 });
    }

    if (body.shippingMethod !== "branch" && (!required(shipping.address_1) || !required(shipping.city) || !required(shipping.state))) {
      return NextResponse.json({ success: false, message: "Please complete your shipping address." }, { status: 400 });
    }

    if (!Array.isArray(body.cart) || body.cart.length === 0) {
      return NextResponse.json({ success: false, message: "Your cart is empty." }, { status: 400 });
    }

    if (!["cod", "card", "installment"].includes(paymentMethod)) {
      return NextResponse.json({ success: false, message: "Unsupported payment method." }, { status: 400 });
    }

    const verifiedItems = await validateCartStock(body.cart);
    const lineItems = verifiedItems.map((item) => ({
      product_id: item.productId,
      ...(item.variation_id ? { variation_id: item.variation_id } : {}),
      quantity: item.quantity,
    }));

    const shippingOption =
      body.shippingMethod === "branch"
        ? { method_id: "local_pickup", method_title: "Branch Pickup", total: "5.00" }
        : { method_id: "bosta", method_title: "Door to Door", total: "80.00" };

    const isOnlinePayment = paymentMethod === "card" || paymentMethod === "installment";
    const order = await wooCommerceRequest<{ id: number; total: string }>("/orders", {
      method: "POST",
      body: JSON.stringify({
        payment_method: isOnlinePayment ? "paymob" : "cod",
        payment_method_title: isOnlinePayment ? "Paymob" : "Cash on Delivery",
        set_paid: false,
        status: isOnlinePayment ? "pending" : "processing",
        billing: {
          first_name: customer.firstName.trim(),
          last_name: customer.lastName.trim(),
          email: customer.email.trim(),
          phone: customer.phone.trim(),
          address_1: shipping.address_1?.trim() || "",
          address_2: shipping.address_2?.trim() || "",
          city: shipping.city?.trim() || "",
          state: shipping.state?.trim() || "",
          postcode: shipping.postcode?.trim() || "",
          country: shipping.country || "EG",
        },
        shipping: {
          first_name: customer.firstName.trim(),
          last_name: customer.lastName.trim(),
          address_1: shipping.address_1?.trim() || "",
          address_2: shipping.address_2?.trim() || "",
          city: shipping.city?.trim() || "",
          state: shipping.state?.trim() || "",
          postcode: shipping.postcode?.trim() || "",
          country: shipping.country || "EG",
        },
        line_items: lineItems,
        shipping_lines: [shippingOption],
        meta_data: [
          { key: "checkout_session_email", value: session?.user?.email || customer.email },
          { key: "requested_payment_method", value: paymentMethod },
        ],
      }),
    });

    if (isOnlinePayment) {
      const payment = await createPaymobPayment({
        orderId: order.id,
        amountCents: Math.round(Number(order.total || 0) * 100),
        customer,
        shipping,
      });

      await wooCommerceRequest(`/orders/${order.id}`, {
        method: "PUT",
        body: JSON.stringify({
          meta_data: [
            { key: "paymob_order_id", value: String(payment.paymobOrderId) },
            ...(PAYMOB_RETURN_URL ? [{ key: "paymob_return_url", value: PAYMOB_RETURN_URL }] : []),
          ],
        }),
      });

      return NextResponse.json(
        {
          success: true,
          orderId: order.id,
          paymentUrl: payment.paymentUrl,
          returnUrl: PAYMOB_RETURN_URL || `/checkout/paymob-return?orderId=${order.id}`,
        },
        { status: 201 }
      );
    }

    return NextResponse.json({ success: true, orderId: order.id }, { status: 201 });
  } catch (error) {
    console.error("POST /api/checkout error:", error);

    if (error instanceof StockValidationError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          availableStock: error.availableStock,
          productName: error.productName,
          requestedQuantity: error.requestedQuantity,
        },
        { status: error.status }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unable to place the order.",
      },
      { status: 500 }
    );
  }
}
