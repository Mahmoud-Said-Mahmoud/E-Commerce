import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.i-techegypt.com",
      },
      {
        protocol: "https",
        hostname: "i-techegypt.com",

  }]
}};


export default nextConfig;
