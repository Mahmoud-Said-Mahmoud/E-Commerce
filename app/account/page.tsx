"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  User,
  ShoppingBag,
  Heart,
  ShoppingCart,
  MapPin,
  LogOut,
  Mail,
  ChevronRight,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export default function AccountPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <main className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-[#0497D8]" />
      </main>
    );
  }

  if (status === "unauthenticated") {
    return (
      <main className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm">
          <User className="mx-auto mb-4 size-12 text-[#0497D8]" />

          <h1 className="text-2xl font-bold text-gray-900">
            You are not logged in
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Please login to access your account.
          </p>

          <Link href="/">
            <Button className="mt-6 w-full bg-[#0497D8] hover:bg-[#0387c2]">
              Go to Store
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  const user = session?.user;

  const fullName =
    user?.name || "Customer";

  const email =
    user?.email || "No email";

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">

        {/* HEADER */}

        <div className="mb-8">
          <p className="text-sm font-medium text-[#0497D8]">
            My Account
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
            Welcome, {fullName}
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage your account, orders, wishlist and personal information.
          </p>
        </div>

        {/* ACCOUNT LAYOUT */}

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">

          {/* SIDEBAR */}

          <aside className="h-fit rounded-2xl border bg-white p-3 shadow-sm">

            <AccountNav
              href="/account"
              icon={<User className="size-5" />}
              label="Overview"
              active
            />

            <AccountNav
              href="/account/orders"
              icon={<ShoppingBag className="size-5" />}
              label="My Orders"
            />

            <AccountNav
              href="/wishlist"
              icon={<Heart className="size-5" />}
              label="Wishlist"
            />

            <AccountNav
              href="/cart"
              icon={<ShoppingCart className="size-5" />}
              label="Cart"
            />

            <AccountNav
              href="/account/addresses"
              icon={<MapPin className="size-5" />}
              label="Addresses"
            />

            <div className="my-3 h-px bg-gray-100" />

            <button
              type="button"
              onClick={() =>
                signOut({
                  callbackUrl: "/",
                })
              }
              className="
                flex
                w-full
                items-center
                gap-3
                rounded-xl
                px-3
                py-3
                text-sm
                font-medium
                text-red-500
                transition
                hover:bg-red-50
              "
            >
              <LogOut className="size-5" />

              <span>Logout</span>
            </button>
          </aside>

          {/* CONTENT */}

          <section className="space-y-6">

            {/* USER CARD */}

            <div className="rounded-2xl border bg-white p-6 shadow-sm">

              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-4">

                  {/* AVATAR */}

                  <div className="
                    flex
                    size-16
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-[#0497D8]/10
                    text-xl
                    font-bold
                    text-[#0497D8]
                  ">
                    {fullName.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {fullName}
                    </h2>

                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                      <Mail className="size-4" />
                      {email}
                    </div>
                  </div>

                </div>

                <Link href="/account/profile">
                  <Button
                    variant="outline"
                    className="gap-2"
                  >
                    Edit Profile
                    <ChevronRight className="size-4" />
                  </Button>
                </Link>

              </div>

            </div>

            {/* QUICK ACTIONS */}

            <div>
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Quick Access
              </h2>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <AccountCard
                  href="/account/orders"
                  icon={<ShoppingBag />}
                  title="Orders"
                  description="View your orders"
                />

                <AccountCard
                  href="/wishlist"
                  icon={<Heart />}
                  title="Wishlist"
                  description="Your saved products"
                />

                <AccountCard
                  href="/cart"
                  icon={<ShoppingCart />}
                  title="Cart"
                  description="View your shopping cart"
                />

                <AccountCard
                  href="/account/addresses"
                  icon={<MapPin />}
                  title="Addresses"
                  description="Manage your addresses"
                />

              </div>
            </div>

            {/* PERSONAL INFORMATION */}

            <div className="rounded-2xl border bg-white p-6 shadow-sm">

              <div className="mb-6 flex items-center justify-between">

                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Personal Information
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Your account information
                  </p>
                </div>

                <Link href="/account/profile">
                  <Button variant="ghost">
                    Edit
                  </Button>
                </Link>

              </div>

              <div className="grid gap-5 sm:grid-cols-2">

                <InfoItem
                  label="Full Name"
                  value={fullName}
                />

                <InfoItem
                  label="Email"
                  value={email}
                />

                <InfoItem
                  label="User ID"
                  value={user?.id || "—"}
                />

                <InfoItem
                  label="Account Status"
                  value="Active"
                />

              </div>

            </div>

          </section>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   ACCOUNT NAV
========================================================= */

function AccountNav({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`
        flex
        w-full
        items-center
        gap-3
        rounded-xl
        px-3
        py-3
        text-sm
        font-medium
        transition
        ${
          active
            ? "bg-[#0497D8]/10 text-[#0497D8]"
            : "text-gray-600 hover:bg-gray-50 hover:text-[#0497D8]"
        }
      `}
    >
      {icon}

      <span>{label}</span>
    </Link>
  );
}

/* =========================================================
   ACCOUNT CARD
========================================================= */

function AccountCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="
        group
        rounded-2xl
        border
        bg-white
        p-5
        shadow-sm
        transition
        hover:-translate-y-0.5
        hover:border-[#0497D8]/40
        hover:shadow-md
      "
    >
      <div className="
        mb-4
        flex
        size-11
        items-center
        justify-center
        rounded-xl
        bg-[#0497D8]/10
        text-[#0497D8]
      ">
        {icon}
      </div>

      <h3 className="font-semibold text-gray-900">
        {title}
      </h3>

      <p className="mt-1 text-sm text-gray-500">
        {description}
      </p>

      <div className="mt-4 flex items-center gap-1 text-sm font-medium text-[#0497D8]">
        View
        <ChevronRight className="size-4 transition group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 break-all text-sm font-medium text-gray-800">
        {value}
      </p>
    </div>
  );
}