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
