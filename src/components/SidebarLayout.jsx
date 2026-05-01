"use client";
import { FaBoxes, FaChartBar, FaComments, FaShoppingCart, FaStore, FaUtensils, FaGlobe } from "react-icons/fa";
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
import { HiOutlineMenuAlt2 } from "react-icons/hi";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";

export default function SidebarLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { t, i18n } = useTranslation();

  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [openLangMenu, setOpenLangMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { setUser, setUserId } = useAuth();

  const { notifications } = useSocket();
  const storeName = localStorageService.getStore()?.name ?? t("common.store");

  const unreadCount = notifications.filter((noti) => noti.status === "unread").length;

  const getRole = localStorageService.getRole();

  const handleMenuClick = (path) => {
    router.push(path);
    setSidebarOpen(false);
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setOpenLangMenu(false);
  };

  useEffect(() => {
    const closeMenu = () => {
      setOpenUserMenu(false);
      setOpenLangMenu(false);
    };
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  const confirmLogout = async () => {
    const result = await Swal.fire({
      title: t("sidebar.logout_confirm"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("common.confirm"),
      cancelButtonText: t("common.cancel"),
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

  const currentLang = i18n.language?.startsWith("en") ? "en" : "vi";

  return (
    <div className='flex h-screen bg-gray-50'>
      <div className='fixed top-0 left-0 right-0 z-40 flex items-center justify-between border-b bg-white px-4 py-3 shadow-sm md:hidden'>
        <button
          className='text-xl text-gray-700'
          aria-label={t("sidebar.open_menu")}
          onClick={(e) => {
            e.stopPropagation();
            setSidebarOpen(true);
          }}
        >
          <HiOutlineMenuAlt2 />
        </button>
        <h1 className='max-w-[55vw] truncate text-base font-semibold text-[#fc6011]'>{storeName}</h1>
        <Link href='/notifications' className='relative'>
          <Image src='/assets/notification.png' alt='Notifications' width={22} height={22} className='cursor-pointer' />
          {unreadCount > 0 && (
            <span className='absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full border border-white bg-[#fc6011] text-xs font-semibold text-white'>
              {unreadCount}
            </span>
          )}
        </Link>
      </div>

      <Sidebar
        toggled={sidebarOpen}
        onBackdropClick={() => setSidebarOpen(false)}
        breakPoint='md'
        width='270px'
        className='h-full border-r border-gray-100 bg-white shadow-lg'
      >
        <header className='flex items-center justify-between border-b bg-white px-4 py-3'>
          <h1 className='text-lg font-bold text-[#fc6011] max-w-[120px] truncate'>{storeName}</h1>

          <div className='flex items-center space-x-3'>
            {/* Language Switcher */}
            <div className='relative'>
              <button
                className='flex items-center gap-1 text-gray-600 hover:text-[#fc6011] transition-colors px-1 py-1 rounded-lg hover:bg-gray-100'
                title={t("language.select")}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenLangMenu((prev) => !prev);
                  setOpenUserMenu(false);
                }}
              >
                <FaGlobe size={18} />
                <span className='text-xs font-semibold uppercase'>{currentLang}</span>
              </button>

              {openLangMenu && (
                <div className='absolute right-0 mt-2 bg-white shadow-lg border rounded-xl w-44 z-50 py-2'>
                  <button
                    className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition text-sm ${
                      currentLang === "vi" ? "font-bold text-[#fc6011]" : "text-gray-700"
                    }`}
                    onClick={() => changeLanguage("vi")}
                  >
                    <span>🇻🇳</span>
                    <span>{t("language.vi")}</span>
                    {currentLang === "vi" && <span className='ml-auto text-[#fc6011]'>✓</span>}
                  </button>
                  <button
                    className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition text-sm ${
                      currentLang === "en" ? "font-bold text-[#fc6011]" : "text-gray-700"
                    }`}
                    onClick={() => changeLanguage("en")}
                  >
                    <span>🇺🇸</span>
                    <span>{t("language.en")}</span>
                    {currentLang === "en" && <span className='ml-auto text-[#fc6011]'>✓</span>}
                  </button>
                </div>
              )}
            </div>

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
                  setOpenLangMenu(false);
                }}
              />

              {openUserMenu && (
                <div className='absolute right-0 mt-2 bg-white shadow-lg border rounded-xl w-56 z-50 py-2'>
                  <button
                    className='w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition'
                    onClick={() => router.push("/account/profile")}
                  >
                    <FiUser size={18} className='text-gray-600' />
                    <span>{t("sidebar.profile")}</span>
                  </button>

                  <button
                    className='w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition'
                    onClick={() => router.push("/account/change-password")}
                  >
                    <FiKey size={18} className='text-gray-600' />
                    <span>{t("sidebar.change_password")}</span>
                  </button>

                  <button
                    className='w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition text-red-500'
                    onClick={confirmLogout}
                  >
                    <FiLogOut size={18} />
                    <span>{t("sidebar.logout")}</span>
                  </button>
                </div>
              )}
            </div>
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
          {getRole !== "staff" && (
            <SubMenu icon={<FaChartBar />} label={t("sidebar.statistics")} defaultOpen={pathname.startsWith("/statistic")}>
              <MenuItem
                active={pathname === "/statistic/revenue"}
                onClick={() => handleMenuClick("/statistic/revenue")}
              >
                {t("sidebar.revenue")}
              </MenuItem>
              <MenuItem active={pathname === "/statistic/orders"} onClick={() => handleMenuClick("/statistic/orders")}>
                {t("sidebar.orders")}
              </MenuItem>
              <MenuItem active={pathname === "/statistic/items"} onClick={() => handleMenuClick("/statistic/items")}>
                {t("sidebar.dishes_stat")}
              </MenuItem>
              <MenuItem
                active={pathname === "/statistic/customers"}
                onClick={() => handleMenuClick("/statistic/customers")}
              >
                {t("sidebar.customers")}
              </MenuItem>
              <MenuItem
                active={pathname === "/statistic/vouchers"}
                onClick={() => handleMenuClick("/statistic/vouchers")}
              >
                {t("sidebar.vouchers_stat")}
              </MenuItem>
            </SubMenu>
          )}

          <SubMenu
            icon={<FaUtensils />}
            label={t("sidebar.menu")}
            defaultOpen={pathname.startsWith("/dish") || pathname.startsWith("/topping")}
          >
            <MenuItem active={pathname === "/dish-group"} onClick={() => handleMenuClick("/dish-group")}>
              {t("sidebar.dish_groups")}
            </MenuItem>
            <MenuItem active={pathname === "/dish"} onClick={() => handleMenuClick("/dish")}>
              {t("sidebar.dishes")}
            </MenuItem>
            <MenuItem active={pathname === "/topping-group"} onClick={() => handleMenuClick("/topping-group")}>
              {t("sidebar.topping_groups")}
            </MenuItem>
            <MenuItem active={pathname === "/topping"} onClick={() => handleMenuClick("/topping")}>
              {t("sidebar.toppings")}
            </MenuItem>
          </SubMenu>

          <SubMenu
            icon={<FaShoppingCart />}
            label={t("sidebar.orders_section")}
            defaultOpen={pathname.startsWith("/orders") || pathname.startsWith("/rating")}
          >
            <MenuItem
              active={pathname.startsWith("/orders/current")}
              onClick={() => handleMenuClick("/orders/current")}
            >
              {t("sidebar.current_orders")}
            </MenuItem>
            <MenuItem
              active={pathname.startsWith("/orders/history")}
              onClick={() => handleMenuClick("/orders/history")}
            >
              {t("sidebar.order_history")}
            </MenuItem>
            <MenuItem active={pathname.startsWith("/rating")} onClick={() => handleMenuClick("/rating")}>
              {t("sidebar.ratings")}
            </MenuItem>
          </SubMenu>

          {getRole !== "staff" && (
            <SubMenu
              icon={<FaStore />}
              label={t("sidebar.store_section")}
              defaultOpen={
                pathname.startsWith("/store") || pathname.startsWith("/staff") || pathname.startsWith("/voucher")
              }
            >
              {getRole !== "manager" && (
                <MenuItem active={pathname.startsWith("/store")} onClick={() => handleMenuClick("/store")}>
                  {t("sidebar.store_info")}
                </MenuItem>
              )}
              <MenuItem active={pathname.startsWith("/staff")} onClick={() => handleMenuClick("/staff")}>
                {t("sidebar.staff")}
              </MenuItem>
              <MenuItem active={pathname.startsWith("/voucher")} onClick={() => handleMenuClick("/voucher")}>
                {t("sidebar.vouchers")}
              </MenuItem>
              <MenuItem active={pathname.startsWith("/shipping-fee")} onClick={() => handleMenuClick("/shipping-fee")}>
                {t("sidebar.shipping_fees")}
              </MenuItem>
            </SubMenu>
          )}

          <MenuItem
            icon={<FaComments />}
            active={pathname.startsWith("/message")}
            onClick={() => handleMenuClick("/message")}
          >
            {t("sidebar.messages")}
          </MenuItem>

          <SubMenu
            icon={<FaBoxes />}
            label={t("sidebar.ingredients_section")}
            defaultOpen={
              pathname.startsWith("/ingredient") || pathname.startsWith("/waste") || pathname.startsWith("/unit")
            }
          >
            <MenuItem active={pathname === "/ingredient"} onClick={() => handleMenuClick("/ingredient")}>
              {t("sidebar.ingredients")}
            </MenuItem>
            <MenuItem
              active={pathname.startsWith("/ingredient-batch")}
              onClick={() => handleMenuClick("/ingredient-batch")}
            >
              {t("sidebar.ingredient_batches")}
            </MenuItem>
            <MenuItem active={pathname.startsWith("/waste")} onClick={() => handleMenuClick("/waste")}>
              {t("sidebar.waste")}
            </MenuItem>
            <MenuItem
              active={pathname === "/ingredient-category"}
              onClick={() => handleMenuClick("/ingredient-category")}
            >
              {t("sidebar.ingredient_categories")}
            </MenuItem>
            <MenuItem active={pathname === "/unit"} onClick={() => handleMenuClick("/unit")}>
              {t("sidebar.units")}
            </MenuItem>
          </SubMenu>
        </Menu>
      </Sidebar>

      <main className='flex-1 overflow-y-auto pt-[64px] md:pt-0'>{children}</main>
    </div>
  );
}
