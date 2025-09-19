"use client";
import React, { useEffect, useState } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Button } from "@mui/material";
import Swal from "sweetalert2";
import localStorageService from "@/utils/localStorageService";
import { addVoucher, deleteVoucher, getAllVoucher, toggleVoucherActive, updateVoucher } from "@/service/voucher";
import VoucherModal from "@/components/popups/Voucher";
import FloatingButton from "@/components/fragment/FloatingButton";
import { viVN } from "@/utils/constants";

const VoucherPage = () => {
  const [vouchers, setVouchers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [storeId] = useState(localStorageService.getStoreId());
  const [voucherBeingEdited, setVoucherBeingEdited] = useState(null);
  const [viewOnly, setViewOnly] = useState(false);
  const [loading, setLoading] = useState(false);

  // load data
  const fetchVouchers = async () => {
    setLoading(true);
    const res = await getAllVoucher(storeId);
    if (res.status === "success") {
      setVouchers(res.data);
    } else {
      console.error("Lỗi khi lấy voucher:", res.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVouchers();
  }, [storeId]);

  const handleCreateVoucher = async (data) => {
    try {
      await addVoucher(storeId, data);
      setShowForm(false);
      fetchVouchers();
    } catch (err) {
      alert(err.message || "Lỗi khi tạo voucher");
    }
  };

  const handleEditVoucher = (voucher) => {
    setVoucherBeingEdited(voucher);
    setShowForm(true);
    setViewOnly(false);
  };

  const handleUpdateVoucher = async (data) => {
    try {
      await updateVoucher(storeId, voucherBeingEdited._id, data);
      setShowForm(false);
      setVoucherBeingEdited(null);
      fetchVouchers();
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
        await deleteVoucher(storeId, voucherId);
        Swal.fire("Đã xóa!", "Voucher đã được xóa.", "success");
        fetchVouchers();
      } catch (err) {
        Swal.fire("Lỗi!", err.message || "Xóa voucher thất bại", "error");
      }
    }
  };

  const handleToggleActive = async (voucherId) => {
    try {
      const res = await toggleVoucherActive(storeId, voucherId);
      if (res.status === "success") {
        fetchVouchers();
      } else {
        alert(res.message || "Lỗi khi toggle trạng thái");
      }
    } catch (err) {
      alert("Có lỗi xảy ra khi cập nhật trạng thái.");
    }
  };

  // define columns
  const columns = [
    {
      field: "code",
      headerName: "Mã giảm giá",
      flex: 1,
      renderCell: (params) => (
        <span onClick={() => handleViewVoucher(params.row)} className='cursor-pointer text-blue-600 hover:underline'>
          {params.value}
        </span>
      ),
    },
    {
      field: "discountType",
      headerName: "Loại giảm",
      flex: 1,
      valueGetter: (params) => (params.row?.discountType === "percentage" ? "Phần trăm" : "Tiền mặt"),
    },
    {
      field: "discountValue",
      headerName: "Giá trị",
      flex: 1,
      valueGetter: (params) =>
        params.row?.discountType === "percentage"
          ? `${params.row?.discountValue}%`
          : `${params.row?.discountValue?.toLocaleString()} đ`,
    },
    {
      field: "usageLimit",
      headerName: "Số lượng",
      flex: 1,
      valueGetter: (params) => params.row?.usageLimit ?? "Không giới hạn",
    },
    { field: "usedCount", headerName: "Đã dùng", flex: 1 },
    {
      field: "isActive",
      headerName: "Trạng thái",
      flex: 1,
      renderCell: (params) => (
        <span
          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
            params.value ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"
          }`}
        >
          {params.value ? "Hoạt động" : "Ngưng"}
        </span>
      ),
    },
    {
      field: "actions",
      headerName: "Hành động",
      flex: 1.5,
      sortable: false,
      renderCell: (params) => (
        <div className='flex gap-3'>
          <Button size='small' onClick={() => handleEditVoucher(params.row)}>
            Sửa
          </Button>
          <Button size='small' color='error' onClick={() => handleDeleteVoucher(params.row?._id)}>
            Xóa
          </Button>
          <Button
            size='small'
            color={params.row?.isActive ? "warning" : "success"}
            onClick={() => handleToggleActive(params.row?._id)}
          >
            {params.row?.isActive ? "Ngưng" : "Kích hoạt"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <FloatingButton onClick={() => setShowForm(true)} />
      <DataGrid
        rows={vouchers}
        columns={columns}
        getRowId={(row) => row?._id}
        pageSize={10}
        rowsPerPageOptions={[5, 10, 20]}
        disableSelectionOnClick
        components={{ Toolbar: GridToolbar }}
        loading={loading}
        localeText={viVN}
      />

      {showForm && (
        <VoucherModal
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setVoucherBeingEdited(null);
            setViewOnly(false);
          }}
          onSubmit={voucherBeingEdited ? handleUpdateVoucher : handleCreateVoucher}
          initialData={voucherBeingEdited}
          isUpdate={!!voucherBeingEdited}
          readOnly={viewOnly}
        />
      )}
    </>
  );
};

export default VoucherPage;
