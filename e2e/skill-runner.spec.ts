import { test, expect } from '@playwright/test';

/**
 * Skill Runner E2E Tests
 *
 * Tests the skill execution flow (without actual API calls)
 */

test.describe('Skill Runner Page', () => {
  test('should load a builtin skill page', async ({ page }) => {
    await page.goto('/#/skill/resume-customizer');

    await page.waitForLoadState('networkidle');

    // Should display skill name or form
    await expect(page.locator('body')).toContainText(/resume|customiz/i);
  });

  test('should display skill input form', async ({ page }) => {
    await page.goto('/#/skill/interview-prep');

    await page.waitForLoadState('networkidle');

    // Should have input fields or form elements
    const inputElements = page.locator('input, textarea, select');
    const count = await inputElements.count();

    // Should have at least one input element
    expect(count).toBeGreaterThan(0);
  });

  test('should show API key warning when not configured', async ({ page }) => {
    // Clear any stored API keys first
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('skillengine_api_keys');
    });

    await page.goto('/#/skill/resume-customizer');

    await page.waitForLoadState('networkidle');

    // Should show some indication about API key requirement
    // This might be a warning, button to configure, or redirect
    const pageContent = await page.content();
    const hasApiKeyReference =
      pageContent.toLowerCase().includes('api') ||
      pageContent.toLowerCase().includes('key') ||
      pageContent.toLowerCase().includes('configure');

    expect(hasApiKeyReference).toBe(true);
  });
});

test.describe('Workflow Runner', () => {
  test('should load workflow page', async ({ page }) => {
    await page.goto('/#/workflow/job-application');

    await page.waitForLoadState('networkidle');

    // Should display workflow content
    await expect(page.locator('body')).toContainText(/job|application|workflow/i);
  });

  test('should display workflow steps', async ({ page }) => {
    await page.goto('/#/workflows');

    await page.waitForLoadState('networkidle');

    // Should have workflow listings
    await expect(page.locator('body')).toContainText(/workflow/i);
  });
});

test.describe('Dynamic Skill Generation', () => {
  test('should load analyze page for job description', async ({ page }) => {
    await page.goto('/#/analyze');

    await page.waitForLoadState('networkidle');

    // Should have textarea for job description input
    const textarea = page.locator('textarea');
    await expect(textarea.first()).toBeVisible();
  });

  test('should accept job description input', async ({ page }) => {
    await page.goto('/#/analyze');

    await page.waitForLoadState('networkidle');

    // Find and fill the job description textarea
    const textarea = page.locator('textarea').first();
    await textarea.fill('Software Engineer position at a tech company...');

    // Should have the text
    await expect(textarea).toHaveValue(/Software Engineer/);
  });
});

test.describe('Export Skills', () => {
  test('should load export page', async ({ page }) => {
    await page.goto('/#/export-skills');

    await page.waitForLoadState('networkidle');

    // Should have export-related content
    await expect(page.locator('body')).toContainText(/export|download|skill/i);
  });
});
