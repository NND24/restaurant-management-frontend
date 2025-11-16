import axios from "../libs/axiosInstance";
export const getAllShippingFee = async (storeId) => {
  try {
    const res = await axios.get(`/shipping-fee/stores/${storeId}`);
    return res.data;
  } catch (error) {
    console.error("Get all shipping fee error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};
export const addShipingFee = async (storeId, shippingFeeData) => {
  try {
    const res = await axios.post(`/shipping-fee/stores/${storeId}`, shippingFeeData);
    return res.data;
  } catch (error) {
    console.error("Add shipping fee error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};
export const updateShippingFee = async (storeId, shippingFeeId, data) => {
  try {
    const res = await axios.put(`/shipping-fee/stores/${storeId}/${shippingFeeId}`, data);
    return res.data;
  } catch (error) {
    console.error("Update shipping fee error:", error);
    throw error.response?.data || { message: "Cập nhật shipping fee thất bại" };
  }
};

export const deleteShippingFee = async (storeId, shippingFeeId) => {
  try {
    const res = await axios.delete(`/shipping-fee/stores/${storeId}/${shippingFeeId}`);
    return res.data;
  } catch (error) {
    console.error("Delete shipping fee error:", error);
    throw error.response?.data || { message: "Xóa shipping fee thất bại" };
  }
};
