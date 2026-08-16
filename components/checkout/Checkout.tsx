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
  Store,
  Truck,
  User,
  Minus,
  Plus,
  Trash2,
  WalletCards,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type ShippingMethod = "bosta" | "branch";

type PaymentMethod = "cod" | "card" | "installment";

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

const CHECKOUT_STORAGE_KEY = "checkout_draft";

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

  shippingMethod: "bosta",
  paymentMethod: "cod",
};

/* =========================================================
   SHIPPING METHODS
========================================================= */

const SHIPPING_METHODS: Record<
  ShippingMethod,
  {
    id: ShippingMethod;
    name: string;
    description: string;
    price: number;
    icon: React.ReactNode;
  }
> = {
  bosta: {
    id: "bosta",
    name: "Door to Door",
    description: "Delivered to your address by Bosta",
    price: 80,
    icon: <Truck size={20} />,
  },

  branch: {
    id: "branch",
    name: "Branch Pickup",
    description: "Pick up your order from our branch",
    price: 5,
    icon: <Store size={20} />,
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
   PRODUCT IMAGE HELPER
========================================================= */

type CheckoutCartImage = {
  src?: string;
  url?: string;
};

type CheckoutCartItemImage = {
  image?: string | CheckoutCartImage;
  images?: Array<string | CheckoutCartImage>;
  image_url?: string;
};

function getProductImage(item: CheckoutCartItemImage): string | null {
  if (
    item?.images &&
    Array.isArray(item.images) &&
    item.images.length > 0
  ) {
    const firstImage = item.images[0];

    if (typeof firstImage === "string") {
      return firstImage;
    }

    if (firstImage?.src) {
      return firstImage.src;
    }

    if (firstImage?.url) {
      return firstImage.url;
    }
  }

  if (item?.image) {
    if (typeof item.image === "string") {
      return item.image;
    }

    if (item.image?.src) {
      return item.image.src;
    }

    if (item.image?.url) {
      return item.image.url;
    }
  }

  if (item?.image_url) {
    return item.image_url;
  }

  return null;
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
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  /* =======================================================
     FORM
  ======================================================= */

  const [form, setForm] =
    React.useState<CheckoutForm>(
      DEFAULT_CHECKOUT
    );

  const [storageLoaded, setStorageLoaded] =
    React.useState(false);

  const [errors, setErrors] =
    React.useState<Record<string, string>>({});

  const [submitting, setSubmitting] =
    React.useState(false);

  const [submitError, setSubmitError] =
    React.useState("");

  /* =======================================================
     RESTORE CHECKOUT
  ======================================================= */

  React.useEffect(() => {
    if (
      typeof window === "undefined"
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
     SAVE CHECKOUT
  ======================================================= */

  React.useEffect(() => {
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
    SHIPPING_METHODS[form.shippingMethod] ??
    SHIPPING_METHODS.bosta;

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
        form.phone.replace(/\s/g, "")
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

    /*
     * If branch pickup is selected,
     * address is technically not required.
     */
    if (
      form.shippingMethod === "branch"
    ) {
      delete nextErrors.address;
      delete nextErrors.city;
      delete nextErrors.governorate;
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors).length === 0
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

              /*
               * Useful for backend.
               */
              paymentProvider:
                form.paymentMethod ===
                  "card" ||
                form.paymentMethod ===
                  "installment"
                  ? "paymob"
                  : "cod",

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

      /* =================================================
         PAYMOB
      ================================================= */

      /*
       * Backend should return paymentUrl
       * when payment method is card/installment.
       */

      if (
        (
          form.paymentMethod ===
            "card" ||
          form.paymentMethod ===
            "installment"
        ) &&
        result?.paymentUrl
      ) {
        try {
          localStorage.setItem(
            "paymob_pending_order",
            JSON.stringify({
              orderId:
                result.orderId,
              createdAt:
                Date.now(),
              returnUrl:
                result.returnUrl,
            })
          );
        } catch {}

        window.location.href =
          result.paymentUrl;

        return;
      }

      /* =================================================
         COD / NORMAL SUCCESS
      ================================================= */

      try {
        localStorage.removeItem(
          CHECKOUT_STORAGE_KEY
        );
      } catch {}

      await clearCart();

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
            <ArrowLeft size={16} />

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
          onSubmit={handleCheckout}
        >
          <div className="grid gap-6 lg:grid-cols-[1fr_400px]">

            {/* =============================================
                LEFT
            ============================================= */}

            <div className="space-y-6">

              {/* ===========================================
                  CUSTOMER
              =========================================== */}

              <Section
                icon={<User size={19} />}
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
                  <MapPin size={19} />
                }
                title="Shipping Address"
                description={
                  form.shippingMethod ===
                  "branch"
                    ? "Optional for branch pickup."
                    : "Where should we deliver your order?"
                }
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
                    required={
                      form.shippingMethod !==
                      "branch"
                    }
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
                    required={
                      form.shippingMethod !==
                      "branch"
                    }
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
                      required={
                        form.shippingMethod !==
                        "branch"
                      }
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
                icon={<Truck size={19} />}
                title="Delivery Method"
                description="Choose how you want to receive your order."
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
                          ].join(" ")}
                        >
                          <div className="flex items-center gap-4">

                            <div
                              className={[
                                "flex h-11 w-11 items-center justify-center rounded-xl",
                                selected
                                  ? "bg-[#5ABBE6] text-white"
                                  : "bg-gray-100 text-gray-500",
                              ].join(" ")}
                            >
                              {
                                method.icon
                              }
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

                          <div className="flex items-center gap-3">

                            <span className="text-sm font-bold text-gray-950">
                              {
                                method.price
                              }{" "}
                              EGP
                            </span>

                            <div
                              className={[
                                "flex h-5 w-5 items-center justify-center rounded-full border",
                                selected
                                  ? "border-[#5ABBE6] bg-[#5ABBE6]"
                                  : "border-gray-300",
                              ].join(" ")}
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
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>

                {/* BOSTA NOTE */}

                {form.shippingMethod ===
                  "bosta" && (
                  <div className="mt-4 rounded-xl border border-[#5ABBE6]/20 bg-[#5ABBE6]/5 p-4">
                    <div className="flex gap-3">
                      <Truck
                        size={18}
                        className="mt-0.5 shrink-0 text-[#5ABBE6]"
                      />

                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          Bosta Door to Door
                        </p>

                        <p className="mt-1 text-xs leading-5 text-gray-500">
                          Your order will be
                          delivered directly
                          to your address
                          through Bosta.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

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
                description="Choose how you want to pay."
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
                      "flex w-full items-center justify-between rounded-2xl border p-4 text-left transition",
                      form.paymentMethod ===
                      "cod"
                        ? "border-[#5ABBE6] bg-[#5ABBE6]/5 ring-1 ring-[#5ABBE6]"
                        : "border-gray-200 bg-white hover:border-gray-400",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-4">

                      <div
                        className={[
                          "flex h-11 w-11 items-center justify-center rounded-xl",
                          form.paymentMethod ===
                          "cod"
                            ? "bg-[#5ABBE6] text-white"
                            : "bg-gray-100 text-gray-500",
                        ].join(" ")}
                      >
                        <WalletCards
                          size={20}
                        />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-950">
                          Cash on Delivery
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          Pay when your
                          order arrives.
                        </p>
                      </div>
                    </div>

                    <div
                      className={[
                        "flex h-5 w-5 items-center justify-center rounded-full border",
                        form.paymentMethod ===
                        "cod"
                          ? "border-[#5ABBE6] bg-[#5ABBE6]"
                          : "border-gray-300",
                      ].join(" ")}
                    >
                      {form.paymentMethod ===
                        "cod" && (
                        <Check
                          size={12}
                          className="text-white"
                        />
                      )}
                    </div>
                  </button>

                  {/* PAYMOB CARD */}

                  <button
                    type="button"
                    onClick={() =>
                      updateField(
                        "paymentMethod",
                        "card"
                      )
                    }
                    className={[
                      "flex w-full items-center justify-between rounded-2xl border p-4 text-left transition",
                      form.paymentMethod ===
                      "card"
                        ? "border-[#5ABBE6] bg-[#5ABBE6]/5 ring-1 ring-[#5ABBE6]"
                        : "border-gray-200 bg-white hover:border-gray-400",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-4">

                      <div
                        className={[
                          "flex h-11 w-11 items-center justify-center rounded-xl",
                          form.paymentMethod ===
                          "card"
                            ? "bg-[#5ABBE6] text-white"
                            : "bg-gray-100 text-gray-500",
                        ].join(" ")}
                      >
                        <CreditCard
                          size={20}
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-950">
                            Online Payment
                          </p>

                          <span className="rounded-full bg-[#5ABBE6]/10 px-2 py-0.5 text-[10px] font-bold text-[#328fb6]">
                            PAYMOB
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-gray-500">
                          Pay securely using
                          Visa or Mastercard.
                        </p>
                      </div>
                    </div>

                    <div
                      className={[
                        "flex h-5 w-5 items-center justify-center rounded-full border",
                        form.paymentMethod ===
                        "card"
                          ? "border-[#5ABBE6] bg-[#5ABBE6]"
                          : "border-gray-300",
                      ].join(" ")}
                    >
                      {form.paymentMethod ===
                        "card" && (
                        <Check
                          size={12}
                          className="text-white"
                        />
                      )}
                    </div>
                  </button>

                  {/* PAYMOB INSTALLMENT */}

                  <button
                    type="button"
                    onClick={() =>
                      updateField(
                        "paymentMethod",
                        "installment"
                      )
                    }
                    className={[
                      "flex w-full items-center justify-between rounded-2xl border p-4 text-left transition",
                      form.paymentMethod ===
                      "installment"
                        ? "border-[#5ABBE6] bg-[#5ABBE6]/5 ring-1 ring-[#5ABBE6]"
                        : "border-gray-200 bg-white hover:border-gray-400",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-4">

                      <div
                        className={[
                          "flex h-11 w-11 items-center justify-center rounded-xl",
                          form.paymentMethod ===
                          "installment"
                            ? "bg-[#5ABBE6] text-white"
                            : "bg-gray-100 text-gray-500",
                        ].join(" ")}
                      >
                        <CreditCard
                          size={20}
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-950">
                            Pay in Installments
                          </p>

                          <span className="rounded-full bg-[#5ABBE6]/10 px-2 py-0.5 text-[10px] font-bold text-[#328fb6]">
                            PAYMOB
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-gray-500">
                          Pay online using
                          available installment
                          plans.
                        </p>
                      </div>
                    </div>

                    <div
                      className={[
                        "flex h-5 w-5 items-center justify-center rounded-full border",
                        form.paymentMethod ===
                        "installment"
                          ? "border-[#5ABBE6] bg-[#5ABBE6]"
                          : "border-gray-300",
                      ].join(" ")}
                    >
                      {form.paymentMethod ===
                        "installment" && (
                        <Check
                          size={12}
                          className="text-white"
                        />
                      )}
                    </div>
                  </button>

                </div>

                {/* PAYMOB INFO */}

                {(form.paymentMethod ===
                  "card" ||
                  form.paymentMethod ===
                    "installment") && (
                  <div className="mt-4 rounded-xl border border-[#5ABBE6]/20 bg-[#5ABBE6]/5 p-4">
                    <div className="flex gap-3">
                      <ShieldCheck
                        size={18}
                        className="mt-0.5 shrink-0 text-[#5ABBE6]"
                      />

                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          Secure Paymob Payment
                        </p>

                        <p className="mt-1 text-xs leading-5 text-gray-500">
                          You will be redirected
                          to Paymob to complete
                          your payment securely.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

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
                      {cartCount === 1
                        ? "item"
                        : "items"}
                    </span>
                  </div>
                </div>

                {/* PRODUCTS */}

                <div className="max-h-[500px] overflow-y-auto p-5">

                  <div className="space-y-5">

                    {cart.map(
                      (item) => {
                        const image =
                          getProductImage(
                            item
                          );

                        const quantity =
                          Math.max(
                            1,
                            Number(
                              item.quantity
                            ) || 1
                          );

                        const itemTotal =
                          Number(
                            item.price || 0
                          ) *
                          quantity;

                        return (
                          <div
                            key={item.id}
                            className="border-b border-gray-100 pb-5 last:border-0 last:pb-0"
                          >

                            <div className="flex gap-3">

                              {/* IMAGE */}

                              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">

                                {image ? (
                                  <img
                                    src={image}
                                    alt={
                                      item.name ||
                                      "Product"
                                    }
                                    className="h-full w-full object-contain p-1"
                                    loading="lazy"
                                    onError={(
                                      e
                                    ) => {
                                      e.currentTarget.style.display =
                                        "none";
                                    }}
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center">
                                    <Package
                                      size={
                                        22
                                      }
                                      className="text-gray-400"
                                    />
                                  </div>
                                )}

                                <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#5ABBE6] px-1 text-[10px] font-bold text-white">
                                  {
                                    quantity
                                  }
                                </span>
                              </div>

                              {/* PRODUCT INFO */}

                              <div className="min-w-0 flex-1">

                                <p className="line-clamp-2 text-sm font-semibold text-gray-900">
                                  {
                                    item.name
                                  }
                                </p>

                                <p className="mt-1 text-xs text-gray-500">
                                  {Number(
                                    item.price ||
                                      0
                                  ).toFixed(
                                    2
                                  )}{" "}
                                  EGP
                                </p>

                                {/* QUANTITY */}

                                <div className="mt-3 flex items-center justify-between">

                                  <div className="flex items-center rounded-lg border border-gray-200 bg-white">

                                    <button
                                      type="button"
                                      disabled={
                                        submitting
                                      }
                                      onClick={() =>
                                        decreaseQuantity(
                                          item.id
                                        )
                                      }
                                      className="flex h-8 w-8 items-center justify-center text-gray-500 transition hover:bg-gray-50 hover:text-[#5ABBE6] disabled:opacity-50"
                                      aria-label="Decrease quantity"
                                    >
                                      <Minus
                                        size={
                                          14
                                        }
                                      />
                                    </button>

                                    <span className="flex h-8 min-w-8 items-center justify-center border-x border-gray-200 px-2 text-xs font-semibold text-gray-900">
                                      {
                                        quantity
                                      }
                                    </span>

                                    <button
                                      type="button"
                                      disabled={
                                        submitting
                                      }
                                      onClick={() =>
                                        increaseQuantity(
                                          item.id
                                        )
                                      }
                                      className="flex h-8 w-8 items-center justify-center text-gray-500 transition hover:bg-gray-50 hover:text-[#5ABBE6] disabled:opacity-50"
                                      aria-label="Increase quantity"
                                    >
                                      <Plus
                                        size={
                                          14
                                        }
                                      />
                                    </button>

                                  </div>

                                  <button
                                    type="button"
                                    disabled={
                                      submitting
                                    }
                                    onClick={() =>
                                      removeFromCart(
                                        item.id
                                      )
                                    }
                                    className="flex items-center gap-1 text-xs text-gray-400 transition hover:text-red-500 disabled:opacity-50"
                                  >
                                    <Trash2
                                      size={
                                        13
                                      }
                                    />

                                    Remove
                                  </button>
                                </div>
                              </div>

                              {/* ITEM TOTAL */}

                              <p className="shrink-0 text-sm font-bold text-gray-950">
                                {itemTotal.toFixed(
                                  2
                                )}{" "}
                                EGP
                              </p>
                            </div>
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

                    <div className="flex justify-between text-xs text-gray-400">
                      <span>
                        {
                          selectedShipping.name
                        }
                      </span>

                      <span>
                        {
                          form.shippingMethod ===
                          "bosta"
                            ? "Bosta"
                            : "Store"
                        }
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

                    <span className="text-xs text-gray-400">
                      Incl. shipping
                    </span>
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
                        {form.paymentMethod ===
                        "cod"
                          ? "Place Order"
                          : "Continue to Payment"}

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
