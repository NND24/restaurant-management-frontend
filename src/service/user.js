import axios from "../libs/axiosInstance";

export const getCurrentUser = async (userId) => {
  try {
    const res = await axios.get(`/user/${userId}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching current user:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const updateUser = async (userData) => {
  try {
    const res = await axios.put(`/user/`, userData);
    return res.data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};
