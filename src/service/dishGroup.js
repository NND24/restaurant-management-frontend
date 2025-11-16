import axios from "../libs/axiosInstance";

export const getStoreDishGroups = async (storeId, activeOnly = false, dishActiveOnly = false) => {
  try {
    const response = await axios.get(`/dish-group/store/${storeId}`, {
      params: { activeOnly, dishActiveOnly },
    });
    return response.data;
  } catch (error) {
    console.error("Get categories error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const getDishGroupById = async (dishGroupId) => {
  try {
    const response = await axios.get(`/dish-group/${dishGroupId}`);
    return response.data;
  } catch (error) {
    console.error("Get categories error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const createDishGroup = async ({ storeId, data }) => {
  try {
    const response = await axios.post(`/dish-group/${storeId}`, data);
    return response.data;
  } catch (error) {
    console.error("Create category error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const updateDishGroupById = async ({ dishGroupId, data }) => {
  try {
    const response = await axios.put(`/dish-group/${dishGroupId}`, data);
    return response.data;
  } catch (error) {
    console.error("Update category error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const toggleActiveDishGroup = async (dishGroupId) => {
  try {
    const response = await axios.put(`/dish-group/${dishGroupId}/toggle-active`, data);
    return response.data;
  } catch (error) {
    console.error("Update category error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const deleteDishGroupById = async (dishGroupId) => {
  try {
    const response = await axios.delete(`/dish-group/${dishGroupId}`);
    return response.data;
  } catch (error) {
    console.error("Delete category error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};
