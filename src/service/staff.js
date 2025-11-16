import axios from "../libs/axiosInstance";
export const getAllStaff = async (storeId) => {
  try {
    const res = await axios.get(`/staff/stores/${storeId}`);

    return res.data;
  } catch (error) {
    console.error("Get all staff error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const getStaff = async ({ staffId }) => {
  try {
    const res = await axios.get(`/staff/${staffId}`);
    return res.data;
  } catch (error) {
    console.error("Get staff error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const createStaff = async ({ storeId, staffData }) => {
  try {
    const res = await axios.post(`/staff/stores/${storeId}`, staffData);
    return res.data;
  } catch (error) {
    console.error("Create staff error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const updateStaff = async ({ userId, staffData }) => {
  try {
    const res = await axios.put(`/staff/${userId}`, staffData);
    return res.data;
  } catch (error) {
    console.error("Update staff error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const deleteStaff = async ({ storeId, userId }) => {
  try {
    const res = await axios.delete(`/staff/stores/${storeId}/${userId}`);
    return res.data;
  } catch (error) {
    console.error("Delete staff error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};
