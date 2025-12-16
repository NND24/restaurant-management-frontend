import axios from "../libs/axiosInstance";

export const createUnit = async (data) => {
  try {
    const res = await axios.post(`/unit/`, data);
    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const getUnits = async (storeId, activeOnly = false) => {
  try {
    const res = await axios.get(`/unit/store/${storeId}`, {
      params: { activeOnly },
    });
    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const getBaseUnits = async (storeId, type) => {
  try {
    const res = await axios.get(`/unit/base/${storeId}`, {
      params: { type },
    });
    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const getUnitsByBaseUnit = async (storeId, baseUnit, activeOnly = false) => {
  try {
    const res = await axios.get(`/unit/by-base/${storeId}`, {
      params: { baseUnit, activeOnly },
    });
    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const getUnitById = async (id) => {
  try {
    const res = await axios.get(`/unit/${id}`);
    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const updateUnit = async ({ id, data }) => {
  try {
    const res = await axios.put(`/unit/${id}`, data);
    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const deleteUnit = async (id, storeId) => {
  try {
    const res = await axios.delete(`/unit/${id}`, { storeId });
    return res.data;
  } catch (error) {
    console.error(error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};
