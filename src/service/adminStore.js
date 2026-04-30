import axios from "../libs/axiosInstance";

export const getAllAdminStores = async () => {
  try {
    const res = await axios.get("/admin/stores");
    return res.data;
  } catch (error) {
    console.error("Error fetching admin stores:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const getAdminStoreById = async (id) => {
  try {
    const res = await axios.get(`/admin/stores/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching admin store detail:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const approveStore = async (id) => {
  try {
    const res = await axios.put(`/admin/stores/approve/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error approving store:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const suspendStore = async (id) => {
  try {
    const res = await axios.put(`/admin/stores/suspend/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error suspending store:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};
