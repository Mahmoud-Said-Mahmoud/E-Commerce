import crypto from "crypto";
import { NextResponse } from "next/server";
import { wooCommerceRequest } from "@/lib/woocommerce";

const PAYMOB_HMAC_SECRET = process.env.PAYMOB_HMAC_SECRET;

const HMAC_FIELDS = [
  "amount_cents",
  "created_at",
  "currency",
  "error_occured",
  "has_parent_transaction",
  "id",
  "integration_id",
  "is_3d_secure",
  "is_auth",
  "is_capture",
  "is_refunded",
  "is_standalone_payment",
  "is_voided",
  "order",
  "owner",
  "pending",
  "source_data.pan",
  "source_data.sub_type",
  "source_data.type",
  "success",
];

function valueFromPath(data: Record<string, unknown>, path: string) {
  return path.split(".").reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object") return "";
    return (current as Record<string, unknown>)[key];
  }, data);
}

function isVerified(data: Record<string, unknown>) {
  if (!PAYMOB_HMAC_SECRET) {
    return false;
  }

  const received = typeof data.hmac === "string" ? data.hmac : "";
  const source = HMAC_FIELDS.map((field) => String(valueFromPath(data, field) ?? "")).join("");
  const calculated = crypto.createHmac("sha512", PAYMOB_HMAC_SECRET).update(source).digest("hex");

  return (
    received.length === calculated.length &&
    crypto.timingSafeEqual(Buffer.from(calculated), Buffer.from(received))
  );
}

function callbackUrl(request: Request, orderId: number, status: "success" | "failed" | "pending") {
  const url = new URL(request.url);
  url.pathname = "/checkout/paymob-return";
  url.search = "";
  url.searchParams.set("orderId", String(orderId));
  url.searchParams.set("status", status);
  return url;
}

async function handlePaymobCallback(request: Request, redirectBrowser = false) {
  const url = new URL(request.url);
  const queryData = Object.fromEntries(url.searchParams.entries());
  const bodyData = await request.json().catch(() => ({}));
  const data = {
    ...queryData,
    ...(bodyData && typeof bodyData === "object" ? bodyData : {}),
  } as Record<string, unknown>;
  const callbackData =
    data.obj && typeof data.obj === "object"
      ? ({ ...(data.obj as Record<string, unknown>), hmac: data.hmac } as Record<string, unknown>)
      : data;

  if (!isVerified(callbackData)) {
    if (redirectBrowser) {
      const url = new URL(request.url);
      url.pathname = "/checkout/paymob-return";
      url.search = "";
      url.searchParams.set("status", "failed");
      url.searchParams.set("reason", "signature");
      return NextResponse.redirect(url);
    }

    return NextResponse.json({ success: false, message: "Invalid Paymob signature." }, { status: 401 });
  }

  const orderId = Number(
    valueFromPath(callbackData, "merchant_order_id") ||
      valueFromPath(callbackData, "order.merchant_order_id")
  );
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return NextResponse.json({ success: false, message: "Missing WooCommerce order ID." }, { status: 400 });
  }

  const paid = String(callbackData.success) === "true" && String(callbackData.pending) !== "true";
  const pending = String(callbackData.pending) === "true";
  const status = paid ? "success" : pending ? "pending" : "failed";

  await wooCommerceRequest(`/orders/${orderId}`, {
    method: "PUT",
    body: JSON.stringify({
      status: paid ? "processing" : pending ? "pending" : "failed",
      set_paid: paid,
      meta_data: [
        { key: "paymob_transaction_id", value: String(callbackData.id || "") },
        { key: "paymob_verified", value: "true" },
        { key: "paymob_payment_status", value: status },
      ],
    }),
  });

  if (redirectBrowser) {
    return NextResponse.redirect(callbackUrl(request, orderId, status));
  }

  return NextResponse.json({ success: true, orderId, paid, pending, status });
}

export async function GET(request: Request) {
  return handlePaymobCallback(request, true);
}

export async function POST(request: Request) {
  return handlePaymobCallback(request);
}
