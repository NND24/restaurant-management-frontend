"use client";
import Header from "@/components/Header";
import React, { useEffect, useState } from "react";
import localStorageService from "@/utils/localStorageService";

import FloatingButton from "@/components/fragment/FloatingButton";
import Swal from "sweetalert2";
import {
  addShipingFee,
  deleteShippingFee,
  getAllShippingFee,
  updateShippingFee,
} from "@/service/shippingFee";
import { toast } from "react-toastify";
import ShippingFeeModal from "@/components/popups/ShippingFee";
const page = () => {
  const [fees, setFees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [storeId, setStoreId] = useState(localStorageService.getStoreId());
  const [feeBeingEdited, setFeeBeingEdited] = useState(null);
  const [viewOnly, setViewOnly] = useState(false);

  const fetchShippingFee = async () => {
    try {
      const res = await getAllShippingFee(storeId);
      if (res.status === "success") {
        setFees(res.data);
      } else {
        toast.error("Lỗi khi lấy shipping fee:", res.message);
      }
    } catch (error) {
      toast.error("Không thể kết nối đến server.");
    }
  };

  // Gọi trong useEffect
  useEffect(() => {
    if (storeId) fetchShippingFee();
  }, [storeId]);

  const handleCreateShippingFee = async (data) => {
    try {
      const res = await addShipingFee(storeId, data);
      if (res && res.status === "success") {
        await fetchShippingFee();
        setShowForm(false);
        toast.success("Thêm mức giá vận chuyển thành công");
      } else {
        toast.error(res.message || "Lỗi khi tạo mức giá");
      }
    } catch (err) {
      toast.error("Lỗi khi tạo mức giá");
    }
  };

  const handleEditShippingFee = (fee) => {
    setFeeBeingEdited(fee);
    setShowForm(true);
    setViewOnly(false);
  };

  const handleUpdateShippingFee = async (data) => {
    try {
      const res = await updateShippingFee(storeId, feeBeingEdited._id, data);
      if (res && res.status === "success") {
        await fetchShippingFee();
        setShowForm(false);
        setFeeBeingEdited(null);
        toast.success("Cập nhật mức giá thành công");
      } else {
        toast.error(res.message || "Lỗi khi cập nhật mức giá");
      }
    } catch (err) {
      toast.error("Lỗi khi cập nhật mức giá");
    }
  };

  const handleDeleteShippingFee = async (shippingFeeId) => {
    const result = await Swal.fire({
      title: "Bạn có chắc chắn?",
      text: "Mức vận chuyển này sẽ bị xóa vĩnh viễn.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        const res = await deleteShippingFee(storeId, shippingFeeId); // gọi API xoá

        if (res.status === "success") {
          Swal.fire("Đã xóa!", "Mức giá đã được xóa.", "success");

          fetchShippingFee(); // refresh danh sách
        }
      } catch (err) {
        Swal.fire("Lỗi!", err.message || "Xóa mức giá thất bại", "error");
      }
    }
  };

  return (
    <>
      <Header title="Giá giao hàng" goBack={true} />
      <FloatingButton onClick={() => setShowForm(true)} />
      <div className="pt-[70px] pb-[10px] bg-gray-100 mx-[50px]">
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 rounded-lg border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-sm font-medium text-gray-700"
                >
                  Mốc khoảng cách (km)
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-sm font-medium text-gray-700"
                >
                  Mức giá
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
              {fees.map((fee) => (
                <tr key={fee._id}>
                  <td className="px-6 py-4">{fee.fromDistance}</td>
                  <td className="px-6 py-4">
                    {new Intl.NumberFormat("vi-VN").format(fee.feePerKm)} VND
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-8">
                      <button
                        className="text-blue-600 hover:underline"
                        onClick={() => handleEditShippingFee(fee)}
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteShippingFee(fee._id)}
                        className="text-red-600 hover:underline"
                      >
                        Xóa
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
        <ShippingFeeModal
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setFeeBeingEdited(null);
            setViewOnly(false);
          }}
          onSubmit={
            feeBeingEdited ? handleUpdateShippingFee : handleCreateShippingFee
          }
          initialData={feeBeingEdited}
          isUpdate={!!feeBeingEdited}
          readOnly={viewOnly}
        />
      )}
    </>
  );
};

export default page;
