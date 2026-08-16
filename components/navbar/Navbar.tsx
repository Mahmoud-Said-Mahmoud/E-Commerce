"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { signOut, useSession } from "next-auth/react";

import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";

import {
  ShoppingCart,
  User,
  MapPinHouse,
  Heart,
  ChevronDown,
  ChevronRight,
  LogOut,
  Package,
} from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import NewSearch from "../search/search";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useLanguage } from "@/context/LanguageContext";

/* =========================================================
   TYPES
========================================================= */

interface Category {
  id: number;
  name: string;
  slug: string;
  parent: number;
  children?: Category[];
}

/* =========================================================
   DECODE HTML
========================================================= */

function decodeHtml(value: string) {
  if (typeof document === "undefined") {
    return value;
  }

  const textarea = document.createElement("textarea");

  textarea.innerHTML = value;

  return textarea.value;
}

/* =========================================================
   BUILD CATEGORY TREE
========================================================= */

function buildCategoryTree(categories: Category[]) {
  const alreadyNested = categories.some(
    (category) =>
      Array.isArray(category.children) &&
      category.children.length > 0
  );

  if (alreadyNested) {
    return categories.filter(
      (category) => category.parent === 0
    );
  }

  const map = new Map<number, Category>();

  categories.forEach((category) => {
    map.set(category.id, {
      ...category,
      children: [],
    });
  });

  const tree: Category[] = [];

  categories.forEach((category) => {
    const current = map.get(category.id);

    if (!current) {
      return;
    }

    if (category.parent === 0) {
      tree.push(current);
      return;
    }

    const parent = map.get(category.parent);

    if (parent) {
      if (!parent.children) {
        parent.children = [];
      }

      parent.children.push(current);
    }
  });

  return tree;
}

/* =========================================================
   NAVBAR
========================================================= */

export default function Navbar() {
  /* =======================================================
     AUTH SESSION
  ======================================================= */

  const {
    data: session,
    status,
  } = useSession();

  /* =======================================================
     GENERAL STATES
  ======================================================= */

  const [authMode, setAuthMode] =
    useState<"login" | "register">("login");

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [loadingCategories, setLoadingCategories] =
    useState(true);

  /* =======================================================
     CART CONTEXT
  ======================================================= */

  const { cartCount } = useCart();

  /* =======================================================
     WISHLIST CONTEXT
  ======================================================= */

  const { wishlist } = useWishlist();
  const { isArabic, toggleLocale, t } = useLanguage();

  /* =======================================================
     CART COUNT
  ======================================================= */

  /* =======================================================
     FETCH CATEGORIES
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    async function getCategories() {
      try {
        const response = await fetch(
          "/api/categories",
          {
            method: "GET",
            cache: "force-cache",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch categories"
          );
        }

        const data: Category[] =
          await response.json();

        if (mounted) {
          setCategories(data);
        }
      } catch (error) {
        console.error(
          "Categories error:",
          error
        );
      } finally {
        if (mounted) {
          setLoadingCategories(false);
        }
      }
    }

    getCategories();

    return () => {
      mounted = false;
    };
  }, []);

  /* =======================================================
     CATEGORY TREE
  ======================================================= */

  const categoryTree = useMemo(() => {
    return buildCategoryTree(categories);
  }, [categories]);

  /* =======================================================
     USER NAME
  ======================================================= */

  const userName =
    session?.user?.name || t("nav.account");

  /* =======================================================
     LOGOUT
  ======================================================= */

  async function handleLogout() {
    await signOut({
      callbackUrl: "/",
    });
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <header
      className="
        sticky
        top-0
        z-50
        w-full
        max-w-full
        border-b
        bg-white
        shadow-sm
        dark:bg-black
      "
    >
      {/* =====================================================
          TOP NAVBAR
      ===================================================== */}

      <div className="w-full">
        <div
          className="
            mx-auto
            w-full
            max-w-[1600px]
            px-3
            sm:px-5
            lg:px-6
          "
        >
          <div
            className="
              grid
              min-h-[72px]
              w-full
              min-w-0
              grid-cols-1
              items-center
              gap-3
              lg:grid-cols-[minmax(190px,auto)_minmax(250px,1fr)_minmax(250px,auto)]
            "
          >
            {/* =================================================
                LOGO + STORE
            ================================================= */}

            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              {/* LOGO */}

              <Link
                href="/"
                className="shrink-0"
              >
                <Image
                  src="/Image/logo.png"
                  alt="I-Technology"
                  width={150}
                  height={60}
                  priority
                  className="
                    h-auto
                    w-[110px]
                    object-contain
                    sm:w-[125px]
                    lg:w-[135px]
                  "
                />
              </Link>

              {/* STORE LOCATION */}

              <Dialog>
                <DialogTrigger
                  render={
                    <Button
                      variant="outline"
                      className="
                        hidden
                        h-9
                        shrink-0
                        items-center
                        gap-2
                        whitespace-nowrap
                        sm:flex
                      "
                    >
                      <MapPinHouse className="size-4 text-[#0497D8]" />

                      <span className="hidden lg:inline">
                        {t("nav.storeLocation")}
                      </span>
                    </Button>
                  }
                />

                <DialogContent className="w-[95%] max-w-[650px]">
                  <DialogHeader>
                    <DialogTitle>
                      {t("nav.storeDialogTitle")}
                    </DialogTitle>

                    <DialogDescription>
                      {t("nav.storeDialogDescription")}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="overflow-hidden rounded-lg">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3451.0385874493927!2d31.3310175!3d30.1217093!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x145815b80eca7a8f%3A0x3cd44d697df321cf!2sI-Technology!5e0!3m2!1sar!2seg!4v1785959031557!5m2!1sar!2seg"
                      width="600"
                      height="450"
                      loading="lazy"
                      className="
                        h-[350px]
                        w-full
                        border-0
                        sm:h-[450px]
                      "
                    />
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      className="
                        bg-[#0497D8]
                        hover:bg-[#0387c2]
                      "
                      onClick={() => {
                        window.open(
                          "https://www.google.com/maps/dir/?api=1&destination=30.1217093,31.3310175",
                          "_blank"
                        );
                      }}
                    >
                      {t("nav.goToStore")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* =================================================
                SEARCH
            ================================================= */}

            <div className="hidden min-w-0 justify-center lg:flex">
              <div className="w-full max-w-2xl min-w-0">
                <NewSearch />
              </div>
            </div>

            {/* =================================================
                ACTIONS
            ================================================= */}

            <div
              className="
                flex
                min-w-0
                items-center
                justify-end
                gap-2
                sm:gap-3
                lg:gap-4
              "
            >
              {/* LANGUAGE */}

              <div className="flex shrink-0 items-center gap-2">
                <Switch
                  id="lang"
                  checked={!isArabic}
                  onCheckedChange={toggleLocale}
                />

                <Image
                  src={isArabic ? "/Image/ar-flag.webp" : "/Image/us-flag.webp"}
                  width={20}
                  height={20}
                  alt={isArabic ? "Arabic" : "English"}
                  className="object-contain"
                />

                <span className="hidden text-xs font-medium text-gray-600 md:inline">
                  {t("nav.languageLabel")}
                </span>
              </div>

              {/* =================================================
                  WISHLIST
              ================================================= */}

              <Link
                href="/wishlist"
                aria-label={`${t("nav.wishlist")}${
                  wishlist.length > 0
                    ? ` (${wishlist.length})`
                    : ""
                }`}
                className="
                  relative
                  flex
                  shrink-0
                  items-center
                  justify-center
                  transition
                  hover:scale-110
                "
              >
                <Heart className="size-5 text-[#0497D8]" />

                {/* WISHLIST COUNT */}

                {wishlist.length > 0 && (
                  <span
                    className="
                      absolute
                      -right-2.5
                      -top-2.5
                      flex
                      h-4
                      min-w-4
                      items-center
                      justify-center
                      rounded-full
                      bg-[#E53935]
                      px-1
                      text-[10px]
                      font-bold
                      leading-none
                      text-white
                    "
                  >
                    {wishlist.length > 99
                      ? "99+"
                      : wishlist.length}
                  </span>
                )}
              </Link>

              {/* =================================================
                  CART
              ================================================= */}

              <Link
                href="/cart"
                aria-label={t("nav.cart")}
                className="
                  relative
                  flex
                  shrink-0
                  items-center
                  justify-center
                  transition
                  hover:scale-110
                "
              >
                <ShoppingCart className="size-5 text-[#0497D8]" />

                {cartCount > 0 && (
                  <span
                    className="
                      absolute
                      -right-2.5
                      -top-2.5
                      flex
                      h-4
                      min-w-4
                      items-center
                      justify-center
                      rounded-full
                      bg-[#E53935]
                      px-1
                      text-[10px]
                      font-bold
                      leading-none
                      text-white
                    "
                  >
                    {cartCount > 99
                      ? "99+"
                      : cartCount}
                  </span>
                )}
              </Link>

              {/* =================================================
                  AUTH
              ================================================= */}

              {status === "loading" ? (
                /* LOADING */

                <div
                  className="
                    hidden
                    h-9
                    w-24
                    animate-pulse
                    rounded-lg
                    bg-gray-100
                    sm:block
                  "
                />
              ) : status === "authenticated" ? (
                /* =================================================
                   LOGGED IN USER
                ================================================= */

                <div className="group relative">
                  {/* USER BUTTON */}

                  <Link
                    href="/account"
                    className="
                      hidden
                      h-9
                      shrink-0
                      items-center
                      gap-2
                      rounded-lg
                      border
                      border-gray-200
                      px-3
                      text-sm
                      font-medium
                      text-gray-700
                      transition
                      hover:border-[#0497D8]
                      hover:text-[#0497D8]
                      sm:flex
                    "
                  >
                    <User className="size-4" />

                    <span className="max-w-[120px] truncate">
                      {userName}
                    </span>

                    <ChevronDown
                      className="
                        size-3.5
                        transition-transform
                        duration-200
                        group-hover:rotate-180
                      "
                    />
                  </Link>

                  {/* =================================================
                      USER DROPDOWN
                  ================================================= */}

                  <div
                    className="
                      invisible
                      absolute
                      right-0
                      top-[calc(100%+8px)]
                      z-[100]
                      w-56
                      translate-y-2
                      rounded-xl
                      border
                      border-gray-100
                      bg-white
                      p-2
                      opacity-0
                      shadow-xl
                      transition-all
                      duration-150
                      group-hover:visible
                      group-hover:translate-y-0
                      group-hover:opacity-100
                    "
                  >
                    {/* USER INFO */}

                    <div
                      className="
                        mb-1
                        border-b
                        border-gray-100
                        px-3
                        pb-3
                        pt-2
                      "
                    >
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {userName}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-gray-500">
                        {session?.user?.email}
                      </p>
                    </div>

                    {/* MY ACCOUNT */}

                    <Link
                      href="/account"
                      className="
                        flex
                        items-center
                        gap-3
                        rounded-lg
                        px-3
                        py-2.5
                        text-sm
                        text-gray-700
                        transition
                        hover:bg-[#0497D8]/10
                        hover:text-[#0497D8]
                      "
                    >
                      <User className="size-4" />

                      <span>
                        {t("nav.myAccount")}
                      </span>
                    </Link>

                    {/* ORDERS */}

                    <Link
                      href="/account/orders"
                      className="
                        flex
                        items-center
                        gap-3
                        rounded-lg
                        px-3
                        py-2.5
                        text-sm
                        text-gray-700
                        transition
                        hover:bg-[#0497D8]/10
                        hover:text-[#0497D8]
                      "
                    >
                      <Package className="size-4" />

                      <span>
                        {t("nav.myOrders")}
                      </span>
                    </Link>

                    {/* WISHLIST */}

                    <Link
                      href="/wishlist"
                      className="
                        flex
                        items-center
                        justify-between
                        gap-3
                        rounded-lg
                        px-3
                        py-2.5
                        text-sm
                        text-gray-700
                        transition
                        hover:bg-[#0497D8]/10
                        hover:text-[#0497D8]
                      "
                    >
                      <div className="flex items-center gap-3">
                        <Heart className="size-4" />

                        <span>
                          {t("nav.wishlist")}
                        </span>
                      </div>

                      {/* WISHLIST COUNT IN DROPDOWN */}

                      {wishlist.length > 0 && (
                        <span
                          className="
                            flex
                            h-5
                            min-w-5
                            items-center
                            justify-center
                            rounded-full
                            bg-[#E53935]
                            px-1
                            text-[10px]
                            font-bold
                            text-white
                          "
                        >
                          {wishlist.length > 99
                            ? "99+"
                            : wishlist.length}
                        </span>
                      )}
                    </Link>

                    {/* DIVIDER */}

                    <div className="my-1 h-px bg-gray-100" />

                    {/* LOGOUT */}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="
                        flex
                        w-full
                        items-center
                        gap-3
                        rounded-lg
                        px-3
                        py-2.5
                        text-left
                        text-sm
                        font-medium
                        text-red-600
                        transition
                        hover:bg-red-50
                      "
                    >
                      <LogOut className="size-4" />

                      <span>
                        {t("nav.logout")}
                      </span>
                    </button>
                  </div>
                </div>
              ) : (
                /* =================================================
                   LOGGED OUT
                ================================================= */

                <Dialog>
                  <DialogTrigger
                    render={
                      <Button
                        variant="outline"
                        className="
                          hidden
                          h-9
                          shrink-0
                          items-center
                          gap-2
                          whitespace-nowrap
                          sm:flex
                        "
                        onClick={() =>
                          setAuthMode("login")
                        }
                      >
                        <User className="size-4" />

                        <span className="hidden lg:inline">
                          {t("nav.signIn")}
                        </span>
                      </Button>
                    }
                  />

                  <DialogContent className="w-[95%] sm:max-w-[450px]">
                    {/* =================================================
                        LOGIN
                    ================================================= */}

                    {authMode === "login" ? (
                      <>
                        <DialogHeader>
                          <DialogTitle>
                            {t("nav.welcomeBack")}
                          </DialogTitle>

                          <DialogDescription>
                            {t("nav.signInDescription")}
                          </DialogDescription>
                        </DialogHeader>

                        <LoginForm />

                        <DialogFooter className="flex-col gap-2 sm:flex-col">
                          <p className="text-center text-sm text-gray-500">
                            {t("nav.noAccount")}
                          </p>

                          <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() =>
                              setAuthMode(
                                "register"
                              )
                            }
                          >
                            {t("nav.createAccount")}
                          </Button>
                        </DialogFooter>
                      </>
                    ) : (
                      /* =================================================
                         REGISTER
                      ================================================= */

                      <>
                        <DialogHeader>
                          <DialogTitle>
                            {t("nav.createAccount")}
                          </DialogTitle>

                          <DialogDescription>
                            {t("nav.createAccountDescription")}
                          </DialogDescription>
                        </DialogHeader>

                        <RegisterForm />

                        <DialogFooter className="flex-col gap-2 sm:flex-col">
                          <p className="text-center text-sm text-gray-500">
                            {t("nav.haveAccount")}
                          </p>

                          <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() =>
                              setAuthMode(
                                "login"
                              )
                            }
                          >
                            {t("nav.signIn")}
                          </Button>
                        </DialogFooter>
                      </>
                    )}
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          {/* =====================================================
              MOBILE / TABLET SEARCH
          ===================================================== */}

          <div className="pb-3 lg:hidden">
            <NewSearch />
          </div>
        </div>
      </div>

      {/* =====================================================
          CATEGORY NAVBAR
      ===================================================== */}

      <div className="w-full border-t">
        <div
          className="
            mx-auto
            w-full
            max-w-[1600px]
            px-3
            sm:px-5
            lg:px-6
          "
        >
          <nav
            className="
              relative
              flex
              min-h-12
              w-full
              min-w-0
              items-center
              gap-1
              overflow-visible
            "
          >
            {loadingCategories ? (
              <div
                className="
                  flex
                  min-h-12
                  w-full
                  shrink-0
                  items-center
                  justify-center
                "
              >
                <span className="text-xs text-gray-400">
                  {t("nav.loadingCategories")}
                </span>
              </div>
            ) : (
              <>
                {categoryTree.map(
                  (category) => (
                    <CategoryMenu
                      key={category.id}
                      category={category}
                    />
                  )
                )}
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

/* =========================================================
   CATEGORY MENU
========================================================= */

function CategoryMenu({
  category,
}: {
  category: Category;
}) {
  const hasChildren =
    Array.isArray(category.children) &&
    category.children.length > 0;

  return (
    <div className="group relative shrink-0">
      {/* PARENT */}

      <Link
        href={`/products?category=${category.id}`}
        title={decodeHtml(category.name)}
        className="
          flex
          min-h-12
          items-center
          justify-center
          gap-1
          whitespace-nowrap
          px-2
          text-[13px]
          font-medium
          text-gray-700
          transition-colors
          hover:text-[#0497D8]
          xl:px-3
          dark:text-gray-200
        "
      >
        <span>
          {decodeHtml(category.name)}
        </span>

        {hasChildren && (
          <ChevronDown
            className="
              size-3.5
              transition-transform
              duration-200
              group-hover:rotate-180
            "
          />
        )}
      </Link>

      {/* PARENT DROPDOWN */}

      {hasChildren && (
        <div
          className="
            invisible
            absolute
            left-0
            top-full
            z-[100]
            w-[270px]
            max-w-[calc(100vw-24px)]
            translate-y-2
            rounded-xl
            border
            border-gray-100
            bg-white
            p-2
            opacity-0
            shadow-2xl
            transition-all
            duration-150
            group-hover:visible
            group-hover:translate-y-0
            group-hover:opacity-100
            dark:border-gray-800
            dark:bg-black
          "
        >
          {/* Parent Header */}

          <Link
            href={`/products?category=${category.id}`}
            className="
              mb-1
              flex
              min-h-10
              w-full
              items-center
              justify-between
              rounded-lg
              bg-gray-50
              px-3
              py-2
              text-sm
              font-semibold
              text-gray-900
              transition
              hover:bg-[#0497D8]/10
              hover:text-[#0497D8]
              dark:bg-gray-900
              dark:text-white
            "
          >
            <span className="truncate">
              {decodeHtml(category.name)}
            </span>

            <ChevronRight
              className="
                size-4
                shrink-0
                text-gray-400
              "
            />
          </Link>

          {/* Divider */}

          <div
            className="
              my-1
              h-px
              bg-gray-100
              dark:bg-gray-800
            "
          />

          {/* SUB */}

          <div className="flex flex-col">
            {category.children?.map(
              (child) => (
                <NestedCategory
                  key={child.id}
                  category={child}
                />
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   NESTED CATEGORY
========================================================= */

function NestedCategory({
  category,
}: {
  category: Category;
}) {
  const hasChildren =
    Array.isArray(category.children) &&
    category.children.length > 0;

  return (
    <div className="group/sub relative w-full">
      {/* CURRENT SUB */}

      <Link
        href={`/products?category=${category.id}`}
        title={decodeHtml(category.name)}
        className="
          flex
          min-h-10
          w-full
          items-center
          justify-between
          gap-3
          rounded-lg
          px-3
          py-2
          text-sm
          text-gray-700
          transition-colors
          hover:bg-[#0497D8]/10
          hover:text-[#0497D8]
          dark:text-gray-200
        "
      >
        <span className="min-w-0 truncate">
          {decodeHtml(category.name)}
        </span>

        {hasChildren && (
          <ChevronRight
            className="
              size-4
              shrink-0
              text-gray-400
              transition-transform
              duration-150
              group-hover/sub:translate-x-0.5
            "
          />
        )}
      </Link>

      {/* SUB CHILD DROPDOWN */}

      {hasChildren && (
        <div
          className="
            invisible
            absolute
            left-[calc(100%+6px)]
            top-0
            z-[110]
            w-[270px]
            max-w-[calc(100vw-24px)]
            translate-x-2
            rounded-xl
            border
            border-gray-100
            bg-white
            p-2
            opacity-0
            shadow-2xl
            transition-all
            duration-150
            group-hover/sub:visible
            group-hover/sub:translate-x-0
            group-hover/sub:opacity-100
            dark:border-gray-800
            dark:bg-black
          "
        >
          {category.children?.map(
            (child) => (
              <NestedCategory
                key={child.id}
                category={child}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}
