import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/* =========================================================
   WOOCOMMERCE CONFIG
========================================================= */

const WC_URL = process.env.WC_URL;
const WC_KEY = process.env.WC_KEY;
const WC_SECRET = process.env.WC_SECRET;

const CART_META_KEY = "_app_cart";

/* =========================================================
   TYPES
========================================================= */

interface CartItem {
  id: number | string;
  productId?: number | string;
  name: string;
  price?: string | number;
  quantity: number;
  image?: string;

  images?: {
    src: string;
  }[];

  [key: string]: unknown;
}

interface WooMeta {
  id?: number;
  key: string;
  value: unknown;
}

/* =========================================================
   WOOCOMMERCE REQUEST
========================================================= */

async function wooCommerceRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  if (!WC_URL || !WC_KEY || !WC_SECRET) {
    throw new Error(
      "WooCommerce environment variables are missing."
    );
  }

  const credentials = Buffer.from(
    `${WC_KEY}:${WC_SECRET}`
  ).toString("base64");

  const response = await fetch(
    `${WC_URL}/wp-json/wc/v3${endpoint}`,
    {
      ...options,

      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${credentials}`,
        ...(options.headers || {}),
      },

      /*
       * Cart must always be fresh.
       */
      cache: "no-store",
    }
  );

  const text = await response.text();

  let data: any = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    console.error(
      "WooCommerce API Error:",
      response.status,
      data
    );

    throw new Error(
      data?.message ||
        `WooCommerce request failed (${response.status}).`
    );
  }

  return data;
}

/* =========================================================
   NORMALIZE CART
========================================================= */

function normalizeCart(
  cart: unknown
): CartItem[] {
  if (!Array.isArray(cart)) {
    return [];
  }

  return cart
    .filter(
      (item) =>
        item &&
        typeof item === "object"
    )
    .map((item) => {
      const cartItem =
        item as CartItem;

      return {
        ...cartItem,

        quantity: Math.max(
          1,
          Number(
            cartItem.quantity
          ) || 1
        ),
      };
    });
}

/* =========================================================
   GET CUSTOMER
========================================================= */

async function getWooCustomer(
  email: string
) {
  const customers =
    await wooCommerceRequest(
      `/customers?email=${encodeURIComponent(
        email
      )}&per_page=1`
    );

  if (
    !Array.isArray(customers) ||
    customers.length === 0
  ) {
    throw new Error(
      "WooCommerce customer not found."
    );
  }

  return customers[0];
}

/* =========================================================
   GET CART META
========================================================= */

function getCartMeta(
  customer: any
): WooMeta | null {
  const metaData: WooMeta[] =
    Array.isArray(
      customer?.meta_data
    )
      ? customer.meta_data
      : [];

  const meta =
    metaData.find(
      (item) =>
        item.key === CART_META_KEY
    );

  return meta || null;
}

/* =========================================================
   GET CUSTOMER CART
========================================================= */

function getCustomerCart(
  customer: any
): CartItem[] {
  const cartMeta =
    getCartMeta(customer);

  if (!cartMeta) {
    return [];
  }

  if (
    cartMeta.value === null ||
    cartMeta.value === undefined ||
    cartMeta.value === ""
  ) {
    return [];
  }

  try {
    const parsed =
      typeof cartMeta.value === "string"
        ? JSON.parse(
            cartMeta.value
          )
        : cartMeta.value;

    return normalizeCart(parsed);
  } catch (error) {
    console.error(
      "Failed to parse customer cart:",
      error
    );

    return [];
  }
}

/* =========================================================
   SAVE CUSTOMER CART
========================================================= */

async function saveCustomerCart(
  customer: any,
  cart: CartItem[]
) {
  const normalizedCart =
    normalizeCart(cart);

  const existingMeta =
    getCartMeta(customer);

  /*
   * IMPORTANT:
   *
   * If the meta already exists,
   * send its ID.
   *
   * This updates the existing meta
   * instead of creating duplicates.
   */

  const meta = existingMeta?.id
    ? {
        id: existingMeta.id,
        key: CART_META_KEY,
        value:
          JSON.stringify(
            normalizedCart
          ),
      }
    : {
        key: CART_META_KEY,
        value:
          JSON.stringify(
            normalizedCart
          ),
      };

  const updatedCustomer =
    await wooCommerceRequest(
      `/customers/${customer.id}`,
      {
        method: "PUT",

        body: JSON.stringify({
          meta_data: [meta],
        }),
      }
    );

  /*
   * Read the cart again from the
   * response so we know what WooCommerce
   * actually saved.
   */

  const savedCart =
    getCustomerCart(
      updatedCustomer
    );

  return savedCart;
}

/* =========================================================
   GET
   /api/cart
========================================================= */

export async function GET() {
  try {
    const session =
      await auth();

    if (
      !session?.user?.email
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unauthorized.",
          cart: [],
        },
        {
          status: 401,
        }
      );
    }

    const customer =
      await getWooCustomer(
        session.user.email
      );

    const cart =
      getCustomerCart(
        customer
      );

    return NextResponse.json(
      {
        success: true,
        cart,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "GET /api/cart error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Unable to get cart.",

        cart: [],
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   POST
   /api/cart

   ADD PRODUCT
========================================================= */

export async function POST(
  request: Request
) {
  try {
    const session =
      await auth();

    if (
      !session?.user?.email
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const body =
      await request.json();

    const product: CartItem =
      body?.product &&
      typeof body.product === "object"
        ? body.product
        : body;

    if (
      !product ||
      !product.id
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Product ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const quantity = Math.max(
      1,
      Number(
        body?.quantity ??
          product?.quantity ??
          1
      ) || 1
    );

    const customer =
      await getWooCustomer(
        session.user.email
      );

    const currentCart =
      getCustomerCart(
        customer
      );

    /*
     * Find existing product.
     */

    const existingIndex =
      currentCart.findIndex(
        (item) =>
          String(item.id) ===
          String(product.id)
      );

    let updatedCart: CartItem[];

    /* =====================================================
       EXISTING PRODUCT
    ===================================================== */

    if (
      existingIndex !== -1
    ) {
      updatedCart =
        currentCart.map(
          (item, index) => {
            if (
              index !==
              existingIndex
            ) {
              return item;
            }

            return {
              ...item,

              quantity:
                Math.max(
                  1,
                  Number(
                    item.quantity
                  ) || 1
                ) + quantity,
            };
          }
        );
    }

    /* =====================================================
       NEW PRODUCT
    ===================================================== */

    else {
      updatedCart = [
        ...currentCart,
        {
          ...product,
          quantity,
        },
      ];
    }

    /*
     * SAVE
     */

    const savedCart =
      await saveCustomerCart(
        customer,
        updatedCart
      );

    return NextResponse.json(
      {
        success: true,

        message:
          "Product added to cart.",

        cart: savedCart,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "POST /api/cart error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Unable to add product to cart.",

        cart: [],
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   PATCH
   /api/cart

   UPDATE QUANTITY
========================================================= */

export async function PATCH(
  request: Request
) {
  try {
    const session =
      await auth();

    if (
      !session?.user?.email
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const body =
      await request.json();

    const productId =
      body?.productId;

    const quantity =
      Number(body?.quantity);

    if (
      productId === undefined ||
      productId === null
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Product ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isInteger(
        quantity
      ) ||
      quantity < 1
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Quantity must be greater than 0.",
        },
        {
          status: 400,
        }
      );
    }

    const customer =
      await getWooCustomer(
        session.user.email
      );

    const currentCart =
      getCustomerCart(
        customer
      );

    const productExists =
      currentCart.some(
        (item) =>
          String(item.id) ===
          String(productId)
      );

    if (!productExists) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Product not found in cart.",
        },
        {
          status: 404,
        }
      );
    }

    const updatedCart =
      currentCart.map(
        (item) =>
          String(item.id) ===
          String(productId)
            ? {
                ...item,
                quantity,
              }
            : item
      );

    const savedCart =
      await saveCustomerCart(
        customer,
        updatedCart
      );

    return NextResponse.json(
      {
        success: true,

        message:
          "Cart updated successfully.",

        cart: savedCart,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "PATCH /api/cart error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Unable to update cart quantity.",

        cart: [],
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   DELETE
   /api/cart

   DELETE ITEM / CLEAR CART
========================================================= */

export async function DELETE(
  request: Request
) {
  try {
    const session =
      await auth();

    if (
      !session?.user?.email
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const customer =
      await getWooCustomer(
        session.user.email
      );

    let body: {
      productId?: string | number;
      clear?: boolean;
    } = {};

    try {
      body =
        await request.json();
    } catch {
      body = {};
    }

    /* =====================================================
       CLEAR CART
    ===================================================== */

    if (
      body.clear === true
    ) {
      const savedCart =
        await saveCustomerCart(
          customer,
          []
        );

      return NextResponse.json(
        {
          success: true,

          message:
            "Cart cleared successfully.",

          cart: savedCart,
        },
        {
          status: 200,
        }
      );
    }

    /* =====================================================
       DELETE PRODUCT
    ===================================================== */

    if (
      body.productId ===
        undefined ||
      body.productId === null
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Product ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const currentCart =
      getCustomerCart(
        customer
      );

    const updatedCart =
      currentCart.filter(
        (item) =>
          String(item.id) !==
          String(
            body.productId
          )
      );

    const savedCart =
      await saveCustomerCart(
        customer,
        updatedCart
      );

    return NextResponse.json(
      {
        success: true,

        message:
          "Product removed from cart.",

        cart: savedCart,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "DELETE /api/cart error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Unable to delete cart item.",

        cart: [],
      },
      {
        status: 500,
      }
    );
  }
}