import { test, expect } from '@playwright/test';

test('visitor can browse and view product', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Aethelon/);

    // Navigate to shop
    await page.goto('/shop');
    await expect(page.url()).toContain('/shop');

    // Wait for product grid to load
    const productGrid = page.locator("[data-testid='product-grid']");
    await expect(productGrid).toBeVisible({ timeout: 15000 });

    // Click first product card
    const firstProduct = page.locator("[data-testid='product-card']").first();
    await firstProduct.click();

    // Expect product page
    await expect(page.url()).toContain('/shop/');
    await expect(page.locator('h1')).toBeVisible();
});
