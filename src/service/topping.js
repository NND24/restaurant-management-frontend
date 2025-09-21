import axios from "../libs/axiosInstance";

/**
 * ========================
 * ToppingGroup
 * ========================
 */

export const getStoreToppingGroups = async (storeId) => {
  try {
    const res = await axios.get(`/topping/topping-group/store/${storeId}`);
    return res.data;
  } catch (error) {
    return error.response?.data || { message: "Unknown error occurred" };
  }
};

export const getActiveStoreToppingGroups = async (storeId) => {
  try {
    const res = await axios.get(`/topping/topping-group/store/${storeId}/active`);
    return res.data;
  } catch (error) {
    return error.response?.data || { message: "Unknown error occurred" };
  }
};

export const getToppingGroupById = async (groupId) => {
  try {
    const res = await axios.get(`/topping/topping-group/${groupId}`);
    return res.data;
  } catch (error) {
    return error.response?.data || { message: "Unknown error occurred" };
  }
};

export const createToppingGroup = async ({ storeId, data }) => {
  try {
    const res = await axios.post(`/topping/topping-group/${storeId}`, data);
    return res.data;
  } catch (error) {
    return error.response?.data || { message: "Unknown error occurred" };
  }
};

export const addToppingsToGroup = async ({ groupId, data }) => {
  try {
    const res = await axios.post(`/topping/topping-group/${groupId}/toppings`, data);
    return res.data;
  } catch (error) {
    return error.response?.data || { message: "Unknown error occurred" };
  }
};

export const updateToppingGroup = async ({ groupId, data }) => {
  try {
    const res = await axios.put(`/topping/topping-group/${groupId}`, data);
    return res.data;
  } catch (error) {
    return error.response?.data || { message: "Unknown error occurred" };
  }
};

export const toggleActiveToppingGroup = async (groupId) => {
  try {
    const res = await axios.put(`/topping/topping-group/${groupId}/toggle-active`);
    return res.data;
  } catch (error) {
    console.error("Error updating topping:", error);
    return error.response?.data || { message: "Unknown error occurred" };
  }
};

export const deleteToppingGroup = async (groupId) => {
  try {
    const res = await axios.delete(`/topping/topping-group/${groupId}`);
    return res.data;
  } catch (error) {
    console.error("Error removing topping:", error);
    return error.response?.data || { message: "Unknown error occurred" };
  }
};

/**
 * ========================
 * Topping
 * ========================
 */

export const getStoreToppings = async (storeId) => {
  try {
    const res = await axios.get(`/topping/store/${storeId}`);
    return res.data;
  } catch (error) {
    return error.response?.data || { message: "Unknown error occurred" };
  }
};

export const getToppingById = async (toppingId) => {
  try {
    const res = await axios.get(`/topping/${toppingId}`);
    return res.data;
  } catch (error) {
    return error.response?.data || { message: "Unknown error occurred" };
  }
};

export const createTopping = async ({ storeId, data }) => {
  try {
    const res = await axios.post(`/topping/${storeId}`, data);
    return res.data;
  } catch (error) {
    return error.response?.data || { message: "Unknown error occurred" };
  }
};

export const updateTopping = async ({ toppingId, data }) => {
  try {
    const res = await axios.put(`/topping/${toppingId}`, data);
    return res.data;
  } catch (error) {
    return error.response?.data || { message: "Unknown error occurred" };
  }
};

export const toggleActiveTopping = async (toppingId) => {
  try {
    const res = await axios.put(`/topping/${toppingId}/toggle-active`);
    return res.data;
  } catch (error) {
    console.error("Error updating topping:", error);
    return error.response?.data || { message: "Unknown error occurred" };
  }
};

export const deleteTopping = async (toppingId) => {
  try {
    const res = await axios.delete(`/topping/${toppingId}`);
    return res.data;
  } catch (error) {
    console.error("Error removing topping:", error);
    return error.response?.data || { message: "Unknown error occurred" };
  }
};
