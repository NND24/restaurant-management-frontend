import axios from "../libs/axiosInstance";

export const uploadImages = async (formData) => {
  try {
    const res = await axios.post("/upload/images", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error) {
    console.error("Upload images error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const uploadRegisterImages = async (formData) => {
  try {
    const res = await axios.post("/upload/register/images", formData);
    return res.data;
  } catch (error) {
    console.error("Upload images error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const uploadAvatar = async (formData) => {
  try {
    const res = await axios.post("/upload/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error) {
    console.error("Upload avatar error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const deleteFile = async ({ filePath }) => {
  try {
    const res = await axios.delete("/upload/delete-file", {
      data: { filePath },
    });
    return res.data;
  } catch (error) {
    console.error("Delete file error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};
