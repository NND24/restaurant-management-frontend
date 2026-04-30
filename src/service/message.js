import axios from "../libs/axiosInstance";

export const getAllMessages = async (chatId) => {
    try {
        const response = await axios.get(`/message/${chatId}`);
        return response.data;
    } catch (error) {
        console.error("Get messages error:", error);
        return error.response?.data || { message: "Unknown error occurred" };
    }
};

export const sendMessage = async (chatId, body) => {
    try {
        const response = await axios.post(`/message/${chatId}`, body);
        return response.data;
    } catch (error) {
        console.error("Send message error:", error);
        return error.response?.data || { message: "Unknown error occurred" };
    }
};

export const deleteMessage = async (id) => {
    try {
        const response = await axios.delete(`/message/delete/${id}`);
        return response.data;
    } catch (error) {
        console.error("Delete message error:", error);
        return error.response?.data || { message: "Unknown error occurred" };
    }
};
