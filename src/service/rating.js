import axios from "../libs/axiosInstance";

// Get all ratings for the store (with optional filters)
export const getStoreRatings = async ({ page = 1, limit = 10, replied, sort = "-createdAt" }) => {
  try {
    const params = { page, limit, sort };
    if (replied !== undefined) params.replied = replied;

    const res = await axios.get("/rating", { params });
    return res.data;
  } catch (error) {
    console.error("Get store ratings error:", error);
    return error.response?.data || { message: "Unknown error occurred" };
  }
};

// Reply or update reply to a specific rating
export const replyToRating = async (ratingId, storeReply) => {
  try {
    const res = await axios.patch(`/rating/${ratingId}/reply`, { storeReply });
    return res.data;
  } catch (error) {
    console.error("Reply to rating error:", error);
    return error.response?.data || { message: "Unknown error occurred" };
  }
};
