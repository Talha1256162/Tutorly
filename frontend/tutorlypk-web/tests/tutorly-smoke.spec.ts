import { expect, test } from '@playwright/test';

const appUrl = process.env.TUTORLY_APP_URL ?? 'http://127.0.0.1:4200';
const apiUrl = process.env.TUTORLY_API_URL ?? 'http://localhost:5101';
const studentEmail = 'zara@example.com';
const tutorEmail = 'ayesha@example.com';
const seedPassword = 'Password123!';

test('Tutorly core application smoke flow', async ({ page }, testInfo) => {
  const browserErrors: string[] = [];

  page.on('console', message => {
    if (message.type() === 'error') {
      browserErrors.push(message.text());
    }
  });

  page.on('pageerror', error => {
    browserErrors.push(error.message);
  });

  await test.step('backend health endpoint works', async () => {
    const response = await page.request.get(`${apiUrl}/health`);
    expect(response.ok()).toBeTruthy();
  });

  await test.step('landing page renders real content', async () => {
    await page.goto(appUrl);
    await expect(page.getByText('Find the right tutor')).toBeVisible();
    await expect(page.getByText("Pakistan's #1 AI-verified tutor marketplace")).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath('home.png'), fullPage: false });
  });

  await test.step('browse tutors and tutor detail render from API data', async () => {
    await page.goto(`${appUrl}/tutors`);
    await expect(page.getByRole('heading', { name: '6 tutors' })).toBeVisible();
    await expect(page.getByText('Ayesha Malik')).toBeVisible();

    await page.goto(`${appUrl}/tutors/ayesha-malik`);
    await expect(page.getByRole('heading', { name: 'Ayesha Malik' })).toBeVisible();
    await expect(page.getByText('Verified tutor with CNIC check')).toBeVisible();
  });

  await test.step('student can log in and see learner dashboard', async () => {
    await page.goto(`${appUrl}/login`);
    await page.locator('input[name="emailOrPhone"]').fill(studentEmail);
    await page.locator('input[name="password"]').fill(seedPassword);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/dashboard');
    await expect(page.getByText('As-salamu alaykum, Zara')).toBeVisible();
    await expect(page.getByText('Recommended teachers')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Tutorly Insight' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Insight', exact: true })).toBeVisible();
  });

  await test.step('authenticated booking flow creates a demo request', async () => {
    await page.goto(`${appUrl}/book/ayesha-malik`);
    await expect(page.getByText('Book a free demo with Ayesha')).toBeVisible();
    await page.getByPlaceholder('Student name').fill('Smoke Test Student');
    await page.getByPlaceholder('Parent phone').fill('+923009990000');
    await page.getByPlaceholder("What's the goal? Any specific topics?").fill('Smoke test booking from automated browser flow.');
    await page.getByRole('button', { name: 'Confirm booking' }).click();
    await expect(page.getByText('Demo request received. The tutor will confirm shortly.')).toBeVisible();
  });

  await test.step('student protected pages render', async () => {
    await page.goto(`${appUrl}/my-bookings`);
    await expect(page.getByRole('heading', { name: 'Demo classes and active sessions.' })).toBeVisible();
    await expect(page.locator('article').filter({ hasText: 'Ayesha Malik' }).first()).toBeVisible();

    await page.goto(`${appUrl}/saved-tutors`);
    await expect(page.getByRole('heading', { name: 'Tutors you kept for later.' })).toBeVisible();

    await page.goto(`${appUrl}/messages`);
    await expect(page.getByText('Teacher Messages')).toBeVisible();
  });

  await test.step('Tutorly Insight diagnostic and matched tutors render', async () => {
    await page.goto(`${appUrl}/insight/diagnostic`);
    await expect(page.getByRole('heading', { name: 'Start Free Level Check' })).toBeVisible();
    const startDiagnosticButton = page.getByRole('button', { name: 'Start Diagnostic Test' });
    await expect(startDiagnosticButton).toBeEnabled();
    await startDiagnosticButton.click();
    await expect(page.getByText('Question 1 of')).toBeVisible();

    await page.locator('button').filter({ hasText: 'A.' }).first().click();
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'Complete test' }).click();
    await page.waitForURL('**/insight/report/**');
    await expect(page.getByText('Tutorly Insight Report')).toBeVisible();

    await page.getByRole('link', { name: 'Matched Tutors' }).click();
    await page.waitForURL('**/insight/matched-tutors/**');
    await expect(page.getByRole('heading', { name: 'Matched Tutors' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Book Demo' }).first()).toBeVisible();
  });

  await test.step('tutor can log in and see teacher dashboard', async () => {
    await page.evaluate(() => localStorage.clear());
    await page.goto(`${appUrl}/login`);
    await page.locator('input[name="emailOrPhone"]').fill(tutorEmail);
    await page.locator('input[name="password"]').fill(seedPassword);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/tutor-dashboard');
    await expect(page.getByText('Good evening, Ayesha')).toBeVisible();
  });

  await test.step('authenticated user can log out', async () => {
    await page.getByRole('button', { name: 'Logout' }).click();
    await page.waitForURL('**/login');
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
    await expect.poll(async () => page.evaluate(() => localStorage.getItem('tutorly_access_token'))).toBeNull();
  });

  const relevantErrors = browserErrors.filter(error =>
    !error.includes('favicon') &&
    !error.includes('Failed to load resource: net::ERR_BLOCKED_BY_CLIENT'));

  expect(relevantErrors).toEqual([]);
});
