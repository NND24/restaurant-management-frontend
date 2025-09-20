import axios from "../libs/axiosInstance";

export const createIngredientCategory = async ({ name, storeId, description }) => {
  try {
    let data = { name, storeId, description };
    const res = await axios.post(`/ingredient-category/`, data);
    return res.data;
  } catch (error) {
    console.error(error);
    return error.response?.data || { message: "Unknown error occurred" };
  }
};

export const getIngredientCategoriesByStore = async (storeId) => {
  try {
    const res = await axios.get(`/ingredient-category/store/${storeId}`);
    return res.data;
  } catch (error) {
    console.error(error);
    return error.response?.data || { message: "Unknown error occurred" };
  }
};

export const getIngredientCategoryById = async (id) => {
  try {
    const res = await axios.get(`/ingredient-category/${id}`);
    return res.data;
  } catch (error) {
    console.error(error);
    return error.response?.data || { message: "Unknown error occurred" };
  }
};

export const updateIngredientCategory = async ({ id, data }) => {
  try {
    console.log(id);
    const res = await axios.put(`/ingredient-category/${id}`, data);
    return res.data;
  } catch (error) {
    console.error(error);
    return error.response?.data || { message: "Unknown error occurred" };
  }
};

export const deleteIngredientCategory = async (id) => {
  try {
    const res = await axios.delete(`/ingredient-category/${id}`);
    return res.data;
  } catch (error) {
    console.error(error);
    return error.response?.data || { message: "Unknown error occurred" };
  }
};
