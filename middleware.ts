import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";
import type { NextRequest } from "next/server";

/**
 * M-4: Global route-level auth enforcement.
 *
 * This middleware provides defense-in-depth: even if a developer forgets to add
 * requireUser() / requireAdmin() inside a Server Component or Route Handler,
 * unauthenticated requests to protected prefixes are rejected here first.
 *
 * Protected prefixes:
 *   /dashboard/** — all authenticated user pages
 *   /admin/**     — all admin-only pages
 *
 * Per-route role checks (requireAdmin()) still apply inside each page/handler
 * to differentiate between USER and ADMIN access.
 */
export default withAuth(function middleware(_request: NextRequest) {
    // Additional middleware logic can go here (e.g. logging, geo-blocking)
});

export const config = {
    matcher: ["/dashboard/:path*", "/admin/:path*"],
};
