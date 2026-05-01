"use client";
import React, { useEffect, useState } from "react";
import { ThreeDots } from "react-loader-spinner";
import Tabs from "@/components/Tabs";
import LatestTab from "@/components/tabs/LatestOrderTab";
import VerifyTab from "@/components/tabs/VerifyOrderTab";
import localStorageService from "@/utils/localStorageService";
import Heading from "@/components/Heading";
import { useTranslation } from "react-i18next";

const page = () => {
  const { t } = useTranslation();
  const storeData = localStorageService.getStore();
  const [storeId, setStoreId] = useState(localStorageService.getStoreId());
  const [activeTab, setActiveTab] = useState(0); // Default tab index

  const tabData = [
    { label: t("orders.new"), component: <LatestTab storeId={storeId} /> },
    { label: t("orders.confirmed"), component: <VerifyTab storeId={storeId} /> },
  ];

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
      <div className='flex min-h-screen w-full items-center justify-center'>
        <ThreeDots visible={true} height='80' width='80' color='#fc6011' radius='9' ariaLabel='three-dots-loading' />
      </div>
    );
  }

  return (
    <div className='page-shell'>
      <Heading title={t("orders.title")} description='' keywords='' />
      <Tabs key={activeTab} tabs={tabData} defaultActiveTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default page;
