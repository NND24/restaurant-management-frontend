import axios from "../libs/axiosInstance";

// Revenue
export const getRevenueSummary = async () => {
  try {
    const res = await axios.get("/statistics/revenue/summary");
    return res.data;
  } catch (error) {
    console.error("Get revenue summary error:", error);
    return error.response?.data || { message: "Unknown error occurred" };
  }
};

export const revenueByPeriod = async ({ period, month, year }) => {
  try {
    const res = await axios.get("/statistics/revenue/by-period", {
      params: { period, month, year },
    });
    return res.data;
  } catch (error) {
    console.error("Get revenue by period error:", error);
    return error.response?.data || { message: "Unknown error occurred" };
  }
};

export const getRevenueByItem = async ({ limit = 5, period = "day", month, year }) => {
  try {
    const res = await axios.get("/statistics/revenue/by-item", {
      params: { limit, period, month, year },
    });
    return res.data;
  } catch (error) {
    console.error("Get revenue by item error:", error);
    return error.response?.data || { message: "Unknown error occurred" };
  }
};

export const getRevenueByDishGroup = async ({ limit = 5, period = "day", month, year }) => {
  try {
    const res = await axios.get("/statistics/revenue/by-dish-group", {
      params: { period, month, year },
    });
    return res.data;
  } catch (error) {
    console.error("Get revenue by dish group error:", error);
    return error.response?.data || { message: "Unknown error occurred" };
  }
};

export const analyzeBusinessResult = async ({ period = "day", month, year }) => {
  try {
    const res = await axios.get("/statistics/revenue/analyze-business", {
      params: { period, month, year },
    });
    return res.data;
  } catch (error) {
    console.error("Get revenue by dish group error:", error);
    return error.response?.data || { message: "Unknown error occurred" };
  }
};

// Orders
export const getOrderStatusRate = async () => {
  try {
    const res = await axios.get("/statistics/order/status-rate");
    return res.data;
  } catch (error) {
    console.error("Get order status rate error:", error);
    return error.response?.data || { message: "Unknown error occurred" };
  }
};

export const getOrderSummaryStats = async () => {
  try {
    const res = await axios.get("/statistics/order/summary");
    return res.data;
  } catch (error) {
    console.error("Get order summary stats error:", error);
    return error.response?.data || { message: "Unknown error occurred" };
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
    return error.response?.data || { message: "Unknown error occurred" };
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
    return error.response?.data || { message: "Unknown error occurred" };
  }
};

export const getOrdersByTimeSlot = async (limit) => {
  try {
    const res = await axios.get("/statistics/orders/by-time-slot");
    return res.data;
  } catch (error) {
    console.error("Get orders by time slot error:", error);
    return error.response?.data || { message: "Unknown error occurred" };
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
    return error.response?.data || { message: "Unknown error occurred" };
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
    return error.response?.data || { message: "Unknown error occurred" };
  }
};

// Customers
export const getNewCustomers = async () => {
  try {
    const res = await axios.get("/statistics/customers/new");
    return res.data;
  } catch (error) {
    console.error("Get new customers error:", error);
    return error.response?.data || { message: "Unknown error occurred" };
  }
};

export const getReturningCustomerRate = async () => {
  try {
    const res = await axios.get("/statistics/customers/returning-rate");
    return res.data;
  } catch (error) {
    console.error("Get returning customer rate error:", error);
    return error.response?.data || { message: "Unknown error occurred" };
  }
};

export const getAverageSpendingPerOrder = async () => {
  try {
    const res = await axios.get("/statistics/customers/average-spending");
    return res.data;
  } catch (error) {
    console.error("Get average spending per order error:", error);
    return error.response?.data || { message: "Unknown error occurred" };
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
    return error.response?.data || { message: "Unknown error occurred" };
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
    return error.response?.data || { message: "Unknown error occurred" };
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
    return error.response?.data || { message: "Unknown error occurred" };
  }
};
