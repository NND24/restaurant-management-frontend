import axios from "../libs/axiosInstance";

export const getAllSystemCategories = async () => {
  try {
    const response = await axios.get(`/system-category`);
    console.log("System category: ", response);
    return response.data.data;
  } catch (error) {
    console.error("Lỗi khi gọi API getAllSystemCategories:", error);
    throw error;
  }
};
