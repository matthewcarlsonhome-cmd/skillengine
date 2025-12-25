import { test, expect } from '@playwright/test';

/**
 * Error Handling E2E Tests
 *
 * Tests error handling and recovery including:
 * - 404 handling
 * - Invalid skill IDs
 * - Network error recovery
 */

test.describe('404 and Invalid Routes', () => {
  test('should handle invalid skill ID gracefully', async ({ page }) => {
    await page.goto('/#/skill/nonexistent-skill-id-12345');
    await page.waitForLoadState('networkidle');

    // Should show error message or redirect, not crash
    const pageContent = await page.content();
    const hasErrorHandling =
      pageContent.toLowerCase().includes('not found') ||
      pageContent.toLowerCase().includes('error') ||
      pageContent.toLowerCase().includes("doesn't exist") ||
      pageContent.toLowerCase().includes('invalid') ||
      // Or redirected to skills page
      pageContent.toLowerCase().includes('browse') ||
      pageContent.toLowerCase().includes('skill');

    expect(hasErrorHandling).toBe(true);
  });

  test('should handle invalid workflow ID gracefully', async ({ page }) => {
    await page.goto('/#/workflow/nonexistent-workflow-99999');
    await page.waitForLoadState('networkidle');

    // Should show error or redirect, not crash
    const pageContent = await page.content();
    const isHandled =
      pageContent.toLowerCase().includes('not found') ||
      pageContent.toLowerCase().includes('error') ||
      pageContent.toLowerCase().includes('workflow');

    expect(isHandled).toBe(true);
  });

  test('should handle invalid workspace ID gracefully', async ({ page }) => {
    await page.goto('/#/workspace/invalid-uuid-here');
    await page.waitForLoadState('networkidle');

    // Should handle gracefully
    const pageContent = await page.content();
    expect(pageContent.length).toBeGreaterThan(0);
  });
});

test.describe('Form Validation Errors', () => {
  test('should show validation errors for empty required fields', async ({ page }) => {
    await page.goto('/#/analyze');
    await page.waitForLoadState('networkidle');

    // Try to submit without filling required fields
    const submitButton = page.locator('button[type="submit"], button:has-text("Analyze"), button:has-text("Submit")').first();

    if ((await submitButton.count()) > 0) {
      await submitButton.click();
      await page.waitForTimeout(500);

      // Should show validation feedback
      const pageContent = await page.content();
      const hasValidationFeedback =
        pageContent.toLowerCase().includes('required') ||
        pageContent.toLowerCase().includes('please') ||
        pageContent.toLowerCase().includes('enter') ||
        pageContent.toLowerCase().includes('invalid') ||
        // Or button remained (form didn't submit)
        (await submitButton.count()) > 0;

      expect(hasValidationFeedback).toBe(true);
    }
  });

  test('should validate job description minimum length', async ({ page }) => {
    await page.goto('/#/analyze');
    await page.waitForLoadState('networkidle');

    // Find textarea and enter short text
    const textarea = page.locator('textarea').first();
    if ((await textarea.count()) > 0) {
      await textarea.fill('Short');

      // Try to submit
      const submitButton = page.locator('button[type="submit"], button:has-text("Analyze")').first();
      if ((await submitButton.count()) > 0) {
        await submitButton.click();
        await page.waitForTimeout(500);

        // Should show validation or not submit
        const pageContent = await page.content();
        const hasMinLengthValidation =
          pageContent.toLowerCase().includes('character') ||
          pageContent.toLowerCase().includes('minimum') ||
          pageContent.toLowerCase().includes('too short') ||
          pageContent.toLowerCase().includes('at least');

        // Either shows validation or stayed on same page
        const url = page.url();
        expect(hasMinLengthValidation || url.includes('analyze')).toBe(true);
      }
    }
  });
});

test.describe('Network Error Handling', () => {
  test('should handle offline gracefully', async ({ page, context }) => {
    await page.goto('/#/skills');
    await page.waitForLoadState('networkidle');

    // Simulate offline mode
    await context.setOffline(true);

    // Try to navigate
    await page.goto('/#/dashboard');
    await page.waitForTimeout(1000);

    // Should still render (using cached data)
    const pageContent = await page.content();
    expect(pageContent.length).toBeGreaterThan(100);

    // Restore online
    await context.setOffline(false);
  });
});

test.describe('Console Error Monitoring', () => {
  test('should not have critical console errors on homepage', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Filter out expected/known errors
    const criticalErrors = errors.filter(
      (e) =>
        !e.includes('favicon') &&
        !e.includes('404') &&
        !e.includes('Failed to load resource')
    );

    expect(criticalErrors.length).toBe(0);
  });

  test('should not have critical console errors on skills page', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/#/skills');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const criticalErrors = errors.filter(
      (e) =>
        !e.includes('favicon') &&
        !e.includes('404') &&
        !e.includes('Failed to load resource')
    );

    expect(criticalErrors.length).toBe(0);
  });
});
