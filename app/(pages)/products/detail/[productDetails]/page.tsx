import ProductGallery from "@/components/ImageSlider/imageslider";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { ProductI } from "@/interface/product";
import { Heart, MinusIcon, PlusIcon, ShoppingCart } from "lucide-react";
import { Params } from "next/dist/server/request/params";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import React from "react";
import { FaStar } from "react-icons/fa";

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
        <ProductGallery product={product}/>
       

        <div key={product.id} className="flex flex-col gap-2">
        
          <span className="text-[#0497D8] font-extrabold">
          {product.brands[0].name}
          </span>
          <h2 className="text-2xl font-bold">{product.name}</h2>
          <div className="flex items-center">
            {/* <p className="border-r-[1.5px] border-black/50 pr-1">
              
                ({product.rating_count})
            </p> */}
            <p className="border-r-[1.5px] border-black/50 pr-1 pl-1">
              SKU:{product.sku}
            </p>
            <p className="pr-1 pl-1">Brand:{product.brands[0].name}</p>
          </div>
          {/* Price */}
          <div className="flex items-center gap-9">
            <p>{product.price} EGP</p>
            {product.sale_price ? (
              <p className="line-through">{product.sale_price}</p>
            ) : (
              ""
            )}
            {product.stock_status&& <p className="text-green-600 font-medium">In Stock</p>}
           
          </div>
        
          <div className="flex gap-2 items-center ">
            <ButtonGroup
              orientation="horizontal"
              aria-label="Media controls"
              className="w-fit"
            >
              <Button variant="outline" size="icon">
                <PlusIcon />
              </Button>
              <Button variant="outline" size="icon">
                <MinusIcon />
              </Button>
            </ButtonGroup>
            <p>1</p>
          </div>
          {/* Add Cart */}
          <div className="w-full flex items-center gap-2">
            <Button className="text-white bg-[#0497D8] p-4 rounded-xl w-1/2">
              <ShoppingCart /> Add Cart
            </Button>
            <div className="w-1/2">
              <Heart className="text-[#0497D8]" />
            </div>
          </div>
        </div>

        <div>{/* <Image src={} height={} width={}/> */}</div>
        {/* short */}
      </div>
    </>
  );
}
