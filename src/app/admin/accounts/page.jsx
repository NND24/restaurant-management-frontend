"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import { getAllAccounts, createAccount, updateAccount } from "@/service/adminAccount";
import Heading from "@/components/Heading";
import { FiSearch, FiX, FiEdit2, FiPlus } from "react-icons/fi";
import { ThreeDots } from "react-loader-spinner";

const ITEMS_PER_PAGE = 6;

const ROLE_CONFIG = {
  admin: { label: "Quản trị viên", className: "bg-purple-100 text-purple-700" },
  owner: { label: "Chủ nhà hàng", className: "bg-blue-100 text-blue-700" },
  manager: { label: "Quản lý", className: "bg-indigo-100 text-indigo-700" },
  staff: { label: "Nhân viên", className: "bg-teal-100 text-teal-700" },
  user: { label: "Khách hàng", className: "bg-gray-100 text-gray-700" },
};

const ROLE_OPTIONS = ["admin", "owner", "manager", "staff", "user"];

const AccountFormModal = ({ account, onClose, onSaved }) => {
  const isEdit = !!account;
  const [form, setForm] = useState({
    name: account?.name || "",
    email: account?.email || "",
    phonenumber: account?.phonenumber || "",
    role: account?.role?.[0] || "user",
    password: "",
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim() || form.name.trim().length < 2) errs.name = "Tên ít nhất 2 ký tự";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Email không hợp lệ";
    if (!form.phonenumber.trim() || !/^\d{10,11}$/.test(form.phonenumber)) errs.phonenumber = "Số điện thoại 10-11 chữ số";
    if (!isEdit && (!form.password || form.password.length < 8)) errs.password = "Mật khẩu ít nhất 8 ký tự";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSaving(true);
    try {
      const payload = { name: form.name, email: form.email, phonenumber: form.phonenumber, role: form.role };
      if (!isEdit) payload.password = form.password;
      if (isEdit) {
        await updateAccount(account._id, payload);
        toast.success("Cập nhật tài khoản thành công!");
      } else {
        await createAccount(payload);
        toast.success("Tạo tài khoản thành công!");
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err?.message || (isEdit ? "Cập nhật thất bại!" : "Tạo tài khoản thất bại!"));
    } finally {
      setSaving(false);
    }
  };

  const field = (label, key, type = "text", placeholder = "") => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition ${
          errors[key] ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus:border-[#fc6011]"
        }`}
      />
      {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-bold text-gray-800">{isEdit ? "Chỉnh sửa tài khoản" : "Thêm tài khoản"}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition">
            <FiX size={20} className="text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {field("Họ và tên", "name", "text", "Nhập tên...")}
          {field("Email", "email", "email", "Nhập email...")}
          {field("Số điện thoại", "phonenumber", "text", "Nhập số điện thoại...")}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
            <select
              value={form.role}
              onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-[#fc6011] transition"
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>{ROLE_CONFIG[r]?.label || r}</option>
              ))}
            </select>
          </div>

          {!isEdit && field("Mật khẩu", "password", "password", "Ít nhất 8 ký tự...")}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-[#fc6011] text-white text-sm font-semibold hover:bg-[#e55010] transition disabled:opacity-60"
            >
              {saving ? "Đang lưu..." : isEdit ? "Lưu" : "Tạo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminAccountsPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modal, setModal] = useState(null);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await getAllAccounts();
      const data = Array.isArray(res) ? res : res?.data || res?.accounts || [];
      setAccounts(data);
    } catch {
      toast.error("Không thể tải danh sách tài khoản!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const filtered = accounts.filter((a) => {
    const q = searchQuery.toLowerCase();
    return (
      (a.name || "").toLowerCase().includes(q) ||
      (a.email || "").toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <ThreeDots visible height="80" width="80" color="#fc6011" radius="9" ariaLabel="loading" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Heading title="Quản lý tài khoản" description="" keywords="" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tài khoản</h1>
          <p className="text-sm text-gray-500 mt-0.5">Quản lý tài khoản người dùng trong hệ thống</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 flex-1 sm:w-64 shadow-sm">
            <FiSearch className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Tìm tên hoặc email..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")}>
                <FiX className="text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
          <button
            onClick={() => setModal({ account: null })}
            className="flex items-center gap-2 px-4 py-2 bg-[#fc6011] text-white rounded-xl text-sm font-semibold hover:bg-[#e55010] transition shadow-sm whitespace-nowrap"
          >
            <FiPlus size={16} />
            Thêm
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 font-semibold text-left">
                <th className="px-5 py-3">Người dùng</th>
                <th className="px-5 py-3 hidden md:table-cell">Email</th>
                <th className="px-5 py-3 hidden sm:table-cell">Số điện thoại</th>
                <th className="px-5 py-3">Vai trò</th>
                <th className="px-5 py-3 hidden md:table-cell">Ngày tạo</th>
                <th className="px-5 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-gray-400">
                    Không tìm thấy tài khoản nào.
                  </td>
                </tr>
              ) : (
                paginated.map((account) => {
                  const roles = Array.isArray(account.role) ? account.role : [account.role].filter(Boolean);
                  const primaryRole = roles[0] || "user";
                  const roleInfo = ROLE_CONFIG[primaryRole] || { label: primaryRole, className: "bg-gray-100 text-gray-700" };
                  const hasAvatar = account.avatar?.url;
                  return (
                    <tr key={account._id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-9 h-9 flex-shrink-0">
                            {hasAvatar ? (
                              <Image src={account.avatar.url} alt={account.name} fill className="rounded-full object-cover" />
                            ) : (
                              <div className="w-full h-full rounded-full bg-orange-100 text-[#fc6011] font-bold flex items-center justify-center text-sm">
                                {(account.name || "?").charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <span className="font-medium text-gray-800 line-clamp-1">{account.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 hidden md:table-cell text-gray-500">{account.email}</td>
                      <td className="px-5 py-3 hidden sm:table-cell text-gray-500">{account.phonenumber || "—"}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${roleInfo.className}`}>
                          {roleInfo.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 hidden md:table-cell text-gray-500">
                        {account.createdAt ? new Date(account.createdAt).toLocaleDateString("vi-VN") : "—"}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-center">
                          <button
                            title="Chỉnh sửa"
                            onClick={() => setModal({ account })}
                            className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition"
                          >
                            <FiEdit2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-5">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
          >
            Trước
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                currentPage === page
                  ? "bg-[#fc6011] text-white"
                  : "border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
          >
            Sau
          </button>
        </div>
      )}

      {/* Modal */}
      {modal !== null && (
        <AccountFormModal
          account={modal.account}
          onClose={() => setModal(null)}
          onSaved={fetchAccounts}
        />
      )}
    </div>
  );
};

export default AdminAccountsPage;
