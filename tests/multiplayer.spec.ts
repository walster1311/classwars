import { test, expect, Browser, BrowserContext, Page } from '@playwright/test';

test.describe('CLASSVERSE Multiplayer Virtual Classroom Tests', () => {
  let browser: Browser;

  test('MVP Acceptance Milestone: 1 Teacher + 5 Students join, sync roster, chat, and test hand-raise permissions', async ({ browser: b }) => {
    test.setTimeout(180000);
    browser = b;

    // 1. Create separate isolated browser contexts for Teacher and 5 Students
    const teacherContext = await browser.newContext();
    const student1Context = await browser.newContext();
    const student2Context = await browser.newContext();
    const student3Context = await browser.newContext();
    const student4Context = await browser.newContext();
    const student5Context = await browser.newContext();

    const teacherPage = await teacherContext.newPage();
    const student1Page = await student1Context.newPage();
    const student2Page = await student2Context.newPage();
    const student3Page = await student3Context.newPage();
    const student4Page = await student4Context.newPage();
    const student5Page = await student5Context.newPage();

    const roomId = `bio-test-${Date.now()}`;

    console.log(`[Test] Step 1: Teacher connecting to classroom ${roomId}...`);
    await teacherPage.goto(`/classroom/${roomId}?role=teacher&name=Dr.+Evelyn+Reed&color=%236366F1`);
    await teacherPage.waitForSelector('text=Dr. Evelyn Reed', { timeout: 15000 });
    await expect(teacherPage.locator('text=Dr. Evelyn Reed').first()).toBeVisible();
    await expect(teacherPage.locator('text=Teacher Controls')).toBeVisible();

    console.log('[Test] Step 2: Students 1 through 5 connecting simultaneously...');
    await student1Page.goto(`/classroom/${roomId}?role=student&name=Student+Alex&color=%2310B981`);
    await student2Page.goto(`/classroom/${roomId}?role=student&name=Student+Maya&color=%23F59E0B`);
    await student3Page.goto(`/classroom/${roomId}?role=student&name=Student+Liam&color=%230EA5E9`);
    await student4Page.goto(`/classroom/${roomId}?role=student&name=Student+Sophia&color=%23F43F5E`);
    await student5Page.goto(`/classroom/${roomId}?role=student&name=Student+Noah&color=%23A855F7`);

    // Wait for all connections to establish
    await student1Page.waitForSelector('text=Student Alex', { timeout: 15000 });
    await student2Page.waitForSelector('text=Student Maya', { timeout: 15000 });
    await student3Page.waitForSelector('text=Student Liam', { timeout: 15000 });
    await student4Page.waitForSelector('text=Student Sophia', { timeout: 15000 });
    await student5Page.waitForSelector('text=Student Noah', { timeout: 15000 });

    console.log('[Test] Step 3: Verifying all 6 participants are synchronized in Teacher and Student rosters...');
    await expect(teacherPage.locator('text=6 connected')).toBeVisible({ timeout: 10000 });
    await expect(student1Page.locator('text=6 connected')).toBeVisible({ timeout: 10000 });
    await expect(student5Page.locator('text=6 connected')).toBeVisible({ timeout: 10000 });

    // Open Roster tab on Teacher page and verify student names
    await teacherPage.click('button:has-text("Class Roster")');
    await expect(teacherPage.locator('text=Student Alex').first()).toBeAttached({ timeout: 8000 });
    await expect(teacherPage.locator('text=Student Maya').first()).toBeAttached({ timeout: 8000 });
    await expect(teacherPage.locator('text=Student Noah').first()).toBeAttached({ timeout: 8000 });

    // Students 3, 4, 5 have validated multi-client presence; close them to conserve CPU during interaction assertions
    await student3Context.close();
    await student4Context.close();
    await student5Context.close();

    console.log('[Test] Step 4: Testing Real-time Chat synchronization...');
    // Student 1 sends a chat message
    const chatInput1 = student1Page.locator('input[placeholder="Type message to class..."]');
    await chatInput1.fill('Hello everyone! Excited for Biology class today.');
    await chatInput1.press('Enter');

    // Verify Teacher and Student 2 see the message instantly without reload
    await expect(teacherPage.locator('text=Hello everyone! Excited for Biology class today.')).toBeVisible({ timeout: 8000 });
    await expect(student2Page.locator('text=Hello everyone! Excited for Biology class today.')).toBeVisible({ timeout: 8000 });

    console.log('[Test] Step 5: Testing Raise Hand & Teacher Speaking Permission approval...');
    // In Lecture mode, student mic should be locked initially
    await expect(student1Page.locator('button:has-text("Mic Locked")')).toBeVisible();

    // Student 1 raises hand
    await student1Page.click('button:has-text("Raise Hand")');
    await expect(student1Page.locator('button:has-text("Hand Raised")')).toBeVisible();

    // Switch Teacher back to Hand Queue tab
    await teacherPage.locator('button:has-text("Hand Queue")').first().click();
    await expect(teacherPage.locator('text=Student Alex').first()).toBeAttached({ timeout: 8000 });

    // Teacher approves Student 1 speaking request
    const approveBtn = teacherPage.locator('button[title="Grant speaking permission"]').first();
    await approveBtn.click();

    // Verify Student 1 receives speaking permission
    await expect(student1Page.locator('button:has-text("Unmute")')).toBeVisible({ timeout: 8000 });

    console.log('[Test] Step 6: Testing Teacher Controls (Announcements & Chat Lock)...');
    // Teacher opens controls modal
    await teacherPage.click('button:has-text("Teacher Controls")');
    await expect(teacherPage.locator('text=Teacher Control Center')).toBeVisible();

    // Teacher locks student chat
    await teacherPage.click('button:has-text("Lock Student Chat")');
    await teacherPage.click('button:has-text("Done")');

    // Verify Student 2 sees locked chat banner
    await expect(student2Page.locator('text=Chat is currently locked by the teacher.')).toBeVisible({ timeout: 8000 });

    // Teacher posts an official announcement
    await teacherPage.click('label:has-text("Send as Official Announcement")');
    const teacherChatInput = teacherPage.locator('input[placeholder="Post announcement to class..."]');
    await teacherChatInput.fill('Please open textbook chapter 4 on Mitosis.');
    await teacherPage.locator('button[type="submit"]').click();

    // Verify announcement appears on student screen
    await expect(student1Page.locator('text=Please open textbook chapter 4 on Mitosis.').first()).toBeVisible({ timeout: 8000 });

    console.log('[Test] Step 7: Cleaning up contexts...');
    await teacherContext.close();
    await student1Context.close();
    await student2Context.close();
    await student3Context.close();
    await student4Context.close();
    await student5Context.close();
    console.log('[Test] Acceptance milestone test completed successfully!');
  });
});
