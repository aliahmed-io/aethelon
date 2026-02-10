import { test, expect } from '@playwright/test';

test('unauthenticated user cannot access dashboard', async ({ page }) => {
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page.url()).toContain('api/auth/login');
});

test('can view health endpoint', async ({ page }) => {
    const response = await page.goto('/api/health');
    expect(response?.ok()).toBeTruthy();
    const json = await response?.json();
    expect(json).toHaveProperty('status', 'ok');
});
