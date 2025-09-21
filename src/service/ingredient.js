import axios from "../libs/axiosInstance";

export const createIngredient = async ({ name, unit, description, category, reorderLevel, storeId }) => {
  try {
    let data = { name, unit, description, category, reorderLevel, storeId };
    const res = await axios.post(`/ingredient/`, data);
    return res.data;
  } catch (error) {
    console.error(error);
    return error.response?.data || { message: "Unknown error occurred" };
  }
};

export const getIngredientsByStore = async (storeId) => {
  try {
    const res = await axios.get(`/ingredient/store/${storeId}`);
    return res.data;
  } catch (error) {
    console.error(error);
    return error.response?.data || { message: "Unknown error occurred" };
  }
};

export const getIngredientsByCategory = async ({ categoryId, storeId }) => {
  try {
    const res = await axios.get(`/ingredient/${categoryId}/${storeId}`);
    return res.data;
  } catch (error) {
    console.error(error);
    return error.response?.data || { message: "Unknown error occurred" };
  }
};

export const getIngredientById = async (id) => {
  try {
    const res = await axios.get(`/ingredient/${id}`);
    return res.data;
  } catch (error) {
    console.error(error);
    return error.response?.data || { message: "Unknown error occurred" };
  }
};

export const updateIngredient = async ({ id, name, unit, description, category, reorderLevel }) => {
  try {
    let data = { name, unit, description, category, reorderLevel };
    const res = await axios.put(`/ingredient/${id}`, data);
    return res.data;
  } catch (error) {
    console.error(error);
    return error.response?.data || { message: "Unknown error occurred" };
  }
};

export const deleteIngredient = async (id) => {
  try {
    const res = await axios.delete(`/ingredient/${id}`);
    return res.data;
  } catch (error) {
    console.error(error);
    return error.response?.data || { message: "Unknown error occurred" };
  }
};
