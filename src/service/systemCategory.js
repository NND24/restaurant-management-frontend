import axios from "../libs/axiosInstance";

export const getAllSystemCategories = async () => {
  try {
    const response = await axios.get(`/system-category`);
    return response.data.data;
  } catch (error) {
    console.error("Lỗi khi gọi API getAllSystemCategories:", error);
    throw error;
  }
};

export const getSystemCategoryByStoreId = async (storeId) => {
  try {
    const response = await axios.get(`/system-category/store/${storeId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gọi API getAllSystemCategories:", error);
    throw error;
  }
};

export const createSystemCategory = async (data) => {
  try {
    const res = await axios.post("/system-category", data);
    return res.data;
  } catch (error) {
    console.error("Error creating system category:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const updateSystemCategory = async (id, data) => {
  try {
    const res = await axios.put(`/system-category/${id}`, data);
    return res.data;
  } catch (error) {
    console.error("Error updating system category:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const deleteSystemCategory = async (id) => {
  try {
    const res = await axios.delete(`/system-category/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error deleting system category:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};
