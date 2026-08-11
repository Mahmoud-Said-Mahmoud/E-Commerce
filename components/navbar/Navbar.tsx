"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import {
  ShoppingCart,
  User,
  MapPinHouse,
  Heart,
  ChevronDown,
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

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { ModeToggle } from "../Darkmode/darkMode";
import NewSearch from "../search/search";

/* =========================================================
   TYPES
========================================================= */

interface MenuItem {
  name: string;
  href: string;
}

interface Category {
  name: string;
  href: string;
  items?: MenuItem[];
}

/* =========================================================
   CATEGORIES
========================================================= */

const categories: Category[] = [
  {
    name: "Mobiles",
    href: "/products?category=66",
    items: [
      {
        name: "Smart Phones",
        href: "/products?category=66",
      },
      {
        name: "Feature Phones",
        href: "/products?category=66",
      },
    ],
  },

  {
    name: "Accessories",
    href: "/products?category=131",
    items: [
      {
        name: "Audio",
        href: "/products?category=131",
      },
      {
        name: "Computer Accessories",
        href: "/products?category=131",
      },
      {
        name: "Mobile Accessories",
        href: "/products?category=131",
      },
      {
        name: "Car Accessories",
        href: "/products?category=131",
      },
      {
        name: "Smart Devices",
        href: "/products?category=131",
      },
      {
        name: "Batteries",
        href: "/products?category=131",
      },
      {
        name: "Power",
        href: "/products?category=131",
      },
    ],
  },

  {
    name: "Laptop & PC",
    href: "/products?category=54",
    items: [
      {
        name: "Desktops",
        href: "/products?category=54",
      },
      {
        name: "Laptops",
        href: "/products?category=54",
      },
      {
        name: "Computer Parts",
        href: "/products?category=54",
      },
      {
        name: "Monitors",
        href: "/products?category=111",
      },
    ],
  },

  {
    name: "Gaming",
    href: "/products?category=948",
    items: [
      {
        name: "Gaming PC",
        href: "/products?category=948",
      },
      {
        name: "Gamepad & Controller",
        href: "/products?category=948",
      },
    ],
  },

  {
    name: "Network",
    href: "/products?category=71",
  },

  {
    name: "Home Appliances",
    href: "/products?category=1843",
  },

  {
    name: "Security Systems",
    href: "/products?category=2313",
  },

  {
    name: "Tools",
    href: "/products?category=17",
  },
];

/* =========================================================
   NAVBAR
========================================================= */

export default function Navbar() {
  const [isEnglish, setIsEnglish] = useState(true);

  return (
    <header className="sticky top-0 z-50 border-b bg-white shadow-sm dark:bg-black">
      {/* =====================================================
          TOP NAVBAR
      ===================================================== */}

      <div className="container mx-auto px-4">
        <div className="grid min-h-[72px] grid-cols-1 items-center gap-4 lg:grid-cols-3">
          {/* =================================================
              LOGO + STORE LOCATION
          ================================================= */}

          <div className="flex items-center gap-5">
            <Link href="/" className="shrink-0">
              <Image
                src="/Image/logo.png"
                alt="I-Technology"
                width={150}
                height={60}
                priority
                className="h-auto w-[130px] object-contain sm:w-[150px]"
              />
            </Link>

            {/* STORE LOCATION */}

            <Dialog>
              <DialogTrigger
                render={
                  <Button
                    variant="outline"
                    className="hidden items-center gap-2 sm:flex"
                  >
                    <MapPinHouse className="size-4 text-[#0497D8]" />

                    <span>Store Location</span>
                  </Button>
                }
              />

              <DialogContent className="w-[95%] max-w-[650px]">
                <DialogHeader>
                  <DialogTitle>Store Location</DialogTitle>

                  <DialogDescription>
                    Find our store location on Google Maps.
                  </DialogDescription>
                </DialogHeader>

                <div className="overflow-hidden rounded-lg">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3451.0385874493927!2d31.3310175!3d30.1217093!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x145815b80eca7a8f%3A0x3cd44d697df321cf!2sI-Technology!5e0!3m2!1sar!2seg!4v1785959031557!5m2!1sar!2seg"
                    width="600"
                    height="450"
                    loading="lazy"
                    className="h-[350px] w-full border-0 sm:h-[450px]"
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    className="bg-[#0497D8] hover:bg-[#0387c2]"
                    onClick={() => {
                      window.open(
                        "https://www.google.com/maps/dir/?api=1&destination=30.1217093,31.3310175",
                        "_blank"
                      );
                    }}
                  >
                    Go to Store
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* =================================================
              SEARCH
          ================================================= */}

          <div className="hidden justify-center lg:flex">
            <div className="w-full max-w-xl">
              <NewSearch />
            </div>
          </div>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="flex items-center justify-end gap-3 sm:gap-5">
            {/* DARK MODE */}

            <ModeToggle />

            {/* LANGUAGE */}

            <div className="flex items-center gap-2">
              <Switch
                id="lang"
                checked={isEnglish}
                onCheckedChange={setIsEnglish}
              />

              {isEnglish && (
                <Image
                  src="/Image/us-flag.webp"
                  width={20}
                  height={20}
                  alt="English"
                  className="object-contain"
                />
              )}
            </div>

            {/* WISHLIST */}

            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="transition hover:scale-110"
            >
              <Heart className="size-5 text-[#0497D8]" />
            </Link>

            {/* CART */}

            <Link
              href="/cart"
              aria-label="Shopping Cart"
              className="transition hover:scale-110"
            >
              <ShoppingCart className="size-5 text-[#0497D8]" />
            </Link>

            {/* LOGIN */}

            <Dialog>
              <DialogTrigger
                render={
                  <Button
                    variant="outline"
                    className="hidden items-center gap-2 sm:flex"
                  >
                    <User className="size-4" />
                    Sign In
                  </Button>
                }
              />

              <DialogContent className="w-[95%] sm:max-w-[420px]">
                <DialogHeader>
                  <DialogTitle>Login</DialogTitle>

                  <DialogDescription>
                    Welcome back 👋
                  </DialogDescription>
                </DialogHeader>

                <FieldGroup>
                  <Field>
                    <Label htmlFor="email">Email</Label>

                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@company.com"
                    />
                  </Field>

                  <Field>
                    <Label htmlFor="password">Password</Label>

                    <Input
                      id="password"
                      name="password"
                      type="password"
                    />
                  </Field>

                  <Button
                    type="button"
                    className="w-full bg-[#0497D8] hover:bg-[#0387c2]"
                  >
                    Login
                  </Button>
                </FieldGroup>

                <DialogFooter>
                  <Button type="button" variant="outline" className="w-full">
                    Sign Up
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* =====================================================
            MOBILE SEARCH
        ===================================================== */}

        <div className="pb-3 lg:hidden">
          <NewSearch />
        </div>
      </div>

      {/* =====================================================
          CATEGORY NAVIGATION
      ===================================================== */}

      <div className="hidden border-t lg:block">
        <div className="container mx-auto px-4">
          <nav className="flex items-center overflow-x-auto">
            {categories.map((category) =>
              category.items ? (
                <CategoryMenu
                  key={category.name}
                  category={category}
                />
              ) : (
                <SimpleNavLink
                  key={category.name}
                  name={category.name}
                  href={category.href}
                />
              )
            )}

            {/* =================================================
                BRAND
            ================================================= */}

            <Link
              href="/products?brand=1922"
              className="px-3 py-1"
            >
              <div className="flex h-10 items-center rounded-lg bg-[#ec6c0380] px-3 transition hover:opacity-80">
                <Image
                  src="/Image/cropped-2022logo-small.png"
                  alt="Brand"
                  width={100}
                  height={100}
                  className=" w-auto object-contain"
                />
              </div>
            </Link>
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
  return (
    <NavigationMenu className="shrink-0 border-r">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="gap-1">
            <Link href={category.href}>
              {category.name}
            </Link>
          </NavigationMenuTrigger>

          <NavigationMenuContent>
            <div className="flex min-w-[230px] flex-col gap-1 p-2">
              {category.items?.map((item) => (
                <NavigationMenuLink
                  key={item.name}
                  render={
                    <Link
                      href={item.href}
                      className="rounded-md px-3 py-2 text-sm transition hover:bg-muted"
                    >
                      {item.name}
                    </Link>
                  }
                />
              ))}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

/* =========================================================
   SIMPLE NAV LINK
========================================================= */

function SimpleNavLink({
  name,
  href,
}: {
  name: string;
  href: string;
}) {
  return (
    <NavigationMenu className="shrink-0 border-r">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink
            render={
              <Link
                href={href}
                className="inline-flex h-10 items-center px-4 text-sm font-medium transition hover:text-[#0497D8]"
              >
                {name}
              </Link>
            }
          />
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}