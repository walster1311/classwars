import { test, expect } from '@playwright/test';

async function ensureFunActionsOpen(page: any) {
  const paperBallBtn = page.locator('button:has-text("Paper Ball Toss")');
  const isVisible = await paperBallBtn.isVisible().catch(() => false);
  if (!isVisible) {
    const toggle = page.locator('[data-testid="fun-actions-toggle"]');
    await expect(toggle).toBeVisible({ timeout: 10000 });
    await toggle.click();
    await expect(paperBallBtn).toBeVisible({ timeout: 5000 });
  }
}

test.describe('CLASSVERSE — Interactive Classroom Fun & Social System', () => {
  const timestamp = Date.now();

  test('1. Fun Actions dock button expands and displays all 7 playful activities', async ({ page }) => {
    // student_alex is a pre-seeded student with valid chibi character
    await page.goto(
      `/classroom/room-fun-${timestamp}?role=student&name=Student+Alex&uid=student_alex`
    );

    // Wait for classroom to load
    await page.waitForSelector('text=Student Alex', { timeout: 20000 });

    // Open Fun Actions dock menu
    await ensureFunActionsOpen(page);

    // Verify all 7 social & fun actions are rendered
    await expect(page.locator('button:has-text("Paper Ball Toss")')).toBeVisible();
    await expect(page.locator('button:has-text("High Five")')).toBeVisible();
    await expect(page.locator('button:has-text("Dance Battle")')).toBeVisible();
    await expect(page.locator('button:has-text("Emoji Reactions")')).toBeVisible();
    await expect(page.locator('button:has-text("Follow Friend")')).toBeVisible();
    await expect(page.locator('button:has-text("Anime Power-Up")')).toBeVisible();
    await expect(page.locator('button:has-text("Paper Airplane")')).toBeVisible();
  });

  test('2. Emoji wheel triggers animated expressive reactions', async ({ page }) => {
    await page.goto(
      `/classroom/room-emoji-${timestamp}?role=student&name=Student+Maya&uid=student_maya`
    );

    await page.waitForSelector('text=Student Maya', { timeout: 20000 });

    // Ensure Fun Actions menu is open
    await ensureFunActionsOpen(page);

    // Click Emoji Reactions action to open wheel
    await page.locator('button:has-text("Emoji Reactions")').click();

    // Verify emoji wheel modal is open
    await expect(page.locator('text=Classroom Emojis')).toBeVisible({ timeout: 5000 });

    // Click an emoji (e.g. ✨ Excited)
    const sparkleEmoji = page.locator('button[title*="Excited"]');
    await expect(sparkleEmoji).toBeVisible();
    await sparkleEmoji.click();

    // Verify wheel closes after selection
    await expect(page.locator('text=Classroom Emojis')).not.toBeVisible();
  });

  test('3. Paper Airplane launcher power meter and flight release', async ({ page }) => {
    await page.goto(
      `/classroom/room-plane-${timestamp}?role=student&name=Student+Liam&uid=student_liam`
    );

    await page.waitForSelector('text=Student Liam', { timeout: 20000 });

    // Ensure Fun Actions menu is open
    await ensureFunActionsOpen(page);

    // Click Paper Airplane action
    await page.locator('button:has-text("Paper Airplane")').click();

    // Verify launcher UI opens
    await expect(page.locator('text=Paper Airplane Launcher')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button:has-text("Launch Paper Airplane")')).toBeVisible();

    // Click Launch Paper Airplane
    await page.locator('button:has-text("Launch Paper Airplane")').click();

    // Verify launcher closes on launch
    await expect(page.locator('text=Paper Airplane Launcher')).not.toBeVisible();
  });

  test('4. Anime Power-Up aura selector triggers charging transformation', async ({ page }) => {
    await page.goto(
      `/classroom/room-power-${timestamp}?role=student&name=Student+Sophia&uid=student_sophia`
    );

    await page.waitForSelector('text=Student Sophia', { timeout: 20000 });

    // Ensure Fun Actions menu is open
    await ensureFunActionsOpen(page);

    // Click Anime Power-Up action
    await page.locator('button:has-text("Anime Power-Up")').click();

    // Verify Aura picker is shown
    await expect(page.locator('text=Choose your original transformation aura color')).toBeVisible({ timeout: 5000 });

    // Select Electric Blue aura
    const blueAuraBtn = page.locator('button:has-text("Electric Blue")');
    await expect(blueAuraBtn).toBeVisible();
    await blueAuraBtn.click();

    // Menu should close and transformation triggers
    await expect(page.locator('text=Choose your original transformation aura color')).not.toBeVisible();
  });

  test('5. Teacher Control Center manages classroom interaction modes and permissions', async ({ page }) => {
    // Navigate teacher to classroom
    await page.goto(
      `/classroom/room-teacher-${timestamp}?role=teacher&name=Sensei+Taro&color=%236366F1`
    );

    await page.waitForSelector('text=Sensei Taro', { timeout: 20000 });

    // Open Teacher Controls
    const teacherBtn = page.locator('button:has-text("Teacher Controls")');
    await expect(teacherBtn).toBeVisible({ timeout: 10000 });
    await teacherBtn.click();

    // Verify modal header and interaction controls section
    await expect(page.locator('text=Teacher Control Center')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Classroom Fun & Social Controls')).toBeVisible();

    // Verify mode buttons exist: Lesson Mode, Break Mode, Free Play
    await expect(page.locator('button:has-text("Lesson Mode")')).toBeVisible();
    await expect(page.locator('button:has-text("Break Mode")')).toBeVisible();
    await expect(page.locator('button:has-text("Free Play")')).toBeVisible();

    // Switch to Free Play mode
    await page.locator('button:has-text("Free Play")').click();

    // Verify toggles exist inside the teacher modal
    await expect(page.getByRole('button', { name: /Paper Ball Toss/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Dance Battle/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Paper Airplanes/ })).toBeVisible();

    // Test Disable All
    await page.locator('button:has-text("✕ Disable All")').click();

    // Test Enable All
    await page.locator('button:has-text("✓ Enable All (7)")').click();

    // Close modal
    await page.locator('button:has-text("Done")').click();
    await expect(page.locator('text=Teacher Control Center')).not.toBeVisible();
  });
});
