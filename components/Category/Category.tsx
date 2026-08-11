import React from "react";
import Image from "next/image";
import Link from "next/link";

import { Card } from "@/components/ui/card";

interface CategoryItem {
  id: number;
  name: string;
  image: string;
}

const categories: CategoryItem[] = [
  {
    id: 71,
    name: "Network",
    image: "/Image/Networki.png",
  },
  {
    id: 54,
    name: "Laptop & PC",
    image: "/Image/laptops&mobile.png",
  },
  {
    id: 66,
    name: "Mobile",
    image: "/Image/Phone.png",
  },
  {
    id: 111,
    name: "Monitors",
    image: "/Image/monitor.png",
  },
  {
    id: 17,
    name: "Tools",
    image: "/Image/dril.png",
  },
  {
    id: 2313,
    name: "Security",
    image: "/Image/security.png",
  },
  {
    id: 1843,
    name: "Small Appliances",
    image: "/Image/small.png",
  },
  {
    id: 131,
    name: "Accessories",
    image: "/Image/assecor.png",
  },
  {
    id: 948,
    name: "Gaming",
    image: "/Image/control.png",
  },
];

export default function Category() {
  return (
    <section className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-extrabold text-gray-900">
          Shop by Category
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Explore our products by category
        </p>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-3 gap-5 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-9">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/products?category=${category.id}`}
            prefetch={true}
            className="group flex flex-col items-center"
          >
            {/* Category Card */}
            <Card
              className="
                flex
                h-24
                w-24
                items-center
                justify-center
                overflow-hidden
                rounded-full
                border
                bg-white
                p-4
                transition-all
                duration-300
                group-hover:-translate-y-1
                group-hover:shadow-md
                sm:h-28
                sm:w-28
                sm:p-5
              "
            >
              <Image
                src={category.image}
                alt={category.name}
                width={200}
                height={200}
                priority={category.id === 71}
                className="
                  h-full
                  w-full
                  object-contain
                  transition-transform
                  duration-300
                  group-hover:scale-110
                "
              />
            </Card>

            {/* Category Name */}
            <p
              className="
                mt-3
                text-center
                text-sm
                font-medium
                text-gray-700
                transition-colors
                duration-200
                group-hover:text-[#0497D8]
              "
            >
              {category.name}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}