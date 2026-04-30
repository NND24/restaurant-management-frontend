import axios from "../libs/axiosInstance";

export const getAllAccounts = async () => {
  try {
    const res = await axios.get("/admin/accounts");
    return res.data;
  } catch (error) {
    console.error("Error fetching accounts:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const createAccount = async (data) => {
  try {
    const res = await axios.post("/admin/accounts", data);
    return res.data;
  } catch (error) {
    console.error("Error creating account:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const updateAccount = async (id, data) => {
  try {
    const res = await axios.put(`/admin/accounts/${id}`, data);
    return res.data;
  } catch (error) {
    console.error("Error updating account:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};
