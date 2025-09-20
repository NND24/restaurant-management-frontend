import axios from "../libs/axiosInstance";

export const getAllCategories = async ({ storeId, limit, page }) => {
    try {
        const params = new URLSearchParams();
        if (limit) params.append("limit", limit);
        if (page) params.append("page", page);

        const response = await axios.get(
            `/category/store/${storeId}${params.toString()}`
        );
        return response.data;
    } catch (error) {
        console.error("Get categories error:", error);
        return error.response?.data || { message: "Unknown error occurred" };
    }
};

export const createCategory = async ({ storeId, name }) => {
    try {
        const response = await axios.post(
            `/category/store/${storeId}`,
            { name }
        );
        return response.data;
    } catch (error) {
        console.error("Create category error:", error);
        return error.response?.data || { message: "Unknown error occurred" };
    }
};

export const updateCategory = async ({ categoryId, name }) => {
    try {
        const response = await axios.put(
            `/category/${categoryId}`,
            { name }
        );
        return response.data;
    } catch (error) {
        console.error("Update category error:", error);
        return error.response?.data || { message: "Unknown error occurred" };
    }
};

export const deleteCategory = async ({ categoryId }) => {
    try {
        const response = await axios.delete(`/category/${categoryId}`);
        return response.data;
    } catch (error) {
        console.error("Delete category error:", error);
        return error.response?.data || { message: "Unknown error occurred" };
    }
};
