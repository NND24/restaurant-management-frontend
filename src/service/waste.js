import axios from "../libs/axiosInstance";

export const createWaste = async ({ data }) => {
  try {
    const res = await axios.post(`/waste/`, data);
    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const getWasteList = async (storeId) => {
  try {
    const res = await axios.get(`/waste/store/${storeId}`);
    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const getWasteById = async (id) => {
  try {
    const res = await axios.get(`/waste/${id}`);
    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const updateWaste = async ({ id, data }) => {
  try {
    const res = await axios.put(`/waste/${id}`, data);
    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const deleteWaste = async (id) => {
  try {
    const res = await axios.delete(`/waste/${id}`);
    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};
