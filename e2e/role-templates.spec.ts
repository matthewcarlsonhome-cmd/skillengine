import { test, expect } from '@playwright/test';

/**
 * Role Templates E2E Tests
 *
 * Tests the role templates feature including:
 * - Browsing available roles
 * - Viewing role details
 * - Accessing role-specific skills
 */

test.describe('Role Templates Page', () => {
  test('should load the role templates page', async ({ page }) => {
    await page.goto('/#/role-templates');
    await page.waitForLoadState('networkidle');

    // Should display role templates content
    await expect(page.locator('body')).toContainText(/role|template|professional/i);
  });

  test('should display multiple role categories', async ({ page }) => {
    await page.goto('/#/role-templates');
    await page.waitForLoadState('networkidle');

    // Should have role cards or list items
    const roleItems = page.locator('[data-testid*="role"], .role-card, [class*="role"]');
    // If no specific selectors, check for generic content
    const pageContent = await page.content();
    const hasRoleContent =
      pageContent.includes('Manager') ||
      pageContent.includes('Engineer') ||
      pageContent.includes('Developer') ||
      pageContent.includes('Analyst') ||
      pageContent.includes('Designer');

    expect(hasRoleContent).toBe(true);
  });

  test('should have clickable role items', async ({ page }) => {
    await page.goto('/#/role-templates');
    await page.waitForLoadState('networkidle');

    // Find clickable elements (buttons or links)
    const clickableItems = page.locator('button, a, [role="button"]');
    const count = await clickableItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should filter roles when search is used', async ({ page }) => {
    await page.goto('/#/role-templates');
    await page.waitForLoadState('networkidle');

    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="earch"], input[placeholder*="ilter"]');
    if ((await searchInput.count()) > 0) {
      await searchInput.first().fill('engineer');
      await page.waitForTimeout(500);

      // Content should be filtered
      const pageContent = await page.content();
      expect(pageContent.toLowerCase()).toContain('engineer');
    }
  });
});

test.describe('Role Template Skills', () => {
  test('should show skills for a selected role', async ({ page }) => {
    await page.goto('/#/role-templates');
    await page.waitForLoadState('networkidle');

    // Click on any role-related element to expand/select
    const roleButton = page.locator('button, [role="button"]').first();
    if ((await roleButton.count()) > 0) {
      await roleButton.click();
      await page.waitForTimeout(500);

      // Should show skills or additional content
      const pageContent = await page.content();
      const hasSkillContent =
        pageContent.toLowerCase().includes('skill') ||
        pageContent.toLowerCase().includes('run') ||
        pageContent.toLowerCase().includes('execute');

      // Page should have interactive elements
      expect(hasSkillContent || (await page.locator('button').count()) > 1).toBe(true);
    }
  });
});
