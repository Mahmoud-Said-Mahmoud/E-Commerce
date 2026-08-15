
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

import {
  ArrowLeft,
  Check,
  CreditCard,
  MapPin,
  Package,
  ShieldCheck,
  Truck,
  User,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type ShippingMethod =
  | "standard"
  | "express";

type PaymentMethod =
  | "cod"
  | "card";

interface CheckoutForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  governorate: string;
  city: string;
  address: string;

  apartment: string;
  postalCode: string;

  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
}

/* =========================================================
   STORAGE
========================================================= */

const CHECKOUT_STORAGE_KEY =
  "checkout_draft";

/* =========================================================
   DEFAULT FORM
========================================================= */

const DEFAULT_CHECKOUT: CheckoutForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",

  governorate: "",
  city: "",
  address: "",

  apartment: "",
  postalCode: "",

  shippingMethod: "standard",
  paymentMethod: "cod",
};

/* =========================================================
   SHIPPING METHODS
========================================================= */

const SHIPPING_METHODS = {
  standard: {
    id: "standard" as const,
    name: "Standard Shipping",
    description:
      "Delivery within 2–4 business days",
    price: 50,
  },

  express: {
    id: "express" as const,
    name: "Express Shipping",
    description:
      "Delivery within 1–2 business days",
    price: 100,
  },
};

/* =========================================================
   GOVERNORATES
========================================================= */

const GOVERNORATES = [
  "Cairo",
  "Giza",
  "Alexandria",
  "Qalyubia",
  "Dakahlia",
  "Sharqia",
  "Gharbia",
  "Monufia",
  "Beheira",
  "Kafr El Sheikh",
  "Damietta",
  "Port Said",
  "Ismailia",
  "Suez",
  "Fayoum",
  "Beni Suef",
  "Minya",
  "Asyut",
  "Sohag",
  "Qena",
  "Luxor",
  "Aswan",
  "Red Sea",
  "New Valley",
  "Matrouh",
  "North Sinai",
  "South Sinai",
];

/* =========================================================
   INPUT
========================================================= */

interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

function Input({
  label,
  error,
  ...props
}: InputProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-900">
        {label}

        {props.required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <input
        {...props}
        className={[
          "h-12 w-full rounded-xl border",
          "bg-white px-4 text-sm",
          "outline-none transition",
          "placeholder:text-gray-400",
          "focus:border-[#5ABBE6]",
          "focus:ring-2 focus:ring-[#5ABBE6]/20",
          error
            ? "border-red-500"
            : "border-gray-200",
          props.className ?? "",
        ].join(" ")}
      />

      {error && (
        <p className="text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   SELECT
========================================================= */

interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
}

function Select({
  label,
  error,
  children,
  ...props
}: SelectProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-900">
        {label}

        {props.required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <select
        {...props}
        className={[
          "h-12 w-full rounded-xl border",
          "bg-white px-4 text-sm",
          "outline-none transition",
          "focus:border-[#5ABBE6]",
          "focus:ring-2 focus:ring-[#5ABBE6]/20",
          error
            ? "border-red-500"
            : "border-gray-200",
        ].join(" ")}
      >
        {children}
      </select>

      {error && (
        <p className="text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   SECTION
========================================================= */

function Section({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#5ABBE6]/10 text-[#5ABBE6]">
          {icon}
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-950">
            {title}
          </h2>

          {description && (
            <p className="mt-1 text-sm text-gray-500">
              {description}
            </p>
          )}
        </div>
      </div>

      {children}
    </section>
  );
}

/* =========================================================
   CHECKOUT
========================================================= */

export default function Checkout() {
  const router = useRouter();

  const {
    cart,
    cartCount,
    cartTotal,
    loadingCart,
    initialized,
  } = useCart();

  /* =======================================================
     CHECKOUT FORM
  ======================================================= */

  const [form, setForm] =
    React.useState<CheckoutForm>(
      DEFAULT_CHECKOUT
    );

  /*
   * VERY IMPORTANT
   *
   * Prevent saving DEFAULT_CHECKOUT
   * before localStorage has been loaded.
   */

  const [storageLoaded, setStorageLoaded] =
    React.useState(false);

  const [errors, setErrors] =
    React.useState<
      Record<string, string>
    >({});

  const [submitting, setSubmitting] =
    React.useState(false);

  const [submitError, setSubmitError] =
    React.useState("");

  /* =======================================================
     RESTORE CHECKOUT DATA
  ======================================================= */

  React.useEffect(() => {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    try {
      const saved =
        localStorage.getItem(
          CHECKOUT_STORAGE_KEY
        );

      if (saved) {
        const parsed =
          JSON.parse(saved);

        /*
         * Merge instead of replacing.
         *
         * This protects us if we add
         * new fields in the future.
         */

        setForm({
          ...DEFAULT_CHECKOUT,
          ...parsed,
        });
      }
    } catch (error) {
      console.error(
        "Failed to restore checkout data:",
        error
      );
    } finally {
      setStorageLoaded(true);
    }
  }, []);

  /* =======================================================
     SAVE CHECKOUT DATA
  ======================================================= */

  React.useEffect(() => {
    /*
     * Don't save anything until
     * localStorage has been restored.
     */

    if (!storageLoaded) {
      return;
    }

    try {
      localStorage.setItem(
        CHECKOUT_STORAGE_KEY,
        JSON.stringify(form)
      );
    } catch (error) {
      console.error(
        "Failed to save checkout data:",
        error
      );
    }
  }, [form, storageLoaded]);

  /* =======================================================
     UPDATE FIELD
  ======================================================= */

  const updateField = <
    K extends keyof CheckoutForm
  >(
    field: K,
    value: CheckoutForm[K]
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => {
      const next = {
        ...current,
      };

      delete next[field];

      return next;
    });
  };

  /* =======================================================
     SHIPPING
  ======================================================= */

  const selectedShipping =
    SHIPPING_METHODS[
      form.shippingMethod
    ];

  const shippingPrice =
    selectedShipping.price;

  const subtotal =
    Number(cartTotal) || 0;

  const finalTotal =
    subtotal + shippingPrice;

  /* =======================================================
     VALIDATION
  ======================================================= */

  const validateForm = () => {
    const nextErrors: Record<
      string,
      string
    > = {};

    if (!form.firstName.trim()) {
      nextErrors.firstName =
        "First name is required.";
    }

    if (!form.lastName.trim()) {
      nextErrors.lastName =
        "Last name is required.";
    }

    if (!form.email.trim()) {
      nextErrors.email =
        "Email is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email
      )
    ) {
      nextErrors.email =
        "Enter a valid email address.";
    }

    if (!form.phone.trim()) {
      nextErrors.phone =
        "Phone number is required.";
    } else if (
      !/^01[0125][0-9]{8}$/.test(
        form.phone.replace(
          /\s/g,
          ""
        )
      )
    ) {
      nextErrors.phone =
        "Enter a valid Egyptian phone number.";
    }

    if (!form.governorate) {
      nextErrors.governorate =
        "Please select your governorate.";
    }

    if (!form.city.trim()) {
      nextErrors.city =
        "City / area is required.";
    }

    if (!form.address.trim()) {
      nextErrors.address =
        "Address is required.";
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors)
        .length === 0
    );
  };

  /* =======================================================
     CHECKOUT
  ======================================================= */

  const handleCheckout = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setSubmitError("");

    if (!validateForm()) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    if (cart.length === 0) {
      setSubmitError(
        "Your cart is empty."
      );

      return;
    }

    setSubmitting(true);

    try {
      const response =
        await fetch(
          "/api/checkout",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials: "include",

            body: JSON.stringify({
              customer: {
                firstName:
                  form.firstName,
                lastName:
                  form.lastName,
                email:
                  form.email,
                phone:
                  form.phone,
              },

              shipping: {
                first_name:
                  form.firstName,
                last_name:
                  form.lastName,

                address_1:
                  form.address,

                address_2:
                  form.apartment,

                city:
                  form.city,

                state:
                  form.governorate,

                postcode:
                  form.postalCode,

                country: "EG",

                phone:
                  form.phone,
              },

              shippingMethod:
                form.shippingMethod,

              shippingCost:
                shippingPrice,

              paymentMethod:
                form.paymentMethod,

              cart,
            }),
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Checkout failed."
        );
      }

      /*
       * Order created successfully.
       *
       * Remove checkout draft.
       */

      try {
        localStorage.removeItem(
          CHECKOUT_STORAGE_KEY
        );
      } catch {}

      if (result?.orderId) {
        router.push(
          `/checkout/success/${result.orderId}`
        );
      } else {
        router.push(
          "/checkout/success"
        );
      }
    } catch (error) {
      console.error(
        "Checkout error:",
        error
      );

      setSubmitError(
        error instanceof Error
          ? error.message
          : "Something went wrong during checkout."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (
    !initialized ||
    loadingCart ||
    !storageLoaded
  ) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-[#5ABBE6]" />

          <p className="text-sm text-gray-500">
            Loading checkout...
          </p>
        </div>
      </main>
    );
  }

  /* =======================================================
     EMPTY CART
  ======================================================= */

  if (cart.length === 0) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#5ABBE6]/10">
            <Package
              size={28}
              className="text-[#5ABBE6]"
            />
          </div>

          <h1 className="text-2xl font-bold text-gray-950">
            Your cart is empty
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Add some products to your
            cart before checking out.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/products"
              )
            }
            className="mt-6 h-12 rounded-xl bg-[#5ABBE6] px-6 text-sm font-semibold text-white transition hover:bg-[#45acd9]"
          >
            Continue Shopping
          </button>
        </div>
      </main>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8">
          <button
            type="button"
            onClick={() =>
              router.back()
            }
            className="mb-5 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-[#5ABBE6]"
          >
            <ArrowLeft
              size={16}
            />

            Back to cart
          </button>

          <h1 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
            Checkout
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Complete your information
            to place your order.
          </p>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {submitError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {submitError}
          </div>
        )}

        {/* =================================================
            FORM
        ================================================= */}

        <form
          onSubmit={
            handleCheckout
          }
        >
          <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
            {/* =============================================
                LEFT
            ============================================= */}

            <div className="space-y-6">
              {/* ===========================================
                  CUSTOMER INFORMATION
              =========================================== */}

              <Section
                icon={
                  <User
                    size={19}
                  />
                }
                title="Customer Information"
                description="Your contact information."
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    label="First Name"
                    placeholder="First Name"
                    value={
                      form.firstName
                    }
                    onChange={(e) =>
                      updateField(
                        "firstName",
                        e.target.value
                      )
                    }
                    error={
                      errors.firstName
                    }
                    required
                  />

                  <Input
                    label="Last Name"
                    placeholder="Last Name"
                    value={
                      form.lastName
                    }
                    onChange={(e) =>
                      updateField(
                        "lastName",
                        e.target.value
                      )
                    }
                    error={
                      errors.lastName
                    }
                    required
                  />

                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="you@example.com"
                    value={
                      form.email
                    }
                    onChange={(e) =>
                      updateField(
                        "email",
                        e.target.value
                      )
                    }
                    error={
                      errors.email
                    }
                    required
                  />

                  <Input
                    label="Phone Number"
                    type="tel"
                    placeholder="01012345678"
                    value={
                      form.phone
                    }
                    onChange={(e) =>
                      updateField(
                        "phone",
                        e.target.value
                      )
                    }
                    error={
                      errors.phone
                    }
                    required
                  />
                </div>
              </Section>

              {/* ===========================================
                  SHIPPING ADDRESS
              =========================================== */}

              <Section
                icon={
                  <MapPin
                    size={19}
                  />
                }
                title="Shipping Address"
                description="Where should we deliver your order?"
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <Select
                    label="Governorate"
                    value={
                      form.governorate
                    }
                    onChange={(e) =>
                      updateField(
                        "governorate",
                        e.target.value
                      )
                    }
                    error={
                      errors.governorate
                    }
                    required
                  >
                    <option value="">
                      Select governorate
                    </option>

                    {GOVERNORATES.map(
                      (
                        governorate
                      ) => (
                        <option
                          key={
                            governorate
                          }
                          value={
                            governorate
                          }
                        >
                          {
                            governorate
                          }
                        </option>
                      )
                    )}
                  </Select>

                  <Input
                    label="City / Area"
                    placeholder="Nasr City"
                    value={
                      form.city
                    }
                    onChange={(e) =>
                      updateField(
                        "city",
                        e.target.value
                      )
                    }
                    error={
                      errors.city
                    }
                    required
                  />

                  <div className="sm:col-span-2">
                    <Input
                      label="Full Address"
                      placeholder="Street name, building number..."
                      value={
                        form.address
                      }
                      onChange={(e) =>
                        updateField(
                          "address",
                          e.target.value
                        )
                      }
                      error={
                        errors.address
                      }
                      required
                    />
                  </div>

                  <Input
                    label="Apartment / Floor"
                    placeholder="Apartment 12, Floor 3"
                    value={
                      form.apartment
                    }
                    onChange={(e) =>
                      updateField(
                        "apartment",
                        e.target.value
                      )
                    }
                  />

                  <Input
                    label="Postal Code"
                    placeholder="Optional"
                    value={
                      form.postalCode
                    }
                    onChange={(e) =>
                      updateField(
                        "postalCode",
                        e.target.value
                      )
                    }
                  />
                </div>
              </Section>

              {/* ===========================================
                  SHIPPING METHOD
              =========================================== */}

              <Section
                icon={
                  <Truck
                    size={19}
                  />
                }
                title="Shipping Method"
                description="Choose your delivery speed."
              >
                <div className="space-y-3">
                  {Object.values(
                    SHIPPING_METHODS
                  ).map(
                    (method) => {
                      const selected =
                        form.shippingMethod ===
                        method.id;

                      return (
                        <button
                          key={
                            method.id
                          }
                          type="button"
                          onClick={() =>
                            updateField(
                              "shippingMethod",
                              method.id
                            )
                          }
                          className={[
                            "flex w-full items-center justify-between rounded-2xl border p-4 text-left transition",
                            selected
                              ? "border-[#5ABBE6] bg-[#5ABBE6]/5 ring-1 ring-[#5ABBE6]"
                              : "border-gray-200 bg-white hover:border-gray-400",
                          ].join(
                            " "
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={[
                                "flex h-5 w-5 items-center justify-center rounded-full border",
                                selected
                                  ? "border-[#5ABBE6] bg-[#5ABBE6]"
                                  : "border-gray-300",
                              ].join(
                                " "
                              )}
                            >
                              {selected && (
                                <Check
                                  size={
                                    12
                                  }
                                  className="text-white"
                                />
                              )}
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-gray-950">
                                {
                                  method.name
                                }
                              </p>

                              <p className="mt-1 text-xs text-gray-500">
                                {
                                  method.description
                                }
                              </p>
                            </div>
                          </div>

                          <span className="text-sm font-semibold text-gray-950">
                            {
                              method.price
                            }{" "}
                            EGP
                          </span>
                        </button>
                      );
                    }
                  )}
                </div>
              </Section>

              {/* ===========================================
                  PAYMENT
              =========================================== */}

              <Section
                icon={
                  <CreditCard
                    size={19}
                  />
                }
                title="Payment Method"
                description="Select your preferred payment method."
              >
                <div className="space-y-3">
                  {/* COD */}

                  <button
                    type="button"
                    onClick={() =>
                      updateField(
                        "paymentMethod",
                        "cod"
                      )
                    }
                    className={[
                      "flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition",
                      form.paymentMethod ===
                      "cod"
                        ? "border-[#5ABBE6] bg-[#5ABBE6]/5 ring-1 ring-[#5ABBE6]"
                        : "border-gray-200 bg-white hover:border-gray-400",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "flex h-5 w-5 items-center justify-center rounded-full border",
                        form.paymentMethod ===
                        "cod"
                          ? "border-[#5ABBE6] bg-[#5ABBE6]"
                          : "border-gray-300",
                      ].join(
                        " "
                      )}
                    >
                      {form.paymentMethod ===
                        "cod" && (
                        <Check
                          size={
                            12
                          }
                          className="text-white"
                        />
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-950">
                        Cash on Delivery
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Pay when your order
                        arrives.
                      </p>
                    </div>
                  </button>

                  {/* ONLINE */}

                  <button
                    type="button"
                    onClick={() =>
                      updateField(
                        "paymentMethod",
                        "card"
                      )
                    }
                    className={[
                      "flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition",
                      form.paymentMethod ===
                      "card"
                        ? "border-[#5ABBE6] bg-[#5ABBE6]/5 ring-1 ring-[#5ABBE6]"
                        : "border-gray-200 bg-white hover:border-gray-400",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "flex h-5 w-5 items-center justify-center rounded-full border",
                        form.paymentMethod ===
                        "card"
                          ? "border-[#5ABBE6] bg-[#5ABBE6]"
                          : "border-gray-300",
                      ].join(
                        " "
                      )}
                    >
                      {form.paymentMethod ===
                        "card" && (
                        <Check
                          size={
                            12
                          }
                          className="text-white"
                        />
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-950">
                        Online Payment
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Pay securely using
                        your card.
                      </p>
                    </div>
                  </button>
                </div>
              </Section>
            </div>

            {/* =============================================
                ORDER SUMMARY
            ============================================= */}

            <aside className="lg:sticky lg:top-6 lg:h-fit">
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                {/* HEADER */}

                <div className="border-b border-gray-100 p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-950">
                      Order Summary
                    </h2>

                    <span className="rounded-full bg-[#5ABBE6]/10 px-3 py-1 text-xs font-semibold text-[#328fb6]">
                      {cartCount}{" "}
                      {cartCount ===
                      1
                        ? "item"
                        : "items"}
                    </span>
                  </div>
                </div>

                {/* PRODUCTS */}

                <div className="max-h-[420px] overflow-y-auto p-5">
                  <div className="space-y-4">
                    {cart.map(
                      (item) => {
                        const image =
                          item.images?.[0]
                            ?.src ||
                          item.image;

                        return (
                          <div
                            key={
                              item.id
                            }
                            className="flex gap-3"
                          >
                            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                              {image ? (
                                <img
                                  src={
                                    image
                                  }
                                  alt={
                                    item.name
                                  }
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <Package
                                    size={
                                      18
                                    }
                                    className="text-gray-400"
                                  />
                                </div>
                              )}

                              <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#5ABBE6] px-1 text-[10px] font-bold text-white">
                                {
                                  item.quantity
                                }
                              </span>
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="line-clamp-2 text-sm font-medium text-gray-900">
                                {
                                  item.name
                                }
                              </p>

                              <p className="mt-1 text-xs text-gray-500">
                                Qty:{" "}
                                {
                                  item.quantity
                                }
                              </p>
                            </div>

                            <p className="shrink-0 text-sm font-semibold text-gray-950">
                              {(
                                Number(
                                  item.price ||
                                    0
                                ) *
                                item.quantity
                              ).toFixed(
                                2
                              )}{" "}
                              EGP
                            </p>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* TOTALS */}

                <div className="border-t border-gray-100 p-5">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">
                        Subtotal
                      </span>

                      <span className="font-medium text-gray-900">
                        {subtotal.toFixed(
                          2
                        )}{" "}
                        EGP
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">
                        Shipping
                      </span>

                      <span className="font-medium text-gray-900">
                        {shippingPrice.toFixed(
                          2
                        )}{" "}
                        EGP
                      </span>
                    </div>
                  </div>

                  <div className="my-5 border-t border-dashed border-gray-200" />

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-sm text-gray-500">
                        Total
                      </p>

                      <p className="mt-1 text-2xl font-bold tracking-tight text-gray-950">
                        {finalTotal.toFixed(
                          2
                        )}{" "}
                        <span className="text-sm font-medium">
                          EGP
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* PLACE ORDER */}

                  <button
                    type="submit"
                    disabled={
                      submitting
                    }
                    className="mt-5 flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#5ABBE6] px-5 text-sm font-semibold text-white transition hover:bg-[#45acd9] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                        Processing...
                      </>
                    ) : (
                      <>
                        Place Order

                        <ArrowLeft
                          size={16}
                          className="rotate-180"
                        />
                      </>
                    )}
                  </button>

                  {/* SECURITY */}

                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                    <ShieldCheck
                      size={15}
                      className="text-[#5ABBE6]"
                    />

                    <span>
                      Secure checkout
                    </span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </form>
      </div>
    </main>
  );
}

