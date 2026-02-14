import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";

import { NextRequest } from "next/server";

export default withAuth(async function middleware(_req: NextRequest) {
    // Custom logic can go here if needed
}, {
    isReturnToCurrentPage: true,
    loginPage: "/api/auth/login",
    publicPaths: ["/", "/shop", "/api/uploadthing"]
});

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/checkout/:path*",
        "/account/:path*"
    ]
};
