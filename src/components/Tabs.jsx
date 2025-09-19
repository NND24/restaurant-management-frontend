"use client";
import React, { useState } from "react";

const Tabs = ({
  tabs,
  defaultActiveTab = 0,
  onTabChange,
  tabClassName = "py-3 px-4 text-sm font-medium flex justify-center items-center transition-colors duration-200",
  activeTabClassName = "text-[#fc6011] border-b-2 border-[#fc6011] bg-orange-50",
}) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab);

  const handleTabClick = (index) => {
    setActiveTab(index);
    if (onTabChange) onTabChange(index);
  };

  return (
    <div className='w-full'>
      {/* Navigation Tabs */}
      <div
        className={`grid border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm`}
        style={{
          gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`,
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
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className='py-4'>{tabs[activeTab]?.component}</div>
    </div>
  );
};

export default Tabs;
