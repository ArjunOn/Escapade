import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Allow images from event data sources
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.evbstatic.com"      },  // Eventbrite
      { protocol: "https", hostname: "**.evbuc.com"           },  // Eventbrite
      { protocol: "https", hostname: "s1.ticketm.net"         },  // Ticketmaster
      { protocol: "https", hostname: "**.ticketmaster.com"    },  // Ticketmaster
      { protocol: "https", hostname: "**.meetupstatic.com"    },  // Meetup
      { protocol: "https", hostname: "images.unsplash.com"    },  // Fallback
      { protocol: "https", hostname: "lh3.googleusercontent.com" }, // Google avatars
    ],
  },

  experimental: {
    serverActions: { bodySizeLimit: "2mb" },
  },

  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options",        value: "DENY"    },
          { key: "X-XSS-Protection",       value: "1; mode=block" },
        ],
      },
    ];
  },

  logging: { fetches: { fullUrl: true } },
};

export default nextConfig;

