"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { getAllAdminStores, getAdminStoreById, approveStore, suspendStore } from "@/service/adminStore";
import Heading from "@/components/Heading";
import { FiSearch, FiX, FiCheck, FiSlash, FiRotateCcw, FiEye } from "react-icons/fi";
import { ThreeDots } from "react-loader-spinner";

const ITEMS_PER_PAGE = 6;

const STATUS_CONFIG = {
  APPROVED: { label: "Đã duyệt", className: "bg-green-100 text-green-700" },
  PENDING: { label: "Chờ duyệt", className: "bg-yellow-100 text-yellow-700" },
  BLOCKED: { label: "Tạm khóa", className: "bg-red-100 text-red-700" },
};

const StoreDetailModal = ({ store, onClose }) => {
  if (!store) return null;
  const status = STATUS_CONFIG[store.status] || { label: store.status, className: "bg-gray-100 text-gray-700" };
  const hasAvatar = store.avatar?.url;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-bold text-gray-800">Chi tiết cửa hàng</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition">
            <FiX size={20} className="text-gray-600" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Cover image */}
          {store.coverImage?.url && (
            <div className="relative w-full h-36 rounded-xl overflow-hidden">
              <Image src={store.coverImage.url} alt="cover" fill className="object-cover" />
            </div>
          )}

          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 flex-shrink-0">
              {hasAvatar ? (
                <Image src={store.avatar.url} alt={store.name} fill className="rounded-full object-cover" />
              ) : (
                <div className="w-full h-full rounded-full bg-orange-100 text-[#fc6011] font-bold flex items-center justify-center text-2xl">
                  {(store.name || "?").charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <p className="font-bold text-gray-800 text-lg">{store.name}</p>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status.className}`}>
                {status.label}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 text-sm">
            <div>
              <span className="text-gray-500 font-medium">Địa chỉ:</span>
              <p className="text-gray-700 mt-0.5">{getAddressString(store.address) || "—"}</p>
            </div>
            {store.phone && (
              <div>
                <span className="text-gray-500 font-medium">Số điện thoại:</span>
                <p className="text-gray-700 mt-0.5">{store.phone}</p>
              </div>
            )}
            {store.email && (
              <div>
                <span className="text-gray-500 font-medium">Email:</span>
                <p className="text-gray-700 mt-0.5">{store.email}</p>
              </div>
            )}
            <div>
              <span className="text-gray-500 font-medium">Ngày đăng ký:</span>
              <p className="text-gray-700 mt-0.5">
                {store.createdAt ? new Date(store.createdAt).toLocaleDateString("vi-VN") : "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

const getAddressString = (address) => {
  if (!address) return "";
  if (typeof address === "string") return address;
  return address.full_address || "";
};

const AdminStoresPage = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStore, setSelectedStore] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const res = await getAllAdminStores();
      const data = Array.isArray(res) ? res : res?.data || res?.stores || [];
      setStores(data);
    } catch {
      toast.error("Không thể tải danh sách cửa hàng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleViewDetail = async (store) => {
    setLoadingDetail(true);
    try {
      const res = await getAdminStoreById(store._id);
      setSelectedStore(res?.data || res || store);
    } catch {
      setSelectedStore(store);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleApprove = async (store) => {
    const result = await Swal.fire({
      title: `Duyệt cửa hàng "${store.name}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#16a34a",
    });
    if (!result.isConfirmed) return;
    setActionLoading(store._id);
    try {
      await approveStore(store._id);
      toast.success("Đã duyệt cửa hàng!");
      fetchStores();
    } catch {
      toast.error("Duyệt cửa hàng thất bại!");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = async (store) => {
    const result = await Swal.fire({
      title: `Tạm khóa cửa hàng "${store.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#dc2626",
    });
    if (!result.isConfirmed) return;
    setActionLoading(store._id);
    try {
      await suspendStore(store._id);
      toast.success("Đã tạm khóa cửa hàng!");
      fetchStores();
    } catch {
      toast.error("Tạm khóa cửa hàng thất bại!");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestore = async (store) => {
    const result = await Swal.fire({
      title: `Khôi phục cửa hàng "${store.name}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#2563eb",
    });
    if (!result.isConfirmed) return;
    setActionLoading(store._id);
    try {
      await approveStore(store._id);
      toast.success("Đã khôi phục cửa hàng!");
      fetchStores();
    } catch {
      toast.error("Khôi phục cửa hàng thất bại!");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = stores.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (s.name || "").toLowerCase().includes(q) || getAddressString(s.address).toLowerCase().includes(q);
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
      <Heading title="Quản lý cửa hàng" description="" keywords="" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Cửa hàng</h1>
          <p className="text-sm text-gray-500 mt-0.5">Quản lý tất cả cửa hàng đăng ký trên hệ thống</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 w-full sm:w-72 shadow-sm">
          <FiSearch className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc địa chỉ..."
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
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 font-semibold text-left">
                <th className="px-5 py-3">Cửa hàng</th>
                <th className="px-5 py-3 hidden md:table-cell">Địa chỉ</th>
                <th className="px-5 py-3">Trạng thái</th>
                <th className="px-5 py-3 hidden sm:table-cell">Ngày tạo</th>
                <th className="px-5 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-gray-400">
                    Không tìm thấy cửa hàng nào.
                  </td>
                </tr>
              ) : (
                paginated.map((store) => {
                  const status = STATUS_CONFIG[store.status] || { label: store.status, className: "bg-gray-100 text-gray-700" };
                  const hasAvatar = store.avatar?.url;
                  const isActing = actionLoading === store._id;
                  return (
                    <tr key={store._id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 flex-shrink-0">
                            {hasAvatar ? (
                              <Image src={store.avatar.url} alt={store.name} fill className="rounded-full object-cover" />
                            ) : (
                              <div className="w-full h-full rounded-full bg-orange-100 text-[#fc6011] font-bold flex items-center justify-center">
                                {(store.name || "?").charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <span className="font-medium text-gray-800 line-clamp-1">{store.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 hidden md:table-cell text-gray-500 max-w-[200px]">
                        <span className="line-clamp-1">{getAddressString(store.address) || "—"}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 hidden sm:table-cell text-gray-500">
                        {store.createdAt ? new Date(store.createdAt).toLocaleDateString("vi-VN") : "—"}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            title="Xem chi tiết"
                            disabled={loadingDetail}
                            onClick={() => handleViewDetail(store)}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition disabled:opacity-50"
                          >
                            <FiEye size={16} />
                          </button>
                          {store.status === "PENDING" && (
                            <button
                              title="Duyệt"
                              disabled={isActing}
                              onClick={() => handleApprove(store)}
                              className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition disabled:opacity-50"
                            >
                              <FiCheck size={16} />
                            </button>
                          )}
                          {store.status === "APPROVED" && (
                            <button
                              title="Tạm khóa"
                              disabled={isActing}
                              onClick={() => handleSuspend(store)}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition disabled:opacity-50"
                            >
                              <FiSlash size={16} />
                            </button>
                          )}
                          {store.status === "BLOCKED" && (
                            <button
                              title="Khôi phục"
                              disabled={isActing}
                              onClick={() => handleRestore(store)}
                              className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition disabled:opacity-50"
                            >
                              <FiRotateCcw size={16} />
                            </button>
                          )}
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

      {/* Detail modal */}
      {selectedStore && <StoreDetailModal store={selectedStore} onClose={() => setSelectedStore(null)} />}
    </div>
  );
};

export default AdminStoresPage;
