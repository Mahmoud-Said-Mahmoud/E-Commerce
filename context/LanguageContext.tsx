"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Locale = "en" | "ar";

type Dictionary = Record<string, string>;

type LanguageContextType = {
  locale: Locale;
  direction: "ltr" | "rtl";
  isArabic: boolean;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: string, fallback?: string) => string;
};

const LANGUAGE_STORAGE_KEY = "site_locale";

const dictionary: Record<Locale, Dictionary> = {
  en: {
    "nav.storeLocation": "Store Location",
    "nav.storeDialogTitle": "Store Location",
    "nav.storeDialogDescription": "Find our store location on Google Maps.",
    "nav.goToStore": "Go to Store",
    "nav.wishlist": "Wishlist",
    "nav.cart": "Shopping Cart",
    "nav.account": "Account",
    "nav.myAccount": "My Account",
    "nav.myOrders": "My Orders",
    "nav.logout": "Logout",
    "nav.signIn": "Sign In",
    "nav.welcomeBack": "Welcome Back",
    "nav.signInDescription": "Sign in to your I-Technology account",
    "nav.noAccount": "Don't have an account?",
    "nav.createAccount": "Create Account",
    "nav.createAccountDescription": "Create your I-Technology account",
    "nav.haveAccount": "Already have an account?",
    "nav.loadingCategories": "Loading categories...",
    "nav.languageLabel": "العربية",
  },
  ar: {
    "nav.storeLocation": "موقع الفرع",
    "nav.storeDialogTitle": "موقع الفرع",
    "nav.storeDialogDescription": "اعرف موقع الفرع على خرائط Google.",
    "nav.goToStore": "الاتجاهات إلى الفرع",
    "nav.wishlist": "المفضلة",
    "nav.cart": "عربة التسوق",
    "nav.account": "الحساب",
    "nav.myAccount": "حسابي",
    "nav.myOrders": "طلباتي",
    "nav.logout": "تسجيل الخروج",
    "nav.signIn": "تسجيل الدخول",
    "nav.welcomeBack": "مرحبًا بعودتك",
    "nav.signInDescription": "سجّل الدخول إلى حسابك في I-Technology",
    "nav.noAccount": "ليس لديك حساب؟",
    "nav.createAccount": "إنشاء حساب",
    "nav.createAccountDescription": "أنشئ حسابك في I-Technology",
    "nav.haveAccount": "لديك حساب بالفعل؟",
    "nav.loadingCategories": "جاري تحميل الأقسام...",
    "nav.languageLabel": "English",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getInitialLocale(): Locale {
  if (typeof window === "undefined") {
    return "en";
  }

  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return stored === "ar" ? "ar" : "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);
  const direction = locale === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = direction;
    localStorage.setItem(LANGUAGE_STORAGE_KEY, locale);
  }, [direction, locale]);

  const value = useMemo<LanguageContextType>(
    () => ({
      locale,
      direction,
      isArabic: locale === "ar",
      setLocale: setLocaleState,
      toggleLocale: () => setLocaleState((current) => (current === "ar" ? "en" : "ar")),
      t: (key, fallback) => dictionary[locale][key] || fallback || key,
    }),
    [direction, locale]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
}
