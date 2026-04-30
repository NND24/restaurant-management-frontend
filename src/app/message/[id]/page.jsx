"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import moment from "moment";
import { useSocket } from "@/context/SocketContext";
import { useAuth } from "@/context/AuthContext";
import { getAllMessages, sendMessage } from "@/service/message";
import MessageItem from "@/components/message/MessageItem";
import Heading from "@/components/Heading";
import { IoArrowBack, IoSend } from "react-icons/io5";
import { ThreeDots } from "react-loader-spinner";

const ConversationPage = () => {
  const { id: chatId } = useParams();
  const router = useRouter();
  const { socket } = useSocket();
  const { userId } = useAuth();

  const [messages, setMessages] = useState([]);
  const [chat, setChat] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState({ avatar: "", name: "" });

  const messagesEndRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const res = await getAllMessages(chatId);
      setMessages(res?.messages || []);
      setChat(res?.chat || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (chatId) fetchMessages();
  }, [chatId]);

  useEffect(() => {
    if (!chat || !userId) return;
    const users = Array.isArray(chat.users) ? chat.users.filter(Boolean) : [];
    const other = users.find((u) => u?._id && u._id !== userId) || users[0];
    setOtherUser({
      avatar: other?.avatar?.url || "",
      name: other?.name || "Khách hàng",
    });
  }, [chat, userId]);

  useEffect(() => {
    if (!socket || !chatId) return;
    socket.emit("joinChat", chatId);
    return () => socket.emit("leaveChat", chatId);
  }, [socket, chatId]);

  useEffect(() => {
    if (!socket) return;
    const handleReceive = () => fetchMessages();
    const handleDelete = () => fetchMessages();
    socket.on("messageReceived", handleReceive);
    socket.on("messageDeleted", handleDelete);
    return () => {
      socket.off("messageReceived", handleReceive);
      socket.off("messageDeleted", handleDelete);
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || sending) return;
    setSending(true);
    try {
      const body = { content: message };
      await sendMessage(chatId, body);
      socket?.emit("sendMessage", { id: chatId, data: body });
      setMessage("");
      await fetchMessages();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const hasAvatar = typeof otherUser.avatar === "string" && otherUser.avatar.trim().length > 0;
  const fallbackInitial = (otherUser.name || "?").charAt(0).toUpperCase();

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <ThreeDots visible={true} height="80" width="80" color="#fc6011" radius="9" ariaLabel="three-dots-loading" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] md:h-screen bg-gray-50">
      <Heading title={`Tin nhắn - ${otherUser.name}`} description="" keywords="" />

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
        <button
          onClick={() => router.push("/message")}
          className="p-2 rounded-full hover:bg-gray-100 transition"
        >
          <IoArrowBack className="text-xl text-gray-600" />
        </button>

        <div className="relative w-10 h-10 flex-shrink-0">
          {hasAvatar ? (
            <Image src={otherUser.avatar} alt={otherUser.name} fill className="rounded-full object-cover" />
          ) : (
            <div className="w-full h-full rounded-full bg-orange-100 text-[#fc6011] font-semibold flex items-center justify-center">
              {fallbackInitial}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <span className="font-semibold text-gray-800">{otherUser.name}</span>
          <span className="text-xs text-gray-400">
            {chat?.latestMessage?.createdAt
              ? moment.utc(chat.latestMessage.createdAt).local().fromNow()
              : ""}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
          </div>
        ) : (
          messages.map((msg, index) => (
            <MessageItem key={index} msg={msg} chatId={chatId} onDeleted={fetchMessages} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-t border-gray-200 flex-shrink-0">
        <div className="flex-1 flex items-center bg-gray-100 rounded-full px-4 py-2">
          <input
            type="text"
            placeholder="Nhập tin nhắn..."
            className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!message.trim() || sending}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-[#fc6011] text-white hover:bg-[#e55010] transition disabled:opacity-50 flex-shrink-0"
        >
          <IoSend className="text-base" />
        </button>
      </div>
    </div>
  );
};

export default ConversationPage;
