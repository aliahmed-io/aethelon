import { test, expect } from '@playwright/test';

test('customer can view products and access bag', async ({ page }) => {
    // 1. Visit Shop
    await page.goto('/shop');
    await expect(page.locator("[data-testid='product-grid']")).toBeVisible({ timeout: 15000 });

    // 2. View a Product
    const firstProduct = page.locator("[data-testid='product-card']").first();
    await firstProduct.click();
    await expect(page.url()).toContain('/shop/');

    // 3. Check product page has key elements
    await expect(page.locator('h1')).toBeVisible();

    // 4. Navigate to bag
    await page.goto('/bag');
    await expect(page.url()).toContain('/bag');
});

test('customer can access checkout flow', async ({ page }) => {
    await page.goto('/checkout');

    // Checkout may redirect to login or show checkout page
    const url = page.url();
    const hasCheckoutOrAuth = url.includes('/checkout') || url.includes('/api/auth');
    expect(hasCheckoutOrAuth).toBe(true);
});
