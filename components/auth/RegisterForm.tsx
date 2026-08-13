"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  registerSchema,
  type RegisterFormValues,
} from "@/interface/registerSchema";

interface RegisterFormProps {
  onSuccess: () => void;
}

export default function RegisterForm({
  onSuccess,
}: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",

    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: RegisterFormValues) {
    setServerError("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        "/api/auth/register",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            username: data.username,
            password: data.password,
          }),
        }
      );

      const result = await response.json();

      /* =========================================
         REGISTER FAILED
      ========================================= */

      if (!response.ok) {
        setServerError(
          result?.message ||
            "Unable to create your account."
        );

        return;
      }

      /* =========================================
         REGISTER SUCCESS
      ========================================= */

      setSuccessMessage(
        "Account created successfully!"
      );

      /*
       * Give the user a moment to see
       * the success message.
       */
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (error) {
      console.error(
        "Register error:",
        error
      );

      setServerError(
        "Something went wrong. Please try again."
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      {/* =========================================
          SERVER ERROR
      ========================================= */}

      {serverError && (
        <div className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-600">
          {serverError}
        </div>
      )}

      {/* =========================================
          SUCCESS
      ========================================= */}

      {successMessage && (
        <div className="rounded-lg bg-green-50 px-3 py-2.5 text-sm text-green-600">
          {successMessage}
        </div>
      )}

      {/* =========================================
          FIRST + LAST NAME
      ========================================= */}

      <div className="grid grid-cols-2 gap-3">
        {/* FIRST NAME */}

        <div>
          <label
            htmlFor="firstName"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            First Name
          </label>

          <Input
            id="firstName"
            {...register("firstName")}
            placeholder="First name"
            autoComplete="given-name"
            className={
              errors.firstName
                ? "border-red-500 focus-visible:ring-red-500"
                : ""
            }
          />

          {errors.firstName && (
            <p className="mt-1 text-xs text-red-500">
              {errors.firstName.message}
            </p>
          )}
        </div>

        {/* LAST NAME */}

        <div>
          <label
            htmlFor="lastName"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Last Name
          </label>

          <Input
            id="lastName"
            {...register("lastName")}
            placeholder="Last name"
            autoComplete="family-name"
            className={
              errors.lastName
                ? "border-red-500 focus-visible:ring-red-500"
                : ""
            }
          />

          {errors.lastName && (
            <p className="mt-1 text-xs text-red-500">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      {/* =========================================
          EMAIL
      ========================================= */}

      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          Email
        </label>

        <Input
          id="email"
          {...register("email")}
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          className={
            errors.email
              ? "border-red-500 focus-visible:ring-red-500"
              : ""
          }
        />

        {errors.email && (
          <p className="mt-1 text-xs text-red-500">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* =========================================
          USERNAME
      ========================================= */}

      <div>
        <label
          htmlFor="username"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          Username{" "}
          <span className="text-slate-400">
            (optional)
          </span>
        </label>

        <Input
          id="username"
          {...register("username")}
          placeholder="username"
          autoComplete="username"
          className={
            errors.username
              ? "border-red-500 focus-visible:ring-red-500"
              : ""
          }
        />

        {errors.username && (
          <p className="mt-1 text-xs text-red-500">
            {errors.username.message}
          </p>
        )}
      </div>

      {/* =========================================
          PASSWORD
      ========================================= */}

      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          Password
        </label>

        <div className="relative">
          <Input
            id="password"
            {...register("password")}
            type={
              showPassword
                ? "text"
                : "password"
            }
            placeholder="Enter your password"
            autoComplete="new-password"
            className={`pr-10 ${
              errors.password
                ? "border-red-500 focus-visible:ring-red-500"
                : ""
            }`}
          />

          <button
            type="button"
            aria-label={
              showPassword
                ? "Hide password"
                : "Show password"
            }
            onClick={() =>
              setShowPassword(
                (value) => !value
              )
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>

        {errors.password && (
          <p className="mt-1 text-xs text-red-500">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* =========================================
          CONFIRM PASSWORD
      ========================================= */}

      <div>
        <label
          htmlFor="confirmPassword"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          Confirm Password
        </label>

        <div className="relative">
          <Input
            id="confirmPassword"
            {...register("confirmPassword")}
            type={
              showConfirmPassword
                ? "text"
                : "password"
            }
            placeholder="Confirm your password"
            autoComplete="new-password"
            className={`pr-10 ${
              errors.confirmPassword
                ? "border-red-500 focus-visible:ring-red-500"
                : ""
            }`}
          />

          <button
            type="button"
            aria-label={
              showConfirmPassword
                ? "Hide confirm password"
                : "Show confirm password"
            }
            onClick={() =>
              setShowConfirmPassword(
                (value) => !value
              )
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
          >
            {showConfirmPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>

        {errors.confirmPassword && (
          <p className="mt-1 text-xs text-red-500">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* =========================================
          SUBMIT
      ========================================= */}

      <Button
        type="submit"
        disabled={
          isSubmitting || !!successMessage
        }
        className="
          h-12
          w-full
          bg-[#0497D8]
          text-base
          font-semibold
          hover:bg-[#0387c2]
        "
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Creating Account...
          </>
        ) : successMessage ? (
          "Account Created ✓"
        ) : (
          "Create Account"
        )}
      </Button>
    </form>
  );
}