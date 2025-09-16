import axios from "../libs/axiosInstance";

export const getAllNotifications = async () => {
  try {
    const res = await axios.get("/notification/get-all-notifications");
    return res.data;
  } catch (error) {
    console.error("Get all notifications error:", error);
    return error.response?.data || { message: "Unknown error occurred" };
  }
};

export const updateNotificationStatus = async (notificationId) => {
  try {
    const res = await axios.put(`/notification/update-notification/${notificationId}`);
    return res.data;
  } catch (error) {
    console.error("Update notification status error:", error);
    return error.response?.data || { message: "Unknown error occurred" };
  }
};
