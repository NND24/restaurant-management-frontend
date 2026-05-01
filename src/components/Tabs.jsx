"use client";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const Tabs = ({
  tabs,
  defaultActiveTab = 0,
  onTabChange,
  tabClassName = "py-3 px-4 text-sm font-medium flex justify-center items-center transition-colors duration-200",
  activeTabClassName = "text-[#fc6011] border-b-2 border-[#fc6011] bg-orange-50",
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(defaultActiveTab);

  const handleTabClick = (index) => {
    setActiveTab(index);
    if (onTabChange) onTabChange(index);
  };

  return (
    <div className='w-full'>
      <div className='sticky top-0 z-10 overflow-x-auto border-b border-gray-200 bg-white shadow-sm'>
        <div
          className='grid min-w-max md:min-w-0'
          style={{
            gridTemplateColumns: `repeat(${tabs.length}, minmax(130px, 1fr))`,
          }}
        >
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => handleTabClick(index)}
              className={`
                ${tabClassName}
                ${activeTab === index ? activeTabClassName : "text-gray-500 hover:text-[#fc6011] hover:bg-gray-50"}
              `}
            >
              {tab.icon && <span className='mr-2 text-lg'>{tab.icon}</span>}
              <span className='truncate'>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className='py-4'>{tabs[activeTab]?.component}</div>
    </div>
  );
};

export default Tabs;
