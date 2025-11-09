import axios from "../libs/axiosInstance";

export const createUnit = async ({ name, type, isActive, storeId }) => {
  try {
    let data = { name, type, storeId, isActive };
    const res = await axios.post(`/unit/`, data);
    return res.data;
  } catch (error) {
    console.error(error);
    return error.response?.data || { message: "Unknown error occurred" };
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
    return error.response?.data || { message: "Unknown error occurred" };
  }
};

export const getUnitById = async (id) => {
  try {
    const res = await axios.get(`/unit/${id}`);
    return res.data;
  } catch (error) {
    console.error(error);
    return error.response?.data || { message: "Unknown error occurred" };
  }
};

export const updateUnit = async ({ id, data }) => {
  try {
    const res = await axios.put(`/unit/${id}`, data);
    return res.data;
  } catch (error) {
    console.error(error);
    return error.response?.data || { message: "Unknown error occurred" };
  }
};

export const deleteUnit = async (id) => {
  try {
    const res = await axios.delete(`/unit/${id}`);
    return res.data;
  } catch (error) {
    console.error(error);
    return error.response?.data || { message: "Unknown error occurred" };
  }
};
