"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

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
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

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

        setProducts(data);
      } catch (error) {
        console.error(error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative w-full max-w-xl">
      {/* Search input */}

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim()) {
              setOpen(true);
            }
          }}
          placeholder="Search products..."
          className="h-12 w-full rounded-xl border px-4 pr-10 outline-none focus:border-[#0497D8]"
        />

        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-[#0497D8]" />
          </div>
        )}
      </div>

      {/* Results */}

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-xl border bg-white shadow-xl">
          {loading ? (
            <div className="p-4 text-sm text-gray-500">Searching...</div>
          ) : products.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">No products found</div>
          ) : (
            <>
            {/* {console.log(products.products)} */}
              {products.products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/detail/${product.id}`}
                  onClick={() => setOpen(false)}
                  className="flex gap-3 border-b p-3 transition hover:bg-gray-50"
                >
                  {/* Image */}

                  <div className="relative h-14 w-14 shrink-0">
                    {product.images?.[0]?.src && (
                      <Image
                        src={product.images[0].src}
                        alt={product.images[0].alt || product.name}
                        fill
                        className="object-contain"
                      />
                    )}
                  </div>

                  {/* Information */}

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

              {/* All results */}

              <Link
                href={`/products/search?q=${encodeURIComponent(query.trim())}`}
                onClick={() => setOpen(false)}
                className="block border-t p-3 text-center text-sm font-medium text-[#0497D8] hover:bg-gray-50"
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
