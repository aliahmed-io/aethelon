import type { NextConfig } from "next";

const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
    typescript: {
        ignoreBuildErrors: false,
    },
    images: {
        formats: ['image/avif', 'image/webp'],
        remotePatterns: [
            { protocol: "https", hostname: "utfs.io" },
            { protocol: "https", hostname: "images.unsplash.com" }
        ],
        minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    },
    poweredByHeader: false,
    compress: true,
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: `
                            default-src 'self';
                            script-src 'self' https://js.stripe.com https://va.vercel-scripts.com;
                            style-src 'self' 'unsafe-inline';
                            img-src 'self' blob: data: https://*.meshy.ai https://res.cloudinary.com https://*.stripe.com https://utfs.io https://images.unsplash.com;
                            connect-src 'self' https://api.meshy.ai https://api.stripe.com https://vitals.vercel-insights.com https://uploadthing.com https://utfs.io;
                            font-src 'self' data:;
                            frame-src 'self' https://js.stripe.com https://hooks.stripe.com;
                            object-src 'none';
                            base-uri 'self';
                            form-action 'self';
                            frame-ancestors 'none';
                            upgrade-insecure-requests;
                        `.replace(/\s{2,}/g, ' ').trim()
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY'
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'origin-when-cross-origin'
                    },
                    {
                        key: 'Permissions-Policy',
                        value: "camera=(), microphone=(), geolocation=()"
                    }
                ]
            },
            {
                // Cache static assets (images, fonts, etc.) for 1 year
                source: '/_next/static/:path*',
                headers: [
                    { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
                ]
            },
            {
                // API Routes: NO CACHE by default to prevent leaking user data.
                // Specific routes can override this.
                source: '/api/:path*',
                headers: [
                    { key: 'Cache-Control', value: 'private, no-cache, no-store, max-age=0' }
                ]
            }
        ];
    },
};

export default withBundleAnalyzer(nextConfig);
