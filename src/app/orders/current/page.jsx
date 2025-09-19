"use client";
import React, { useEffect, useState } from "react";

import { ThreeDots } from "react-loader-spinner";

import Tabs from "@/components/Tabs";

import LatestTab from "@/components/tabs/LatestOrderTab";
import VerifyTab from "@/components/tabs/VerifyOrderTab";
import localStorageService from "@/utils/localStorageService";

const page = () => {
  const storeData = localStorageService.getStore();
  const [storeId, setStoreId] = useState(localStorageService.getStoreId());
  const [tabData, setTabData] = useState([
    { label: "Mới", component: <LatestTab storeId={storeId} /> },
    { label: "Đã xác nhận", component: <VerifyTab storeId={storeId} /> },
  ]);
  const [activeTab, setActiveTab] = useState(0); // Default tab index

  // Load the stored active tab index from localStorage when the page loads
  useEffect(() => {
    const savedTab = parseInt(localStorageService.getActiveTab());
    if (!isNaN(savedTab)) {
      setActiveTab(savedTab);
    }
  }, []);

  const handleTabChange = (index) => {
    setActiveTab(index);
    localStorageService.setActiveTab(index);
  };

  if (!storeId) {
    return (
      <div className='flex justify-center items-center h-screen w-screen'>
        <ThreeDots visible={true} height='80' width='80' color='#fc6011' radius='9' ariaLabel='three-dots-loading' />
      </div>
    );
  }

  return (
    <Tabs
      key={activeTab} // 👈 force re-render when either changes
      tabs={tabData}
      defaultActiveTab={activeTab}
      onTabChange={handleTabChange}
    />
  );
};

export default page;
