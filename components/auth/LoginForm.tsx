"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginFormProps {
  onSuccess?: () => void;
}

export default function LoginForm({
  onSuccess,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* =========================================================
     SYNC LOCAL CART
  ========================================================= */

  async function syncLocalCart() {
    try {
      const storedCart = localStorage.getItem("cart");

      // No local cart
      if (!storedCart) {
        return true;
      }

      const cart = JSON.parse(storedCart);

      // Empty cart
      if (!Array.isArray(cart) || cart.length === 0) {
        localStorage.removeItem("cart");
        return true;
      }

      const response = await fetch("/api/cart/sync", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          items: cart,
        }),
      });

      if (!response.ok) {
        console.error(
          "Cart sync failed:",
          await response.text()
        );

        return false;
      }

      // Only remove local cart AFTER successful sync
      localStorage.removeItem("cart");

      return true;
    } catch (error) {
      console.error(
        "Local cart sync error:",
        error
      );

      return false;
    }
  }

  /* =========================================================
     SYNC LOCAL WISHLIST
  ========================================================= */

  async function syncLocalWishlist() {
    try {
      const storedWishlist =
        localStorage.getItem("wishlist");

      // No local wishlist
      if (!storedWishlist) {
        return true;
      }

      const wishlist = JSON.parse(
        storedWishlist
      );

      // Empty wishlist
      if (
        !Array.isArray(wishlist) ||
        wishlist.length === 0
      ) {
        localStorage.removeItem("wishlist");
        return true;
      }

      const response = await fetch(
        "/api/wishlist/sync",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            items: wishlist,
          }),
        }
      );

      if (!response.ok) {
        console.error(
          "Wishlist sync failed:",
          await response.text()
        );

        return false;
      }

      // Only remove local wishlist
      // AFTER successful sync
      localStorage.removeItem(
        "wishlist"
      );

      return true;
    } catch (error) {
      console.error(
        "Local wishlist sync error:",
        error
      );

      return false;
    }
  }

  /* =========================================================
     LOGIN
  ========================================================= */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      /* =====================================================
         AUTHENTICATION
      ===================================================== */

      const result = await signIn(
        "credentials",
        {
          email,
          password,
          redirect: false,
        }
      );

      console.log(
        "LOGIN RESULT:",
        result
      );

      /* =====================================================
         LOGIN ERROR
      ===================================================== */

      if (!result) {
        setError(
          "Something went wrong."
        );

        return;
      }

      if (result.error) {
        console.error(
          "LOGIN ERROR:",
          result.error
        );

        setError(
          "Invalid email or password."
        );

        return;
      }

      /* =====================================================
         LOGIN SUCCESS
      ===================================================== */

      console.log(
        "LOGIN SUCCESSFUL"
      );

      /* =====================================================
         SYNC LOCAL CART
      ===================================================== */

      const cartSynced =
        await syncLocalCart();

      /* =====================================================
         SYNC LOCAL WISHLIST
      ===================================================== */

      const wishlistSynced =
        await syncLocalWishlist();

      /* =====================================================
         CHECK SYNC RESULT
      ===================================================== */

      if (
        !cartSynced ||
        !wishlistSynced
      ) {
        console.warn(
          "Login successful, but some local data could not be synced."
        );

        setSuccess(
          "Login successful!"
        );

        /*
         * We DO NOT remove failed local data.
         *
         * This is intentional.
         *
         * If the API failed, the local cart/wishlist
         * remains available so the user doesn't lose data.
         */

        await new Promise(
          (resolve) =>
            setTimeout(resolve, 500)
        );

        onSuccess?.();

        window.location.reload();

        return;
      }

      /* =====================================================
         EVERYTHING SUCCESSFUL
      ===================================================== */

      console.log(
        "Cart and Wishlist synced successfully."
      );

      setSuccess(
        "Login successful!"
      );

      /*
       * Give NextAuth a little time to
       * update the client session.
       */

      await new Promise(
        (resolve) =>
          setTimeout(resolve, 500)
      );

      /* =====================================================
         CALLBACK
      ===================================================== */

      onSuccess?.();

      /* =====================================================
         REFRESH
      ===================================================== */

      window.location.reload();
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {/* =====================================================
          EMAIL
      ===================================================== */}

      <div>
        <Label
          htmlFor="login-email"
          className="mb-2 block"
        >
          Email
        </Label>

        <Input
          id="login-email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          autoComplete="email"
          required
        />
      </div>

      {/* =====================================================
          PASSWORD
      ===================================================== */}

      <div>
        <Label
          htmlFor="login-password"
          className="mb-2 block"
        >
          Password
        </Label>

        <Input
          id="login-password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
          autoComplete="current-password"
          required
        />
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div
          className="
            rounded-lg
            bg-red-50
            px-3
            py-2
            text-sm
            text-red-600
          "
        >
          {error}
        </div>
      )}

      {/* =====================================================
          SUCCESS
      ===================================================== */}

      {success && (
        <div
          className="
            rounded-lg
            bg-green-50
            px-3
            py-2
            text-sm
            text-green-600
          "
        >
          {success}
        </div>
      )}

      {/* =====================================================
          SUBMIT
      ===================================================== */}

      <Button
        type="submit"
        disabled={loading}
        className="
          h-12
          w-full
          bg-[#0497D8]
          text-base
          font-semibold
          hover:bg-[#0387c2]
        "
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />

            Logging in...
          </>
        ) : (
          "Login"
        )}
      </Button>
    </form>
  );
}