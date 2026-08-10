import React from "react";

import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

export default async function Category() {

  return (
    <div className="container mx-auto py-5">
      <h2 className="text-lg font-extrabold">Shop by Category</h2>
      <div className="flex gap-7 items-center justify-center">
        <div className="text-center">
          <Link href={"/products/" + 71}>
            {" "}
            <Card className="w-30 h-30  p-5 flex justify-center items-center rounded-full hover:scale-105 duration-300 cursor-pointer">
              <Image
                src="/Image/Networki.png"
                alt="Event cover"
                height={700}
                width={700}
                className="object-cover"
              />
            </Card>
          </Link>

          <p>Network</p>
        </div>
        <div className="text-center">
          <Link href={"/products/" + 54}>
            {" "}
            <Card className="w-30 h-30  p-5 flex justify-center items-center rounded-full hover:scale-105 duration-300 cursor-pointer">
              <Image
                src="/Image/laptops&mobile.png"
                alt="Event cover"
                height={700}
                width={700}
                className="object-cover"
              />
            </Card>
          </Link>

          <p>Laptop&PC</p>
        </div>
        <div className="text-center">
          <Link href={"/products/" + 66}>
            <Card className="w-30 h-30  p-5 flex justify-center items-center rounded-full hover:scale-105 duration-300 cursor-pointer">
              <Image
                src="/Image/Phone.png"
                alt="Event cover"
                height={700}
                width={700}
                className="object-cover"
              />
            </Card>
          </Link>

          <p>Mobile</p>
        </div>
        <div className="text-center">
          <Link href={"/products/" + 111}>
            <Card className="w-30 h-30  p-5 flex justify-center items-center rounded-full hover:scale-105 duration-300 cursor-pointer">
              <Image
                src="/Image/monitor.png"
                alt="Event cover"
                height={700}
                width={700}
                className="object-cover"
              />
            </Card>
          </Link>

          <p>Monitors</p>
        </div>
        <div className="text-center">
          <Link href={"/products/" + 17}>
            <Card className="w-30 h-30  p-5 flex justify-center items-center rounded-full hover:scale-105 duration-300 cursor-pointer">
              <Image
                src="/Image/dril.png"
                alt="Event cover"
                height={700}
                width={700}
                className="object-cover"
              />
            </Card>
          </Link>

          <p>Tools</p>
        </div>
        <div className="text-center">
          <Link href={"/products/" + 2313}>
            <Card className="w-30 h-30  p-5 flex justify-center items-center rounded-full hover:scale-105 duration-300 cursor-pointer">
              <Image
                src="/Image/security.png"
                alt="Event cover"
                height={700}
                width={700}
                className="object-cover"
              />
            </Card>
          </Link>

          <p>Security</p>
        </div>
        <div className="text-center">
          <Link href={"/products/" + 1843}>
            <Card className="w-30 h-30  p-5 flex justify-center items-center rounded-full hover:scale-105 duration-300 cursor-pointer">
              <Image
                src="/Image/small.png"
                alt="Event cover"
                height={700}
                width={700}
                className="object-cover"
              />
            </Card>
          </Link>

          <p>Small Appliances</p>
        </div>
        <div className="text-center">
          <Link href={"/products/" + 131}>
            <Card className="w-30 h-30  p-5 flex justify-center items-center rounded-full hover:scale-105 duration-300 cursor-pointer">
              <Image
                src="/Image/assecor.png"
                alt="Event cover"
                height={700}
                width={700}
                className="object-cover"
              />
            </Card>
          </Link>

          <p>Accessories</p>
        </div>
        <div className="text-center">
          <Link href={"/products/" + 948}>
            <Card className="w-30 h-30  p-5 flex justify-center items-center rounded-full hover:scale-105 duration-300 cursor-pointer">
              <Image
                src="/Image/control.png"
                alt="Event cover"
                height={700}
                width={700}
                className="object-cover"
              />
            </Card>
          </Link>

          <p>Gaming</p>
        </div>
      </div>
    </div>
  );
}
