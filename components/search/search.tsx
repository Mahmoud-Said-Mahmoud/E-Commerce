"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  price: string;
  images: {
    src: string;
    alt: string;
  }[];
}

export default function NewSearch() {
  const router = useRouter();

  const searchRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  /* =========================================================
     SEARCH API
  ========================================================= */

  useEffect(() => {
    if (!query.trim()) {
      setProducts([]);
      setOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setOpen(true);

        const response = await fetch(
          `/api/search?q=${encodeURIComponent(query)}`,
        );

        if (!response.ok) {
          throw new Error("Search failed");
        }

        const data = await response.json();

        setProducts(
          Array.isArray(data)
            ? data
            : Array.isArray(data?.products)
            ? data.products
            : []
        );
      } catch (error) {
        console.error(error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  /* =========================================================
     CLICK OUTSIDE
  ========================================================= */

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /* =========================================================
     GO TO ALL SEARCH RESULTS
  ========================================================= */

  const handleSearchSubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const value = query.trim();

    if (!value) return;

    setOpen(false);

    router.push(
      `/products/search?q=${encodeURIComponent(value)}`,
    );
  };

  return (
    <div
      ref={searchRef}
      className="relative w-full max-w-xl"
    >
      {/* =====================================================
          SEARCH INPUT
      ===================================================== */}

      <form onSubmit={handleSearchSubmit}>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => {
              if (query.trim()) {
                setOpen(true);
              }
            }}
            placeholder="Search products..."
            className="
              h-12
              w-full
              rounded-xl
              border
              px-4
              pr-10
              outline-none
              focus:border-[#0497D8]
            "
          />

          {loading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div
                className="
                  h-4
                  w-4
                  animate-spin
                  rounded-full
                  border-2
                  border-gray-300
                  border-t-[#0497D8]
                "
              />
            </div>
          )}
        </div>
      </form>

      {/* =====================================================
          RESULTS
      ===================================================== */}

      {open && (
        <div
          className="
            absolute
            left-0
            right-0
            top-[calc(100%+8px)]
            z-50
            grid
            w-full
            max-w-[800px]
            grid-cols-1
            gap-2
            overflow-y-auto
            overscroll-contain
            rounded-xl
            border
            bg-white
            shadow-xl

            sm:grid-cols-2
            lg:grid-cols-3

            max-h-[70vh]
          "
        >
          {loading ? (
            <div className="col-span-full p-4 text-sm text-gray-500">
              Searching...
            </div>
          ) : products.length === 0 ? (
            <div className="col-span-full p-4 text-sm text-gray-500">
              No products found
            </div>
          ) : (
            <>
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/detail/${product.id}`}
                  onClick={() => setOpen(false)}
                  className="
                    flex
                    min-w-0
                    gap-3
                    border-b
                    p-3
                    transition
                    hover:bg-gray-50
                  "
                >
                  <div className="relative h-14 w-14 shrink-0">
                    {product.images?.[0]?.src && (
                      <Image
                        src={product.images[0].src}
                        alt={
                          product.images[0].alt ||
                          product.name
                        }
                        fill
                        className="object-contain"
                      />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-medium">
                      {product.name}
                    </p>

                    {product.sku && (
                      <p className="mt-1 text-xs text-gray-500">
                        SKU: {product.sku}
                      </p>
                    )}

                    <p className="mt-1 text-sm font-semibold">
                      {product.price}
                    </p>
                  </div>
                </Link>
              ))}

              {/* =================================================
                  SEE ALL RESULTS
              ================================================= */}

              <Link
                href={`/products/search?q=${encodeURIComponent(
                  query.trim(),
                )}`}
                onClick={() => setOpen(false)}
                className="
                  col-span-full
                  border-t
                  p-3
                  text-center
                  text-sm
                  font-medium
                  text-[#0497D8]
                  transition
                  hover:bg-gray-50
                "
              >
                See all results for "{query}"
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
