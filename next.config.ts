import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        formats: ['image/avif', 'image/webp'],
        remotePatterns: [
            { protocol: "https", hostname: "utfs.io" },
            { protocol: "https", hostname: "images.unsplash.com" }
        ]
    },
    poweredByHeader: false,
    compress: true,
};

export default nextConfig;
