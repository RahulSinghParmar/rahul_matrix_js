import { test, expect } from '@playwright/test';
test('layout fits narrow, tablet and desktop widths and skip link works', async ({ page }) => {
  await page.goto('/');
  for (const width of [320, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: /Skip to/ })).toBeFocused();
});
