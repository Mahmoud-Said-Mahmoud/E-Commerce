'use client'
import React from 'react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import Image from 'next/image'
export default function Slider() {
return (
    <div className='container mx-auto py-5'>
 <Carousel   opts={{
    align: "start",
    loop: true,
  }}  plugins={[
        Autoplay({
          delay: 4000,
        }),
      ]}>
  <CarouselContent>
    <CarouselItem><Image src='/Image/Huawei-nova-15-ar-copy.webp' width={2000} height={2000} alt='' className='w-full'/></CarouselItem>
    <CarouselItem><Image src='/Image/sc-site-arb-1.webp' width={2000} height={2000} alt='' className='w-full'/></CarouselItem>
    <CarouselItem><Image src='/Image/Huawei-nova-15-ar-copy.webp' width={2000} height={2000} alt='' className='w-full'/></CarouselItem>
  </CarouselContent>
  <CarouselPrevious className='hover:bg-[#0497D8]'/>
  <CarouselNext className='hover:bg-[#0497D8]'/>
</Carousel>
    </div>
)
}
