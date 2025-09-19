import axios from "../libs/axiosInstance";

export const createWaste = async ({ ingredientBatch, quantity, reason, otherReason, staff }) => {
  try {
    let data = { ingredientBatch, quantity, reason, otherReason, staff };
    const res = await axios.post(`/waste/`, data);
    return res.data;
  } catch (error) {
    console.error(error);
    return error.response?.data || { message: "Unknown error occurred" };
  }
};

export const getWasteList = async ({ storeId, from, to, reason, staff }) => {
  try {
    let data = { from, to, reason, staff };
    const res = await axios.get(`/waste/store/${storeId}`, data);
    return res.data;
  } catch (error) {
    console.error(error);
    return error.response?.data || { message: "Unknown error occurred" };
  }
};

export const getWasteById = async (id) => {
  try {
    const res = await axios.get(`/waste/${id}`);
    return res.data;
  } catch (error) {
    console.error(error);
    return error.response?.data || { message: "Unknown error occurred" };
  }
};

export const deleteWaste = async ({ id }) => {
  try {
    const res = await axios.delete(`/waste/${id}`);
    return res.data;
  } catch (error) {
    console.error(error);
    return error.response?.data || { message: "Unknown error occurred" };
  }
};
