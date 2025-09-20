import axios from "../libs/axiosInstance";

export const getDishCategories = async (storeId) => {
  try {
    const response = await axios.get(`/dish-category/store/${storeId}`);
    return response.data;
  } catch (error) {
    console.error("Get categories error:", error);
    return error.response?.data || { message: "Unknown error occurred" };
  }
};

export const getCategoryById = async (categoryId) => {
  try {
    const response = await axios.get(`/dish-category/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error("Get categories error:", error);
    return error.response?.data || { message: "Unknown error occurred" };
  }
};

export const createDishCategory = async ({ storeId, data }) => {
  try {
    const response = await axios.post(`/dish-category/store/${storeId}`, data);
    return response.data;
  } catch (error) {
    console.error("Create category error:", error);
    return error.response?.data || { message: "Unknown error occurred" };
  }
};

export const updateDishCategory = async ({ id, data }) => {
  try {
    const response = await axios.put(`/dish-category/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Update category error:", error);
    return error.response?.data || { message: "Unknown error occurred" };
  }
};

export const deleteDishCategory = async (categoryId) => {
  try {
    const response = await axios.delete(`/dish-category/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error("Delete category error:", error);
    return error.response?.data || { message: "Unknown error occurred" };
  }
};
