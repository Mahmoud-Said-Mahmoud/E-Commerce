import { NextRequest, NextResponse } from "next/server";
import React from "react";
const username = process.env.WC_KEY;
const password = process.env.WC_SECRET;

const auth = Buffer.from(`${username}:${password}`).toString("base64");
export async function GET(request: NextRequest) {


  const { searchParams } = new URL(request.url);

  const id = searchParams.get("category");
  const page = searchParams.get("page") || "1";
<<<<<<< HEAD
  const brandId = searchParams.get("brandId") ;

=======
>>>>>>> cebe80e (New Update)

  const response = await fetch(
    `https://www.i-techegypt.com/wp-json/wc/v3/products?orderby=popularity&stock_status=instock&order=desc&category=${id}&page=${page}&per_page=12&brandId=${brandId}`,
    {
      headers: {
        Authorization: `Basic ${auth}`,
      },
      next: {
        revalidate: 300,
      },
    },
  );
  const data = await response.json();

  const totalProducts = Number(response.headers.get("X-WP-Total"));

  const totalPages = Number(response.headers.get("X-WP-TotalPages"));

<<<<<<< HEAD


=======
>>>>>>> cebe80e (New Update)

  return NextResponse.json({
    totalProducts,
    totalPages,
<<<<<<< HEAD
    data: data,
    currentpage: Number(page),
=======

    data,
    currentpage:Number(page)

>>>>>>> cebe80e (New Update)
  });
}
