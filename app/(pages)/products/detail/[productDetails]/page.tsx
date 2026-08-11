import ProductGallery from "@/components/ImageSlider/imageslider";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { ProductI } from "@/interface/product";
import { Heart, MinusIcon, PlusIcon, ShoppingCart } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Params } from "next/dist/server/request/params";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import React from "react";
import { FaCheck, FaStar } from "react-icons/fa";

const username = process.env.WC_KEY;
const password = process.env.WC_SECRET;

const auth = Buffer.from(`${username}:${password}`).toString("base64");
export default async function page({ params }: { params: Params }) {
  const { productDetails } = await params;
  console.log(productDetails);
  const response = await fetch(
    "https://www.i-techegypt.com/wp-json/wc/v3/products/" + productDetails,

    {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    },
  );
  const product: ProductI = await response.json();
  console.log(product);
  return (
    <>
      <div className="grid lg:grid-cols-2 md:grid-col-1  gap-20 container mx-auto pt-5">
        <ProductGallery product={product} />
        <div key={product.id} className="flex flex-col gap-5  p-5  ">
          <span className="text-[#0497D8] font-extrabold text-2xl">
            {product.brands[0].name}
          </span>
          <h2 className="text-3xl font-bold line-clamp-2">{product.name}</h2>
          <div className="flex items-center gap-5 ">
            <p className=" pr-1 font-bold">SKU:{product.sku}</p>
            <p className="pr-1 pl-1 font-bold">
              Brand:{product.brands[0].name}
            </p>
          </div>

          {/* Price */}
          <div className="flex items-center gap-9">
            <p className="font-bold text-[#0497D8]">{product.price} EGP</p>
            {product.sale_price ? (
              <p className="line-through">{product.sale_price}</p>
            ) : (
              ""
            )}
            {product.stock_status && (
              <p className="text-green-600 font-medium">
                <FaCheck className="inline" /> In Stock
              </p>
            )}
          </div>

          {/* Attribute */}

          <div>
            <h3 className="font-bold mb-2">Choose Options</h3>
            {/* Storage */}
            <div className="flex flex-col gap-5">
              <div>
                <p className="mb-2">Storage</p>
                <div className="flex gap-2">
                  <span className=" rounded-xl border border-gray-300 p-2">
                    256 GB
                  </span>
                  <span className=" rounded-xl border border-gray-300 p-2">
                    256 GB
                  </span>
                  <span className=" rounded-xl border border-gray-300 p-2">
                    256 GB
                  </span>
                </div>
              </div>

              <div>
                <p className="mb-2">RAM</p>
                <div className="flex gap-2">
                  <span className=" rounded-xl border border-gray-300 p-2 ">
                    8 GB
                  </span>
                  <span className=" rounded-xl border border-gray-300 p-2 ">
                    8 GB
                  </span>
                  <span className=" rounded-xl border border-gray-300 p-2 ">
                    8 GB
                  </span>
                </div>
              </div>

              <div>
                <p>Color :</p>
                <div className=" rounded-full w-7 h-7 bg-black"></div>
              </div>
            </div>
          </div>

          <div className="flex gap-2  flex-col">
            <p className="font-bold">Quantity</p>
            <div className="flex flex-row items-center">
              <Button variant="outline" size="icon" className="rounded-2xl">
                <PlusIcon />
              </Button>

              <div className="p-2">1</div>

              <Button variant="outline" size="icon" className="rounded-2xl">
                <MinusIcon />
              </Button>
            </div>
          </div>
          {/* Add Cart */}
          <div className="w-full flex items-center gap-2">
            <Button className="text-white bg-[#0497D8] p-4 rounded- w-1/2 hover:bg-[#0497D8] cursor-pointer">
              <ShoppingCart /> Add Cart
            </Button>
            <div className="w-1/2">
              <Button className="text-[#0497D8] bg-white p-4 rounded- w-1/2 border-gray-400 hover:bg-[#0497D8] hover:text-white cursor-pointer">
                <Heart /> Add to Wishlist
              </Button>
            </div>
          </div>

          <div>
            <Drawer>
              <DrawerTrigger render={<Button variant="outline" />}>
                Open
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Buy Now Pay Later</DrawerTitle>
                  <DrawerDescription>
                    <Tabs defaultValue="Bank" className="w-[400px]">
                      <TabsList>
                        <TabsTrigger value="Bank">Bank Installment</TabsTrigger>
                        <TabsTrigger value="BNPL">BNPL Installment</TabsTrigger>
                      </TabsList>
                      <TabsContent value="Bank"></TabsContent>
                      <TabsContent value="BNPL">
                        Change your password here.
                      </TabsContent>
                    </Tabs>
                  </DrawerDescription>
                </DrawerHeader>
                <div className="p-4">
                  <Accordion defaultValue={["item-1"]}>
                    <AccordionItem value="item-1">
                      <AccordionTrigger className='no-underline!'>BankNXT</AccordionTrigger>
                      <AccordionContent>
                        <Table>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-medium">
                                6 Months
                              </TableCell>
                              <TableCell className="flex flex-col text-[11px]">
                                <div>0% INTEREST</div>
                                <div>0% Downpayment</div>
                                <div>0% Fees | Distributed</div>
                              </TableCell>
                              <TableCell className="text-right">
                                3,667 / Month
                                Total
                              </TableCell>
                            </TableRow>

                            <TableRow>
                              <TableCell className="font-medium">
                                12 Months
                              </TableCell>
                              <TableCell className="flex flex-col text-[11px]">
                                <div>0% INTEREST</div>
                                <div>0% Downpayment</div>
                                <div>0% Fees | Distributed</div>
                              </TableCell>
                              <TableCell className="text-right">
                                1,005.22 / Month
                              </TableCell>
                            </TableRow>

                            <TableRow>
                              <TableCell className="font-medium">
                                18 Months
                              </TableCell>
                              <TableCell className="flex flex-col text-[11px]">
                                <div>0% INTEREST</div>
                                <div>0% Downpayment</div>
                                <div>0% Fees | Distributed</div>
                              </TableCell>
                              <TableCell className="text-right">
                                709.62 / Month
                              </TableCell>
                            </TableRow>

                            <TableRow>
                              <TableCell className="font-medium">
                                24 Months
                              </TableCell>
                              <TableCell className="flex flex-col text-[11px]">
                                <div>0% INTEREST</div>
                                <div>0% Downpayment</div>
                                <div>0% Fees | Distributed</div>
                              </TableCell>
                              <TableCell className="text-right">
                                562.63 / Month
                              </TableCell>
                            </TableRow>

                            <TableRow>
                              <TableCell className="font-medium">
                                36 Months
                              </TableCell>
                              <TableCell className="flex flex-col text-[11px]">
                                <div>0% INTEREST</div>
                                <div>0% Downpayment</div>
                                <div>0% Fees | Distributed</div>
                              </TableCell>
                              <TableCell className="text-right">
                                430.43 / Month
                              </TableCell>
                            </TableRow>

                          </TableBody>
                        </Table>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
                <DrawerFooter>
                  <Button>Submit</Button>
                  <DrawerClose render={<Button variant="outline" />}>
                    Cancel
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </div>
    </>
  );
}
