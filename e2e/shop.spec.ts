import { test, expect } from "@playwright/test";

test.describe("Shop Flow", () => {
    test("can browse and view products", async ({ page }) => {
        // Navigate to shop
        await page.goto("/shop");

        // Wait for page to fully load
        await page.waitForLoadState("networkidle");

        // Check page loaded - look for any heading
        const heading = page.locator("h1").first();
        await expect(heading).toBeVisible({ timeout: 20000 });

        // Wait for products to load using data-testid
        const productCard = page.locator("[data-testid='product-card']").first();
        await expect(productCard).toBeVisible({ timeout: 20000 });

        // Check product grid exists using data-testid
        const productGrid = page.locator("[data-testid='product-grid']");
        await expect(productGrid).toBeVisible();
    });

    test("product page shows product details", async ({ page }) => {
        // Navigate to shop first
        await page.goto("/shop");
        await page.waitForLoadState("networkidle");

        // Click first product link using data-testid
        const firstProductLink = page.locator("[data-testid='product-card']").first();
        await expect(firstProductLink).toBeVisible({ timeout: 20000 });
        await firstProductLink.click();

        // Wait for navigation to product page
        await page.waitForURL(/\/shop\/.+/, { timeout: 15000 });
        await page.waitForLoadState("networkidle");

        // Verify we're on a product page by checking the h1 (product name) is visible
        const productTitle = page.locator("h1");
        await expect(productTitle).toBeVisible({ timeout: 15000 });

        // Verify there's some content on the page
        await expect(page.locator("body")).toContainText(/\$|USD|Price/i, { timeout: 10000 });
    });

});

test.describe("Error Pages", () => {
    test("404 page renders correctly", async ({ page }) => {
        await page.goto("/this-page-does-not-exist-12345");
        await page.waitForLoadState("networkidle");

        // Check for 404 content - flexible matching
        const pageContent = page.locator("body");
        await expect(pageContent).toContainText(/Page Not Found|404|not found/i, { timeout: 15000 });

        // Check that some navigation exists
        await expect(page.locator("a[href='/']").first()).toBeVisible({ timeout: 10000 });
    });
});

test.describe("Wholesale Portal", () => {
    test("wholesale page loads with form", async ({ page }) => {
        await page.goto("/wholesale");
        await page.waitForLoadState("networkidle");

        // Check hero section
        await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });

        // Check page has relevant content
        const pageContent = page.locator("body");
        await expect(pageContent).toContainText(/Wholesale|Partner|Bulk|Business/i, { timeout: 15000 });

        // Check form exists
        const submitButton = page.locator("button[type='submit'], button:has-text('Submit'), button:has-text('Apply')").first();
        await expect(submitButton).toBeVisible({ timeout: 10000 });
    });
});

test.describe("Search", () => {
    // Skip on mobile since search button may be in mobile menu
    test("search overlay opens and accepts input", async ({ page, isMobile }) => {
        test.skip(isMobile, "Skipping on mobile - search is in mobile menu");

        await page.goto("/");
        await page.waitForLoadState("networkidle");

        // Click search button using data-testid
        const searchButton = page.locator("[data-testid='search-button']");
        await expect(searchButton).toBeVisible({ timeout: 15000 });
        await searchButton.click();

        // Wait for search overlay/modal
        const searchInput = page.locator("input[placeholder*='Search'], input[placeholder*='search'], input[placeholder*='collection']").first();
        await expect(searchInput).toBeVisible({ timeout: 15000 });
    });
});
