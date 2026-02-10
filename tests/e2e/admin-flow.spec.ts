import { test, expect } from '@playwright/test';

test('admin dashboard requires authentication', async ({ page }) => {
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page.url()).toContain('api/auth/login');
});
