"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import localStorageService from "@/utils/localStorageService";

const ENDPOINT = process.env.NEXT_PUBLIC_WS_URL || "";
const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const userId = localStorageService.getUserId();
    const storeId = localStorageService.getStoreId();

    if (!userId) return;

    const newSocket = io(ENDPOINT, { transports: ["websocket"] });
    setSocket(newSocket);

    if (storeId) newSocket.emit("registerStore", storeId);

    newSocket.on("getAllNotifications", (allNotifications) => {
      setNotifications(allNotifications);
    });

    newSocket.on("newOrderNotification", (payload) => {
      setNotifications((prev) => [...prev, payload.notification]);
    });

    newSocket.on("newNotification", (newNotification) => {
      setNotifications((prev) => [...prev, newNotification]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const sendNotification = ({ userId, title, message, type, orderId }) => {
    if (!socket) return;
    socket.emit("sendNotification", { userId, title, message, type, orderId });
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        notifications,
        setNotifications,
        sendNotification, // 👈 expose function
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
