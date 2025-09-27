"use client";
import React, { useEffect, useState } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Box, IconButton, Tooltip } from "@mui/material";
import Swal from "sweetalert2";
import localStorageService from "@/utils/localStorageService";
import { addVoucher, deleteVoucher, getAllVoucher, toggleVoucherActive, updateVoucher } from "@/service/voucher";
import VoucherModal from "@/components/popups/Voucher";
import { viVN } from "@/utils/constants";
import { FaPlus } from "react-icons/fa";

const VoucherPage = () => {
  const [vouchers, setVouchers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [storeId] = useState(localStorageService.getStoreId());
  const [voucherBeingEdited, setVoucherBeingEdited] = useState(null);
  const [viewOnly, setViewOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

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

  const rows = vouchers.map((voucher) => ({
    id: voucher?._id, // cần id cho DataGrid
    _id: voucher?._id,
    code: voucher?.code,
    discountType: voucher?.discountType,
    discountValue: voucher?.discountValue,
    usageLimit: voucher?.usageLimit,
    usedCount: voucher?.usedCount,
    isActive: voucher?.isActive,
  }));

  // define columns
  const columns = [
    {
      field: "code",
      headerName: "Mã giảm giá",
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => <span className='text-blue-600'>{params.value}</span>,
    },
    {
      field: "discountType",
      headerName: "Loại giảm",
      headerAlign: "center",
      align: "center",
      width: 140,
      renderCell: (params) => <span>{params.row?.discountType === "PERCENTAGE" ? "Phần trăm" : "Tiền mặt"}</span>,
    },
    {
      field: "discountValue",
      headerName: "Giá trị",
      width: 140,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const row = params.row;
        if (!row) return null;
        return (
          <span>
            {row.discountType === "PERCENTAGE" ? `${row.discountValue}%` : `${row.discountValue?.toLocaleString()} đ`}
          </span>
        );
      },
    },
    {
      field: "usageLimit",
      headerName: "Số lượng",
      headerAlign: "center",
      align: "center",
      width: 140,
    },
    { field: "usedCount", headerName: "Đã dùng", headerAlign: "center", align: "center", width: 140 },
    {
      field: "isActive",
      headerName: "Trạng thái",
      headerAlign: "center",
      align: "center",
      width: 140,
      renderCell: (params) => (
        <span
          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold cursor-pointer ${
            params.value ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"
          }`}
          onClick={() => handleToggleActive(params.row?._id)}
        >
          {params.value ? "Hoạt động" : "Ngưng"}
        </span>
      ),
    },
    {
      field: "actions",
      headerName: "Hành động",
      sortable: false,
      filterable: false,
      headerAlign: "center",
      align: "center",
      width: 150,
      renderCell: (params) => (
        <div className='flex justify-center items-center space-x-1 w-full h-full'>
          <Tooltip title='Xem chi tiết' PopperProps={{ strategy: "fixed" }}>
            <IconButton
              size='small'
              color='primary'
              sx={{
                width: 30,
                height: 30,
                fontSize: "16px",
              }}
              onClick={() => {
                setSelectedId(params.row._id);
                setShowForm(true);
                setViewOnly(true);
                handleViewVoucher(params.row);
              }}
            >
              👁️
            </IconButton>
          </Tooltip>

          <Tooltip title='Chỉnh sửa' PopperProps={{ strategy: "fixed" }}>
            <IconButton
              size='small'
              color='info'
              sx={{
                width: 30,
                height: 30,
                fontSize: "16px",
              }}
              onClick={() => {
                setSelectedId(params.row._id);
                setShowForm(true);
                setViewOnly(false);
                handleEditVoucher(params.row);
              }}
            >
              ✏️
            </IconButton>
          </Tooltip>

          <Tooltip title='Xoá' PopperProps={{ strategy: "fixed" }}>
            <IconButton
              size='small'
              color='error'
              sx={{
                width: 30,
                height: 30,
                fontSize: "16px",
              }}
              onClick={() => handleDeleteVoucher(params.row?._id)}
            >
              🗑️
            </IconButton>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className='flex justify-between gap-2 border-b pb-2 mb-2'>
        <span className='font-semibold text-[20px] color-[#4a4b4d]'>Voucher</span>
        <div className='flex gap-3 mt-2 md:mt-0 justify-end'>
          <button
            onClick={() => setShowForm(true)}
            className='px-4 py-2 flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-500 text-white font-semibold transition'
          >
            <FaPlus className='text-lg' />
            <span>Thêm</span>
          </button>
        </div>
      </div>
      <Box sx={{ height: 525, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row?._id}
          components={{ Toolbar: GridToolbar }}
          pagination
          pageSizeOptions={[]}
          initialState={{
            pagination: { paginationModel: { pageSize: 8 } },
          }}
          loading={loading}
          disableRowSelectionOnClick
          localeText={viVN}
        />
      </Box>

      {showForm && (
        <VoucherModal
          open={showForm}
          onClose={() => {
            setShowForm(false);
            setVoucherBeingEdited(null);
            setViewOnly(false);
          }}
          onSubmit={voucherBeingEdited ? handleUpdateVoucher : handleCreateVoucher}
          voucherId={selectedId}
          storeId={storeId}
          isUpdate={!!voucherBeingEdited}
          readOnly={viewOnly}
        />
      )}
    </>
  );
};

export default VoucherPage;
