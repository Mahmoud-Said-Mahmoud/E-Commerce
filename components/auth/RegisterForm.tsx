"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Eye,
  EyeOff,
  Loader2,
  MapPin,
  Phone,
  User,
  Mail,
  Lock,
  Home,
} from "lucide-react";

import { toast } from "sonner";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  registerSchema,
  type RegisterFormValues,
} from "@/interface/registerSchema";

export default function RegisterForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),

    mode: "onBlur",

    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      phone: "",

      country: "EG",
      governorate: "",
      city: "",
      district: "",
      street: "",
      buildingNumber: "",
      floor: "",
      apartment: "",
      postalCode: "",
      addressLabel: "Home",

      password: "",
      confirmPassword: "",
    },
  });

  /* =========================================================
     SUBMIT
  ========================================================= */

  async function onSubmit(data: RegisterFormValues) {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(data),
      });

      const result = await response.json();

      /* =====================================================
         ERROR
      ===================================================== */

      if (!response.ok) {
        toast.error(
          result?.message ||
            "Unable to create your account."
        );

        return;
      }

      /* =====================================================
         SUCCESS
      ===================================================== */

      toast.success("Account created successfully!", {
        description: "Redirecting you to login...",
        duration: 1500,
      });

      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch (error) {
      console.error("Register error:", error);

      toast.error("Something went wrong.", {
        description:
          "Please check your connection and try again.",
        duration: 4000,
      });
    }
  }

  return (
    <div className="w-full">
      {/* =====================================================
          SCROLL CONTAINER
      ===================================================== */}

      <div
        className="
          h-100
          overflow-y-auto
          overscroll-contain
          pr-2
          scrollbar-thin
          scrollbar-thumb-slate-300
          scrollbar-track-transparent
        "
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 pb-3"
        >
          {/* =================================================
              ACCOUNT INFORMATION
          ================================================= */}

          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="size-5 text-[#0497D8]" />

              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Account Information
                </h2>

                <p className="text-xs text-slate-500">
                  Create your account
                </p>
              </div>
            </div>

            {/* FIRST + LAST NAME */}

            <div
              className="
                grid
                grid-cols-1
                gap-4
                sm:grid-cols-2
              "
            >
              {/* FIRST NAME */}

              <div>
                <label
                  htmlFor="firstName"
                  className="
                    mb-1.5
                    block
                    text-sm
                    font-medium
                    text-slate-700
                  "
                >
                  First Name
                </label>

                <Input
                  id="firstName"
                  {...register("firstName")}
                  placeholder="First name"
                  autoComplete="given-name"
                  className={`
                    h-11
                    rounded-xl
                    ${
                      errors.firstName
                        ? "border-red-500"
                        : ""
                    }
                  `}
                />

                {errors.firstName && (
                  <ErrorMessage>
                    {errors.firstName.message}
                  </ErrorMessage>
                )}
              </div>

              {/* LAST NAME */}

              <div>
                <label
                  htmlFor="lastName"
                  className="
                    mb-1.5
                    block
                    text-sm
                    font-medium
                    text-slate-700
                  "
                >
                  Last Name
                </label>

                <Input
                  id="lastName"
                  {...register("lastName")}
                  placeholder="Last name"
                  autoComplete="family-name"
                  className={`
                    h-11
                    rounded-xl
                    ${
                      errors.lastName
                        ? "border-red-500"
                        : ""
                    }
                  `}
                />

                {errors.lastName && (
                  <ErrorMessage>
                    {errors.lastName.message}
                  </ErrorMessage>
                )}
              </div>
            </div>

            {/* EMAIL */}

            <div>
              <label
                htmlFor="email"
                className="
                  mb-1.5
                  block
                  text-sm
                  font-medium
                  text-slate-700
                "
              >
                Email
              </label>

              <div className="relative">
                <Mail
                  className="
                    pointer-events-none
                    absolute
                    left-3
                    top-1/2
                    size-4
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <Input
                  id="email"
                  {...register("email")}
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={`
                    h-11
                    rounded-xl
                    pl-9
                    ${
                      errors.email
                        ? "border-red-500"
                        : ""
                    }
                  `}
                />
              </div>

              {errors.email && (
                <ErrorMessage>
                  {errors.email.message}
                </ErrorMessage>
              )}
            </div>

            {/* USERNAME */}

            <div>
              <label
                htmlFor="username"
                className="
                  mb-1.5
                  block
                  text-sm
                  font-medium
                  text-slate-700
                "
              >
                Username{" "}
                <span className="font-normal text-slate-400">
                  (optional)
                </span>
              </label>

              <Input
                id="username"
                {...register("username")}
                placeholder="username"
                autoComplete="username"
                className={`
                  h-11
                  rounded-xl
                  ${
                    errors.username
                      ? "border-red-500"
                      : ""
                  }
                `}
              />

              {errors.username && (
                <ErrorMessage>
                  {errors.username.message}
                </ErrorMessage>
              )}
            </div>

            {/* PHONE */}

            <div>
              <label
                htmlFor="phone"
                className="
                  mb-1.5
                  block
                  text-sm
                  font-medium
                  text-slate-700
                "
              >
                Phone Number
              </label>

              <div className="relative">
                <Phone
                  className="
                    pointer-events-none
                    absolute
                    left-3
                    top-1/2
                    size-4
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <Input
                  id="phone"
                  {...register("phone")}
                  type="tel"
                  placeholder="01xxxxxxxxx"
                  autoComplete="tel"
                  className={`
                    h-11
                    rounded-xl
                    pl-9
                    ${
                      errors.phone
                        ? "border-red-500"
                        : ""
                    }
                  `}
                />
              </div>

              {errors.phone && (
                <ErrorMessage>
                  {errors.phone.message}
                </ErrorMessage>
              )}
            </div>
          </section>

          {/* =================================================
              ADDRESS
          ================================================= */}

          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="size-5 text-[#0497D8]" />

              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Address
                </h2>

                <p className="text-xs text-slate-500">
                  Add your delivery address
                </p>
              </div>
            </div>

            {/* COUNTRY + GOVERNORATE */}

            <div
              className="
                grid
                grid-cols-1
                gap-4
                sm:grid-cols-2
              "
            >
              {/* COUNTRY */}

              <div>
                <label
                  htmlFor="country"
                  className="
                    mb-1.5
                    block
                    text-sm
                    font-medium
                    text-slate-700
                  "
                >
                  Country
                </label>

                <select
                  id="country"
                  {...register("country")}
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-input
                    bg-background
                    px-3
                    text-sm
                    outline-none
                    focus:border-[#0497D8]
                    focus:ring-1
                    focus:ring-[#0497D8]
                  "
                >
                  <option value="EG">
                    Egypt
                  </option>
                </select>
              </div>

              {/* GOVERNORATE */}

              <div>
                <label
                  htmlFor="governorate"
                  className="
                    mb-1.5
                    block
                    text-sm
                    font-medium
                    text-slate-700
                  "
                >
                  Governorate
                </label>

                <Input
                  id="governorate"
                  {...register("governorate")}
                  placeholder="Cairo"
                  autoComplete="address-level1"
                  className={`
                    h-11
                    rounded-xl
                    ${
                      errors.governorate
                        ? "border-red-500"
                        : ""
                    }
                  `}
                />

                {errors.governorate && (
                  <ErrorMessage>
                    {errors.governorate.message}
                  </ErrorMessage>
                )}
              </div>
            </div>

            {/* CITY + DISTRICT */}

            <div
              className="
                grid
                grid-cols-1
                gap-4
                sm:grid-cols-2
              "
            >
              {/* CITY */}

              <div>
                <label
                  htmlFor="city"
                  className="
                    mb-1.5
                    block
                    text-sm
                    font-medium
                    text-slate-700
                  "
                >
                  City
                </label>

                <Input
                  id="city"
                  {...register("city")}
                  placeholder="Cairo"
                  autoComplete="address-level2"
                  className={`
                    h-11
                    rounded-xl
                    ${
                      errors.city
                        ? "border-red-500"
                        : ""
                    }
                  `}
                />

                {errors.city && (
                  <ErrorMessage>
                    {errors.city.message}
                  </ErrorMessage>
                )}
              </div>

              {/* DISTRICT */}

              <div>
                <label
                  htmlFor="district"
                  className="
                    mb-1.5
                    block
                    text-sm
                    font-medium
                    text-slate-700
                  "
                >
                  Area / District
                </label>

                <Input
                  id="district"
                  {...register("district")}
                  placeholder="Nasr City"
                  className={`
                    h-11
                    rounded-xl
                    ${
                      errors.district
                        ? "border-red-500"
                        : ""
                    }
                  `}
                />

                {errors.district && (
                  <ErrorMessage>
                    {errors.district.message}
                  </ErrorMessage>
                )}
              </div>
            </div>

            {/* STREET */}

            <div>
              <label
                htmlFor="street"
                className="
                  mb-1.5
                  block
                  text-sm
                  font-medium
                  text-slate-700
                "
              >
                Street Address
              </label>

              <Input
                id="street"
                {...register("street")}
                placeholder="Street name"
                autoComplete="street-address"
                className={`
                  h-11
                  rounded-xl
                  ${
                    errors.street
                      ? "border-red-500"
                      : ""
                  }
                `}
              />

              {errors.street && (
                <ErrorMessage>
                  {errors.street.message}
                </ErrorMessage>
              )}
            </div>

            {/* BUILDING + FLOOR + APARTMENT */}

            <div
              className="
                grid
                grid-cols-1
                gap-4
                sm:grid-cols-3
              "
            >
              {/* BUILDING */}

              <div>
                <label
                  htmlFor="buildingNumber"
                  className="
                    mb-1.5
                    block
                    text-sm
                    font-medium
                    text-slate-700
                  "
                >
                  Building
                </label>

                <Input
                  id="buildingNumber"
                  {...register("buildingNumber")}
                  placeholder="Building No."
                  className="h-11 rounded-xl"
                />
              </div>

              {/* FLOOR */}

              <div>
                <label
                  htmlFor="floor"
                  className="
                    mb-1.5
                    block
                    text-sm
                    font-medium
                    text-slate-700
                  "
                >
                  Floor
                </label>

                <Input
                  id="floor"
                  {...register("floor")}
                  placeholder="Floor"
                  className="h-11 rounded-xl"
                />
              </div>

              {/* APARTMENT */}

              <div>
                <label
                  htmlFor="apartment"
                  className="
                    mb-1.5
                    block
                    text-sm
                    font-medium
                    text-slate-700
                  "
                >
                  Apartment
                </label>

                <Input
                  id="apartment"
                  {...register("apartment")}
                  placeholder="Apartment"
                  className="h-11 rounded-xl"
                />
              </div>
            </div>

            {/* POSTAL CODE + ADDRESS LABEL */}

            <div
              className="
                grid
                grid-cols-1
                gap-4
                sm:grid-cols-2
              "
            >
              {/* POSTAL CODE */}

              <div>
                <label
                  htmlFor="postalCode"
                  className="
                    mb-1.5
                    block
                    text-sm
                    font-medium
                    text-slate-700
                  "
                >
                  Postal Code
                </label>

                <Input
                  id="postalCode"
                  {...register("postalCode")}
                  placeholder="Postal code"
                  autoComplete="postal-code"
                  className="h-11 rounded-xl"
                />
              </div>

              {/* ADDRESS LABEL */}

              <div>
                <label
                  htmlFor="addressLabel"
                  className="
                    mb-1.5
                    block
                    text-sm
                    font-medium
                    text-slate-700
                  "
                >
                  Address Type
                </label>

                <select
                  id="addressLabel"
                  {...register("addressLabel")}
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-input
                    bg-background
                    px-3
                    text-sm
                    outline-none
                    focus:border-[#0497D8]
                    focus:ring-1
                    focus:ring-[#0497D8]
                  "
                >
                  <option value="Home">
                    Home
                  </option>

                  <option value="Work">
                    Work
                  </option>
                </select>
              </div>
            </div>
          </section>

          {/* =================================================
              SECURITY
          ================================================= */}

          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Lock className="size-5 text-[#0497D8]" />

              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Security
                </h2>

                <p className="text-xs text-slate-500">
                  Protect your account
                </p>
              </div>
            </div>

            {/* PASSWORD */}

            <div>
              <label
                htmlFor="password"
                className="
                  mb-1.5
                  block
                  text-sm
                  font-medium
                  text-slate-700
                "
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
                  className={`
                    h-11
                    rounded-xl
                    pr-11
                    ${
                      errors.password
                        ? "border-red-500"
                        : ""
                    }
                  `}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (value) => !value
                    )
                  }
                  className="
                    absolute
                    right-3
                    top-1/2
                    flex
                    size-7
                    -translate-y-1/2
                    items-center
                    justify-center
                    rounded-md
                    text-slate-400
                    hover:bg-slate-100
                  "
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>

              {errors.password && (
                <ErrorMessage>
                  {errors.password.message}
                </ErrorMessage>
              )}
            </div>

            {/* CONFIRM PASSWORD */}

            <div>
              <label
                htmlFor="confirmPassword"
                className="
                  mb-1.5
                  block
                  text-sm
                  font-medium
                  text-slate-700
                "
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
                  className={`
                    h-11
                    rounded-xl
                    pr-11
                    ${
                      errors.confirmPassword
                        ? "border-red-500"
                        : ""
                    }
                  `}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (value) => !value
                    )
                  }
                  className="
                    absolute
                    right-3
                    top-1/2
                    flex
                    size-7
                    -translate-y-1/2
                    items-center
                    justify-center
                    rounded-md
                    text-slate-400
                    hover:bg-slate-100
                  "
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>

              {errors.confirmPassword && (
                <ErrorMessage>
                  {errors.confirmPassword.message}
                </ErrorMessage>
              )}
            </div>
          </section>

          {/* =================================================
              SUBMIT
          ================================================= */}

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="
                h-12
                w-full
                rounded-xl
                bg-[#0497D8]
                text-base
                font-semibold
                text-white
                shadow-sm
                hover:bg-[#0387c2]
              "
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <Home className="size-4" />
                  Create Account
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================================================
   ERROR MESSAGE
========================================================= */

function ErrorMessage({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <p className="mt-1.5 text-xs text-red-500">
      {children}
    </p>
  );
}