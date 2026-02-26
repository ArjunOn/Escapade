import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // PWA-ready: you can plug in next-pwa or a custom service worker here later.
  // experimental: {
  //   pwa: {
  //     dest: "public",
  //   },
  // },
};

export default nextConfig;
