"use client";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProductI } from "@/interface/product";
import { productApi } from "@/service/product";
import { Button } from "@base-ui/react";
import { Badge } from "lucide-react";
import Image from "next/image";
import { useParams, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FaShippingFast } from "react-icons/fa";
import { LuShieldCheck } from "react-icons/lu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Loading } from "@/components/Loading/Loading";

export default function ProductDetails() {
  let { productId } = useParams();
  const [loading, setIsLoading] = useState(false);
  //   console.log(params)
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;

  const [bestProduct, setBestProduct] = useState<ProductI[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  const [totalproduct, setTotalproduct] = useState("");



  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  const pagesPerGroup = 11;
  const start = Math.floor((page - 1) / pagesPerGroup) * pagesPerGroup;
  const visiblePages = pages.slice(start, start + pagesPerGroup);

  useEffect(() => {
    async function getProducts() {
      setIsLoading(true);
      const best = await productApi(Number(productId), page);
      setBestProduct(best.data);
      setTotalPages(best.totalPages);
      setTotalproduct(best.totalProducts);
      setIsLoading(false);

      console.log(best);
    }

    getProducts();
  }, [productId, page]);
  return (
    <>

      {/* <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<a href="/" />}>Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink render={<a href="/components" />}>
              Components
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb> */}
      {loading ? (
        <Loading />
      ) : (
        <>
          {" "}
          <div className="container mx-auto flex gap-1 text-xl pt-5">
            {totalproduct}
            <h1>Products </h1>
          </div>
          <div className="grid grid-cols-4 gap-7 p-5 container mx-auto">
            {bestProduct.map((product) => (
              <Card
                className="relative   pt-0 cursor-pointer "
                key={product.id}
              >
                {product.images[0]?.src && (
                  <Image
                    src={product.images[0].src}
                    alt={product.name}
                    width={400}
                    height={400}
                    className="w-full  h-75 hover:scale-105 duration-200 p-2"
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
                <Button className="text-white bg-[#0497D8] p-2 m-2 rounded-2xl">
                  Add Cart
                </Button>
              </Card>
            ))}
          </div>
          

      <div className="grid grid-cols-4 gap-7 p-5 container mx-auto">
        {bestProduct.map((product) => (
          <Card className="relative   pt-0 cursor-pointer " key={product.id}>
            {product.images[0]?.src && (
              <Image
                src={product.images[0].src}
                alt={product.name}
                width={400}
                height={400}
                className="w-full  h-100 hover:scale-105 duration-200 p-2"
              />
            )}

            <CardHeader className="h-25">
              <CardTitle className="font-light line-clamp-2">
                {product.name}
              </CardTitle>
              <CardDescription className="flex justify-between items-center">
                <p className="font-extrabold text-black">{product.price} EGP</p>
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
            <Button className="text-white bg-[#0497D8] p-2 m-2 rounded-2xl">
              Add Cart
            </Button>
          </Card>
        ))}
      </div>


      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={`?page=${page - 1}`}
              className={page <= 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>

          {visiblePages.map((pageNumber) => (

            <PaginationItem key={pageNumber}>
              <PaginationLink
                href={`?page=${pageNumber}`}
                isActive={page === pageNumber}
              >
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          ))}


          <PaginationItem>{/* <PaginationEllipsis />   */}</PaginationItem>

          <PaginationItem>
        
          </PaginationItem>

          <PaginationItem>
            <PaginationNext
              href={`?page=${page + 1}`}
              className={
                page >= totalPages ? "pointer-events-none opacity-50" : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

        </>
      )}



      

    </>
  );
}
