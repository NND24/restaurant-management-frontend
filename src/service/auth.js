import axios from "../libs/axiosInstance";
import { jwtDecode } from "jwt-decode";
import localStorageService from "@/utils/localStorageService";

export const loginUser = async (credentials) => {
    try {
        const res = await axios.post(
            "/auth/login?getRole=true&getStore=true",
            credentials
        );
        if (res.status !== 200) {
            // Defensive, but Axios throws for non-2xx anyway.
            throw new Error(res.data?.message?.message || "Đăng nhập thất bại!");
        }
        const data = res.data;
        const token = data.token;
        const storeId = data.storeId;

        localStorageService.setUserId(data._id);
        localStorageService.setToken(data.token);
        localStorageService.setRole(data.role);
        localStorageService.setStoreId(storeId);

        if (token) {
            const decoded = jwtDecode(token);
        }

        // Always return {success: true, ...}
        return { ...data, success: true };
    } catch (error) {
        // Handle both possible error shapes from backend
        let msg = "Unknown error occurred";
        let success = false;
        if (error.response?.data) {
            if (typeof error.response.data.message === "string") {
                msg = error.response.data.message;
            } else if (typeof error.response.data.message === "object") {
                msg = error.response.data.message.message || msg;
                success = error.response.data.message.success === true;
            }
        }
        return { success, message: msg };
    }
};
export const getOwneStore = async () => {
    try {
        const res = await axios.post("/auth/store");
        const data = res.data;
        localStorageService.setStore(data.data);
        return data;
    } catch (error) {
        console.error("Get owner store error:", error);
        return error.response?.data || { message: "Unknown error occurred" };
    }
};

export const logoutUser = async () => {
    const res = await axios.get("/auth/logout");
    localStorageService.clearAll();
};

export const registerStoreOwner = async (storeOwnerData) => {
    try {
        const res = await axios.post(
            "/auth/register/store-owner",
            storeOwnerData
        );
        const data = res.data;

        return data;
    } catch (error) {
        console.error("Registration error:", error);
        return error.response?.data || { message: "Unknown error occurred" };
    }
};

export const checkStoreOwnerEmail = async (email) => {
    try {
        const res = await axios.get(
            `/auth/check-register-store-owner?email=${email}`
        );
        const data = res.data;

        return data;
    } catch (error) {
        console.error("Email check error:", error);
        return error.response?.data || { message: "Unknown error occurred" };
    }
};

export const refreshAccessToken = async () => {
    try {
        const res = await axios.get("/auth/refresh");
        const data = res.data;

        localStorageService.setToken(data.token);
        return data;
    } catch (error) {
        console.error("Token refresh error:", error);
        return error.response?.data || { message: "Unknown error occurred" };
    }
};

export const changePassword = async (passwordData) => {
    try {
        const res = await axios.put("/auth/change-password", passwordData);
        const data = res.data;

        return data;
    } catch (error) {
        console.error("Change password error:", error);
        return error.response?.data || { message: "Unknown error occurred" };
    }
};

export const resetPassword = async (resetData) => {
    try {
        const res = await axios.post("/auth/reset-password", resetData);
        const data = res.data;

        return data;
    } catch (error) {
        console.error("Reset password error:", error);
        return error.response?.data || { message: "Unknown error occurred" };
    }
};

export const getOwnerStore = async () => {
    try {
        const res = await axios.get("/auth/store");
        const data = res.data;

        return data;
    } catch (error) {
        console.error("Get owner store error:", error);
        return error.response?.data || { message: "Unknown error occurred" };
    }
};
