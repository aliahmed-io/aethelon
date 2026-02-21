import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";

export const GET = process.env.KINDE_ISSUER_URL
    ? handleAuth()
    : async () => new Response("Kinde Auth requires KINDE_ISSUER_URL", { status: 500 });

