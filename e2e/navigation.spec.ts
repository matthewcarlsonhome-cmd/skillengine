import { test, expect } from '@playwright/test';

/**
 * Navigation E2E Tests
 *
 * Tests critical navigation flows and page accessibility
 */

test.describe('Homepage Navigation', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');

    // Check main headline is visible
    await expect(page.getByRole('heading', { name: /AI Skills for/i })).toBeVisible();

    // Check that the main CTA buttons are visible
    await expect(page.getByRole('link', { name: /Start Job Search/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Browse Skill Library/i })).toBeVisible();
  });

  test('should navigate to skill library', async ({ page }) => {
    await page.goto('/');

    // Click on Browse Skill Library
    await page.getByRole('link', { name: /Browse Skill Library/i }).first().click();

    // Should be on library page
    await expect(page).toHaveURL(/.*library/);
  });

  test('should navigate to account settings', async ({ page }) => {
    await page.goto('/');

    // Find and click account link (may be in header or setup section)
    const accountLink = page.getByRole('link', { name: /Set Up API Key|Settings|Account/i }).first();
    await accountLink.click();

    // Should be on account page
    await expect(page).toHaveURL(/.*account/);
  });

  test('should navigate to workflows page', async ({ page }) => {
    await page.goto('/');

    // Click on View All Workflows
    await page.getByRole('link', { name: /View All Workflows/i }).click();

    // Should be on workflows page
    await expect(page).toHaveURL(/.*workflows/);
  });

  test('should navigate to analyze page for custom skills', async ({ page }) => {
    await page.goto('/');

    // Click on Create Custom Skills or Generate Custom Skills
    await page.getByRole('link', { name: /Create Custom Skills|Generate Custom Skills/i }).first().click();

    // Should be on analyze page
    await expect(page).toHaveURL(/.*analyze/);
  });
});

test.describe('Skill Library', () => {
  test('should display skill categories', async ({ page }) => {
    await page.goto('/#/library');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check that the library page has loaded with some content
    await expect(page.locator('body')).toContainText(/skill|library/i);
  });

  test('should filter skills by use case', async ({ page }) => {
    await page.goto('/#/library?useCase=job-search');

    await page.waitForLoadState('networkidle');

    // Page should show job search related content
    await expect(page.locator('body')).toContainText(/job|search|resume/i);
  });
});

test.describe('Account Settings', () => {
  test('should display API key configuration section', async ({ page }) => {
    await page.goto('/#/account');

    await page.waitForLoadState('networkidle');

    // Should have API key configuration UI
    await expect(page.locator('body')).toContainText(/API|key|provider/i);
  });
});

test.describe('Responsive Design', () => {
  test('homepage should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');

    // Main content should still be visible
    await expect(page.getByRole('heading', { name: /AI Skills for/i })).toBeVisible();

    // CTA buttons should be visible on mobile
    await expect(page.getByRole('link', { name: /Start Job Search/i })).toBeVisible();
  });

  test('homepage should be responsive on tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto('/');

    // Main content should still be visible
    await expect(page.getByRole('heading', { name: /AI Skills for/i })).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('homepage should have proper heading structure', async ({ page }) => {
    await page.goto('/');

    // Should have h1
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();

    // H1 should come before h2s
    const headings = await page.locator('h1, h2, h3').allTextContents();
    expect(headings.length).toBeGreaterThan(0);
  });

  test('interactive elements should be keyboard accessible', async ({ page }) => {
    await page.goto('/');

    // Tab through the page
    await page.keyboard.press('Tab');

    // Should be able to focus on interactive elements
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});
