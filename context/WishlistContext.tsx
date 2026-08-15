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

interface WishlistContextType {
  wishlist: ProductI[];
  wishlistCount: number;

  isInWishlist: (productId: number) => boolean;

  addToWishlist: (product: ProductI) => void;
  removeFromWishlist: (productId: number) => void;
  toggleWishlist: (product: ProductI) => void;
  clearWishlist: () => void;
}

/* =========================================================
   CONTEXT
========================================================= */

const WishlistContext =
  createContext<WishlistContextType | undefined>(
    undefined
  );

/* =========================================================
   STORAGE KEYS
========================================================= */

const GUEST_WISHLIST_KEY = "wishlist_guest";

function getUserWishlistKey(userId?: string) {
  if (!userId) {
    return GUEST_WISHLIST_KEY;
  }

  return `wishlist_user_${userId}`;
}

/* =========================================================
   READ STORAGE
========================================================= */

function getStoredWishlist(
  storageKey: string
): ProductI[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored =
      localStorage.getItem(storageKey);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch (error) {
    console.error(
      "Failed to read wishlist:",
      error
    );

    return [];
  }
}

/* =========================================================
   MERGE WISHLISTS
========================================================= */

function mergeWishlists(
  userWishlist: ProductI[],
  guestWishlist: ProductI[]
): ProductI[] {
  const merged = [...userWishlist];

  for (const guestProduct of guestWishlist) {
    const exists = merged.some(
      (product) =>
        product.id === guestProduct.id
    );

    if (!exists) {
      merged.push(guestProduct);
    }
  }

  return merged;
}

/* =========================================================
   PROVIDER
========================================================= */

export function WishlistProvider({
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
    : undefined;

  /* =======================================================
     STATE
  ======================================================= */

  const [wishlist, setWishlist] =
    useState<ProductI[]>([]);

  const [initialized, setInitialized] =
    useState(false);

  const [
    activeStorageKey,
    setActiveStorageKey,
  ] = useState<string | null>(null);

  /* =======================================================
     LOAD WISHLIST
  ======================================================= */

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    /*
     * Important:
     * Stop saving the previous user's wishlist
     * while switching authentication state.
     */

    setInitialized(false);

    /* =====================================================
       GUEST
    ===================================================== */

    if (!userId) {
      const guestWishlist =
        getStoredWishlist(
          GUEST_WISHLIST_KEY
        );

      setWishlist(guestWishlist);

      setActiveStorageKey(
        GUEST_WISHLIST_KEY
      );

      setInitialized(true);

      window.dispatchEvent(
        new CustomEvent(
          "wishlist-updated",
          {
            detail: {
              wishlist: guestWishlist,
            },
          }
        )
      );

      return;
    }

    /* =====================================================
       USER
    ===================================================== */

    const userWishlistKey =
      getUserWishlistKey(userId);

    const userWishlist =
      getStoredWishlist(
        userWishlistKey
      );

    const guestWishlist =
      getStoredWishlist(
        GUEST_WISHLIST_KEY
      );

    /*
     * Merge guest wishlist
     * into user wishlist
     */

    const mergedWishlist =
      mergeWishlists(
        userWishlist,
        guestWishlist
      );

    /* =====================================================
       SAVE USER WISHLIST
    ===================================================== */

    try {
      localStorage.setItem(
        userWishlistKey,
        JSON.stringify(
          mergedWishlist
        )
      );

      /*
       * Guest wishlist is no longer needed
       */

      if (guestWishlist.length > 0) {
        localStorage.removeItem(
          GUEST_WISHLIST_KEY
        );
      }
    } catch (error) {
      console.error(
        "Failed to save wishlist:",
        error
      );
    }

    /* =====================================================
       UPDATE STATE
    ===================================================== */

    setWishlist(
      mergedWishlist
    );

    setActiveStorageKey(
      userWishlistKey
    );

    setInitialized(true);

    /*
     * Notify Navbar / other components
     */

    window.dispatchEvent(
      new CustomEvent(
        "wishlist-updated",
        {
          detail: {
            wishlist:
              mergedWishlist,
          },
        }
      )
    );
  }, [status, userId]);

  /* =======================================================
     SAVE WISHLIST
  ======================================================= */

  useEffect(() => {
    if (!initialized) {
      return;
    }

    if (!activeStorageKey) {
      return;
    }

    try {
      localStorage.setItem(
        activeStorageKey,
        JSON.stringify(wishlist)
      );

      /*
       * Notify other components
       */

      window.dispatchEvent(
        new CustomEvent(
          "wishlist-updated",
          {
            detail: {
              wishlist,
            },
          }
        )
      );
    } catch (error) {
      console.error(
        "Failed to save wishlist:",
        error
      );
    }
  }, [
    wishlist,
    initialized,
    activeStorageKey,
  ]);

  /* =======================================================
     CHECK PRODUCT
  ======================================================= */

  const isInWishlist = (
    productId: number
  ) => {
    return wishlist.some(
      (product) =>
        product.id === productId
    );
  };

  /* =======================================================
     ADD
  ======================================================= */

  const addToWishlist = (
    product: ProductI
  ) => {
    setWishlist((currentWishlist) => {
      const exists =
        currentWishlist.some(
          (item) =>
            item.id === product.id
        );

      if (exists) {
        return currentWishlist;
      }

      return [
        ...currentWishlist,
        product,
      ];
    });
  };

  /* =======================================================
     REMOVE
  ======================================================= */

  const removeFromWishlist = (
    productId: number
  ) => {
    setWishlist((currentWishlist) =>
      currentWishlist.filter(
        (product) =>
          product.id !== productId
      )
    );
  };

  /* =======================================================
     TOGGLE
  ======================================================= */

  const toggleWishlist = (
    product: ProductI
  ) => {
    setWishlist((currentWishlist) => {
      const exists =
        currentWishlist.some(
          (item) =>
            item.id === product.id
        );

      if (exists) {
        return currentWishlist.filter(
          (item) =>
            item.id !== product.id
        );
      }

      return [
        ...currentWishlist,
        product,
      ];
    });
  };

  /* =======================================================
     CLEAR
  ======================================================= */

  const clearWishlist = () => {
    setWishlist([]);
  };

  /* =======================================================
     COUNT
  ======================================================= */

  const wishlistCount =
    wishlist.length;

  /* =======================================================
     PROVIDER
  ======================================================= */

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount,

        isInWishlist,

        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

/* =========================================================
   HOOK
========================================================= */

export function useWishlist() {
  const context =
    useContext(WishlistContext);

  if (!context) {
    throw new Error(
      "useWishlist must be used inside WishlistProvider"
    );
  }

  return context;
}