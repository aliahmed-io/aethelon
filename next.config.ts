import type { NextConfig } from "next";

const nextConfig: NextConfig = {

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
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: `
                            default-src 'self';
                            script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://va.vercel-scripts.com;
                            style-src 'self' 'unsafe-inline';
                            img-src 'self' blob: data: https://*.meshy.ai https://res.cloudinary.com https://*.stripe.com https://utfs.io https://images.unsplash.com;
                            connect-src 'self' https://api.meshy.ai https://api.stripe.com https://vitals.vercel-insights.com;
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
            }
        ];
    },
};

export default nextConfig;
