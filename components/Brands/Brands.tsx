"use client";

import React, { useEffect, useState } from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { BrandI } from "@/interface/brand";
import { BrandApi } from "@/service/brand";
import Image from "next/image";
import { Card } from "../ui/card";
import Autoplay from "embla-carousel-autoplay";

export default function Brands() {
  const [bestBrand, setBestBrand] = useState<BrandI[]>([]);

  useEffect(() => {
    async function getBrands() {
      const best = await BrandApi();
      setBestBrand(best);
      console.log(best);
    }

    getBrands();
  }, []);

  return (
    <section className="container mx-auto py-5">
      {/* Header */}
      <div className="mb-5">
        <p className="text-2xl font-bold">
          Popular Brands
        </p>

        <p className="text-sm text-muted-foreground">
          Shop from the brands you trust
        </p>
      </div>

      {/* Brands Carousel */}
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[
        Autoplay({
          delay: 2000,
        }),
      ]}
        className="w-full"
      >
        <CarouselContent className="p-5">
          {bestBrand.map(
            (brand) =>
              brand.image?.src && (
                <CarouselItem
                  key={brand.id}
                  className="pl-3 basis-1/6"
                >
                  <Card className="h-28 rounded-xl flex items-center justify-center p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#0497D8] hover:shadow-md">
                    <Image
                      src={brand.image.src}
                      alt={brand.name}
                      width={140}
                      height={70}
                      className="max-w-full max-h-full object-contain"
                    />
                  </Card>
                </CarouselItem>
              ),
          )}
        </CarouselContent>

        <CarouselPrevious className="left-2" />

        <CarouselNext className="right-2" />
      </Carousel>
    </section>
  );
}