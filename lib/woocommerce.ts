export type CartInputItem = {
  id?: string | number;
  productId?: string | number;
  variation_id?: string | number;
  variationId?: string | number;
  quantity?: number;
  name?: string;
  price?: string | number;
  image?: string;
  images?: { id?: number; src?: string; alt?: string }[];
  attributes?: unknown;
  [key: string]: unknown;
};

export type ValidatedCartItem = CartInputItem & {
  id: number;
  productId: number;
  variation_id?: number;
  quantity: number;
  name: string;
  price: string;
  regular_price: string;
  sale_price: string;
  stock_status: string;
  stockQuantity: number | null;
  stockStatus: string;
  manageStock: boolean;
  purchasable: boolean;
  image?: string;
  images: { id?: number; src: string; alt?: string }[];
};

type WooProduct = {
  id: number;
  name?: string;
  status?: string;
  type?: string;
  price?: string;
  regular_price?: string;
  sale_price?: string;
  stock_status?: string;
  stock_quantity?: number | null;
  manage_stock?: boolean | "parent";
  purchasable?: boolean;
  images?: { id?: number; src?: string; alt?: string }[];
};

export class StockValidationError extends Error {
  status: number;
  availableStock: number | null;
  productName: string;
  requestedQuantity: number;

  constructor({
    message,
    status = 409,
    availableStock,
    productName,
    requestedQuantity,
  }: {
    message: string;
    status?: number;
    availableStock: number | null;
    productName: string;
    requestedQuantity: number;
  }) {
    super(message);
    this.name = "StockValidationError";
    this.status = status;
    this.availableStock = availableStock;
    this.productName = productName;
    this.requestedQuantity = requestedQuantity;
  }
}

const WC_URL = process.env.WC_URL;
const WC_KEY = process.env.WC_KEY;
const WC_SECRET = process.env.WC_SECRET;

function wooCredentials() {
  if (!WC_URL || !WC_KEY || !WC_SECRET) {
    throw new Error("WooCommerce configuration is missing.");
  }

  return Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString("base64");
}

export async function wooCommerceRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${WC_URL}/wp-json/wc/v3${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${wooCredentials()}`,
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  const text = await response.text();
  let data: unknown = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      typeof data === "object" && data && "message" in data
        ? String(data.message)
        : `WooCommerce request failed (${response.status}).`
    );
  }

  return data as T;
}

export function getCartProductId(item: CartInputItem) {
  return item.productId ?? item.id;
}

export function getCartVariationId(item: CartInputItem) {
  return item.variation_id ?? item.variationId;
}

export function cartItemKey(item: CartInputItem) {
  const productId = getCartProductId(item);
  const variationId = getCartVariationId(item);
  return `${String(productId)}:${
    variationId === undefined || variationId === null ? "" : String(variationId)
  }`;
}

export function normalizeCartItems(cart: unknown): CartInputItem[] {
  if (!Array.isArray(cart)) {
    return [];
  }

  const items = new Map<string, CartInputItem>();

  for (const item of cart) {
    if (!item || typeof item !== "object") continue;

    const cartItem = item as CartInputItem;
    const productId = getCartProductId(cartItem);
    if (productId === undefined || productId === null) continue;

    const normalized: CartInputItem = {
      ...cartItem,
      id: cartItem.id ?? productId,
      productId,
      variation_id: getCartVariationId(cartItem),
      quantity: Math.max(1, Math.floor(Number(cartItem.quantity) || 1)),
    };

    const key = cartItemKey(normalized);
    const existing = items.get(key);
    items.set(
      key,
      existing
        ? {
            ...existing,
            ...normalized,
            quantity: Number(existing.quantity || 1) + Number(normalized.quantity || 1),
          }
        : normalized
    );
  }

  return [...items.values()];
}

function firstImage(product: WooProduct, fallback?: CartInputItem) {
  const image = product.images?.find((item) => typeof item.src === "string" && item.src);
  if (image?.src) return image.src;
  if (typeof fallback?.image === "string" && fallback.image) return fallback.image;
  const fallbackImage = fallback?.images?.find((item) => typeof item.src === "string" && item.src);
  return fallbackImage?.src;
}

function availableStockFor(item: WooProduct) {
  return typeof item.stock_quantity === "number" ? item.stock_quantity : null;
}

function assertSellable(product: WooProduct, sellable: WooProduct, quantity: number) {
  const name = sellable.name || product.name || "This product";
  const availableStock = availableStockFor(sellable);
  const purchasable = sellable.purchasable !== false && product.purchasable !== false;
  const published = product.status === undefined || product.status === "publish";
  const inStock = sellable.stock_status === "instock";

  if (!published || !purchasable || !inStock) {
    throw new StockValidationError({
      message: `${name} is currently unavailable.`,
      availableStock: availableStock ?? 0,
      productName: name,
      requestedQuantity: quantity,
    });
  }

  if (availableStock !== null && quantity > availableStock) {
    throw new StockValidationError({
      message: `${name} has only ${availableStock} item${availableStock === 1 ? "" : "s"} available. You requested ${quantity}.`,
      availableStock,
      productName: name,
      requestedQuantity: quantity,
    });
  }
}

export async function validateCartItemStock(
  item: CartInputItem,
  quantity: number
): Promise<ValidatedCartItem> {
  const productId = Number(getCartProductId(item));
  const variationValue = getCartVariationId(item);
  const variationId =
    variationValue === undefined || variationValue === null || variationValue === ""
      ? undefined
      : Number(variationValue);
  const safeQuantity = Math.max(1, Math.floor(Number(quantity) || 1));

  if (!Number.isInteger(productId) || productId <= 0) {
    throw new StockValidationError({
      message: "Product ID is required.",
      status: 400,
      availableStock: null,
      productName: "Product",
      requestedQuantity: safeQuantity,
    });
  }

  if (variationValue !== undefined && variationValue !== null && variationValue !== "" && (!Number.isInteger(variationId) || Number(variationId) <= 0)) {
    throw new StockValidationError({
      message: "Variation ID is invalid.",
      status: 400,
      availableStock: null,
      productName: "Product",
      requestedQuantity: safeQuantity,
    });
  }

  const product = await wooCommerceRequest<WooProduct>(`/products/${productId}`);
  const sellable = variationId
    ? await wooCommerceRequest<WooProduct>(`/products/${productId}/variations/${variationId}`)
    : product;

  assertSellable(product, sellable, safeQuantity);

  const image = firstImage(sellable, item) || firstImage(product, item);
  const images = (sellable.images?.length ? sellable.images : product.images || [])
    .filter((wooImage): wooImage is { id?: number; src: string; alt?: string } => Boolean(wooImage.src));

  return {
    ...item,
    id: productId,
    productId,
    variation_id: variationId,
    variationId,
    quantity: safeQuantity,
    name: sellable.name || product.name || String(item.name || "Product"),
    price: sellable.price || product.price || "0",
    regular_price: sellable.regular_price || product.regular_price || sellable.price || product.price || "0",
    sale_price: sellable.sale_price || product.sale_price || "",
    stock_status: sellable.stock_status || "instock",
    stockQuantity: availableStockFor(sellable),
    stockStatus: sellable.stock_status || "instock",
    manageStock: sellable.manage_stock === true,
    purchasable: sellable.purchasable !== false && product.purchasable !== false,
    image,
    images,
  };
}

export async function validateCartStock(cart: CartInputItem[]) {
  const normalized = normalizeCartItems(cart);
  return Promise.all(
    normalized.map((item) => validateCartItemStock(item, Number(item.quantity || 1)))
  );
}
