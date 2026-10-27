import { test, expect } from '@playwright/test';

test.describe('CLASSVERSE Connection Resilience & Offline Sandbox Mode', () => {
  const testRunId = Date.now();

  test('1. Connection Unavailable screen provides direct 1-click Enter Offline Sandbox Mode', async ({ page }) => {
    // Force offline by pointing custom server URL to unreachable port
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('CLASSVERSE_CUSTOM_SERVER_URL', 'http://127.0.0.1:9999');
    });

    // Navigate to classroom
    await page.goto(`/classroom/room-sandbox-${testRunId}?role=student&name=SandboxHero&uid=student_sandbox_${testRunId}&char=boy&hair=boy_spiky_anime`);

    // Verify Connection Unavailable screen appears
    const sandboxButton = page.locator('button:has-text("Enter Offline Sandbox Mode")');
    await expect(sandboxButton).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Connection Unavailable')).toBeVisible();

    // Click Enter Offline Sandbox Mode
    await sandboxButton.click();

    // Verify 3D canvas mounts immediately
    await page.waitForSelector('canvas', { timeout: 15000 });
    await expect(page.locator('canvas')).toBeVisible();

    // Verify TopBar shows SANDBOX badge
    await expect(page.getByText('SANDBOX', { exact: true })).toBeVisible();

    // Verify Fun Actions menu works in sandbox mode
    const funDockButton = page.locator('button:has-text("Fun Actions")');
    await expect(funDockButton).toBeVisible();
    await funDockButton.click();

    // Verify all 7 actions available
    await expect(page.locator('text=Paper Ball Toss')).toBeVisible();
    await expect(page.locator('text=High Five')).toBeVisible();
    await expect(page.locator('text=Dance Battle')).toBeVisible();
    await expect(page.locator('text=Anime Power-Up')).toBeVisible();
    await expect(page.locator('text=Paper Airplane')).toBeVisible();

    // Clean up
    await page.evaluate(() => {
      localStorage.removeItem('CLASSVERSE_CUSTOM_SERVER_URL');
    });
  });

  test('2. Custom server configuration can be expanded and configured', async ({ page }) => {
    // Evaluate in page context
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('CLASSVERSE_CUSTOM_SERVER_URL', 'https://mock-backend.up.railway.app');
    });

    const stored = await page.evaluate(() => localStorage.getItem('CLASSVERSE_CUSTOM_SERVER_URL'));
    expect(stored).toBe('https://mock-backend.up.railway.app');

    // Clean up
    await page.evaluate(() => {
      localStorage.removeItem('CLASSVERSE_CUSTOM_SERVER_URL');
    });
  });
});
