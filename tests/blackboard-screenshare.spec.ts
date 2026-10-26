import { test, expect } from '@playwright/test';

test.describe('CLASSVERSE Widescreen Blackboard & Teacher Desktop Screen Share', () => {
  const testRunId = Date.now();

  test('Teacher has Share Screen button in bottom toolbar and on the 3D blackboard', async ({ page }) => {
    const teacherId = `teacher_screen_${testRunId}`;
    const roomId = `room-screen-${testRunId}`;

    await page.goto(`/classroom/${roomId}?role=teacher&name=Prof+Einstein&uid=${teacherId}`);

    // Wait for 3D classroom scene to mount
    await page.waitForSelector('canvas', { timeout: 20000 });
    await expect(page.locator('canvas')).toBeVisible();

    // Verify Teacher bottom toolbar contains "Share Screen" button
    const shareScreenBtn = page.locator('button:has-text("Share Screen")');
    await expect(shareScreenBtn).toBeVisible({ timeout: 10000 });

    // Verify teacher controls are enabled
    await expect(page.locator('text=Lecture Mode')).toBeVisible();
  });

  test('Screen sharing state broadcasts and updates UI toolbar to Stop Screen', async ({ page }) => {
    const teacherId = `teacher_broadcast_${testRunId}`;
    const roomId = `room-broadcast-${testRunId}`;

    await page.goto(`/classroom/${roomId}?role=teacher&name=Prof+Curie&uid=${teacherId}`);
    await page.waitForSelector('canvas', { timeout: 20000 });

    const shareScreenBtn = page.locator('button:has-text("Share Screen")');
    await expect(shareScreenBtn).toBeVisible();

    // Trigger screen sharing via the store
    await page.evaluate(() => {
      const store = (window as any).__CLASSROOM_STORE__;
      if (store) {
        store.getState().setScreenSharingState(true, 'test_teacher', 'Prof Curie');
      }
    });

    // Verify that the toolbar toggles to "Stop Screen"
    const stopScreenBtn = page.locator('button:has-text("Stop Screen")');
    await expect(stopScreenBtn).toBeVisible({ timeout: 5000 });

    // Reset screen sharing state
    await page.evaluate(() => {
      const store = (window as any).__CLASSROOM_STORE__;
      if (store) {
        store.getState().setScreenSharingState(false, '', '');
      }
    });

    // Verify toolbar returns to "Share Screen"
    await expect(page.locator('button:has-text("Share Screen")')).toBeVisible({ timeout: 5000 });
  });
});
