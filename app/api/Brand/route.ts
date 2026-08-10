import { NextResponse } from "next/server";

const username = process.env.WC_KEY;
const password = process.env.WC_SECRET;

const auth = Buffer.from(`${username}:${password}`).toString("base64");

export async function GET() {

for (let page = 2; page <= 2; page++) {
      const response = await fetch(
        `https://www.i-techegypt.com/wp-json/wc/v3/products/brands?per_page=100&page=${page}`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
          next: {
            revalidate: 300,
          },
        }
      );

    const data = await response.json();
    return NextResponse.json(data);
}
}