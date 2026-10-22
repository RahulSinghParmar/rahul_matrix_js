import { test, expect } from '@playwright/test';
test('controls, saved settings, pause, reset and PNG export work', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'Amber', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Amber', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByLabel('CHARACTER SET').selectOption('binary');
  await page.getByRole('button', { name: 'Pause animation' }).click();
  await expect(page.locator('#render-status')).toHaveText('PAUSED');
  const before = await page.locator('canvas').evaluate((c) => c.toDataURL());
  await page.waitForTimeout(150);
  expect(await page.locator('canvas').evaluate((c) => c.toDataURL())).toBe(before);
  await page.reload();
  await expect(page.getByLabel('CHARACTER SET')).toHaveValue('binary');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Save PNG' }).click();
  expect((await download).suggestedFilename()).toBe('signal-matrix-rain.png');
  await page.getByRole('button', { name: 'Restore defaults' }).click();
  await expect(page.getByLabel('CHARACTER SET')).toHaveValue('mixed');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});
test('reduced motion starts paused with an explicit opt-in', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('#render-status')).toHaveText('PAUSED');
  await page.getByRole('button', { name: 'Resume animation' }).click();
  await expect(page.locator('#render-status')).toHaveText('RENDERING');
});
test('blocked localStorage still permits interaction', async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new Error('blocked');
      },
    }),
  );
  await page.goto('/');
  await page.getByRole('button', { name: 'Ice', exact: true }).click();
  await expect(page.locator('#preset-caption')).toHaveText('03 / ICE BLUE');
});
