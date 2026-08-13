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

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
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

      /*
       * Login successful
       */

      setSuccess(
        "Login successful!"
      );

      /*
       * Give NextAuth time to update
       * the client session.
       */

      await new Promise(
        (resolve) =>
          setTimeout(resolve, 500)
      );

      onSuccess?.();

      /*
       * Refresh the page so Navbar
       * gets the authenticated session.
       */

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

      {error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-600">
          {success}
        </div>
      )}

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