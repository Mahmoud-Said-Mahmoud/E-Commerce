"use client";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { Button } from "../ui/button";
import { Truck } from "lucide-react";
import { ProductI } from "@/interface/product";
import { productApi } from "@/service/product";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import { LuShieldCheck } from "react-icons/lu";
import { FaShippingFast } from "react-icons/fa";

export default function Todays() {
  const [bestProduct, setBestProduct] = useState<ProductI[]>([]);
  const [id, setId] = useState(134);
  const [page, setpage] = useState(1);
  useEffect(() => {
    async function getProducts() {
      const best = await productApi(id,page);
      setBestProduct(best.data);
    }

    getProducts();
  }, [id]);
  const [time, setTime] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  // const now= new Date().getTime()
  const endDate = new Date("2026-08-10").getTime();

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();

      const diffrent = endDate - now;

      if (diffrent <= 0) {
        clearInterval(timer);

        setTime({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        });

        return;
      }

      setTime({
        days: Math.round(diffrent / (1000 * 60 * 60 * 24)),
        hours: Math.round(
          (diffrent % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        ),
        minutes: Math.round((diffrent % (1000 * 60 * 60)) / 1000 / 60),
        seconds: Math.round((diffrent % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <section className="container mx-auto flex gap-2 items-center py-5">
        <div className="w-full">
          <Card className="w-full p-4">
            <div className="flex gap-7 items-center">
              <div>
                <p className="text-[#0497D8] font-extrabold text-lg pb-2">
                  Today&apos;s Deals 🔥
                </p>
                <p className="leading-6">
                  Don&apos;t miss our biggest discounts Save up to 50% on top
                  electronics.
                </p>
              </div>

              <Image
                src="/Image/offers.png"
                width={400}
                height={400}
                alt="offers"
                className="w-1/2"
              />
            </div>
            <div>
              <p className="text-[16px] text-[#0497D8] font-bold ms-2">
                Ends In
              </p>
              <div className="flex gap-2">
                <Card className="w-17.5 p-2 text-center ">
                  <CardHeader className="p-0">
                    <p>Days</p>
                    <CardDescription>{time.days}</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="w-17.5 p-2 text-center">
                  <CardHeader className="p-0">
                    <p>Hours</p>
                    <CardDescription>{time.hours}</CardDescription>
                  </CardHeader>
                </Card>

                <Card className="w-17.5 p-2 text-center">
                  <CardHeader className="p-0">
                    <p>Minutes</p>
                    <CardDescription>{time.minutes}</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="w-17.5 p-2 text-center">
                  <CardHeader className="p-0">
                    <p>Seconds</p>
                    <CardDescription>{time.seconds}</CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>
            <Button className="hover:-translate-y-0.5 duration-300 w-1/3">
              Shop Now
            </Button>
          </Card>
        </div>

        <Carousel
          className="relative"
          opts={{
            align: "start",
            loop: true,
          }}
        >
          <CarouselContent className="p-1 m-1">
            {bestProduct.map((product) => (
              <CarouselItem key={product.id} className="basis-1/4">
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
                    <CardDescription className="flex justify-between items-center ">
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
          <CarouselPrevious className="hover:bg-[#0497D8] duration-200 cursor-pointer p-5 absolute left-5" />
          <CarouselNext className="hover:bg-[#0497D8] duration-200 cursor-pointer p-5 absolute right-3" />
        </Carousel>
      </section>
    </>
  );
}
