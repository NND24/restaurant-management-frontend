"use client";
import React from "react";
import Image from "next/image";
import { FaEllipsis } from "react-icons/fa6";
import Swal from "sweetalert2";
import { deleteMessage } from "@/service/message";
import { useSocket } from "@/context/SocketContext";
import { useAuth } from "@/context/AuthContext";

const MessageItem = ({ msg, chatId, onDeleted }) => {
  const { socket } = useSocket();
  const { userId } = useAuth();

  const isOwn = msg?.sender?._id === userId;

  const confirmDeleteMessage = async () => {
    const result = await Swal.fire({
      title: "Bạn có chắc chắn muốn xóa tin nhắn này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      await deleteMessage(msg._id);
      socket?.emit("deleteMessage", chatId);
      onDeleted?.();
    }
  };

  return (
    <div className={`relative flex items-end gap-2 py-2 ${isOwn ? "justify-end pl-14" : "pr-14"}`}>
      {msg?.content?.length > 0 && (
        <div
          className={`relative py-2 px-4 max-w-[70%] rounded-2xl break-words text-sm leading-relaxed ${
            isOwn ? "bg-[#fc6011] text-white" : "bg-gray-100 text-gray-800"
          }`}
        >
          <span>{msg.content}</span>

          {isOwn && (
            <div className="absolute top-1/2 -translate-y-1/2 -left-9 w-7 h-7 rounded-full cursor-pointer hover:bg-gray-200 group flex items-center justify-center">
              <FaEllipsis className="text-gray-400 text-base" />
              <div className="hidden group-hover:block absolute top-0 right-full mr-1 shadow-md bg-white border border-gray-200 p-2 rounded-lg z-10 min-w-[80px]">
                <button
                  className="w-full text-left px-2 py-1 rounded cursor-pointer hover:bg-gray-100 text-xs text-red-500 whitespace-nowrap"
                  onClick={confirmDeleteMessage}
                >
                  Xóa
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {msg?.image && (
        <div className="relative">
          <div className="relative w-48 h-32 rounded-xl overflow-hidden">
            <Image loading="lazy" fill src={msg.image.url} alt="" className="object-cover" />
          </div>

          {isOwn && (
            <div className="absolute top-1/2 -translate-y-1/2 -left-9 w-7 h-7 rounded-full cursor-pointer hover:bg-gray-200 group flex items-center justify-center">
              <FaEllipsis className="text-gray-400 text-base" />
              <div className="hidden group-hover:block absolute top-0 right-full mr-1 shadow-md bg-white border border-gray-200 p-2 rounded-lg z-10 min-w-[80px]">
                <button
                  className="w-full text-left px-2 py-1 rounded cursor-pointer hover:bg-gray-100 text-xs text-red-500 whitespace-nowrap"
                  onClick={confirmDeleteMessage}
                >
                  Xóa
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageItem;
