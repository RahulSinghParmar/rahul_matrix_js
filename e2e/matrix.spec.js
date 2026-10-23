import { test, expect } from '@playwright/test';
test('sparse rain stays visible and glyphs align to crisp rows', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    Math.random = () => 0.99;
    window.glyphRows = [];
    const original = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (text, x, y) {
      window.glyphRows.push(y);
      return original.call(this, text, x, y);
    };
  });
  await page.goto('/');
  await expect(page.locator('#render-status')).toHaveText('PAUSED');
  const result = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
    let visible = false;
    for (let i = 0; i < pixels.length; i += 4)
      if (pixels[i + 1] > 20) {
        visible = true;
        break;
      }
    return { visible, rows: window.glyphRows };
  });
  expect(result.visible).toBe(true);
  expect(result.rows.length).toBeGreaterThan(0);
  expect(result.rows.every((y) => y % 18 === 0)).toBe(true);
});
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
