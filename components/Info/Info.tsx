import React from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IoShieldCheckmark,IoCash,IoWallet} from "react-icons/io5";
import { FaShippingFast } from "react-icons/fa";

export default function Info() {
  return (
    <div className="container lg:mx-auto py-5 grid lg:grid-cols-4 gap-4 md:grid-cols-2 sm:grid-cols-1">
      <Card className="text-center hover:-translate-y-1 duration-200">
        <CardHeader>
          <CardTitle className="w-full "><IoShieldCheckmark className="text-4xl mx-auto text-[#0497D8]"/></CardTitle>
          <CardDescription>Warranty</CardDescription>
        </CardHeader>
        <CardContent>
          <p>All products come with a 14-day free return policy.</p>
        </CardContent>
      </Card>
      <Card className="text-center hover:-translate-y-1 duration-200 ">
        <CardHeader>
          <CardTitle className="w-full "><FaShippingFast className="text-4xl mx-auto text-[#0497D8]"/></CardTitle>
          <CardDescription>Free shipping</CardDescription>
        </CardHeader>
        <CardContent>
          <p>For orders over 3000 EGP</p>
        </CardContent>
      </Card>
      <Card className="text-center hover:-translate-y-1 duration-200">
        <CardHeader>
          <CardTitle className="w-full "><IoCash  className="text-4xl mx-auto text-[#0497D8]"/></CardTitle>
          <CardDescription>Cash on delivery</CardDescription>
        </CardHeader>
        <CardContent>
          <p>For all parts of the republic</p>
        </CardContent>
      </Card>
      <Card className="text-center hover:-translate-y-1 duration-200">
        <CardHeader>
          <CardTitle className="w-full "><IoWallet  className="text-4xl mx-auto text-[#0497D8]"/></CardTitle>
          <CardDescription>Installments</CardDescription>
        </CardHeader>
        <CardContent>
          <p>from 6 months up to 60 months</p>
        </CardContent>
      </Card>
    </div>
  );
}
