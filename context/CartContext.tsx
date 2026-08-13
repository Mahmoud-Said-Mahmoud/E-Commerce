"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { useSession } from "next-auth/react";
import type { ProductI } from "@/interface/product";

/* =========================================================
   TYPES
========================================================= */

export interface CartItem extends ProductI {
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;

  addToCart: (product: ProductI) => void;
  removeFromCart: (itemId: string | number) => void;
  increaseQuantity: (itemId: string | number) => void;
  decreaseQuantity: (itemId: string | number) => void;
  clearCart: () => void;
}

/* =========================================================
   CONTEXT
========================================================= */

const CartContext =
  createContext<CartContextType | undefined>(
    undefined
  );

/* =========================================================
   STORAGE KEYS
========================================================= */

const GUEST_CART_KEY = "cart_guest";

function getUserCartKey(userId: string) {
  return `cart_user_${userId}`;
}

/* =========================================================
   READ CART
========================================================= */

function getStoredCart(
  key: string
): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(key);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch (error) {
    console.error(
      `Failed to read cart "${key}":`,
      error
    );

    return [];
  }
}

/* =========================================================
   SAVE CART
========================================================= */

function saveCart(
  key: string,
  cart: CartItem[]
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(
      key,
      JSON.stringify(cart)
    );
  } catch (error) {
    console.error(
      `Failed to save cart "${key}":`,
      error
    );
  }
}

/* =========================================================
   CART UPDATE EVENT
========================================================= */

function dispatchCartUpdate(
  cart: CartItem[]
) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent("cart-updated", {
      detail: {
        cart,
      },
    })
  );
}

/* =========================================================
   MERGE CARTS
========================================================= */

function mergeCarts(
  userCart: CartItem[],
  guestCart: CartItem[]
): CartItem[] {
  const merged = userCart.map((item) => ({
    ...item,
  }));

  for (const guestItem of guestCart) {
    const existingItem = merged.find(
      (item) =>
        String(item.id) ===
        String(guestItem.id)
    );

    if (existingItem) {
      existingItem.quantity +=
        guestItem.quantity;

      continue;
    }

    merged.push({
      ...guestItem,
    });
  }

  return merged;
}

/* =========================================================
   PROVIDER
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

  const userId = session?.user?.id
    ? String(session.user.id)
    : null;

  /* =======================================================
     STATE
  ======================================================= */

  const [cart, setCart] =
    useState<CartItem[]>([]);

  const [initialized, setInitialized] =
    useState(false);

  /*
   * The storage currently being used.
   *
   * Guest:
   * cart_guest
   *
   * Logged user:
   * cart_user_123
   */

  const [activeStorageKey, setActiveStorageKey] =
    useState<string | null>(null);

  /* =======================================================
     LOAD / SWITCH CART
  ======================================================= */

  useEffect(() => {
    /*
     * Wait until NextAuth finishes
     * checking the session.
     */

    if (status === "loading") {
      return;
    }

    /*
     * Prevent save effect from
     * saving the wrong cart while
     * switching between guest/user.
     */

    setInitialized(false);

    /* =====================================================
       GUEST USER
    ===================================================== */

    if (!userId) {
      const guestCart =
        getStoredCart(GUEST_CART_KEY);

      setCart(guestCart);

      setActiveStorageKey(
        GUEST_CART_KEY
      );

      setInitialized(true);

      dispatchCartUpdate(
        guestCart
      );

      return;
    }

    /* =====================================================
       LOGGED USER
    ===================================================== */

    const userCartKey =
      getUserCartKey(userId);

    /*
     * Existing user cart
     */

    const userCart =
      getStoredCart(userCartKey);

    /*
     * Guest cart
     */

    const guestCart =
      getStoredCart(GUEST_CART_KEY);

    /*
     * Merge:
     *
     * user cart
     * +
     * guest cart
     */

    const mergedCart =
      mergeCarts(
        userCart,
        guestCart
      );

    /*
     * Save user cart
     */

    saveCart(
      userCartKey,
      mergedCart
    );

    /*
     * Guest cart has now
     * been transferred.
     *
     * We don't need a second
     * copy anymore.
     */

    if (guestCart.length > 0) {
      localStorage.removeItem(
        GUEST_CART_KEY
      );
    }

    /*
     * Update React immediately.
     */

    setCart(mergedCart);

    /*
     * Change active storage.
     */

    setActiveStorageKey(
      userCartKey
    );

    /*
     * Cart is ready.
     */

    setInitialized(true);

    /*
     * Notify Navbar / CartPage
     */

    dispatchCartUpdate(
      mergedCart
    );
  }, [status, userId]);

  /* =======================================================
     SAVE CART WHEN CART CHANGES
  ======================================================= */

  useEffect(() => {
    /*
     * Don't save while switching
     * between guest and user.
     */

    if (!initialized) {
      return;
    }

    if (!activeStorageKey) {
      return;
    }

    /*
     * Save immediately.
     */

    saveCart(
      activeStorageKey,
      cart
    );

    /*
     * Notify components.
     */

    dispatchCartUpdate(cart);
  }, [
    cart,
    initialized,
    activeStorageKey,
  ]);

  /* =======================================================
     ADD TO CART
  ======================================================= */

  const addToCart = (
    product: ProductI
  ) => {
    setCart((currentCart) => {
      const existingItem =
        currentCart.find(
          (item) =>
            String(item.id) ===
            String(product.id)
        );

      /*
       * Existing product
       */

      if (existingItem) {
        return currentCart.map(
          (item) =>
            String(item.id) ===
            String(product.id)
              ? {
                  ...item,
                  quantity:
                    item.quantity + 1,
                }
              : item
        );
      }

      /*
       * New product
       */

      return [
        ...currentCart,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  };

  /* =======================================================
     REMOVE FROM CART
  ======================================================= */

  const removeFromCart = (
    itemId: string | number
  ) => {
    setCart((currentCart) =>
      currentCart.filter(
        (item) =>
          String(item.id) !==
          String(itemId)
      )
    );
  };

  /* =======================================================
     INCREASE QUANTITY
  ======================================================= */

  const increaseQuantity = (
    itemId: string | number
  ) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        String(item.id) ===
        String(itemId)
          ? {
              ...item,
              quantity:
                item.quantity + 1,
            }
          : item
      )
    );
  };

  /* =======================================================
     DECREASE QUANTITY
  ======================================================= */

  const decreaseQuantity = (
    itemId: string | number
  ) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          String(item.id) ===
          String(itemId)
            ? {
                ...item,
                quantity:
                  item.quantity - 1,
              }
            : item
        )
        .filter(
          (item) =>
            item.quantity > 0
        )
    );
  };

  /* =======================================================
     CLEAR CART
  ======================================================= */

  const clearCart = () => {
    setCart([]);
  };

  /* =======================================================
     CART COUNT
  ======================================================= */

  const cartCount = cart.reduce(
    (total, item) =>
      total +
      Number(item.quantity || 0),
    0
  );

  /* =======================================================
     CART TOTAL
  ======================================================= */

  const cartTotal = cart.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) *
        Number(item.quantity || 0),
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
    useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}