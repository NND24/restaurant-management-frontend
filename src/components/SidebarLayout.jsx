"use client";
import { FaBoxes, FaChartBar, FaShoppingCart, FaStore, FaUtensils } from "react-icons/fa";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { usePathname, useRouter } from "next/navigation";
import { useSocket } from "@/context/SocketContext";
import localStorageService from "@/utils/localStorageService";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { logoutUser } from "@/service/auth";
import { useAuth } from "@/context/AuthContext";
import { FiUser, FiKey, FiLogOut } from "react-icons/fi";

export default function SidebarLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname(); // 👈 Lấy route hiện tại

  const [openUserMenu, setOpenUserMenu] = useState(false);
  const { user, setUser, setUserId } = useAuth();

  const { notifications } = useSocket();
  const storeName = localStorageService.getStore()?.name ?? "Cửa hàng";

  const unreadCount = notifications.filter((noti) => noti.status === "unread").length;

  const getRole = localStorageService.getRole();

  const handleMenuClick = (path) => {
    router.push(path);
  };

  useEffect(() => {
    const closeMenu = () => setOpenUserMenu(false);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  const confirmLogout = async () => {
    const result = await Swal.fire({
      title: "Bạn có chắc chắn muốn đăng xuất không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        await logoutUser();
        setUserId(null);
        setUser(null);
      } catch (error) {
        console.error(error);
      } finally {
        router.push("/auth/login");
      }
    }
  };

  return (
    <div className='flex h-screen'>
      {/* Sidebar */}
      <Sidebar breakPoint='md' collapsedWidth='64px' className='shadow-lg'>
        {/* Header */}
        <header className='bg-white border-b px-4 py-3 flex items-center justify-between'>
          <h1 className='text-lg font-bold text-[#fc6011] max-w-[150px] truncate'>{storeName}</h1>

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

            <div className='relative'>
              <Image
                src='/assets/user.png'
                alt='User'
                width={26}
                height={26}
                className='cursor-pointer'
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenUserMenu((prev) => !prev);
                }}
              />

              {openUserMenu && (
                <div className='absolute right-0 mt-2 bg-white shadow-lg border rounded-xl w-56 z-50 py-2'>
                  <button
                    className='w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition'
                    onClick={() => router.push("/account/profile")}
                  >
                    <FiUser size={18} className='text-gray-600' />
                    <span>Thông tin cá nhân</span>
                  </button>

                  <button
                    className='w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition'
                    onClick={() => router.push("/account/change-password")}
                  >
                    <FiKey size={18} className='text-gray-600' />
                    <span>Đổi mật khẩu</span>
                  </button>

                  <button
                    className='w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition text-red-500'
                    onClick={confirmLogout}
                  >
                    <FiLogOut size={18} />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
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
          {getRole !== "staff" && (
            <SubMenu icon={<FaChartBar />} label='Thống kê' defaultOpen={pathname.startsWith("/statistic")}>
              <MenuItem
                active={pathname === "/statistic/revenue"}
                onClick={() => handleMenuClick("/statistic/revenue")}
              >
                Doanh thu
              </MenuItem>
              <MenuItem active={pathname === "/statistic/orders"} onClick={() => handleMenuClick("/statistic/orders")}>
                Đơn hàng
              </MenuItem>
              <MenuItem active={pathname === "/statistic/items"} onClick={() => handleMenuClick("/statistic/items")}>
                Món ăn
              </MenuItem>
              <MenuItem
                active={pathname === "/statistic/customers"}
                onClick={() => handleMenuClick("/statistic/customers")}
              >
                Khách hàng
              </MenuItem>
              <MenuItem
                active={pathname === "/statistic/vouchers"}
                onClick={() => handleMenuClick("/statistic/vouchers")}
              >
                Giảm giá
              </MenuItem>
            </SubMenu>
          )}

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

          {getRole !== "staff" && (
            <SubMenu
              icon={<FaStore />}
              label='Cửa hàng'
              defaultOpen={
                pathname.startsWith("/store") || pathname.startsWith("/staff") || pathname.startsWith("/voucher")
              }
            >
              {getRole !== "manager" && (
                <MenuItem active={pathname.startsWith("/store")} onClick={() => handleMenuClick("/store")}>
                  Thông tin
                </MenuItem>
              )}
              <MenuItem active={pathname.startsWith("/staff")} onClick={() => handleMenuClick("/staff")}>
                Nhân viên
              </MenuItem>
              <MenuItem active={pathname.startsWith("/voucher")} onClick={() => handleMenuClick("/voucher")}>
                Phiếu giảm giá
              </MenuItem>
              <MenuItem active={pathname.startsWith("/shipping-fee")} onClick={() => handleMenuClick("/shipping-fee")}>
                Phí vận chuyển
              </MenuItem>
            </SubMenu>
          )}

          <SubMenu
            icon={<FaBoxes />}
            label='Nguyên liệu'
            defaultOpen={
              pathname.startsWith("/ingredient") || pathname.startsWith("/waste") || pathname.startsWith("/unit")
            }
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
            <MenuItem active={pathname === "/unit"} onClick={() => handleMenuClick("/unit")}>
              Đơn vị
            </MenuItem>
          </SubMenu>
        </Menu>
      </Sidebar>

      {/* Content */}
      <main className='flex-1 bg-gray-50 overflow-y-hidden'>{children}</main>
    </div>
  );
}
