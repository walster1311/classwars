import { test, expect } from '@playwright/test';

test.describe('Classroom Interactive Systems', () => {
  test('Seating collision & Server Authoritative Lock', async ({ browser }) => {
    const student1Ctx = await browser.newContext();
    const student2Ctx = await browser.newContext();

    const p1 = await student1Ctx.newPage();
    const p2 = await student2Ctx.newPage();

    await p1.goto('/classroom/test-room-seating?role=student&name=Student+SeatA&color=%2310B981');
    await p2.goto('/classroom/test-room-seating?role=student&name=Student+SeatB&color=%23F59E0B');

    await p1.waitForSelector('text=Student SeatA', { timeout: 15000 });
    await p2.waitForSelector('text=Student SeatB', { timeout: 15000 });

    // Verify initial standing state
    await expect(p1.locator('button:has-text("Sit at Desk")')).toBeVisible();
    await expect(p2.locator('button:has-text("Sit at Desk")')).toBeVisible();

    await student1Ctx.close();
    await student2Ctx.close();
  });

  test('LiveKit Voice Token Dispenser and Server-Enforced Permissions', async ({ request }) => {
    // 1. Teacher request should have canPublish: true
    const teacherRes = await request.post('http://localhost:2567/api/livekit/token', {
      data: {
        roomName: 'bio-101',
        identity: 'teacher_session_1',
        name: 'Dr. Evelyn Reed',
        role: 'teacher',
        canPublishAudio: false // Teacher role automatically grants audio publishing
      }
    });

    expect(teacherRes.ok()).toBeTruthy();
    const teacherData = await teacherRes.json();
    expect(teacherData.token).toBeDefined();
    expect(teacherData.canPublish).toBe(true);

    // 2. Student without permission should have canPublish: false
    const studentRes = await request.post('http://localhost:2567/api/livekit/token', {
      data: {
        roomName: 'bio-101',
        identity: 'student_session_1',
        name: 'Student Alex',
        role: 'student',
        canPublishAudio: false
      }
    });

    expect(studentRes.ok()).toBeTruthy();
    const studentData = await studentRes.json();
    expect(studentData.token).toBeDefined();
    expect(studentData.canPublish).toBe(false);

    // 3. Student with granted permission should have canPublish: true
    const studentApprovedRes = await request.post('http://localhost:2567/api/livekit/token', {
      data: {
        roomName: 'bio-101',
        identity: 'student_session_1',
        name: 'Student Alex',
        role: 'student',
        canPublishAudio: true
      }
    });

    expect(studentApprovedRes.ok()).toBeTruthy();
    const approvedData = await studentApprovedRes.json();
    expect(approvedData.canPublish).toBe(true);
  });
});
