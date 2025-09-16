// helpers.js
import { expect } from '@playwright/test';

export async function login(page, email, password) {
  await page.goto("http://localhost:3000/auth/login");
  await page.getByRole("textbox", { name: "Nhập email của bạn" }).fill(email);
  await page.getByRole("textbox", { name: "Nhập mật khẩu của bạn" }).fill(password);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await page.waitForTimeout(4000);
}

export async function expectVerifyTabHasOrder(page, orderId, { status = 'confirmed', timeout = 10_000 } = {}) {
  const start = Date.now();
  
  while (Date.now() - start < timeout) {
    await page.goto(`/orders?status=${status}&page=1`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const row = page.locator(`[data-testid="verify-order-row"][data-order-id="${orderId}"]`);
    if (await row.count()) {
      await expect(row).toBeVisible();
      // Also check the status attribute if provided
      await expect(row).toHaveAttribute('data-status', status);
      return row;
    }
    // Small backoff (avoid arbitrary huge waits)
    await page.waitForTimeout(500);
  }

  throw new Error(`Order ${orderId} did not appear in Verify tab (status=${status}) within ${timeout}ms`);
}


export async function expectHistoryTabHasOrder(
  page,
  orderId,
  {
    timeout = 10_000,
    maxPages = 20,
    buildUrl = (pageNum) => `/orders?tab=history&page=${pageNum}`,
    statuses = ["delivered", "cancelled", "completed", "taken", "delivering", "done"],
  } = {}
) {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    for (let p = 1; p <= maxPages; p++) {
      await page.goto(buildUrl(p), { waitUntil: "networkidle" });
      // small settle delay for client-side renders
      await page.waitForTimeout(800);

      const row = page.locator(
        `[data-testid="verify-order-row"][data-order-id="${orderId}"]`
      );

      if (await row.count()) {
        await expect(row).toBeVisible();

        // If the component sets data-status, ensure it's one of the history statuses
        const statusAttr = await row.getAttribute("data-status");
        if (statusAttr && !statuses.includes(statusAttr)) {
          throw new Error(
            `Order ${orderId} found in History tab but with unexpected status="${statusAttr}". Expected one of: ${statuses.join(
              ", "
            )}`
          );
        }

        return row;
      }
    }

    // Backoff before another sweep through pages
    await page.waitForTimeout(500);
  }

  throw new Error(
    `Order ${orderId} did not appear in History tab within ${timeout}ms (checked up to ${maxPages} pages)`
  );
}
