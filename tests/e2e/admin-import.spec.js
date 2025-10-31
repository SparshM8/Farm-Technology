const { test, expect } = require('@playwright/test');

test.describe('Admin Import Flow', () => {
  test('should login as admin, import products, and verify they appear', async ({ page }) => {
    // Navigate to the site
    await page.goto('http://localhost:3000');

    // Perform login through the page context to ensure session cookie is set
    const loginOk = await page.evaluate(async () => {
      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: 'PASSCODE' })
        });
        return res.ok;
      } catch (e) {
        return false;
      }
    });
    expect(loginOk).toBeTruthy();

    // Import products by calling the admin API directly (ensures session cookie is used)
    const importResult = await page.evaluate(async () => {
      try {
        // call the import endpoint; uses same-origin cookie
        const r = await fetch('/api/admin/import-products', { method: 'POST', credentials: 'same-origin' });
        const json = await r.json().catch(() => ({}));
        return { ok: r.ok, json };
      } catch (e) {
        return { ok: false, json: {} };
      }
    });
    expect(importResult.ok).toBeTruthy();

    // Wait for the public product grid to refresh and show products
    await page.waitForSelector('#products-grid .product-card, #products-grid .product-item', { timeout: 10000 });

    // Verify public-facing product cards show up
    const publicCount = await page.locator('#products-grid .product-card, #products-grid .product-item').count();
    expect(publicCount).toBeGreaterThan(0);
  });
});