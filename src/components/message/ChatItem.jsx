"use client";
import moment from "moment";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FaEllipsis } from "react-icons/fa6";
import Swal from "sweetalert2";
import { deleteChat } from "@/service/chat";
import { useAuth } from "@/context/AuthContext";

const ChatItem = ({ chat, onDeleted }) => {
  const [avatar, setAvatar] = useState("");
  const [name, setName] = useState("");
  const { userId } = useAuth();

  useEffect(() => {
    if (!chat) return;
    const users = Array.isArray(chat.users) ? chat.users.filter(Boolean) : [];
    if (users.length === 0) return;

    const otherUser = users.find((u) => u?._id && u._id !== userId) || users[0];

    setAvatar(otherUser?.avatar?.url || "");
    setName(otherUser?.name || "");
  }, [chat, userId]);

  const hasAvatar = typeof avatar === "string" && avatar.trim().length > 0;
  const fallbackInitial = (name || "?").charAt(0).toUpperCase();

  const confirmDeleteChat = async () => {
    const result = await Swal.fire({
      title: "Bạn có chắc chắn muốn xóa cuộc trò chuyện này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      await deleteChat(chat._id);
      onDeleted?.();
    }
  };

  return (
    <Link
      href={`/message/${chat._id}`}
      className="relative flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="relative w-[52px] h-[52px] flex-shrink-0">
        {hasAvatar ? (
          <Image src={avatar} alt={name || "avatar"} fill className="rounded-full object-cover" />
        ) : (
          <div className="w-full h-full rounded-full bg-orange-100 text-[#fc6011] font-semibold flex items-center justify-center text-xl">
            {fallbackInitial}
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-gray-800 font-semibold text-base truncate">{name || "Khách hàng"}</span>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <span className="text-gray-400 text-sm truncate">
            {chat?.latestMessage?.content || "Chưa có tin nhắn"}
          </span>
          <span className="text-gray-400 text-xs flex-shrink-0">
            {chat?.latestMessage?.createdAt
              ? moment.utc(chat.latestMessage.createdAt).local().fromNow()
              : ""}
          </span>
        </div>
      </div>

      <div
        className="absolute top-1/2 -translate-y-1/2 right-3 w-[28px] h-[28px] rounded-full cursor-pointer hover:bg-gray-100 group flex items-center justify-center"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <FaEllipsis className="text-gray-400 text-base" />
        <div className="hidden group-hover:block absolute top-full right-0 mt-1 shadow-md bg-white border border-gray-200 p-2 rounded-lg z-10 min-w-[120px]">
          <button
            className="w-full text-left px-3 py-1.5 rounded-md cursor-pointer hover:bg-gray-100 text-sm text-red-500 whitespace-nowrap"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              confirmDeleteChat();
            }}
          >
            Xóa cuộc trò chuyện
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ChatItem;
