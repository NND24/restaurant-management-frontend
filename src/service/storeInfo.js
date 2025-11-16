import axios from "../libs/axiosInstance";
export const getInformation = async () => {
  try {
    const res = await axios.get(`/store`);
    return res.data;
  } catch (error) {
    console.error("Get all information error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};
export const toggleOpenStatus = async () => {
  try {
    const res = await axios.patch(`/store/open-status`);
    return res.data;
  } catch (error) {
    console.error("Change status error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};
export const updateHours = async (data) => {
  try {
    const res = await axios.patch(`/store/hours`, data);
    return res.data;
  } catch (error) {
    console.error("Change status error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};
export const upadteInfo = async (data) => {
  try {
    const res = await axios.patch(`/store/info`, data);
    return res.data;
  } catch (error) {
    console.error("Change info error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};
export const updateImages = async (data) => {
  try {
    const res = await axios.patch(`/store/images`, data);
    return res.data;
  } catch (error) {
    console.error("Change image error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};
export const updateAddress = async (data) => {
  try {
    const res = await axios.patch(`/store/address`, data);
    return res.data;
  } catch (error) {
    console.error("Change address error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};
export const updatePaperwork = async (data) => {
  try {
    const res = await axios.patch(`/store/paperwork`, data);
    return res.data;
  } catch (error) {
    console.error("Change paperwork error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};
