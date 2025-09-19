"use client";
import React, { useState } from "react";
import { ThreeDots } from "react-loader-spinner";
import HistoryTab from "@/components/tabs/HistoryOrderTab";
import localStorageService from "@/utils/localStorageService";

const page = () => {
  const [storeId, setStoreId] = useState(localStorageService.getStoreId());

  if (!storeId) {
    return (
      <div className='flex justify-center items-center h-screen w-screen'>
        <ThreeDots visible={true} height='80' width='80' color='#fc6011' radius='9' ariaLabel='three-dots-loading' />
      </div>
    );
  }

  return (
    <>
      <div className='pb-[10px] bg-gray-100'>
        <HistoryTab storeId={storeId} />
      </div>
    </>
  );
};

export default page;
