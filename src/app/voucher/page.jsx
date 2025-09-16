"use client";
import Header from "@/components/Header";
import React, { useEffect, useState } from "react";
import localStorageService from "@/utils/localStorageService";
import {
  addVoucher,
  deleteVoucher,
  getAllVoucher,
  toggleVoucherActive,
  updateVoucher,
} from "@/service/voucher";
import VoucherModal from "@/components/popups/Voucher";
import FloatingButton from "@/components/fragment/FloatingButton";
import Swal from "sweetalert2";
const page = () => {
  const [vouchers, setVouchers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [storeId, setStoreId] = useState(localStorageService.getStoreId());
  const [voucherBeingEdited, setVoucherBeingEdited] = useState(null);
  const [viewOnly, setViewOnly] = useState(false);

  useEffect(() => {
    const fetchVouchers = async () => {
      const res = await getAllVoucher(storeId);
      if (res.status === "success") {
        console.log("Success: ", res.data);
        setVouchers(res.data);
      } else {
        console.error("Lỗi khi lấy voucher:", res.message);
      }
    };

    fetchVouchers();
  }, [storeId]);

  const handleCreateVoucher = async (data) => {
    try {
      await addVoucher(storeId, data); // gọi API thêm mới
      setShowForm(false); // đóng modal
      const res = await getAllVoucher(storeId); // refresh lại danh sách
      if (res.status === "success") {
        setVouchers(res.data);
      }
    } catch (err) {
      alert(err.message || "Lỗi khi tạo voucher");
    }
  };

  const handleEditVoucher = (voucher) => {
    console.log("Voucher: ", voucher);
    setVoucherBeingEdited(voucher); // lưu data để đổ vào form
    setShowForm(true);
  };

  const handleUpdateVoucher = async (data) => {
    try {
      console.log("Voucher edit: ", voucherBeingEdited);
      await updateVoucher(storeId, voucherBeingEdited._id, data);
      setShowForm(false);
      setVoucherBeingEdited(null);
      const res = await getAllVoucher(storeId);
      if (res.status === "success") {
        setVouchers(res.data);
      }
    } catch (err) {
      alert(err.message || "Lỗi khi cập nhật voucher");
    }
  };

  const handleViewVoucher = (voucher) => {
    setVoucherBeingEdited(voucher);
    setShowForm(true);
    setViewOnly(true);
  };

  const handleDeleteVoucher = async (voucherId) => {
    const result = await Swal.fire({
      title: "Bạn có chắc chắn?",
      text: "Voucher này sẽ bị xóa vĩnh viễn.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        await deleteVoucher(storeId, voucherId); // gọi API xoá
        Swal.fire("Đã xóa!", "Voucher đã được xóa.", "success");

        const res = await getAllVoucher(storeId); // refresh danh sách
        if (res.status === "success") {
          setVouchers(res.data);
        }
      } catch (err) {
        Swal.fire("Lỗi!", err.message || "Xóa voucher thất bại", "error");
      }
    }
  };

  const handleToggleActive = async (voucherId) => {
    try {
      const res = await toggleVoucherActive(storeId, voucherId);
      if (res.status === "success") {
        const updatedList = await getAllVoucher(storeId);
        setVouchers(updatedList.data);
      } else {
        alert(res.message || "Lỗi khi toggle trạng thái");
      }
    } catch (err) {
      alert("Có lỗi xảy ra khi cập nhật trạng thái.");
    }
  };

  return (
    <>
      <Header title="Vouchers" goBack={true} />
      <FloatingButton onClick={() => setShowForm(true)} />
      <div className="pt-[70px] pb-[10px] bg-gray-100">
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 rounded-lg border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-sm font-medium text-gray-700"
                >
                  Mã giảm giá
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-sm font-medium text-gray-700"
                >
                  Loại giảm
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-sm font-medium text-gray-700"
                >
                  Giá trị
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-sm font-medium text-gray-700"
                >
                  Số lượng
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-sm font-medium text-gray-700"
                >
                  Đã dùng
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-sm font-medium text-gray-700"
                >
                  Trạng thái
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-sm font-medium text-gray-700"
                >
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white text-sm text-gray-800">
              {vouchers.map((voucher) => (
                <tr key={voucher._id}>
                  <td
                    onClick={() => handleViewVoucher(voucher)}
                    className="px-6 py-4 cursor-pointer"
                  >
                    {voucher.code}
                  </td>
                  <td className="px-6 py-4">
                    {voucher.discountType === "percentage"
                      ? "Phần trăm"
                      : "Tiền mặt"}
                  </td>
                  <td className="px-6 py-4">
                    {voucher.discountType === "percentage"
                      ? `${voucher.discountValue}%`
                      : `${voucher.discountValue.toLocaleString()} đ`}
                  </td>
                  <td className="px-6 py-4">
                    {voucher.usageLimit ?? "Không giới hạn"}
                  </td>
                  <td className="px-6 py-4">{voucher.usedCount}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                        voucher.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {voucher.isActive ? "Hoạt động" : "Ngưng"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-8">
                      <button
                        onClick={() => handleEditVoucher(voucher)}
                        className="text-blue-600 hover:underline"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteVoucher(voucher._id)}
                        className="text-red-600 hover:underline"
                      >
                        Xóa
                      </button>
                      <button
                        onClick={() => handleToggleActive(voucher._id)}
                        className={`hover:underline ${
                          voucher.isActive
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      >
                        {voucher.isActive ? "Ngưng" : "Kích hoạt"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showForm && (
        <VoucherModal
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setVoucherBeingEdited(null);
            setViewOnly(false);
          }}
          onSubmit={
            voucherBeingEdited ? handleUpdateVoucher : handleCreateVoucher
          }
          initialData={voucherBeingEdited}
          isUpdate={!!voucherBeingEdited}
          readOnly={viewOnly}
        />
      )}
    </>
  );
};

export default page;
