"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type ProductGalleryImage = {
  id?: number;
  src: string;
  alt?: string;
};

type ProductGalleryProps = {
  images: ProductGalleryImage[];
  productName: string;
  productImage: string;
  onSale?: boolean;
};

export default function ProductGallery({
  images,
  productName,
  productImage,
  onSale = false,
}: ProductGalleryProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);

  /*
   * =========================================================
   * CAROUSEL EVENTS
   * =========================================================
   */

  useEffect(() => {
    if (!api) return;

    const updateSelectedIndex = () => {
      setSelectedIndex(api.selectedScrollSnap());
    };

    updateSelectedIndex();

    api.on("select", updateSelectedIndex);
    api.on("reInit", updateSelectedIndex);

    return () => {
      api.off("select", updateSelectedIndex);
      api.off("reInit", updateSelectedIndex);
    };
  }, [api]);

  /*
   * =========================================================
   * KEEP ACTIVE THUMBNAIL VISIBLE
   * =========================================================
   */

  useEffect(() => {
    const activeThumbnail = thumbnailRefs.current[selectedIndex];

    activeThumbnail?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [selectedIndex]);

  /*
   * =========================================================
   * THUMBNAIL CLICK
   * =========================================================
   */

  const handleThumbnailClick = (index: number) => {
    api?.scrollTo(index);
  };

  /*
   * =========================================================
   * IMAGE FALLBACK
   * =========================================================
   */

  const hasImages = images.length > 0;

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <div className="min-w-0">
      <div className="relative">
        {/* =====================================================
            MAIN GALLERY
        ===================================================== */}

        <div
          className="
            relative
            overflow-hidden
            rounded-3xl
            border
            bg-white
            shadow-sm
          "
        >
          {/* ===================================================
              SALE BADGE
          =================================================== */}

          {onSale && (
            <span
              className="
                absolute
                left-5
                top-5
                z-30
                rounded-full
                bg-red-500
                px-3
                py-1.5
                text-xs
                font-bold
                text-white
                shadow-sm
              "
            >
              SALE
            </span>
          )}

          {/* ===================================================
              MAIN IMAGE CAROUSEL
          =================================================== */}

          <Carousel
            setApi={setApi}
            opts={{
              loop: hasImages && images.length > 1,
              align: "center",
            }}
            className="relative w-full"
          >
            <CarouselContent className="ml-0">
              {hasImages ? (
                images.map((image, index) => (
                  <CarouselItem
                    key={image.id ?? index}
                    className="pl-0"
                  >
                    <div
                      className="
                        relative
                        flex
                        h-[380px]
                        w-full
                        items-center
                        justify-center
                        overflow-hidden
                        bg-white
                        sm:h-[450px]
                        md:h-[520px]
                        lg:h-[560px]
                      "
                    >
                      <Image
                        src={image.src}
                        alt={
                          image.alt ||
                          `${productName} image ${index + 1}`
                        }
                        fill
                        priority={index === 0}
                        sizes="
                          (max-width: 640px) 100vw,
                          (max-width: 1024px) 50vw,
                          45vw
                        "
                        className="
                          object-contain
                          p-6
                          transition-transform
                          duration-500
                          sm:p-8
                          md:p-12
                        "
                      />
                    </div>
                  </CarouselItem>
                ))
              ) : (
                <CarouselItem className="pl-0">
                  <div
                    className="
                      relative
                      flex
                      h-[380px]
                      w-full
                      items-center
                      justify-center
                      bg-white
                      sm:h-[450px]
                      md:h-[520px]
                      lg:h-[560px]
                    "
                  >
                    <Image
                      src={productImage}
                      alt={productName}
                      fill
                      priority
                      sizes="
                        (max-width: 640px) 100vw,
                        (max-width: 1024px) 50vw,
                        45vw
                      "
                      className="
                        object-contain
                        p-6
                        sm:p-8
                        md:p-12
                      "
                    />
                  </div>
                </CarouselItem>
              )}
            </CarouselContent>

            {/* =================================================
                PREVIOUS
            ================================================= */}

            {images.length > 1 && (
              <CarouselPrevious
                className="
                  left-4
                  z-20
                  h-10
                  w-10
                  border
                  bg-white/95
                  shadow-md
                  transition-all
                  duration-200
                  hover:border-[#0497D8]
                  hover:bg-[#0497D8]
                  hover:text-white
                  sm:h-11
                  sm:w-11
                "
              />
            )}

            {/* =================================================
                NEXT
            ================================================= */}

            {images.length > 1 && (
              <CarouselNext
                className="
                  right-4
                  z-20
                  h-10
                  w-10
                  border
                  bg-white/95
                  shadow-md
                  transition-all
                  duration-200
                  hover:border-[#0497D8]
                  hover:bg-[#0497D8]
                  hover:text-white
                  sm:h-11
                  sm:w-11
                "
              />
            )}
          </Carousel>
        </div>

        {/* =====================================================
            THUMBNAILS
        ===================================================== */}

        {images.length > 1 && (
          <div className="mt-4">
            <div
              className="
                flex
                gap-3
                overflow-x-auto
                px-1
                pb-2
                scrollbar-thin
              "
            >
              {images.map((image, index) => {
                const isActive = selectedIndex === index;

                return (
                  <button
                    key={image.id ?? index}
                    ref={(element) => {
                      thumbnailRefs.current[index] = element;
                    }}
                    type="button"
                    onClick={() => handleThumbnailClick(index)}
                    aria-label={`Show image ${index + 1}`}
                    aria-current={isActive}
                    className={`
                      group
                      relative
                      h-[72px]
                      w-[72px]
                      shrink-0
                      overflow-hidden
                      rounded-xl
                      bg-white
                      transition-all
                      duration-200
                      sm:h-[82px]
                      sm:w-[82px]
                      md:h-[90px]
                      md:w-[90px]

                      ${
                        isActive
                          ? "border-2 border-[#0497D8] ring-2 ring-[#0497D8]/15"
                          : "border border-gray-200 hover:border-[#0497D8]"
                      }
                    `}
                  >
                    <Image
                      src={image.src}
                      alt={
                        image.alt ||
                        `${productName} thumbnail ${index + 1}`
                      }
                      fill
                      sizes="90px"
                      className={`
                        object-contain
                        p-2
                        transition-transform
                        duration-300

                        ${
                          isActive
                            ? "scale-105"
                            : "group-hover:scale-110"
                        }
                      `}
                    />

                    {/* ACTIVE OVERLAY */}

                    {isActive && (
                      <span
                        className="
                          pointer-events-none
                          absolute
                          inset-0
                          rounded-xl
                          border-2
                          border-[#0497D8]
                        "
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* =====================================================
            IMAGE COUNTER
        ===================================================== */}

        {images.length > 1 && (
          <div
            className="
              mt-2
              flex
              items-center
              justify-between
              px-1
              text-xs
              text-gray-400
            "
          >
            <span>
              Image {selectedIndex + 1} of {images.length}
            </span>

            <span className="hidden sm:block">
              Click thumbnails to view
            </span>
          </div>
        )}
      </div>
    </div>
  );
}