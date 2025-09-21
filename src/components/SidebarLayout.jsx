"use client";
import { FaBoxes, FaBoxOpen, FaChartBar, FaShoppingCart, FaStore, FaUtensils } from "react-icons/fa";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { usePathname, useRouter } from "next/navigation";
import { useSocket } from "@/context/SocketContext";
import localStorageService from "@/utils/localStorageService";
import Link from "next/link";
import Image from "next/image";

export default function SidebarLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname(); // 👈 Lấy route hiện tại

  const { notifications } = useSocket();
  const storeName = localStorageService.getStore()?.name ?? "Cửa hàng";

  const unreadCount = notifications.filter((noti) => noti.status === "unread").length;

  const handleMenuClick = (path) => {
    router.push(path);
  };

  return (
    <div className='flex h-screen'>
      {/* Sidebar */}
      <Sidebar breakPoint='md' collapsedWidth='64px' className='shadow-lg'>
        {/* Header */}
        <header className='bg-white border-b px-4 py-3 flex items-center justify-between'>
          <h1 className='text-lg font-bold text-[#fc6011] truncate'>{storeName}</h1>

          <div className='flex items-center space-x-5'>
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
            active={pathname.startsWith("/statistics")}
            onClick={() => handleMenuClick("/statistics")}
          >
            Thống kê
          </MenuItem>

          <SubMenu
            icon={<FaUtensils />}
            label='Thực đơn'
            defaultOpen={pathname.startsWith("/dish") || pathname.startsWith("/topping")}
          >
            <MenuItem active={pathname === "/dish-group"} onClick={() => handleMenuClick("/dish-group")}>
              Nhóm món ăn
            </MenuItem>
            <MenuItem active={pathname === "/dish"} onClick={() => handleMenuClick("/dish")}>
              Món ăn
            </MenuItem>
            <MenuItem active={pathname === "/topping-group"} onClick={() => handleMenuClick("/topping-group")}>
              Nhóm món thêm
            </MenuItem>
            <MenuItem active={pathname === "/topping"} onClick={() => handleMenuClick("/topping")}>
              Món thêm
            </MenuItem>
          </SubMenu>

          <SubMenu
            icon={<FaShoppingCart />}
            label='Đơn hàng'
            defaultOpen={pathname.startsWith("/orders") || pathname.startsWith("/rating")}
          >
            <MenuItem
              active={pathname.startsWith("/orders/current")}
              onClick={() => handleMenuClick("/orders/current")}
            >
              Đơn hàng
            </MenuItem>
            <MenuItem
              active={pathname.startsWith("/orders/history")}
              onClick={() => handleMenuClick("/orders/history")}
            >
              Lịch sử đơn hàng
            </MenuItem>
            <MenuItem active={pathname.startsWith("/rating")} onClick={() => handleMenuClick("/rating")}>
              Đánh giá
            </MenuItem>
          </SubMenu>

          <SubMenu
            icon={<FaStore />}
            label='Cửa hàng'
            defaultOpen={
              pathname.startsWith("/store") || pathname.startsWith("/staff") || pathname.startsWith("/voucher")
            }
          >
            <MenuItem active={pathname.startsWith("/store")} onClick={() => handleMenuClick("/store")}>
              Thông tin
            </MenuItem>
            <MenuItem active={pathname.startsWith("/staff")} onClick={() => handleMenuClick("/staff")}>
              Nhân viên
            </MenuItem>
            <MenuItem active={pathname.startsWith("/voucher")} onClick={() => handleMenuClick("/voucher")}>
              Voucher
            </MenuItem>
          </SubMenu>

          <SubMenu
            icon={<FaBoxes />}
            label='Nguyên liệu'
            defaultOpen={pathname.startsWith("/ingredient") || pathname.startsWith("/waste")}
          >
            <MenuItem active={pathname === "/ingredient"} onClick={() => handleMenuClick("/ingredient")}>
              Nguyên liệu
            </MenuItem>
            <MenuItem
              active={pathname.startsWith("/ingredient-batch")}
              onClick={() => handleMenuClick("/ingredient-batch")}
            >
              Lô nguyên liệu
            </MenuItem>
            <MenuItem active={pathname.startsWith("/waste")} onClick={() => handleMenuClick("/waste")}>
              Nguyên liệu hỏng
            </MenuItem>
            <MenuItem
              active={pathname === "/ingredient-category"}
              onClick={() => handleMenuClick("/ingredient-category")}
            >
              Loại nguyên liệu
            </MenuItem>
          </SubMenu>
        </Menu>
      </Sidebar>

      {/* Content */}
      <main className='flex-1 bg-gray-50 p-5 overflow-y-hidden'>{children}</main>
    </div>
  );
}
