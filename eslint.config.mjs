import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    ...compat.extends("next/core-web-vitals", "next/typescript"),
    {
        ignores: [
            // Next.js environment definitions
            "next-env.d.ts",

            // Test files
            "tests/**/*",
            "e2e/**/*",
            "**/*.spec.ts",
            "**/*.test.ts",

            // Playwright reports
            "playwright-report/**/*",
            "test-results/**/*",


            // Config files
            "*.config.mjs",
            "*.config.ts",
            "*.config.js",
            "tailwind.config.ts",
            "postcss.config.mjs",
            "playwright.config.ts",
            "vitest.config.ts",

            // Build artifacts
            ".next/**/*",
            "node_modules/**/*",

            // Scripts
            "scripts/**/*",

            // Prisma
            "prisma/**/*",

            // Seed files
            "**/seed.ts",
            "**/soft_seed.ts",
            "**/manual_seed.ts",

            // Generated files
            "**/*.min.js",
            "**/*.bundle.js",

            // Other
            "Novexa/**/*",
        ],
    },
    {
        rules: {
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
            "@typescript-eslint/ban-ts-comment": "off",
            "@typescript-eslint/no-require-imports": "off",
        },
    },
    {
        files: [
            "app/api/**/*",
            "lib/**/*",
            "app/components/**/*",
            "app/store/**/*",
            "app/dashboard/**/*",
            "app/shop/**/*",
            "components/**/*",
            "check_db.ts"
        ],
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unused-vars": "off"
        }
    }
];


export default eslintConfig;
