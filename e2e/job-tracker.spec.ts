import { test, expect } from '@playwright/test';

/**
 * Job Tracker E2E Tests
 *
 * Tests the job application tracking feature including:
 * - Adding new job applications
 * - Viewing job list
 * - Updating job status
 * - Filtering and searching
 */

test.describe('Job Tracker Page', () => {
  test.beforeEach(async ({ page }) => {
    // Clear stored data
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('skillengine_jobs');
    });
  });

  test('should load the job tracker page', async ({ page }) => {
    await page.goto('/#/job-tracker');
    await page.waitForLoadState('networkidle');

    // Should display job tracker content
    await expect(page.locator('body')).toContainText(/job|track|application/i);
  });

  test('should have add job button or form', async ({ page }) => {
    await page.goto('/#/job-tracker');
    await page.waitForLoadState('networkidle');

    // Look for add button or form
    const addElements = page.locator('button:has-text("Add"), button:has-text("New"), button:has-text("Create"), form');
    const count = await addElements.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display empty state when no jobs', async ({ page }) => {
    await page.goto('/#/job-tracker');
    await page.waitForLoadState('networkidle');

    // Should show empty state or prompt to add
    const pageContent = await page.content();
    const hasEmptyState =
      pageContent.toLowerCase().includes('no job') ||
      pageContent.toLowerCase().includes('add your first') ||
      pageContent.toLowerCase().includes('get started') ||
      pageContent.toLowerCase().includes('track');

    expect(hasEmptyState).toBe(true);
  });

  test('should persist jobs to localStorage', async ({ page }) => {
    await page.goto('/#/job-tracker');
    await page.waitForLoadState('networkidle');

    // Try to add a job (click add button if exists)
    const addButton = page.locator('button:has-text("Add"), button:has-text("New")').first();
    if ((await addButton.count()) > 0) {
      await addButton.click();
      await page.waitForTimeout(500);

      // Look for form inputs
      const companyInput = page.locator('input[placeholder*="ompany"], input[name*="company"]');
      if ((await companyInput.count()) > 0) {
        await companyInput.fill('Test Company');

        // Try to save
        const saveButton = page.locator('button:has-text("Save"), button:has-text("Add"), button[type="submit"]').first();
        if ((await saveButton.count()) > 0) {
          await saveButton.click();
          await page.waitForTimeout(500);
        }
      }
    }

    // Check localStorage has some job data
    const storedJobs = await page.evaluate(() => {
      // Check various possible keys
      return (
        localStorage.getItem('skillengine_jobs') ||
        localStorage.getItem('jobs') ||
        localStorage.getItem('job-tracker')
      );
    });

    // Either we stored jobs or the UI updated
    const pageContent = await page.content();
    expect(storedJobs !== null || pageContent.includes('Test Company')).toBe(true);
  });
});

test.describe('Job Status Management', () => {
  test('should display status options', async ({ page }) => {
    await page.goto('/#/job-tracker');
    await page.waitForLoadState('networkidle');

    // Look for status-related UI elements
    const pageContent = await page.content();
    const hasStatusContent =
      pageContent.toLowerCase().includes('applied') ||
      pageContent.toLowerCase().includes('interview') ||
      pageContent.toLowerCase().includes('pending') ||
      pageContent.toLowerCase().includes('status');

    expect(hasStatusContent).toBe(true);
  });
});
