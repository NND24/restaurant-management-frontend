import axios from "../libs/axiosInstance";

export const getAllDish = async (storeId) => {
  try {
    const res = await axios.get(`/dish/store/${storeId}`);
    return res.data;
  } catch (error) {
    console.error("Get all dish error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const getDish = async (dishId) => {
  try {
    const res = await axios.get(`/dish/${dishId}`);
    return res.data;
  } catch (error) {
    console.error("Get dish error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const getToppingFromDish = async (dishId) => {
  try {
    const res = await axios.get(`/topping/dish/${dishId}`);
    return res.data;
  } catch (error) {
    console.error("Get topping from dish error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const updateDish = async ({ dishId, data }) => {
  try {
    const res = await axios.put(`/dish/${dishId}`, data);
    return res.data;
  } catch (error) {
    console.error("Update dish error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const deleteDish = async (dishId) => {
  try {
    const res = await axios.delete(`/dish/${dishId}`);
    return res.data;
  } catch (error) {
    console.error("Update dish error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const createDish = async ({ storeId, data }) => {
  try {
    const res = await axios.post(`/dish/store/${storeId}`, data);
    return res.data;
  } catch (error) {
    console.error("Create dish error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const toggleSaleStatus = async ({ dishId }) => {
  try {
    const res = await axios.post(`/dish/${dishId}/status`);
    return res.data;
  } catch (error) {
    console.error("Toggle sale status error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};
