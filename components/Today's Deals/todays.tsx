"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "../ui/button";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";

import { productApi } from "@/service/product";
import type { ProductI } from "@/interface/product";

import { LuShieldCheck } from "react-icons/lu";
import { FaShippingFast } from "react-icons/fa";

const END_DATE = new Date("2026-08-15T23:59:59").getTime();

export default function Todays() {
  const [products, setProducts] = useState<ProductI[]>([]);
  const [loading, setLoading] = useState(true);

  const [time, setTime] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    async function getProducts() {
      try {
        const result = await productApi(1, {
          category: "134",
        });

        const filtered = (result.data || [])
          .filter((product) =>
            product.images?.some((image) => image?.src)
          )
          .slice(0, 8);

        setProducts(filtered);
      } finally {
        setLoading(false);
      }
    }

    getProducts();
  }, []);

  useEffect(() => {
    const update = () => {
      const diff = END_DATE - Date.now();

      if (diff <= 0) return;

      setTime({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };

    update();

    const timer = setInterval(update, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="container mx-auto py-10">
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        {/* DEAL CARD */}

        <Card className="overflow-hidden border-0 bg-gradient-to-br from-[#0497D8]/10 via-white to-[#0497D8]/5 shadow-lg">
          <div className="p-6">
            <div className="mb-5 flex items-center justify-between">
              <span className="rounded-full bg-[#0497D8] px-3 py-1 text-xs font-semibold text-white">
                LIMITED OFFER
              </span>

              <span className="text-sm font-medium text-[#0497D8]">
                Up to 50% OFF
              </span>
            </div>

            <h2 className="text-3xl font-bold text-gray-900">
              Today&apos;s Deals
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              Don&apos;t miss our biggest discounts on top electronics,
              accessories and smart devices.
            </p>

            <Image
              src="/Image/offers.png"
              width={500}
              height={400}
              alt="Offers"
              className="mx-auto my-5 h-44 w-full object-contain"
            />

            <p className="mb-3 text-sm font-semibold text-gray-700">
              Ends in
            </p>

            <div className="grid grid-cols-4 gap-2">
              <TimerBox label="Days" value={time.days} />
              <TimerBox label="Hours" value={time.hours} />
              <TimerBox label="Min" value={time.minutes} />
              <TimerBox label="Sec" value={time.seconds} />
            </div>

            <Button className="mt-6 w-full bg-[#0497D8] text-white hover:bg-[#0387c2]">
              Shop Now
            </Button>
          </div>
        </Card>

        {/* PRODUCTS */}

        <div className="min-w-0">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Special offers</p>

              <h3 className="text-xl font-semibold text-gray-900">
                Best Deals For You
              </h3>
            </div>

          
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-xl border"
                >
                  <div className="h-56 animate-pulse bg-gray-100" />

                  <div className="space-y-3 p-4">
                    <div className="h-4 animate-pulse rounded bg-gray-100" />

                    <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Carousel
              opts={{
                align: "start",
                loop: products.length > 4,
              }}
            >
              <CarouselContent className="-ml-4">
                {products.map((product) => {
                  const image = product.images?.find(
                    (item) => item?.src
                  );

                  if (!image?.src) return null;

                  return (
                    <CarouselItem
                      key={product.id}
                      className="basis-1/2 pl-4 lg:basis-1/4"
                    >
                      <Link href={`/products/detail/${product.id}`}>
                        <Card className="group h-full overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                          <div className="relative flex h-56 items-center justify-center overflow-hidden bg-gray-50">
                            <Image
                              src={image.src}
                              alt={product.name}
                              width={400}
                              height={400}
                              className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                            />

                            {product.on_sale && (
                              <span className="absolute left-3 top-3 rounded-full bg-red-500 px-2 py-1 text-xs font-semibold text-white">
                                Sale
                              </span>
                            )}
                          </div>

                          <CardHeader className="space-y-3">
                            <CardTitle className="line-clamp-2 text-sm font-medium">
                              {product.name}
                            </CardTitle>

                            <CardDescription>
                              <div className="flex items-center justify-between">
                                <span className="text-lg font-bold text-gray-900">
                                  {product.price} EGP
                                </span>

                                {product.on_sale &&
                                  product.regular_price && (
                                    <span className="text-xs text-gray-400 line-through">
                                      {product.regular_price}
                                    </span>
                                  )}
                              </div>

                              <div className="mt-3 h-7 overflow-hidden">
                                <div className="animate-vertical-slide">
                                  <div className="flex h-7 items-center gap-2 text-xs text-gray-500">
                                    <LuShieldCheck className="text-[#0497D8]" />
                                    Secure payment with Paymob
                                  </div>

                                  <div className="flex h-7 items-center gap-2 text-xs text-gray-500">
                                    <FaShippingFast className="text-[#0497D8]" />
                                    Delivery with Bosta
                                  </div>
                                </div>
                              </div>
                            </CardDescription>
                          </CardHeader>
                        </Card>
                      </Link>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>

              <CarouselPrevious className="left-2 bg-white shadow-md hover:bg-[#0497D8] hover:text-white" />

              <CarouselNext className="right-2 bg-white shadow-md hover:bg-[#0497D8] hover:text-white" />
            </Carousel>
          )}
        </div>
      </div>
    </section>
  );
}

function TimerBox({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border bg-white p-3 text-center shadow-sm">
      <p className="text-xl font-bold text-gray-900">
        {String(value).padStart(2, "0")}
      </p>

      <span className="text-[11px] text-gray-500">
        {label}
      </span>
    </div>
  );
}