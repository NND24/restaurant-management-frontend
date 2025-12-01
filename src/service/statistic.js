import axios from "../libs/axiosInstance";

// Revenue
export const getRevenueSummary = async () => {
  try {
    const res = await axios.get("/statistics/revenue/summary");
    return res.data;
  } catch (error) {
    console.error("Get revenue summary error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const revenueByPeriod = async (params) => {
  try {
    const res = await axios.get("/statistics/revenue/by-period", {
      params,
    });
    return res.data;
  } catch (error) {
    console.error("Get revenue by period error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const getRevenueByItem = async (params = {}) => {
  try {
    const res = await axios.get("/statistics/revenue/by-item", { params });
    return res.data;
  } catch (error) {
    console.error("❌ Get revenue by item error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const getRevenueByDishGroup = async (params = {}) => {
  try {
    const res = await axios.get("/statistics/revenue/by-dish-group", { params });
    return res.data;
  } catch (error) {
    console.error("❌ Get revenue by dish group error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const analyzeBusinessResult = async (params) => {
  try {
    const res = await axios.get("/statistics/revenue/analyze-business", {
      params,
    });
    return res.data;
  } catch (error) {
    console.error("Get revenue by dish group error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const getRecommendedDishes = async () => {
  try {
    const res = await axios.get("/statistics/recommend-dish");
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const getRecommendedDishesByCategory = async () => {
  try {
    const res = await axios.get("/statistics/recommend-dish-category");
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const improveVietnameseDescription = async (caption) => {
  try {
    const res = await axios.post("/statistics/improve-description", caption);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

// Orders
export const getOrderStatusRate = async () => {
  try {
    const res = await axios.get("/statistics/order/status-rate");
    return res.data;
  } catch (error) {
    console.error("Get order status rate error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const getOrderSummaryStats = async () => {
  try {
    const res = await axios.get("/statistics/order/summary");
    return res.data;
  } catch (error) {
    console.error("Get order summary stats error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const getOrdersOverTime = async (from, to) => {
  try {
    const res = await axios.get("/statistics/order/over-time", {
      params: { from, to },
    });
    return res.data;
  } catch (error) {
    console.error("Get orders over time error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const getOrderStatusDistribution = async (from, to) => {
  try {
    const res = await axios.get("/statistics/order/status-distribution", {
      params: { from, to },
    });
    return res.data;
  } catch (error) {
    console.error("Get order status distribution error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const getOrdersByTimeSlot = async (limit) => {
  try {
    const res = await axios.get("/statistics/orders/by-time-slot");
    return res.data;
  } catch (error) {
    console.error("Get orders by time slot error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

// Items
export const getTopSellingItems = async (limit) => {
  try {
    const res = await axios.get("/statistics/top-selling-items", {
      params: { limit },
    });
    return res.data;
  } catch (error) {
    console.error("Get top selling items error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const getRevenueContributionByItem = async (limit) => {
  try {
    const res = await axios.get("/statistics/items/revenue-contribution", {
      params: { limit },
    });
    return res.data;
  } catch (error) {
    console.error("Get revenue contribution by item error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

// Customers
export const getNewCustomers = async () => {
  try {
    const res = await axios.get("/statistics/customers/new");
    return res.data;
  } catch (error) {
    console.error("Get new customers error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const getReturningCustomerRate = async () => {
  try {
    const res = await axios.get("/statistics/customers/returning-rate");
    return res.data;
  } catch (error) {
    console.error("Get returning customer rate error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const getAverageSpendingPerOrder = async () => {
  try {
    const res = await axios.get("/statistics/customers/average-spending");
    return res.data;
  } catch (error) {
    console.error("Get average spending per order error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const getVoucherUsageSummary = async (from, to) => {
  try {
    const res = await axios.get("/statistics/vouchers/usage-summary", {
      params: { from, to },
    });
    return res.data;
  } catch (error) {
    console.error("Get voucher usage summary error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const getTopUsedVouchers = async (limit, from, to) => {
  try {
    const res = await axios.get("/statistics/vouchers/top-used", {
      params: { limit, from, to },
    });
    return res.data;
  } catch (error) {
    console.error("Get top used vouchers error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};

export const getVoucherRevenueImpact = async (from, to) => {
  try {
    const res = await axios.get("/statistics/vouchers/revenue-impact", {
      params: { from, to },
    });
    return res.data;
  } catch (error) {
    console.error("Get voucher revenue impact error:", error);
    throw error.response?.data || { message: "Unknown error occurred" };
  }
};
