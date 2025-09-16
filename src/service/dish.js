import axios from "../libs/axiosInstance";

export const getAllDish = async (storeId, name) => {
    try {
        const params = {};
        if (name) params.name = name;
        const res = await axios.get(`/dish/store/${storeId}`, { params });
        return res.data;
    } catch (error) {
        console.error("Get all dish error:", error);
        return error.response?.data || { message: "Unknown error occurred" };
    }
};

export const getDish = async (dishId) => {
    try {
        const res = await axios.get(`/dish/${dishId}`);
        return res.data;
    } catch (error) {
        console.error("Get dish error:", error);
        return error.response?.data || { message: "Unknown error occurred" };
    }
};

export const getToppingFromDish = async (dishId) => {
    try {
        const res = await axios.get(`/topping/dish/${dishId}`);
        return res.data;
    } catch (error) {
        console.error("Get topping from dish error:", error);
        return error.response?.data || { message: "Unknown error occurred" };
    }
};

export const updateDish = async ({ dishId, updatedData }) => {
    try {
        const res = await axios.put(`/dish/${dishId}`, updatedData);
        return res.data;
    } catch (error) {
        console.error("Update dish error:", error);
        return error.response?.data || { message: "Unknown error occurred" };
    }
};

export const deleteDish = async ({ dishId }) => {
    try {
        const res = await axios.delete(`/dish/${dishId}`);
        return res.data;
    } catch (error) {
        console.error("Update dish error:", error);
        return error.response?.data || { message: "Unknown error occurred" };
    }
};

export const createDish = async ({ storeId, dishData }) => {
    try {
        const res = await axios.post(`/dish/store/${storeId}`, dishData);
        return res.data;
    } catch (error) {
        console.error("Create dish error:", error);
        return error.response?.data || { message: "Unknown error occurred" };
    }
};

export const toggleSaleStatus = async ({dishId}) => {
    try {
        const res = await axios.post(`/dish/${dishId}/status`);
        return res.data;
    } catch (error) {
        console.error("Toggle sale status error:", error);
        return error.response?.data || { message: "Unknown error occurred" };
    }
};
