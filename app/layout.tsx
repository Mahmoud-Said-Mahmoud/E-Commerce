import type { Metadata } from "next";
import localFont from 'next/font/local'
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import Navbar from "@/components/navbar/Navbar";
import { ThemeProvider } from "@/components/theme-provider"
import Slider from "@/components/Slider/Slider";
import Info from "@/components/Info/Info";
import Trend from "@/components/Trend/Trend";
import Footer from "@/components/footer/Footer";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = localFont({
  src: "./fonts/Inter-VariableFont_opsz,wght.ttf",
  variable: "--font-inter",
  display: "swap",
});


export const metadata: Metadata = {
  title: "I-Tehchnology",
  description: "ECommerce",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", inter.variable, "font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange 
            >
              <Navbar/>
        {children}
        <Info />
        <Footer/>
        </ThemeProvider>
        </body>
    </html>
  );
}
