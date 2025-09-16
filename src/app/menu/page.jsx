'use client';

import NavBar from "@/components/NavBar";
import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Tabs from "@/components/Tabs";
import DishTab from "@/components/tabs/DishMenuTab";
import ToppingTab from "@/components/tabs/ToppingMenuTab";
import localStorageService from "@/utils/localStorageService";

const MENU_TAB_KEY = "activeMenuTab";

const Page = () => {
  // Read initial tab from localStorage, default to 0 if not found/invalid
  const getInitialTab = () => {
    if (typeof window !== "undefined") {
      const tab = localStorageService.getActiveMenuTab();
      return typeof tab === "number" && !isNaN(tab) ? tab : 0;
    }
    return 0;
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());

  // When mounted, sync the tab if localStorage changes (e.g. after back navigation)
  useEffect(() => {
    setActiveTab(getInitialTab());
  }, []);

  const handleTabChange = (index) => {
    setActiveTab(index);
    localStorageService.setActiveMenuTab(index);
    // You can add your custom tab logic here if needed
  };

  const tabData = [
    { label: "Món ăn", component: <DishTab /> },
    { label: "Topping", component: <ToppingTab /> },
  ];

  return (
    <>
      <Header title="Thực đơn" goBack={true} />
      <div className='pt-[70px] pb-[10px] bg-gray-100'>
        <Tabs
          tabs={tabData}
          defaultActiveTab={activeTab}
          onTabChange={handleTabChange}
        />
      </div>
      <NavBar page='menu' />
    </>
  );
};

export default Page;
