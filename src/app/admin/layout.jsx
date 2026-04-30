"use client";
import { FaStore, FaUsers, FaList, FaCog } from "react-icons/fa";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { logoutUser } from "@/service/auth";
import { FiLogOut, FiUser } from "react-icons/fi";
import { HiOutlineMenuAlt2 } from "react-icons/hi";
import Image from "next/image";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { setUser, setUserId } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openUserMenu, setOpenUserMenu] = useState(false);

  const handleMenuClick = (path) => {
    router.push(path);
    setSidebarOpen(false);
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
    <div className="flex h-screen bg-gray-50">
      {/* Mobile header */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between border-b bg-white px-4 py-3 shadow-sm md:hidden">
        <button
          className="text-xl text-gray-700"
          aria-label="Mở menu"
          onClick={(e) => {
            e.stopPropagation();
            setSidebarOpen(true);
          }}
        >
          <HiOutlineMenuAlt2 />
        </button>
        <h1 className="text-base font-semibold text-[#fc6011]">Quản trị hệ thống</h1>
        <div className="w-6" />
      </div>

      <Sidebar
        toggled={sidebarOpen}
        onBackdropClick={() => setSidebarOpen(false)}
        breakPoint="md"
        width="270px"
        className="h-full border-r border-gray-100 bg-white shadow-lg"
      >
        <header className="flex items-center justify-between border-b bg-white px-4 py-3">
          <h1 className="text-lg font-bold text-[#fc6011]">Quản trị viên</h1>
          <div className="relative">
            <Image
              src="/assets/user.png"
              alt="User"
              width={26}
              height={26}
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setOpenUserMenu((prev) => !prev);
              }}
            />
            {openUserMenu && (
              <div className="absolute right-0 mt-2 bg-white shadow-lg border rounded-xl w-56 z-50 py-2">
                <button
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition"
                  onClick={() => {
                    setOpenUserMenu(false);
                    router.push("/admin/settings");
                  }}
                >
                  <FiUser size={18} className="text-gray-600" />
                  <span>Thông tin cá nhân</span>
                </button>
                <button
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition text-red-500"
                  onClick={() => {
                    setOpenUserMenu(false);
                    confirmLogout();
                  }}
                >
                  <FiLogOut size={18} />
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        </header>

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
            icon={<FaStore />}
            active={pathname.startsWith("/admin/stores")}
            onClick={() => handleMenuClick("/admin/stores")}
          >
            Cửa hàng
          </MenuItem>
          <MenuItem
            icon={<FaUsers />}
            active={pathname.startsWith("/admin/accounts")}
            onClick={() => handleMenuClick("/admin/accounts")}
          >
            Tài khoản
          </MenuItem>
          <MenuItem
            icon={<FaList />}
            active={pathname.startsWith("/admin/systemCategory")}
            onClick={() => handleMenuClick("/admin/systemCategory")}
          >
            Danh mục
          </MenuItem>
          <MenuItem
            icon={<FaCog />}
            active={pathname === "/admin/settings"}
            onClick={() => handleMenuClick("/admin/settings")}
          >
            Cài đặt
          </MenuItem>
        </Menu>
      </Sidebar>

      <main className="flex-1 overflow-y-auto pt-[64px] md:pt-0">{children}</main>
    </div>
  );
}
