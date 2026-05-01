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
import Heading from "@/components/Heading";
import { useTranslation } from "react-i18next";

const VoucherPage = () => {
  const { t } = useTranslation();
  const [vouchers, setVouchers] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const storeData = typeof window !== "undefined" && localStorage.getItem("store");
  const storeId = storeData ? JSON.parse(storeData)?._id : "";

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
      title: t("common.are_you_sure"),
      text: t("voucher.delete_confirm"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: t("common.delete"),
      cancelButtonText: t("common.cancel"),
    });

    if (result.isConfirmed) {
      try {
        await deleteVoucher(storeId, voucherId);
        Swal.fire(t("common.deleted"), t("voucher.deleted_msg"), "success");
        fetchVouchers();
      } catch (err) {
        Swal.fire(t("common.error"), err.message || t("common.error"), "error");
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
      headerName: t("voucher.code"),
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => <span className='text-blue-600'>{params.value}</span>,
    },
    {
      field: "discountType",
      headerName: t("voucher.discount_type"),
      headerAlign: "center",
      align: "center",
      width: 140,
      renderCell: (params) => (
        <span>{params.row?.discountType === "PERCENTAGE" ? t("voucher.percentage") : t("voucher.cash")}</span>
      ),
    },
    {
      field: "discountValue",
      headerName: t("voucher.value"),
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
      headerName: t("voucher.usage_limit"),
      headerAlign: "center",
      align: "center",
      width: 140,
    },
    { field: "usedCount", headerName: t("voucher.used_count"), headerAlign: "center", align: "center", width: 140 },
    {
      field: "isActive",
      headerName: t("common.status"),
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
          {params.value ? t("voucher.active") : t("voucher.inactive")}
        </span>
      ),
    },
    {
      field: "actions",
      headerName: t("common.actions"),
      sortable: false,
      filterable: false,
      headerAlign: "center",
      align: "center",
      width: 150,
      renderCell: (params) => (
        <div className='flex justify-center items-center space-x-1 w-full h-full'>
          <IconButton
            data-tooltip-id='dish-tooltip'
            data-tooltip-content={t("common.view_detail")}
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

          <IconButton
            data-tooltip-id='dish-tooltip'
            data-tooltip-content={t("common.edit")}
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

          <IconButton
            data-tooltip-id='dish-tooltip'
            data-tooltip-content={t("common.delete")}
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
        </div>
      ),
    },
  ];

  return (
    <div className='page-shell'>
      <Heading title={t("voucher.title")} description='' keywords='' />
      <div className='flex justify-between gap-2 border-b pb-2 mb-2'>
        <span className='text-xl font-semibold text-[#4a4b4d]'>{t("voucher.title")}</span>
        <div className='flex gap-3 mt-2 md:mt-0 justify-end'>
          <button
            onClick={() => setShowForm(true)}
            className='px-4 py-2 flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-500 text-white font-semibold transition'
          >
            <FaPlus className='text-lg' />
            <span>{t("common.add")}</span>
          </button>
        </div>
      </div>
      <Box className='responsive-grid-table' sx={{ height: { xs: 480, md: 525 }, width: "100%" }}>
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
    </div>
  );
};

export default VoucherPage;
