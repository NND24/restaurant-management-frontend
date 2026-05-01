"use client";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ThreeDots } from "react-loader-spinner";
import ChatItem from "@/components/message/ChatItem";
import { getAllChats } from "@/service/chat";
import Heading from "@/components/Heading";
import { IoChatbubblesOutline } from "react-icons/io5";

const MessagesPage = () => {
  const { t } = useTranslation();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const res = await getAllChats();
      setChats(res?.chats || (Array.isArray(res) ? res : []));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <ThreeDots visible={true} height="80" width="80" color="#fc6011" radius="9" ariaLabel="three-dots-loading" />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <Heading title={t("message.title")} description="" keywords="" />
      <h1 className="text-xl font-bold text-gray-800 mb-5">{t("message.title")}</h1>

      {chats.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
          <IoChatbubblesOutline className="text-5xl text-gray-300" />
          <p className="text-base">{t("message.no_conversations")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {chats.map((chat) => (
            <ChatItem key={chat._id} chat={chat} onDeleted={fetchChats} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
