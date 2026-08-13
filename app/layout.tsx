import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

import Navbar from "@/components/navbar/Navbar";
import Slider from "@/components/Slider/Slider";
import Info from "@/components/Info/Info";
import Trend from "@/components/Trend/Trend";
import Footer from "@/components/footer/Footer";

import { CartProvider } from "@/context/CartContext";
import SessionProviderWrapper from "@/components/providers/SessionProvider";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

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
        "font-sans",
        geist.variable
      )}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col">

        {/* Session Provider لازم يكون فوق CartProvider */}
        <SessionProviderWrapper>

          {/* CartProvider بيقدر يستخدم useSession هنا */}
          <CartProvider>

            <Navbar />

            <div className="flex-1">
              {children}
            </div>

          </CartProvider>

        </SessionProviderWrapper>

        <Footer />

      </body>
    </html>
  );
}