// tests/apiClient.js
import { request, expect } from "@playwright/test";

const API_BASE = process.env.API_BASE_URL || "http://localhost:5000";
const LOGIN_ENDPOINT = process.env.API_LOGIN_ENDPOINT || "/api/v1/auth/login";
// ^^^ TODO: change to your real login endpoint path, e.g. '/auth/login' or '/auth/sign-in'

/**
 * Log in with client credentials and return { token, api }.
 * If your login returns a different JSON shape, adjust token extraction.
 */
export async function loginAndGetToken(email, password) {
  const api = await request.newContext({ baseURL: API_BASE });
  const res = await api.post(LOGIN_ENDPOINT, {
    data: { email, password },
  });
  expect(res.status() == 200).toBeTruthy();

  const body = await res.json();
  // adjust these lines to your API response fields
  const token = body?.token || body?.data?.accessToken || body?.accessToken;
  if (!token) throw new Error("Login did not return a token. Check API response/LOGIN_ENDPOINT.");
  return { token, api };
}

/**
 * Create/update cart with one line item.
 */
export async function updateCart(apiOrToken, payload) {
  const { api, token } = await ensureContext(apiOrToken);

  const res = await api.post("/api/v1/cart/update", {
    headers: { Authorization: `Bearer ${token}` },
    data: payload,
  });
  expect(res.status() == 200).toBeTruthy();

  return res.json(); // cart state
}

/**
 * Complete the cart (creates an order). Returns { orderId, ... } from API.
 */
export async function completeCart(apiOrToken, payload) {
  const { api, token } = await ensureContext(apiOrToken);

  const res = await api.post("/api/v1/cart/complete", {
    headers: { Authorization: `Bearer ${token}` },
    data: payload,
  });
  expect(res.status() == 201).toBeTruthy();

  return res.json(); // should include order info
}

/**
 * One-shot convenience: login → updateCart → completeCart.
 * Returns { orderId, cart, complete } for assertions.
 */
export async function createPendingOrder({
  email,
  password,
  storeId,
  dishId,
  quantity = 1,
  toppings = [],
  note = "",
  paymentMethod = "cash",
  deliveryAddress = "SYSTEM TEST ADDRESS",
  customerName = "SYSTEM TESTER",
  customerPhonenumber = "0123456789",
  detailAddress = "",
  location = [109.1764224, 12.2585088],
  vouchers = [],
}) {
  const { token, api } = await loginAndGetToken(email, password);

  const cart = await updateCart(
    { token, api },
    {
      storeId,
      dishId,
      quantity,
      toppings,
      note,
    }
  );

  const complete = await completeCart(
    { token, api },
    {
      storeId,
      paymentMethod,
      deliveryAddress,
      customerName,
      customerPhonenumber,
      detailAddress,
      note,
      location,
      vouchers,
    }
  );

  // Guess the order id path—adjust to your API response!
  const orderId = complete?.orderId || complete?.data?.orderId || complete?.order?._id || complete?._id;

  if (!orderId) {
    console.warn("completeCart response:", complete);
    throw new Error("Could not find orderId in completeCart response—adjust parsing.");
  }

  return { token, api, cart, complete, orderId };
}

/** Optional helper for deleting an order later (fill in your endpoint when ready). */
export async function deleteOrder(apiOrToken, orderId) {
  const { api, token } = await ensureContext(apiOrToken);
  // Replace endpoint with your real one when you have it.
  const res = await api.delete(`/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(res.ok()).toBeTruthy();
  return res.json();
}

// ---------- internal ----------
async function ensureContext(apiOrToken) {
  if (typeof apiOrToken === "string") {
    const api = await request.newContext({ baseURL: API_BASE });
    return { api, token: apiOrToken };
  }
  if (apiOrToken?.token && apiOrToken?.api) {
    return apiOrToken;
  }
  throw new Error("Pass a token string or an object { token, api }.");
}

export async function getOrderById(apiOrToken, orderId) {
  const { api, token } = await ensureContext(apiOrToken);
  const res = await api.get(`/api/v1/order/${orderId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(res.status() == 200).toBeTruthy();
  return res.json(); // { _id, items, user, status, ... }
}

export async function findItemToEdit(order) {
  if (!order?.items?.length) throw new Error("Order has no items to edit.");
  // Prefer a known dish if present, else first item.
  return order.items.find((it) => (it.dish?.name || it.dishName || "").includes("Value Burger Tôm")) || order.items[0];
}
