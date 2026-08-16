import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

import { cn } from "@/lib/utils";
import { WishlistProvider } from "@/context/WishlistContext";
import Navbar from "@/components/navbar/Navbar";
import Slider from "@/components/Slider/Slider";
import Info from "@/components/Info/Info";
import Trend from "@/components/Trend/Trend";
import Footer from "@/components/footer/Footer";

import { CartProvider } from "@/context/CartContext";
import { LanguageProvider } from "@/context/LanguageContext";
import SessionProviderWrapper from "@/components/providers/SessionProvider";

const inter = localFont({
  src: "./fonts/Inter-VariableFont_opsz,wght.ttf",
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "I-Technology",
  description: "ECommerce",
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        inter.variable,
        "font-sans"
      )}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col">

       <LanguageProvider>
       <SessionProviderWrapper>
  <CartProvider>
    <WishlistProvider>
      <Navbar />

      <div className="flex-1">
        {children}
          <Toaster position="top-right" richColors />
      </div>
    </WishlistProvider>
  </CartProvider>
</SessionProviderWrapper>
</LanguageProvider>

        <Footer />

      </body>
    </html>
  );
}
