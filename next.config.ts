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
<<<<<<< HEAD
      }
   
    ],
  },
};
=======
  }]
}};
>>>>>>> cebe80e (New Update)

export default nextConfig;
