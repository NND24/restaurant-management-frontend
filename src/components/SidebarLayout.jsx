"use client";
import { useState } from "react";
import { FaBoxes, FaBoxOpen, FaChartBar, FaShoppingCart, FaStore, FaUtensils } from "react-icons/fa";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { useRouter } from "next/navigation";
import { useSocket } from "@/context/SocketContext";
import localStorageService from "@/utils/localStorageService";
import Link from "next/link";
import Image from "next/image";

export default function SidebarLayout({ children }) {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState("stats");

  const { notifications } = useSocket();
  const storeName = localStorageService.getStore()?.name ?? "Cửa hàng";

  const unreadCount = notifications.filter((noti) => noti.status === "unread").length;

  const handleMenuClick = (menu, path) => {
    setActiveMenu(menu);
    router.push(path);
  };

  return (
    <div className='flex h-screen'>
      {/* Sidebar */}
      <Sidebar breakPoint='md' collapsedWidth='64px' className='shadow-lg'>
        {/* Header */}
        <header className='bg-white border-b px-4 py-3 flex items-center justify-between'>
          <h1 className='text-lg font-bold text-[#fc6011] truncate'>{storeName}</h1>

          {/* Notifications + User */}
          <div className='flex items-center space-x-5'>
            {/* Notifications */}
            <Link href='/notifications' className='relative'>
              <Image
                src='/assets/notification.png'
                alt='Notifications'
                width={22}
                height={22}
                className='cursor-pointer hover:opacity-80'
              />
              {unreadCount > 0 && (
                <span className='absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center text-xs font-semibold text-white bg-[#fc6011] rounded-full border border-white'>
                  {unreadCount}
                </span>
              )}
            </Link>

            <Link href='/account' className='hover:opacity-80'>
              <Image src='/assets/user.png' alt='User' width={26} height={26} className='cursor-pointer' />
            </Link>
          </div>
        </header>

        {/* Menu */}
        <Menu
          menuItemStyles={{
            button: ({ active }) => ({
              backgroundColor: active ? "#fc6011" : "transparent",
              color: active ? "#fff" : "#374151",
              borderRadius: "8px",
              margin: "4px 8px",
              padding: "10px 12px",
              fontWeight: active ? 600 : 500,
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                backgroundColor: active ? "#fc6011" : "#f3f4f6",
                color: active ? "#fff" : "#fc6011",
              },
            }),
          }}
        >
          <MenuItem
            icon={<FaChartBar />}
            active={activeMenu === "stats"}
            onClick={() => handleMenuClick("stats", "/statistics")}
          >
            Thống kê
          </MenuItem>

          <SubMenu icon={<FaUtensils />} label='Thực đơn'>
            <MenuItem active={activeMenu === "dish"} onClick={() => handleMenuClick("dish", "/dish")}>
              Món ăn
            </MenuItem>
            <MenuItem active={activeMenu === "topping"} onClick={() => handleMenuClick("topping", "/topping")}>
              Topping
            </MenuItem>
            <MenuItem
              active={activeMenu === "dish-category"}
              onClick={() => handleMenuClick("dish-category", "/dish-category")}
            >
              Loại món ăn
            </MenuItem>
            <MenuItem
              active={activeMenu === "topping-category"}
              onClick={() => handleMenuClick("topping-category", "/topping-category")}
            >
              Loại topping
            </MenuItem>
          </SubMenu>

          <SubMenu icon={<FaShoppingCart />} label='Đơn hàng'>
            <MenuItem active={activeMenu === "current"} onClick={() => handleMenuClick("current", "/orders/current")}>
              Đơn hàng
            </MenuItem>
            <MenuItem active={activeMenu === "history"} onClick={() => handleMenuClick("history", "/orders/history")}>
              Lịch sử đơn hàng
            </MenuItem>
            <MenuItem active={activeMenu === "rating"} onClick={() => handleMenuClick("rating", "/rating")}>
              Đánh giá
            </MenuItem>
          </SubMenu>

          <SubMenu icon={<FaStore />} label='Cửa hàng'>
            <MenuItem active={activeMenu === "store"} onClick={() => handleMenuClick("store", "/store")}>
              Thông tin
            </MenuItem>
            <MenuItem active={activeMenu === "staff"} onClick={() => handleMenuClick("staff", "/staff")}>
              Nhân viên
            </MenuItem>
            <MenuItem active={activeMenu === "voucher"} onClick={() => handleMenuClick("voucher", "/voucher")}>
              Voucher
            </MenuItem>
          </SubMenu>

          <SubMenu icon={<FaBoxes />} label='Nguyên liệu'>
            <MenuItem active={activeMenu === "ingredient"} onClick={() => handleMenuClick("ingredient", "/ingredient")}>
              Nguyên liệu
            </MenuItem>
            <MenuItem
              active={activeMenu === "ingredient-batch"}
              onClick={() => handleMenuClick("ingredient-batch", "/ingredient-batch")}
            >
              Lô nguyên liệu
            </MenuItem>
            <MenuItem
              active={activeMenu === "ingredient-category"}
              onClick={() => handleMenuClick("ingredient-category", "/ingredient-category")}
            >
              Loại nguyên liệu
            </MenuItem>
            <MenuItem active={activeMenu === "unit"} onClick={() => handleMenuClick("unit", "/unit")}>
              Đơn vị
            </MenuItem>
            <MenuItem active={activeMenu === "waste"} onClick={() => handleMenuClick("waste", "/waste")}>
              Nguyên liệu hỏng
            </MenuItem>
          </SubMenu>
        </Menu>
      </Sidebar>

      {/* Content */}
      <main className='flex-1 bg-gray-50 p-5 overflow-y-hidden'>{children}</main>
    </div>
  );
}
