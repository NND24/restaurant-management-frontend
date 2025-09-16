// tests/orders.tc09.spec.js
import { test, expect } from "@playwright/test";
import {
    createPendingOrder,
    getOrderById,
    findItemToEdit,
} from "./utils/apiClient.js";
import {
    login,
    expectVerifyTabHasOrder,
    expectHistoryTabHasOrder,
} from "./utils/helpers.js";

const CLIENT_EMAIL =
    process.env.STAFF_EMAIL || "n21dccn003@student.ptithcm.edu.vn";
const CLIENT_PASS = process.env.STAFF_PASS || "123";

const STORE_ID = "67c6e409f1c07122e88619d6";
const DISH_ID = "67c6e40af1c07122e88619e8";

const BASE_UI_URL = process.env.BASE_UI_URL ?? "http://localhost:3000";
const BASE_API_URL = process.env.BASE_API_URL ?? "http://localhost:5000";

function extractToppingName(label = "") {
    // Strip currency chunks like "5.000 ₫", extra spaces, and any leading "- "
    let s = label.replace(/\d{1,3}(\.\d{3})*(,\d+)?\s*₫/g, "");
    s = s.replace(/^-+\s*/, ""); // remove leading dashes
    s = s.replace(/\s{2,}/g, " ").trim();
    return s;
}

function normalize(s = "") {
    return s.normalize("NFC").trim().toLowerCase();
}

test("TC07 _ Kiểm tra tab 'mới nhất' có đơn hàng vừa đặt không", async ({ page }) => {
    // Arrange: create pending order via API as a client
    const { token, api, orderId } = await createPendingOrder({
        email: CLIENT_EMAIL,
        password: CLIENT_PASS,
        storeId: STORE_ID,
        dishId: DISH_ID,
        quantity: 1,
        note: "",
    });

    // Fetch truth from API for comparison
    const orderApi = await getOrderById({ token, api }, orderId);

    // Act: login to store UI and open the pending tab
    await login(page, "buianh120403@gmail.com", "123"); // staff/owner account
    await page.waitForTimeout(2000);
    await page.goto("/orders");
    await page.waitForTimeout(1000);

    // If you have a "Mới" tab button, click it; otherwise LatestOrder already shows pending
    const maybePendingTab = page.getByRole("button", { name: /Mới|Pending/i });
    if (await maybePendingTab.count()) {
        await maybePendingTab.click();
    }
    await page.waitForTimeout(3000);

    // Assert 1: the row with this order id is visible
    const row = page.locator(
        `[data-testid="order-row"][data-order-id="${orderId}"]`
    );
    await expect(row).toBeVisible();

    // Assert 2: the visible text shows the orderId
    await expect(row.getByTestId("order-id-text")).toContainText(orderId);

    const apiOrderData = orderApi.data;

    if (!apiOrderData || !Array.isArray(apiOrderData.items)) {
        throw new Error(
            `Expected items array in API response, got: ${JSON.stringify(
                orderApi
            )}`
        );
    }

    // totals
    const expectedQty = apiOrderData.items.reduce(
        (a, i) => a + (i.quantity || 0),
        0
    );
    const expectedPrice = apiOrderData.items.reduce((acc, item) => {
        const base = (item.dish?.price || item.price || 0) * item.quantity;
        const toppings =
            (Array.isArray(item.toppings)
                ? item.toppings.reduce((s, t) => s + (t.price || 0), 0)
                : 0) * item.quantity;
        return acc + base + toppings;
    }, 0);

    await expect(row).toHaveAttribute("data-total-qty", String(expectedQty));
    await expect(row).toHaveAttribute(
        "data-total-price",
        String(expectedPrice)
    );

    // per-item checks
    const uiItems = row.locator('[data-testid="item-row"]');
    const uiCount = await uiItems.count();
    expect(uiCount).toBe(apiOrderData.items.length);

    for (let i = 0; i < uiCount; i++) {
        const uiItem = uiItems.nth(i);
        const uiName = await uiItem.getAttribute("data-item-name");
        const uiQty = Number(await uiItem.getAttribute("data-item-qty"));
        const uiTop = Number(
            await uiItem.getAttribute("data-item-topping-count")
        );

        const apiItem = apiOrderData.items[i];
        expect(uiName).toBe(apiItem.dish?.name || apiItem.dishName);
        expect(uiQty).toBe(apiItem.quantity || 0);
        expect(uiTop).toBe((apiItem.toppings || []).length);
    }

    // (Optional) Also check customer name if present
    if (orderApi.user?.name) {
        await expect(row.getByTestId("customer-name")).toHaveText(
            orderApi.user.name,
            { useInnerText: true }
        );
    }
});

test("TC8 _ Kiểm tra tab 'đã xác nhận' có đơn hàng với trạng thái đã xác nhận", async ({ page }) => {
    // Arrange: create pending order via API
    const { token, api, orderId } = await createPendingOrder({
        email: CLIENT_EMAIL,
        password: CLIENT_PASS,
        storeId: STORE_ID,
        dishId: DISH_ID,
        quantity: 1,
        note: "",
    });

    // Staff logs into UI
    await login(page, "buianh120403@gmail.com", "123");

    // Go to pending list and confirm the order
    await page.goto("/orders", { waitUntil: "networkidle" });
    const pendingRow = page.locator(
        `[data-testid="order-row"][data-order-id="${orderId}"]`
    );
    await expect(pendingRow).toBeVisible();
    await pendingRow.getByTestId("btn-confirm").click();
    await page.getByRole("button", { name: "Đã xác nhận" }).click();
    // Go straight to Verify tab filtered to confirmed and poll until the row shows up
    const verifyRow = await expectVerifyTabHasOrder(page, orderId, {
        status: "confirmed",
    });

    // API truth
    const orderApi = await getOrderById({ token, api }, orderId);
    expect(orderApi?.data?.status).toBe("confirmed");

    // Buttons in confirmed state: have finish, no taken
    await expect(verifyRow.getByTestId("btn-finish")).toBeVisible();
    await expect(verifyRow.getByTestId("btn-taken")).toHaveCount(0);
});

test("TC9 _ Kiểm tra tab 'đã xác nhận' có đơn hàng với trạng thái đã xong ", async ({ page }) => {
    // Seed another pending order
    const { token, api, orderId } = await createPendingOrder({
        email: CLIENT_EMAIL,
        password: CLIENT_PASS,
        storeId: STORE_ID,
        dishId: DISH_ID,
        quantity: 1,
    });

    await login(page, "buianh120403@gmail.com", "123");

    // Confirm it in Pending tab
    await page.goto("/orders", { waitUntil: "networkidle" });
    const pendingRow = page.locator(
        `[data-testid="order-row"][data-order-id="${orderId}"]`
    );
    await expect(pendingRow).toBeVisible();
    await pendingRow.getByTestId("btn-confirm").click();

    console.log("Order confirmed, now in Verify tab");
    await page.getByRole("button", { name: "Đã xác nhận" }).click();
    await page.waitForTimeout(2000);
    // Now move it to Finished in Verify tab
    const verifyRowConfirmed = await expectVerifyTabHasOrder(page, orderId, {
        status: "confirmed",
    });
    await page.waitForTimeout(4000);
    await verifyRowConfirmed.getByTestId("btn-finish").click();

    console.log("Order finished, should now be in Verify tab");
    await page.waitForTimeout(4000);
    // Row remains on Verify tab, status becomes 'finished' and button changes
    const verifyRowFinished = await expectVerifyTabHasOrder(page, orderId, {
        status: "finished",
    });
    await page.waitForTimeout(2000);
    await expect(verifyRowFinished.getByTestId("btn-taken")).toBeVisible(); // "Giao tài xế"
    await expect(verifyRowFinished.getByTestId("btn-finish")).toHaveCount(0); // "Thông báo tài xế" gone

    // API truth
    const orderApi = await getOrderById({ token, api }, orderId);
    expect(orderApi?.data?.status).toBe("finished");
});
test("TC10 _ Kiểm tra tab 'lịch sử' có đơn hàng với trạng thái đã nhận", async ({ page }) => {
    // Seed another pending order
    const { token, api, orderId } = await createPendingOrder({
        email: CLIENT_EMAIL,
        password: CLIENT_PASS,
        storeId: STORE_ID,
        dishId: DISH_ID,
        quantity: 1,
    });

    await login(page, "buianh120403@gmail.com", "123");

    // Confirm it in Pending tab
    await page.goto("/orders", { waitUntil: "networkidle" });
    const pendingRow = page.locator(
        `[data-testid="order-row"][data-order-id="${orderId}"]`
    );
    await expect(pendingRow).toBeVisible();
    await pendingRow.getByTestId("btn-confirm").click();

    console.log("Order confirmed, now in Verify tab");
    await page.getByRole("button", { name: "Đã xác nhận" }).click();
    await page.waitForTimeout(2000);
    // Now move it to Finished in Verify tab
    const verifyRowConfirmed = await expectVerifyTabHasOrder(page, orderId, {
        status: "confirmed",
    });
    await page.waitForTimeout(4000);
    await verifyRowConfirmed.getByTestId("btn-finish").click();

    console.log("Order finished, should now be in Verify tab");
    await page.waitForTimeout(4000);
    // Row remains on Verify tab, status becomes 'finished' and button changes
    const verifyRowFinished = await expectVerifyTabHasOrder(page, orderId, {
        status: "finished",
    });
    await page.waitForTimeout(2000);
    await expect(verifyRowFinished.getByTestId("btn-taken")).toBeVisible(); // "Giao tài xế"
    await expect(verifyRowFinished.getByTestId("btn-finish")).toHaveCount(0); // "Thông báo tài xế" gone
    await verifyRowConfirmed.getByTestId("btn-taken").click();
    await page.waitForTimeout(2000);
    await page.getByRole("button", { name: "Lịch sử" }).click();
    const finishRow = await expectHistoryTabHasOrder(page, orderId, {
        status: "finished",
    });
    await expect(verifyRowFinished).toBeVisible();
    console.log("Order moved to History tab");
    // API truth
    const orderApi = await getOrderById({ token, api }, orderId);
    expect(orderApi?.data?.status).toBe("taken");
});

test("TC11 _ Kiểm tra chỉnh sửa order", async ({ page }) => {
    const { token, api, orderId } = await createPendingOrder({
        email: CLIENT_EMAIL,
        password: CLIENT_PASS,
        storeId: STORE_ID,
        dishId: DISH_ID,
        quantity: 1,
    });

    // --- helpers (new) ---
    const normalize = (s = "") => s.normalize("NFC").trim().toLowerCase();
    const extractToppingName = (label = "") => {
        // strip currency chunks and leading dash
        let s = label.replace(/\d{1,3}(\.\d{3})*(,\d+)?\s*₫/g, "");
        s = s.replace(/^-+\s*/, "");
        s = s.replace(/\s{2,}/g, " ").trim();
        return s;
    };

    // 1) Login
    await login(page, "buianh120403@gmail.com", "123");
    await page.waitForTimeout(2000);

    // 2) Get original order (API)
    const originalOrderData = await getOrderById({ token, api }, orderId);
    const originalOrder = originalOrderData.data;
    console.log("Original order:", originalOrder);

    const originalItem = await findItemToEdit(originalOrder);
    console.log("Original item to edit:", originalItem);

    const dishName = originalItem.dishName; // keep
    const originalQty = originalItem.quantity; // keep
    const originalToppingNames = new Set(
        (originalItem.toppings ?? []).map((t) => t.toppingName)
    );
    console.log(
        `Original item: ${dishName} x ${originalQty}, toppings: ${[
            ...originalToppingNames,
        ].join(", ")}`
    );

    // 3) Open order detail UI
    await page.goto(`${BASE_UI_URL}/orders/${orderId}`, {
        waitUntil: "networkidle",
    });
    await page.waitForTimeout(2000);

    // 4) Click "Sửa" to go to update page
    await page.getByRole("button", { name: "Sửa" }).click();
    await page.waitForURL(new RegExp(`/orders/${orderId}/update$`));
    await page.waitForTimeout(2000);

    // 5) Find the item row by dish name and click "+" once  (unchanged per your request)
    const row = page
        .locator("div", { hasText: dishName })
        .filter({ has: page.getByRole("button", { name: "+" }) })
        .first();

    await expect(row).toBeVisible();
    await row.getByRole("button", { name: "+" }).click();

    // 6) Open toppings modal and pick first unchecked topping not already in original
    await row.getByRole("button", { name: "Chọn topping" }).click();

    // scope to the open modal by finding the container that has the "Áp dụng" button
    const modal = page
        .locator("div")
        .filter({
            has: page.getByRole("button", { name: "Áp dụng" }),
        })
        .first();

    const checkboxes = modal.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    if (count === 0) test.fail(true, "No topping options available");

    // normalize set for comparison
    const originalSet = new Set([...originalToppingNames].map(normalize));

    let pickedLabel = "";
    let pickedIndex = -1;

    for (let i = 0; i < count; i++) {
        const checkbox = checkboxes.nth(i);
        // parent row contains checkbox and the <span> with the name
        const optionRow = checkbox.locator("..");
        const nameSpan = optionRow.locator("span");
        const rawName = (await nameSpan.innerText())?.trim() || "";

        if (!rawName) continue;

        const norm = normalize(rawName);
        // skip if already present in original
        const alreadyHad = [...originalSet].some(
            (t) => norm.includes(t) || t.includes(norm)
        );
        if (!alreadyHad) {
            await checkbox.check();
            pickedLabel = rawName; // keep original for UI assert
            pickedIndex = i;
            break;
        }
    }

    // If all were already selected (edge case), just select the first one anyway
    if (pickedIndex === -1) {
        const firstRow = checkboxes.first().locator("..");
        await checkboxes.first().check();
        pickedLabel = (await firstRow.locator("span").innerText()).trim();
    }

    console.log(`Picked topping: ${pickedLabel} (index ${pickedIndex})`);
    await page.waitForTimeout(2000);

    // Apply the toppings, then Save + confirm
    await page.getByRole("button", { name: "Áp dụng" }).click();
    await page.getByRole("button", { name: "Lưu thay đổi" }).click();
    await page.getByRole("button", { name: "Lưu", exact: true }).click();
    await page.waitForTimeout(2000);

    // 7) Back to detail page
    await page.waitForURL(new RegExp(`/orders/${orderId}$`));
    await page.waitForTimeout(2000);

    // 8) Verify UI shows qty+1 and topping visible  (keep your dishName/quantity logic)
    const expectedQty = originalQty + 1;
    console.log(`${expectedQty} x ${dishName}`);

    await expect(
        page.locator(`text=/^\\s*${expectedQty} x ${dishName}\\s*$/`)
    ).toBeVisible();

    // Find the LI that contains the quantity + dish name
    const dishRow = page
        .locator("li", { hasText: `${expectedQty} x ${dishName}` })
        .first();
    await expect(dishRow).toBeVisible();

    // Extract stable topping name (no currency / dash)
    const toppingNameForAssert = extractToppingName(pickedLabel);

    // Inside that row, find a span that contains the topping name
    await expect(
        dishRow.locator("span", { hasText: toppingNameForAssert })
    ).toBeVisible();

    // 9) Verify via API (use your same helper that takes token/api)
    const updatedOrderData = await getOrderById({ token, api }, orderId);
    const updatedOrder = updatedOrderData.data;

    const updatedItem =
        (updatedOrder.items || []).find(
            (it) => (it.dish?.name || it.dishName) === dishName
        ) || updatedOrder.items?.[0];

    expect(updatedItem?.quantity, "Quantity should increase by 1").toBe(
        expectedQty
    );

    const updatedToppingNames = (updatedItem?.toppings ?? []).map(
        (t) => t.toppingName
    );

    // VN accents, spacing
    const serverHasPicked = updatedToppingNames
        .map((n) => normalize(n))
        .some(
            (n) =>
                n === normalize(toppingNameForAssert) ||
                normalize(toppingNameForAssert).includes(n)
        );

    expect(
        serverHasPicked,
        `New topping should be present. Saw: ${updatedToppingNames.join(", ")}`
    ).toBe(true);
});
