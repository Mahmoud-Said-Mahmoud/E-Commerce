"use client";
import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IoCartOutline } from "react-icons/io5";
import { LuShieldCheck } from "react-icons/lu";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { productApi } from "@/service/product";
import { ProductI } from "@/interface/product";
import Image from "next/image";
import { start } from "repl";
import Autoplay from "embla-carousel-autoplay";
import { FaShippingFast } from "react-icons/fa";

export default function Assec() {
  const [bestProduct, setBestProduct] = useState<ProductI[]>([]);
  const [id, setId] = useState(131);
  const [page, setpage] = useState(1);
  useEffect(() => {
    async function getProducts() {
      const best = await productApi(id,page);
      setBestProduct(best.data);
    }

    getProducts();
  }, [id,page]);
  return (
    <div className="container mx-auto py-5">
      <h2 className="text-lg font-extrabold">Popular Accessories</h2>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent className="p-1 m-1">
          {bestProduct.map((product) => (
            <CarouselItem key={product.id} className="basis-1/5">
              <Card className="relative mx-auto w-full max-w-sm pt-0 cursor-pointer">
                {product.images[0]?.src && (
                  <Image
                    src={product.images[0].src}
                    alt={product.name}
                    width={500}
                    height={500}
                    className="w-full object-cover h-75 hover:scale-105 duration-200 p-2"
                  />
                )}

                <CardHeader className="h-25">
                  <CardTitle className="font-light line-clamp-2">
                    {product.name}
                  </CardTitle>
                  <CardDescription className="flex justify-between items-center">
                    <p className="font-extrabold text-black">
                      {product.price} EGP
                    </p>
                    <p className="line-through">{product.sale_price}</p>
                  </CardDescription>
                  <div className="h-8 overflow-hidden">
                    <div className="animate-vertical-slide">
                      <div className="h-8 flex items-center gap-2">
                        <LuShieldCheck className="text-[#0497D8]" />
                        <span>Secure payment with Paymob</span>
                      </div>
                      <div className="h-8 flex items-center gap-2">
                        <FaShippingFast className="text-[#0497D8]" />
                        <span>Track and delivery with Bosta</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hover:bg-[#0497D8] duration-200 cursor-pointer p-5" />
        <CarouselNext className="hover:bg-[#0497D8] duration-200 cursor-pointer p-5" />
      </Carousel>

    
    </div>
  );
}
