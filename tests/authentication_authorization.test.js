// test-auth.spec.js
import { test, expect } from "@playwright/test";
import { login } from "./utils/helpers";

// Happy case
test("TC01 - Đăng nhập với tài khoản hợp lệ", async ({ page }) => {
    await login(page, "buianh120403@gmail.com", "123");
    await expect(page.getByText("Đăng nhập thành công!")).toBeVisible();
    await page.waitForTimeout(1000);
    await expect(page.url()).toContain("/home");
});

// Login with wrong credentials
test("TC02 - Đăng nhập với tài khoản không hợp lệ", async ({ page }) => {
    await login(page, "buianh120403@gmail.com", "1231");
    await expect(page.getByText("Email hoặc mật khẩu không hợp")).toBeVisible();
    await page.waitForTimeout(1000);
    await expect(page.url()).toContain("/auth/login");
});

// Login with blocked account
test("TC03 - Đăng nhập với tài khoản cửa hàng bị block", async ({ page }) => {
    await login(page, "block@gmail.com", "123");
    await page.waitForTimeout(1000);
    await expect(page.url()).toContain("/auth/blocked");
});

// Login with pending account
test("TC04 - Đăng nhập với tài khoản cửa hàng đang chờ duyệt", async ({ page }) => {
    await login(page, "pending@gmail.com", "123");
    await page.waitForTimeout(1000);
    await expect(page.url()).toContain("/auth/verification-pending");
});

// Login as staff but access owner-only page
test("TC05 - Đăng nhập với vai trò staff nhưng cố truy cập các trang vai trò cao hơn", async ({ page }) => {
    await login(page, "tom@gmail.com", "123");
    await page.waitForTimeout(1000);
    await page.goto("http://localhost:3000/staff"); // Or use navigation as needed
    await page.waitForTimeout(1000);
    await expect(
        page.getByRole("heading", { name: "Truy cập bị từ chối" })
    ).toBeVisible();
});

// Login as owner and access all pages
test("TC06 - Đăng nhập với vai trò là owner và có thể truy cập các trang", async ({ page }) => {
    await login(page, "buianh120403@gmail.com", "123");
    await page.waitForTimeout(1000);
    await page.goto("http://localhost:3000/staff");
    await page.waitForTimeout(1000);
    await expect(
        page.getByRole("heading", { name: "Quản lý nhân viên" })
    ).toBeVisible();
});

