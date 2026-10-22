import { test } from '@playwright/test';
test('capture actual desktop and mobile showcase images', async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name !== 'chromium',
    'One reference browser generates documentation images',
  );
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto('/');
  await page.screenshot({ path: 'docs/screenshots/desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'docs/screenshots/mobile.png', fullPage: true });
});
