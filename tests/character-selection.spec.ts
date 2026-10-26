import { test, expect } from '@playwright/test';

test.describe('CLASSVERSE 3D Chibi Character Selection System', () => {
  const testRunId = Date.now();

  test('1. Mandatory Route Guard: First-time student navigating directly to classroom is blocked and redirected to /character-selection', async ({ page }) => {
    const freshStudentId = `student_new_${testRunId}`;
    const targetRoom = `room-guard-${testRunId}`;

    console.log(`[Test] Navigating directly to /classroom/${targetRoom} with unconfigured student...`);
    await page.goto(`/classroom/${targetRoom}?role=student&name=New+Student&uid=${freshStudentId}`);

    // Wait for the route guard to intercept and redirect to /character-selection
    await page.waitForURL(/\/character-selection/, { timeout: 15000 });
    expect(page.url()).toContain('/character-selection');
    expect(page.url()).toContain(`uid=${freshStudentId}`);

    // Verify character selection page UI elements
    await expect(page.locator('text=Create Your Classroom Character')).toBeVisible();
    await expect(page.locator('text=Choose your character and hairstyle before entering your classroom.')).toBeVisible();
    await expect(page.locator('button:has-text("Boy")')).toBeVisible();
    await expect(page.locator('button:has-text("Girl")')).toBeVisible();
  });

  test('2. Character Selection UI: Switching gender, previewing hairstyles, and switching animations', async ({ page }) => {
    const studentId = `student_creator_${testRunId}`;
    await page.goto(`/character-selection?role=student&name=Taylor&uid=${studentId}&classroomId=room-creator-${testRunId}`);

    await page.waitForSelector('text=Create Your Classroom Character', { timeout: 15000 });

    // Verify default Boy hairstyles are shown
    await expect(page.locator('text=Spiky Anime')).toBeVisible();
    await expect(page.locator('text=Classic Short')).toBeVisible();

    // Click Girl character card
    await page.click('button:has-text("Girl")');

    // Verify Girl hairstyles are now dynamically displayed
    await expect(page.locator('text=Twin Tails')).toBeVisible();
    await expect(page.locator('text=Bob Cut')).toBeVisible();
    await expect(page.locator('text=Long Straight')).toBeVisible();

    // Select Bob Cut hairstyle
    await page.click('button:has-text("Bob Cut")');

    // Test animation preview toggles
    await page.click('button:has-text("Wave")');
    await page.click('button:has-text("Celebrate")');
    await page.click('button:has-text("Idle")');

    // Verify Save & Enter button is enabled
    const submitBtn = page.locator('button:has-text("Save Character & Enter Classroom")');
    await expect(submitBtn).toBeEnabled();
  });

  test('3. Save Character & Enter Classroom: Saves to backend profile and enters game with custom 3D chibi model', async ({ page }) => {
    const studentId = `student_saved_${testRunId}`;
    const targetRoom = `room-join-${testRunId}`;

    await page.goto(`/character-selection?role=student&name=Samantha&uid=${studentId}&classroomId=${targetRoom}`);
    await page.waitForSelector('text=Create Your Classroom Character', { timeout: 15000 });

    // Select Girl with Ponytail
    await page.click('button:has-text("Girl")');
    await page.click('button:has-text("Ponytail")');

    // Save and Enter
    const submitBtn = page.locator('button:has-text("Save Character & Enter Classroom")');
    await submitBtn.click();

    // Wait for redirect to classroom
    await page.waitForURL(new RegExp(`/classroom/${targetRoom}`), { timeout: 20000 });
    expect(page.url()).toContain(`/classroom/${targetRoom}`);

    // Wait for classroom connection and nameplate
    await page.waitForSelector('text=Samantha', { timeout: 15000 });
    await expect(page.locator('text=Samantha')).toBeVisible();
  });

  test('4. Returning Student Bypass: Returning student with saved character bypasses character-selection directly into classroom', async ({ page }) => {
    const targetRoom = `room-returning-${testRunId}`;

    // student_alex is pre-seeded on server startup as Boy with Spiky Anime hair
    console.log('[Test] Navigating directly to classroom as returning student_alex...');
    await page.goto(`/classroom/${targetRoom}?role=student&name=Student+Alex&uid=student_alex`);

    // Verify student is NOT redirected to /character-selection
    await page.waitForSelector('text=Student Alex', { timeout: 15000 });
    expect(page.url()).not.toContain('/character-selection');
    expect(page.url()).toContain(`/classroom/${targetRoom}`);
    await expect(page.locator('text=Student Alex')).toBeVisible();
  });

  test('5. Teacher Immunity: Teachers are not redirected to character selection and enter directly', async ({ page }) => {
    const targetRoom = `room-teacher-${testRunId}`;

    console.log('[Test] Navigating directly to classroom as Teacher...');
    await page.goto(`/classroom/${targetRoom}?role=teacher&name=Dr.+Evelyn+Reed&uid=teacher_reed`);

    // Verify teacher enters directly without redirect
    await page.waitForSelector('text=Dr. Evelyn Reed', { timeout: 15000 });
    expect(page.url()).not.toContain('/character-selection');
    await expect(page.locator('text=Teacher Controls')).toBeVisible();
  });
});
