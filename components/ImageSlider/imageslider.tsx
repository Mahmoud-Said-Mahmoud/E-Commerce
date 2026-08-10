"use client";

import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useState } from "react";

export default function ProductGallery({ product }: any) {
  const [api, setApi] = useState<any>();

  return (
    <div className="space-y-4">

      {/* Main Images */}
      <Carousel
        setApi={setApi}
        opts={{
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {product.images.map((image: any, index: number) => (
            <CarouselItem key={index}>
              <Image
                src={image.src}
                height={1000}
                width={1000}
                alt={product.name}
                className="h-fit w-full object-cover"
              />
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      {/* Thumbnails */}
      <Carousel className="mx-auto w-[80%]">
        <CarouselContent className="mx-auto gap-1 p-2">
          {console.log(product.images)}
          {product.images.map((image: any, index: number) => (
            <CarouselItem
              key={index}
              onClick={() => api?.scrollTo(index)}
              style={{
                flexBasis: `${100 / product.images.length}%`,
              }}
              className="cursor-pointer rounded-lg border p-1"
            >
              <Image
                src={image.src}
                height={200}
                width={200}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious  />
        <CarouselNext />
      </Carousel>

    </div>
  );
}