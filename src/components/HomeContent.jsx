"use client";
import React, { useEffect, useState } from "react";
import IconCard from "../components/IconCard"; // Assuming IconCard is in the same directory

const icons = [
  {
    href: "/orders",
    src: "/assets/order.png",
    label: "Đơn hàng",
    roles: ["owner", "manager", "staff"],
  },
  {
    href: "/menu",
    src: "/assets/dishes.png",
    label: "Thực đơn",
    roles: ["owner", "manager", "staff"],
  },
  {
    href: "/store",
    src: "/assets/admin-icons/store.png",
    roles: ["owner"],
    label: "Thông tin cửa hàng",
  },
  {
    href: "/staff",
    src: "/assets/staff.png",
    label: "Quản lý nhân viên",
    roles: ["owner", "manager"],
  },
  {
    href: "/rating",
    src: "/assets/star.png",
    label: "Đánh giá",
    roles: ["owner", "manager", "staff"],
  },
  {
    href: "/shipping-fee",
    src: "/assets/scooter.png",
    label: "Quản lý tiền giao hàng",
    roles: ["owner"],
  },
  {
    href: "/voucher",
    src: "/assets/voucher.png",
    label: "Quản lý voucher",
    roles: ["owner", "manager"],
  },
  {
    href: "/statistics",
    src: "/assets/report.png",
    label: "Báo cáo",
    roles: ["owner", "manager"],
  },
];

const HomeContent = () => {
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("role");
      console.log("Raw role from localStorage:", raw);
      const parsed = JSON.parse(raw);
      setRoles(Array.isArray(parsed) ? parsed : []);
    } catch (err) {
      console.error("Lỗi parse role:", err);
      setRoles([]);
    }
  }, []);

  const hasPermission = (iconRoles) => {
    if (!iconRoles) return true;
    return iconRoles.some((role) => roles.includes(role));
  };

  const filteredIcons = icons.filter((icon) => hasPermission(icon.roles));

  return (
    <div className="p-5 shadow-md mb-48 mt-12">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
        {filteredIcons.map((icon, index) => (
          <IconCard
            key={index}
            href={icon.href}
            src={icon.src}
            label={icon.label}
          />
        ))}
      </div>
    </div>
  );
};

export default HomeContent;
