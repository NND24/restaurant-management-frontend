import axios from "../libs/axiosInstance";

export const getStoreInformation = async (storeId) => {
  try {
    const res = await axios.get(`/store/${storeId}`);
    return res.data;
  } catch (error) {
    console.error("Get store information error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const updateStoreInformation = async ({ storeId, updates }) => {
  try {
    const res = await axios.put(`/store/${storeId}`, updates);
    return res.data;
  } catch (error) {
    console.error("Update store information error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const checkStoreName = async (name) => {
  try {
    const res = await axios.get(`/store/check-name/${name}`);
    return res.data;
  } catch (error) {
    console.error("Check store name error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const registerStore = async (storeData) => {
  try {
    const res = await axios.post("/store/register", storeData);
    return res.data;
  } catch (error) {
    console.error("Register store error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};
