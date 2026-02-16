
import { defineConfig } from "@prisma/config";

export default defineConfig({
    earlyAccess: true,
    engine: 'classic',
    datasource: {
        url: process.env.DATABASE_URL,
    },
});
