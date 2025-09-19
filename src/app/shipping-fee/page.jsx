"use client";

import React, { useEffect, useState } from "react";
import localStorageService from "@/utils/localStorageService";

import FloatingButton from "@/components/fragment/FloatingButton";
import Swal from "sweetalert2";
import { addShipingFee, deleteShippingFee, getAllShippingFee, updateShippingFee } from "@/service/shippingFee";
import { toast } from "react-toastify";
import ShippingFeeModal from "@/components/popups/ShippingFee";

import { DataGrid, GridToolbar } from "@mui/x-data-grid";

const viVN = {
  toolbarColumns: "Cột",
  toolbarFilters: "Bộ lọc",
  toolbarDensity: "Mật độ",
  toolbarExport: "Xuất",
  noRowsLabel: "Không có dữ liệu",
  MuiTablePagination: {
    labelRowsPerPage: "Số hàng mỗi trang:",
    labelDisplayedRows: ({ from, to, count }) => `${from}–${to} trên ${count !== -1 ? count : `nhiều hơn ${to}`}`,
  },
};

const Page = () => {
  const [fees, setFees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [storeId, setStoreId] = useState(localStorageService.getStoreId());
  const [feeBeingEdited, setFeeBeingEdited] = useState(null);
  const [viewOnly, setViewOnly] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchShippingFee = async () => {
    try {
      setLoading(true);
      const res = await getAllShippingFee(storeId);
      if (res.status === "success") {
        setFees(res.data);
      } else {
        toast.error("Lỗi khi lấy shipping fee:", res.message);
      }
      setLoading(false);
    } catch (error) {
      toast.error("Không thể kết nối đến server.");
    }
  };

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
    } catch {
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
    } catch {
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
        const res = await deleteShippingFee(storeId, shippingFeeId);
        if (res.status === "success") {
          Swal.fire("Đã xóa!", "Mức giá đã được xóa.", "success");
          fetchShippingFee();
        }
      } catch (err) {
        Swal.fire("Lỗi!", err.message || "Xóa mức giá thất bại", "error");
      }
    }
  };

  const rows = fees.map((fee, index) => ({
    id: fee._id,
    fromDistance: fee.fromDistance,
    feePerKm: fee.feePerKm,
  }));

  const columns = [
    { field: "fromDistance", headerName: "Mốc khoảng cách (km)", width: 200 },
    {
      field: "feePerKm",
      headerName: "Mức giá",
      width: 200,
      valueFormatter: (params) => {
        const value = Number(params.value) || 0;
        return new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
          maximumFractionDigits: 0,
        }).format(value);
      },
    },
    {
      field: "actions",
      headerName: "Hành động",
      width: 200,
      renderCell: (params) => (
        <div className='flex gap-4'>
          <button
            className='text-blue-600 hover:underline'
            onClick={() => handleEditShippingFee(fees.find((f) => f._id === params.row.id))}
          >
            Sửa
          </button>
          <button className='text-red-600 hover:underline' onClick={() => handleDeleteShippingFee(params.row.id)}>
            Xóa
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <FloatingButton onClick={() => setShowForm(true)} />

      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[5, 10, 20]}
        autoHeight
        disableSelectionOnClick
        components={{ Toolbar: GridToolbar }}
        loading={loading}
        localeText={viVN}
      />

      {showForm && (
        <ShippingFeeModal
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setFeeBeingEdited(null);
            setViewOnly(false);
          }}
          onSubmit={feeBeingEdited ? handleUpdateShippingFee : handleCreateShippingFee}
          initialData={feeBeingEdited}
          isUpdate={!!feeBeingEdited}
          readOnly={viewOnly}
        />
      )}
    </>
  );
};

export default Page;
