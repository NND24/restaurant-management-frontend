import axios from "../libs/axiosInstance";
export const getAllVoucher = async (storeId) => {
  try {
    const res = await axios.get(`/voucher/stores/${storeId}/vouchers`);
    return res.data;
  } catch (error) {
    console.error("Get all voucher error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};
export const getVoucherById = async (storeId, voucherId) => {
  try {
    const res = await axios.get(`/voucher/stores/${storeId}/vouchers/${voucherId}`);
    return res.data;
  } catch (error) {
    console.error("Get all voucher error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};
export const addVoucher = async (storeId, voucherData) => {
  try {
    const res = await axios.post(`/voucher/stores/${storeId}/vouchers`, voucherData);
    return res.data;
  } catch (error) {
    console.error("Add voucher error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};
export const updateVoucher = async (storeId, voucherId, data) => {
  try {
    const res = await axios.put(`/voucher/stores/${storeId}/vouchers/${voucherId}`, data);
    return res.data;
  } catch (error) {
    console.error("Update voucher error:", error);
    throw error.response?.data || { message: "Cập nhật voucher thất bại" };
  }
};

export const deleteVoucher = async (storeId, voucherId) => {
  try {
    const res = await axios.delete(`/voucher/stores/${storeId}/vouchers/${voucherId}`);
    return res.data;
  } catch (error) {
    console.error("Delete voucher error:", error);
    throw error.response?.data || { message: "Xóa voucher thất bại" };
  }
};
export const toggleVoucherActive = async (storeId, voucherId) => {
  try {
    const res = await axios.patch(`/voucher/stores/${storeId}/vouchers/${voucherId}/toggle-active`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { status: "error", message: "Toggle failed" };
  }
};
