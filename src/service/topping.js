import axios from "../libs/axiosInstance";

export const getAllTopping = async ({ storeId, limit, page }) => {
  try {
    const params = new URLSearchParams();
    if (limit) params.append("limit", limit);
    if (page) params.append("page", page);

    const res = await axios.get(`/topping/store/${storeId}?${params.toString()}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching toppings:", error);
    return error.response?.data || { message: "Unknown error occurred" };
  }
};

export const getTopping = async ({ groupId }) => {
  try {
    const res = await axios.get(`/topping/topping-group/${groupId}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching topping group:", error);
    return error.response?.data || { message: "Unknown error occurred" };
  }
};

export const addToppingToGroup = async ({ groupId, name, price }) => {
  try {
    const res = await axios.post(`/topping/topping-group/${groupId}/topping`, { name, price });
    return res.data;
  } catch (error) {
    console.error("Error adding topping:", error);
    return error.response?.data || { message: "Unknown error occurred" };
  }
};

export const addToppingGroupOnly = async ({ storeId, name }) => {
  try {
    const res = await axios.post(`/topping/store/${storeId}/topping-group`, { name });
    return res.data;
  } catch (error) {
    console.error("Error creating topping group:", error);
    return error.response?.data || { message: "Unknown error occurred" };
  }
};

export const removeToppingFromGroup = async ({ groupId, toppingId }) => {
  try {
    const res = await axios.delete(`/topping/topping-group/${groupId}/topping/${toppingId}`);
    return res.data;
  } catch (error) {
    console.error("Error removing topping:", error);
    return error.response?.data || { message: "Unknown error occurred" };
  }
};

export const updateTopping = async ({ groupId, toppingId, name, price }) => {
  try {
    const res = await axios.put(`/topping/topping-group/${groupId}/topping/${toppingId}`, {
      name,
      price,
    });
    return res.data;
  } catch (error) {
    console.error("Error updating topping:", error);
    return error.response?.data || { message: "Unknown error occurred" };
  }
};

export const removeToppingGroup = async ({ groupId }) => {
  try {
    const res = await axios.delete(`/topping/topping-group/${groupId}`);
    return res.data;
  } catch (error) {
    console.error("Error removing topping:", error);
    return error.response?.data || { message: "Unknown error occurred" };
  }
};
