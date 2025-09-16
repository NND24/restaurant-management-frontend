import axios from "../libs/axiosInstance";

export const createChat = async ({ id, body }) => {
    try {
        const response = await axios.post(`/chat/${id}`, body);
        return response.data;
    } catch (error) {
        console.error("Create chat error:", error);
        return error.response?.data || { message: "Unknown error occurred" };
    }
};

export const getAllChats = async () => {
    try {
        const response = await axios.get(`/chat/`);
        return response.data;
    } catch (error) {
        console.error("Get all chats error:", error);
        return error.response?.data || { message: "Unknown error occurred" };
    }
};

export const deleteChat = async (id) => {
    try {
        const response = await axios.delete(`/chat/delete/${id}`);
        return response.data;
    } catch (error) {
        console.error("Delete chat error:", error);
        return error.response?.data || { message: "Unknown error occurred" };
    }
};
