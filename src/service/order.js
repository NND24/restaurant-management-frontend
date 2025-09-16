import axios from "../libs/axiosInstance";

export const getAllOrders = async ({ storeId, status, limit, page }) => {
  try {
    const params = new URLSearchParams();
    if (Array.isArray(status)) {
      params.append("status", status.join(","));
    } else if (status) {
      params.append("status", status);
    }
    if (limit) params.append("limit", limit);
    if (page) params.append("page", page);

    const res = await axios.get(`/order/store/${storeId}?${params.toString()}`);
    return res.data;
  } catch (error) {
    console.error("Get all orders error:", error);
    return error.response?.data || { message: "Unknown error occurred" };
  }
};

export const getOrder = async ({ orderId }) => {
  try {
    const res = await axios.get(`/order/${orderId}`);
    return res.data;
  } catch (error) {
    console.error("Get order error:", error);
    return error.response?.data || { message: "Unknown error occurred" };
  }
};

export const updateOrder = async ({ orderId, updatedData }) => {
  try {
    const res = await axios.put(`/order/${orderId}`, updatedData);
    return res.data;
  } catch (error) {
    console.error("Update order error:", error);
    return error.response?.data || { message: "Unknown error occurred" };
  }
};
