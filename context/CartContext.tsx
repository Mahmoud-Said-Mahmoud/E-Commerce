"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { useSession } from "next-auth/react";
import type { ProductI } from "@/interface/product";

/* =========================================================
   TYPES
========================================================= */

export interface CartItem extends Omit<ProductI, "attributes"> {
  quantity: number;
  productId?: string | number;
  variationId?: string | number;
  variation_id?: string | number;
  image?: string;
  stockQuantity?: number | null;
  stockStatus?: string;
  manageStock?: boolean;
  purchasable?: boolean;
  attributes?: ProductI["attributes"] | Record<string, string>;
}

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;

  loadingCart: boolean;
  initialized: boolean;

  addToCart: (product: Omit<CartItem, "quantity">) => Promise<void>;

  removeFromCart: (
    itemId: string | number,
    variationId?: string | number
  ) => Promise<void>;

  increaseQuantity: (
    itemId: string | number,
    variationId?: string | number
  ) => Promise<void>;

  decreaseQuantity: (
    itemId: string | number,
    variationId?: string | number
  ) => Promise<void>;

  clearCart: () => Promise<void>;
}

/* =========================================================
   CONTEXT
========================================================= */

const CartContext = createContext<
  CartContextType | undefined
>(undefined);

/* =========================================================
   STORAGE
========================================================= */

const GUEST_CART_KEY = "cart_guest";

/*
 * Optional local backup for logged users.
 *
 * IMPORTANT:
 * Database remains the source of truth
 * for authenticated users.
 */
const USER_CART_CACHE_KEY = "cart_user_backup";

class CartApiError extends Error {
  cart: CartItem[];
  availableStock?: number | null;

  constructor(
    message: string,
    cart: CartItem[] = [],
    availableStock?: number | null
  ) {
    super(message);
    this.name = "CartApiError";
    this.cart = cart;
    this.availableStock = availableStock;
  }
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
   LOCAL STORAGE - GUEST
========================================================= */

function getGuestCart(): CartItem[] {
  if (
    typeof window === "undefined"
  ) {
    return [];
  }

  try {
    const stored =
      localStorage.getItem(
        GUEST_CART_KEY
      );

    if (!stored) {
      return [];
    }

    return normalizeCart(
      JSON.parse(stored)
    );
  } catch (error) {
    console.error(
      "Failed to read guest cart:",
      error
    );

    return [];
  }
}

function saveGuestCart(
  cart: CartItem[]
) {
  if (
    typeof window === "undefined"
  ) {
    return;
  }

  try {
    localStorage.setItem(
      GUEST_CART_KEY,
      JSON.stringify(
        normalizeCart(cart)
      )
    );
  } catch (error) {
    console.error(
      "Failed to save guest cart:",
      error
    );
  }
}

function clearGuestCart() {
  if (
    typeof window === "undefined"
  ) {
    return;
  }

  try {
    localStorage.removeItem(
      GUEST_CART_KEY
    );
  } catch (error) {
    console.error(
      "Failed to clear guest cart:",
      error
    );
  }
}

/* =========================================================
   USER LOCAL CACHE
========================================================= */

function getUserCartCache(): CartItem[] {
  if (
    typeof window === "undefined"
  ) {
    return [];
  }

  try {
    const stored =
      localStorage.getItem(
        USER_CART_CACHE_KEY
      );

    if (!stored) {
      return [];
    }

    return normalizeCart(
      JSON.parse(stored)
    );
  } catch (error) {
    console.error(
      "Failed to read user cart cache:",
      error
    );

    return [];
  }
}

function saveUserCartCache(
  cart: CartItem[]
) {
  if (
    typeof window === "undefined"
  ) {
    return;
  }

  try {
    localStorage.setItem(
      USER_CART_CACHE_KEY,
      JSON.stringify(
        normalizeCart(cart)
      )
    );
  } catch (error) {
    console.error(
      "Failed to save user cart cache:",
      error
    );
  }
}

/* =========================================================
   CART EVENT
========================================================= */

function dispatchCartUpdate(
  cart: CartItem[]
) {
  if (
    typeof window === "undefined"
  ) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(
      "cart-updated",
      {
        detail: {
          cart,
        },
      }
    )
  );
}

/* =========================================================
   API - GET CART
========================================================= */

async function fetchUserCart(): Promise<
  CartItem[]
> {
  const response =
    await fetch(
      "/api/cart",
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: {
          Accept:
            "application/json",
        },
      }
    );

  const result =
    await response
      .json()
      .catch(() => null);

  if (!response.ok) {
    throw new Error(
      result?.message ||
        "Failed to fetch cart."
    );
  }

  return normalizeCart(
    result?.cart
  );
}

/* =========================================================
   API - ADD
========================================================= */

async function addProductToDatabaseCart(
  product: Omit<CartItem, "quantity">,
  quantity = 1
): Promise<CartItem[]> {
  const safeQuantity =
    Math.max(
      1,
      Number(quantity) || 1
    );

  const response =
    await fetch(
      "/api/cart",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Accept:
            "application/json",
        },

        credentials:
          "include",

        body: JSON.stringify({
          product,
          quantity:
            safeQuantity,
        }),
      }
    );

  const result =
    await response
      .json()
      .catch(() => null);

  if (!response.ok) {
    throw new CartApiError(
      result?.message ||
        "Failed to add product to cart.",
      normalizeCart(result?.cart),
      result?.availableStock
    );
  }

  return normalizeCart(
    result?.cart
  );
}

/* =========================================================
   API - UPDATE QUANTITY
========================================================= */

async function updateDatabaseCartQuantity(
  productId: string | number,
  quantity: number,
  variationId?: string | number
): Promise<CartItem[]> {
  const safeQuantity =
    Math.max(
      1,
      Number(quantity) || 1
    );

  const response =
    await fetch(
      "/api/cart",
      {
        method: "PATCH",

        headers: {
          "Content-Type":
            "application/json",

          Accept:
            "application/json",
        },

        credentials:
          "include",

        body: JSON.stringify({
          productId,
          variationId,
          quantity:
            safeQuantity,
        }),
      }
    );

  const result =
    await response
      .json()
      .catch(() => null);

  if (!response.ok) {
    throw new CartApiError(
      result?.message ||
        "Failed to update cart quantity.",
      normalizeCart(result?.cart),
      result?.availableStock
    );
  }

  return normalizeCart(
    result?.cart
  );
}

/* =========================================================
   API - REMOVE
========================================================= */

async function removeProductFromDatabaseCart(
  productId: string | number,
  variationId?: string | number
): Promise<CartItem[]> {
  const response =
    await fetch(
      "/api/cart",
      {
        method: "DELETE",

        headers: {
          "Content-Type":
            "application/json",

          Accept:
            "application/json",
        },

        credentials:
          "include",

        body: JSON.stringify({
          productId,
          variationId,
        }),
      }
    );

  const result =
    await response
      .json()
      .catch(() => null);

  if (!response.ok) {
    throw new CartApiError(
      result?.message ||
        "Failed to remove product.",
      normalizeCart(result?.cart)
    );
  }

  return normalizeCart(
    result?.cart
  );
}

/* =========================================================
   API - CLEAR
========================================================= */

async function clearDatabaseCart(): Promise<
  CartItem[]
> {
  const response =
    await fetch(
      "/api/cart",
      {
        method: "DELETE",

        headers: {
          "Content-Type":
            "application/json",

          Accept:
            "application/json",
        },

        credentials:
          "include",

        body: JSON.stringify({
          clear: true,
        }),
      }
    );

  const result =
    await response
      .json()
      .catch(() => null);

  if (!response.ok) {
    throw new CartApiError(
      result?.message ||
        "Failed to clear cart.",
      normalizeCart(result?.cart)
    );
  }

  return normalizeCart(
    result?.cart
  );
}

/* =========================================================
   LOCAL ADD
========================================================= */

function addProductToLocalCart(
  currentCart: CartItem[],
  product: Omit<CartItem, "quantity">
): CartItem[] {
  const existingIndex =
    currentCart.findIndex(
      (item) =>
        String(item.productId ?? item.id) === String((product as CartItem).productId ?? product.id) &&
        String(item.variation_id ?? item.variationId ?? "") ===
        String((product as CartItem).variation_id ?? (product as CartItem).variationId ?? "")
    );

  /* -------------------------------------------------------
     NEW PRODUCT
  ------------------------------------------------------- */

  if (
    existingIndex === -1
  ) {
    return [
      ...currentCart,

      {
        ...product,
        productId: (product as CartItem).productId ?? product.id,
        variation_id: (product as CartItem).variation_id ?? (product as CartItem).variationId,
        quantity: 1,
      },
    ];
  }

  /* -------------------------------------------------------
     EXISTING PRODUCT
  ------------------------------------------------------- */

  return currentCart.map(
    (item, index) =>
      index === existingIndex
        ? {
            ...item,

            quantity:
              Math.max(
                1,
                Number(
                  item.quantity
                ) || 1
              ) + 1,
          }
        : item
  );
}

/* =========================================================
   CART PROVIDER
========================================================= */

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  /* =======================================================
     SESSION
  ======================================================= */

  const {
    data: session,
    status,
  } = useSession();

  /*
   * IMPORTANT
   *
   * Do NOT depend on session.user.id.
   *
   * We use email because your API
   * already searches WooCommerce by email.
   */

  const userEmail =
    session?.user?.email
      ? String(
          session.user.email
        ).trim()
      : null;

  const isAuthenticated =
    status ===
      "authenticated" &&
    !!userEmail;

  /* =======================================================
     STATE
  ======================================================= */

  const [cart, setCart] =
    useState<CartItem[]>([]);

  const [initialized, setInitialized] =
    useState(false);

  const [loadingCart, setLoadingCart] =
    useState(false);

  /* =======================================================
     CART REF
  ======================================================= */

  const cartRef =
    useRef<CartItem[]>([]);

  /* =======================================================
     INITIALIZATION REF
  ======================================================= */

  const initializedUserRef =
    useRef<string | null>(
      null
    );

  /* =======================================================
     ADD QUEUE
  ======================================================= */

  const addQueueRef =
    useRef<Promise<void>>(
      Promise.resolve()
    );

  /* =======================================================
     UPDATE CART
  ======================================================= */

  const updateCart = (
    newCart: CartItem[]
  ) => {
    const normalized =
      normalizeCart(
        newCart
      );

    cartRef.current =
      normalized;

    setCart(normalized);

    /*
     * Save local backup.
     *
     * This does NOT replace
     * the database for logged users.
     */
    saveUserCartCache(
      normalized
    );

    dispatchCartUpdate(
      normalized
    );
  };

  /* =======================================================
     INITIALIZE CART
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function initializeCart() {
      /*
       * Wait until NextAuth finishes.
       */

      if (
        status === "loading"
      ) {
        return;
      }

      /*
       * Prevent unnecessary
       * duplicate initialization.
       */

      const initializationKey =
        isAuthenticated
          ? `user:${userEmail}`
          : "guest";

      if (
        initializedUserRef.current ===
        initializationKey
      ) {
        return;
      }

      initializedUserRef.current =
        initializationKey;

      setLoadingCart(true);
      setInitialized(false);

      try {
        /* =================================================
           GUEST
        ================================================= */

        if (
          status ===
            "unauthenticated" ||
          !isAuthenticated
        ) {
          const guestCart =
            getGuestCart();

          if (cancelled) {
            return;
          }

          cartRef.current =
            guestCart;

          setCart(
            guestCart
          );

          dispatchCartUpdate(
            guestCart
          );

          return;
        }

        /* =================================================
           LOGGED USER
        ================================================= */

        /*
         * ALWAYS try the database first.
         */

        let databaseCart: CartItem[] =
          [];

        try {
          databaseCart =
            await fetchUserCart();
        } catch (error) {
          console.error(
            "Failed to load database cart:",
            error
          );

          /*
           * If API fails, use
           * local backup.
           */

          const cachedCart =
            getUserCartCache();

          if (
            cachedCart.length > 0
          ) {
            databaseCart =
              cachedCart;
          }
        }

        if (cancelled) {
          return;
        }

        /* =================================================
           GUEST CART
        ================================================= */

        const guestCart =
          getGuestCart();

        /*
         * If no guest cart,
         * simply use database.
         */

        if (
          guestCart.length === 0
        ) {
          cartRef.current =
            databaseCart;

          setCart(
            databaseCart
          );

          saveUserCartCache(
            databaseCart
          );

          dispatchCartUpdate(
            databaseCart
          );

          return;
        }

        /* =================================================
           MERGE GUEST → DATABASE
        ================================================= */

        let mergedCart =
          databaseCart;

        for (
          const guestItem of guestCart
        ) {
          if (cancelled) {
            return;
          }

          const quantity =
            Math.max(
              1,
              Number(
                guestItem.quantity
              ) || 1
            );

          const existingItem = mergedCart.find((item) =>
            String(item.productId ?? item.id) === String(guestItem.productId ?? guestItem.id) &&
            String(item.variation_id ?? item.variationId ?? "") ===
            String(guestItem.variation_id ?? guestItem.variationId ?? "")
          );

          /*
           * Product doesn't exist
           */

          if (
            !existingItem
          ) {
            mergedCart =
              await addProductToDatabaseCart(
                guestItem,
                quantity
              );

            continue;
          }

          /*
           * Product already exists.
           *
           * API POST increments quantity.
           */

          for (
            let i = 0;
            i < quantity;
            i++
          ) {
            if (
              cancelled
            ) {
              return;
            }

            mergedCart =
              await addProductToDatabaseCart(
                guestItem,
                1
              );
          }
        }

        if (cancelled) {
          return;
        }

        /*
         * Sync completed.
         */

        cartRef.current =
          mergedCart;

        setCart(
          mergedCart
        );

        saveUserCartCache(
          mergedCart
        );

        /*
         * Guest cart can now
         * safely be removed.
         */

        clearGuestCart();

        dispatchCartUpdate(
          mergedCart
        );
      } catch (error) {
        console.error(
          "Cart initialization error:",
          error
        );

        if (cancelled) {
          return;
        }

        /*
         * Last fallback.
         */

        if (
          isAuthenticated
        ) {
          const cachedCart =
            getUserCartCache();

          if (
            cachedCart.length > 0
          ) {
            cartRef.current =
              cachedCart;

            setCart(
              cachedCart
            );

            dispatchCartUpdate(
              cachedCart
            );
          }
        } else {
          const guestCart =
            getGuestCart();

          cartRef.current =
            guestCart;

          setCart(
            guestCart
          );

          dispatchCartUpdate(
            guestCart
          );
        }
      } finally {
        if (!cancelled) {
          setInitialized(
            true
          );

          setLoadingCart(
            false
          );
        }
      }
    }

    initializeCart();

    return () => {
      cancelled = true;
    };
  }, [
    status,
    userEmail,
    isAuthenticated,
  ]);

  /* =======================================================
     ADD TO CART
  ======================================================= */

  const addToCart = async (
    product: Omit<CartItem, "quantity">
  ) => {
    /* =====================================================
       GUEST
    ===================================================== */

    if (!isAuthenticated) {
      const newCart =
        addProductToLocalCart(
          cartRef.current,
          product
        );

      cartRef.current =
        newCart;

      setCart(newCart);

      saveGuestCart(
        newCart
      );

      dispatchCartUpdate(
        newCart
      );

      return;
    }

    /* =====================================================
       LOGGED USER
    ===================================================== */

    /*
     * Optimistic local update.
     */

    const previousCart =
      cartRef.current;

    const localCart =
      addProductToLocalCart(
        previousCart,
        product
      );

    cartRef.current =
      localCart;

    setCart(
      localCart
    );

    saveUserCartCache(
      localCart
    );

    dispatchCartUpdate(
      localCart
    );

    /*
     * Database queue.
     */

    const operation =
      addQueueRef.current
        .catch(() => {})
        .then(
          async () => {
            try {
              await addProductToDatabaseCart(
                product,
                1
              );

              /*
               * IMPORTANT:
               *
               * Don't replace local
               * cart with old API response.
               */

            } catch (error) {
              console.error(
                "Add to cart error:",
                error
              );

              updateCart(
                error instanceof CartApiError &&
                  error.cart.length > 0
                  ? error.cart
                  : previousCart
              );

              try {
                const databaseCart =
                  await fetchUserCart();

                updateCart(
                  databaseCart
                );
              } catch (
                reloadError
              ) {
                console.error(
                  "Failed to reload cart:",
                  reloadError
                );
              }

              throw error;
            }
          }
        );

    addQueueRef.current =
      operation;

    await operation;
  };

  /* =======================================================
     REMOVE FROM CART
  ======================================================= */

  const removeFromCart =
    async (
      itemId: string | number,
      variationId?: string | number
    ) => {
      /* ===================================================
         GUEST
      =================================================== */

      if (
        !isAuthenticated
      ) {
        const newCart =
          cartRef.current.filter(
            (item) =>
              String(
                item.id
              ) !==
              String(itemId)
          );

        cartRef.current =
          newCart;

        setCart(
          newCart
        );

        saveGuestCart(
          newCart
        );

        dispatchCartUpdate(
          newCart
        );

        return;
      }

      /* ===================================================
         LOGGED USER
      =================================================== */

      const previousCart =
        cartRef.current;

      const optimisticCart = previousCart.filter(
        (item) => String(item.id) !== String(itemId)
      );
      updateCart(optimisticCart);
      const operation = addQueueRef.current.catch(() => {}).then(async () => {
        try {
          await removeProductFromDatabaseCart(itemId, variationId);
        } catch (error) {
          console.error("Remove cart item error:", error);
          updateCart(
            error instanceof CartApiError &&
              error.cart.length > 0
              ? error.cart
              : previousCart
          );
          throw error;
        }
      });
      addQueueRef.current = operation;
      await operation;
    };

  /* =======================================================
     INCREASE QUANTITY
  ======================================================= */

  const increaseQuantity =
    async (
      itemId: string | number,
      variationId?: string | number
    ) => {
      const item =
        cartRef.current.find(
          (cartItem) => isSameCartItem(cartItem, itemId, variationId)
        );

      if (!item) {
        return;
      }

      const currentQuantity =
        Math.max(
          1,
          Number(
            item.quantity
          ) || 1
        );

      const newQuantity =
        currentQuantity + 1;

      const availableStock =
        typeof item.stockQuantity === "number"
          ? item.stockQuantity
          : null;

      if (
        availableStock !== null &&
        newQuantity > availableStock
      ) {
        throw new Error(
          `Only ${availableStock} item${
            availableStock === 1 ? "" : "s"
          } available.`
        );
      }

      /* ===================================================
         GUEST
      =================================================== */

      if (
        !isAuthenticated
      ) {
        const newCart =
          cartRef.current.map(
            (cartItem) => isSameCartItem(cartItem, itemId, variationId)
                ? {
                    ...cartItem,
                    quantity:
                      Math.max(
                        1,
                        Number(
                          cartItem.quantity
                        ) || 1
                      ) + 1,
                  }
                : cartItem
          );

        cartRef.current =
          newCart;

        setCart(
          newCart
        );

        saveGuestCart(
          newCart
        );

        dispatchCartUpdate(
          newCart
        );

        return;
      }

      /* ===================================================
         LOGGED USER
      =================================================== */

      /*
       * Optimistic update first.
       */

      const previousCart =
        cartRef.current;

      const optimisticCart =
        previousCart.map(
          (cartItem) => isSameCartItem(cartItem, itemId, variationId)
              ? {
                  ...cartItem,
                  quantity:
                    newQuantity,
                }
              : cartItem
        );

      cartRef.current =
        optimisticCart;

      setCart(
        optimisticCart
      );

      saveUserCartCache(
        optimisticCart
      );

      dispatchCartUpdate(
        optimisticCart
      );

      const operation = addQueueRef.current.catch(() => {}).then(async () => {
        try {
          await updateDatabaseCartQuantity(itemId, newQuantity, variationId);
        } catch (error) {
          console.error("Increase quantity error:", error);
          updateCart(
            error instanceof CartApiError &&
              error.cart.length > 0
              ? error.cart
              : previousCart
          );
          throw error;
        }
      });
      addQueueRef.current = operation;
      await operation;
    };

  /* =======================================================
     DECREASE QUANTITY
  ======================================================= */

  const decreaseQuantity =
    async (
      itemId: string | number,
      variationId?: string | number
    ) => {
      const item =
        cartRef.current.find(
          (cartItem) => isSameCartItem(cartItem, itemId, variationId)
        );

      if (!item) {
        return;
      }

      const currentQuantity =
        Math.max(
          1,
          Number(
            item.quantity
          ) || 1
        );

      const newQuantity =
        currentQuantity - 1;

      /* ===================================================
         GUEST
      =================================================== */

      if (
        !isAuthenticated
      ) {
        const newCart =
          cartRef.current
            .map(
              (cartItem) => isSameCartItem(cartItem, itemId, variationId)
                  ? {
                      ...cartItem,
                      quantity:
                        Number(
                          cartItem.quantity
                        ) - 1,
                    }
                  : cartItem
            )
            .filter(
              (cartItem) =>
                Number(
                  cartItem.quantity
                ) > 0
            );

        cartRef.current =
          newCart;

        setCart(
          newCart
        );

        saveGuestCart(
          newCart
        );

        dispatchCartUpdate(
          newCart
        );

        return;
      }

      /* ===================================================
         REMOVE
      =================================================== */

      if (
        newQuantity <= 0
      ) {
        await removeFromCart(
          itemId,
          variationId
        );

        return;
      }

      /* ===================================================
         OPTIMISTIC UPDATE
      =================================================== */

      const previousCart =
        cartRef.current;

      const optimisticCart =
        previousCart.map(
          (cartItem) => isSameCartItem(cartItem, itemId, variationId)
              ? {
                  ...cartItem,
                  quantity:
                    newQuantity,
                }
              : cartItem
        );

      cartRef.current =
        optimisticCart;

      setCart(
        optimisticCart
      );

      saveUserCartCache(
        optimisticCart
      );

      dispatchCartUpdate(
        optimisticCart
      );

      /* ===================================================
         DATABASE
      =================================================== */

      const operation = addQueueRef.current.catch(() => {}).then(async () => {
        try {
          await updateDatabaseCartQuantity(itemId, newQuantity, variationId);
        } catch (error) {
          console.error("Decrease quantity error:", error);
          updateCart(
            error instanceof CartApiError &&
              error.cart.length > 0
              ? error.cart
              : previousCart
          );
          throw error;
        }
      });
      addQueueRef.current = operation;
      await operation;
    };

  /* =======================================================
     CLEAR CART
  ======================================================= */

  const clearCart =
    async () => {
      /* ===================================================
         GUEST
      =================================================== */

      if (
        !isAuthenticated
      ) {
        clearGuestCart();

        updateCart([]);

        return;
      }

      /* ===================================================
         LOGGED USER
      =================================================== */

      // Clearing shares the same mutation queue as add/remove/quantity updates,
      // so it cannot race with a preceding click and overwrite newer server data.
      const previousCart =
        cartRef.current;

      updateCart([]);

      const operation = addQueueRef.current.catch(() => {}).then(async () => {
        try {
          await clearDatabaseCart();
        } catch (error) {
          console.error("Clear cart error:", error);
          updateCart(
            error instanceof CartApiError &&
              error.cart.length > 0
              ? error.cart
              : previousCart
          );
          throw error;
        }
      });
      addQueueRef.current = operation;
      await operation;
    };

  /* =======================================================
     CART COUNT
  ======================================================= */

  const cartCount =
    cart.reduce(
      (
        total,
        item
      ) =>
        total +
        Math.max(
          0,
          Number(
            item.quantity
          ) || 0
        ),
      0
    );

  /* =======================================================
     CART TOTAL
  ======================================================= */

  const cartTotal =
    cart.reduce(
      (
        total,
        item
      ) =>
        total +
        Number(
          item.price || 0
        ) *
          Math.max(
            0,
            Number(
              item.quantity
            ) || 0
          ),
      0
    );

  /* =======================================================
     PROVIDER
  ======================================================= */

  return (
    <CartContext.Provider
      value={{
        cart,

        cartCount,

        cartTotal,

        loadingCart,

        initialized,

        addToCart,

        removeFromCart,

        increaseQuantity,

        decreaseQuantity,

        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/* =========================================================
   HOOK
========================================================= */

export function useCart() {
  const context =
    useContext(
      CartContext
    );

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}

function isSameCartItem(
  item: CartItem,
  itemId: string | number,
  variationId?: string | number
) {
  return String(item.productId ?? item.id) === String(itemId) &&
    String(item.variation_id ?? item.variationId ?? "") === String(variationId ?? "");
}
