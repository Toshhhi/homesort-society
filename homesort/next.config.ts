import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  // This handles the redirect from / to /login
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: false, // Set to true only once you are 100% sure this is the final structure
      },
    ];
  },
};

export default nextConfig;
