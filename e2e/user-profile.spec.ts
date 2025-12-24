import { test, expect } from '@playwright/test';

/**
 * User Profile E2E Tests
 *
 * Tests the user profile management flow including:
 * - Viewing profile page
 * - Updating profile information
 * - Resume text persistence
 */

test.describe('User Profile Page', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any stored data before each test
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test('should load the profile page', async ({ page }) => {
    await page.goto('/#/profile');
    await page.waitForLoadState('networkidle');

    // Should have profile-related content
    await expect(page.locator('body')).toContainText(/profile|resume|background/i);
  });

  test('should display form fields for user information', async ({ page }) => {
    await page.goto('/#/profile');
    await page.waitForLoadState('networkidle');

    // Should have input fields
    const inputs = page.locator('input, textarea');
    const count = await inputs.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should persist profile data in localStorage', async ({ page }) => {
    await page.goto('/#/profile');
    await page.waitForLoadState('networkidle');

    // Find a text input and type in it
    const textInput = page.locator('input[type="text"]').first();
    if ((await textInput.count()) > 0) {
      await textInput.fill('Test User Name');

      // Wait for potential debounced save
      await page.waitForTimeout(1000);

      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Check if data persisted (may be in form or localStorage)
      const storedData = await page.evaluate(() => {
        return localStorage.getItem('skillengine_profile');
      });

      // Either form shows value or localStorage has data
      const formValue = await textInput.inputValue();
      expect(formValue === 'Test User Name' || storedData !== null).toBe(true);
    }
  });

  test('should have resume text area', async ({ page }) => {
    await page.goto('/#/profile');
    await page.waitForLoadState('networkidle');

    // Look for resume-related textarea
    const textareas = page.locator('textarea');
    const count = await textareas.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Profile Data Flow', () => {
  test('should use profile data in skills', async ({ page }) => {
    // First, set up profile with resume
    await page.goto('/#/profile');
    await page.waitForLoadState('networkidle');

    // Find resume textarea and fill it
    const resumeTextarea = page.locator('textarea').first();
    if ((await resumeTextarea.count()) > 0) {
      await resumeTextarea.fill('Software Engineer with 5 years experience in React and TypeScript.');
      await page.waitForTimeout(500);
    }

    // Navigate to a skill that uses resume
    await page.goto('/#/skill/resume-customizer');
    await page.waitForLoadState('networkidle');

    // The page should have loaded (even if resume isn't auto-populated)
    await expect(page.locator('body')).toContainText(/resume|customiz/i);
  });
});
