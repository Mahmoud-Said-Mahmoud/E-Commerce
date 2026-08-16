import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  StockValidationError,
  cartItemKey,
  normalizeCartItems,
  validateCartItemStock,
  wooCommerceRequest,
  type CartInputItem,
} from "@/lib/woocommerce";

/* =========================================================
   WOOCOMMERCE CONFIG
========================================================= */

// Meta keys prefixed with an underscore are protected by WordPress and may be
// omitted from WooCommerce REST writes. Keep customer carts under a public key.
const CART_META_KEY = "app_cart";
const LEGACY_CART_META_KEY = "_app_cart";

/* =========================================================
   TYPES
========================================================= */

interface CartItem extends CartInputItem {
  id: number | string;
  productId?: number | string;
  variation_id?: number | string;
  variationId?: number | string;
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

interface WooCustomer {
  id: number;
  meta_data?: WooMeta[];
}

/* =========================================================
   NORMALIZE CART
========================================================= */

function normalizeCart(
  cart: unknown
): CartItem[] {
  return normalizeCartItems(cart) as CartItem[];
}

/* =========================================================
   GET CUSTOMER
========================================================= */

async function getWooCustomer(
  email: string
) {
  const customers =
    await wooCommerceRequest<WooCustomer[]>(
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
  customer: WooCustomer
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

  return meta || metaData.find((item) => item.key === LEGACY_CART_META_KEY) || null;
}

/* =========================================================
   GET CUSTOMER CART
========================================================= */

function getCustomerCart(
  customer: WooCustomer
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
  customer: WooCustomer,
  cart: CartItem[]
) {
  const normalizedCart =
    normalizeCart(cart);

  const existingMeta = (Array.isArray(customer?.meta_data) ? customer.meta_data : [])
    .find((item: WooMeta) => item.key === CART_META_KEY) as WooMeta | undefined;

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
    await wooCommerceRequest<WooCustomer>(
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

  const savedCart = getCustomerCart(updatedCustomer);

  if (JSON.stringify(savedCart) !== JSON.stringify(normalizedCart)) {
    throw new Error(
      "WooCommerce did not persist the customer cart metadata."
    );
  }

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

    const existingIndex = currentCart.findIndex(
      (item) => cartItemKey(item) === cartItemKey(product)
    );

    let updatedCart: CartItem[];
    let requestedQuantity = quantity;

    /* =====================================================
       EXISTING PRODUCT
    ===================================================== */

    if (
      existingIndex !== -1
    ) {
      requestedQuantity =
        Math.max(
          1,
          Number(currentCart[existingIndex].quantity) || 1
        ) + quantity;

      const validatedItem =
        await validateCartItemStock(
          product,
          requestedQuantity
        );

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
              ...validatedItem,
              quantity:
                requestedQuantity,
            };
          }
        );
    }

    /* =====================================================
       NEW PRODUCT
    ===================================================== */

    else {
      const validatedItem =
        await validateCartItemStock(
          product,
          requestedQuantity
        );

      updatedCart = [
        ...currentCart,
        {
          ...product,
          ...validatedItem,
          quantity:
            requestedQuantity,
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

    if (error instanceof StockValidationError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          availableStock: error.availableStock,
          productName: error.productName,
          requestedQuantity: error.requestedQuantity,
        },
        {
          status: error.status,
        }
      );
    }

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

    const productId = body?.productId;
    const variationId = body?.variationId;

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
      currentCart.some((item) => cartItemKey(item) === cartItemKey({
        id: productId,
        productId,
        variation_id: variationId,
        name: "",
        quantity: 1,
      }));

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

    const currentItem =
      currentCart.find((item) => cartItemKey(item) === cartItemKey({
        id: productId,
        productId,
        variation_id: variationId,
        name: "",
        quantity: 1,
      }));

    const validatedItem =
      await validateCartItemStock(
        currentItem || {
          id: productId,
          productId,
          variation_id: variationId,
          name: "",
        },
        quantity
      );

    const updatedCart =
      currentCart.map(
        (item) =>
          cartItemKey(item) === cartItemKey({ id: productId, productId, variation_id: variationId, name: "", quantity: 1 })
            ? {
                ...item,
                ...validatedItem,
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

    if (error instanceof StockValidationError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          availableStock: error.availableStock,
          productName: error.productName,
          requestedQuantity: error.requestedQuantity,
        },
        {
          status: error.status,
        }
      );
    }

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
      variationId?: string | number;
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
      currentCart.filter((item) =>
        cartItemKey(item) !== cartItemKey({
          id: body.productId!,
          productId: body.productId!,
          variation_id: body.variationId,
          name: "",
          quantity: 1,
        })
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
