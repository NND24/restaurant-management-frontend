import axios from "../libs/axiosInstance";

export const createBatch = async (payload) => {
  try {
    const res = await axios.post(`/ingredient-batch/`, payload);
    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const getBatchesByStore = async (storeId) => {
  try {
    const res = await axios.get(`/ingredient-batch/store/${storeId}`);
    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const getBatchesByIngredient = async (id) => {
  try {
    const res = await axios.get(`/ingredient-batch/ingredient/${id}`);
    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const getBatchById = async (id) => {
  try {
    const res = await axios.get(`/ingredient-batch/${id}`);
    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const updateBatch = async ({ id, data }) => {
  try {
    const res = await axios.put(`/ingredient-batch/${id}`, data);
    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const deleteBatch = async (id) => {
  try {
    const res = await axios.delete(`/ingredient-batch/${id}`);
    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};
