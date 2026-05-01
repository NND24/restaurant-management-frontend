"use client";

import React, { useEffect, useState } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Box, IconButton } from "@mui/material";
import Swal from "sweetalert2";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import localStorageService from "@/utils/localStorageService";

import { addShipingFee, deleteShippingFee, getAllShippingFee, updateShippingFee } from "@/service/shippingFee";

import ShippingFeeModal from "@/components/popups/ShippingFee";
import { viVN } from "@/utils/constants";
import Heading from "@/components/Heading";
import { useTranslation } from "react-i18next";

const ShippingFeePage = () => {
  const { t } = useTranslation();
  const [fees, setFees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const storeData = typeof window !== "undefined" && localStorage.getItem("store");
  const storeId = storeData ? JSON.parse(storeData)?._id : "";
  const [feeBeingEdited, setFeeBeingEdited] = useState(null);
  const [viewOnly, setViewOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // === Load data ===
  const fetchShippingFee = async () => {
    try {
      setLoading(true);
      const res = await getAllShippingFee(storeId);
      if (res.status === "success") {
        setFees(res.data);
      } else {
        toast.error(res.message || t("shipping_fee.load_error"));
      }
      setLoading(false);
    } catch {
      toast.error(t("shipping_fee.connect_error"));
      setLoading(false);
    }
  };

  useEffect(() => {
    if (storeId) fetchShippingFee();
  }, [storeId]);

  // === CRUD ===
  const handleCreateShippingFee = async (data) => {
    try {
      const res = await addShipingFee(storeId, data);
      if (res?.status === "success") {
        toast.success(t("shipping_fee.create_success"));
        setShowForm(false);
        fetchShippingFee();
      } else {
        toast.error(res.message || t("shipping_fee.create_error"));
      }
    } catch {
      toast.error(t("shipping_fee.create_error"));
    }
  };

  const handleUpdateShippingFee = async (data) => {
    try {
      const res = await updateShippingFee(storeId, feeBeingEdited._id, data);
      if (res?.status === "success") {
        toast.success(t("shipping_fee.update_success"));
        setShowForm(false);
        setFeeBeingEdited(null);
        fetchShippingFee();
      } else {
        toast.error(res.message || t("shipping_fee.update_error"));
      }
    } catch {
      toast.error(t("shipping_fee.update_error"));
    }
  };

  const handleDeleteShippingFee = async (shippingFeeId) => {
    const result = await Swal.fire({
      title: t("common.are_you_sure"),
      text: t("shipping_fee.delete_confirm_text"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: t("common.delete"),
      cancelButtonText: t("common.cancel"),
    });

    if (result.isConfirmed) {
      try {
        const res = await deleteShippingFee(storeId, shippingFeeId);
        if (res.status === "success") {
          Swal.fire(t("common.deleted"), t("shipping_fee.delete_success_text"), "success");
          fetchShippingFee();
        }
      } catch (err) {
        Swal.fire(t("common.error"), err.message || t("shipping_fee.delete_error"), "error");
      }
    }
  };

  const handleToggleActive = async (shippingFeeId) => {
    try {
      const res = await toggleShippingFeeActive(storeId, shippingFeeId);
      if (res.status === "success") {
        fetchShippingFee();
      } else {
        toast.error(res.message || t("shipping_fee.toggle_status_error"));
      }
    } catch {
      toast.error(t("common.error_occurred"));
    }
  };

  // === DataGrid mapping ===
  const rows = fees.map((fee) => ({
    id: fee?._id,
    fromDistance: fee?.fromDistance,
    feePerKm: fee?.feePerKm,
    isActive: fee?.isActive,
  }));

  const columns = [
    {
      field: "fromDistance",
      headerName: t("shipping_fee.min_distance"),
      headerAlign: "center",
      align: "center",
      flex: 1,
    },
    {
      field: "feePerKm",
      headerName: t("shipping_fee.fee"),
      headerAlign: "center",
      align: "center",
      flex: 1,
      renderCell: (params) => {
        const row = params.row;
        if (!row) return null;
        return <span>{params.row?.feePerKm ? params.row?.feePerKm.toLocaleString() + "₫" : "0₫"}</span>;
      },
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
            size='small'
            color='primary'
            sx={{ width: 30, height: 30, fontSize: "16px" }}
            onClick={() => {
              setSelectedId(params.row.id);
              setFeeBeingEdited(params.row);
              setViewOnly(true);
              setShowForm(true);
            }}
          >
            👁️
          </IconButton>
          <IconButton
            size='small'
            color='info'
            sx={{ width: 30, height: 30, fontSize: "16px" }}
            onClick={() => {
              setSelectedId(params.row.id);
              setFeeBeingEdited(params.row);
              setViewOnly(false);
              setShowForm(true);
            }}
          >
            ✏️
          </IconButton>
          <IconButton
            size='small'
            color='error'
            sx={{ width: 30, height: 30, fontSize: "16px" }}
            onClick={() => handleDeleteShippingFee(params.row.id)}
          >
            🗑️
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <div className='page-shell'>
      <Heading title={t("shipping_fee.title")} description='' keywords='' />
      {/* Header */}
      <div className='flex justify-between gap-2 border-b pb-2 mb-2'>
        <span className='text-xl font-semibold text-[#4a4b4d]'>{t("shipping_fee.title")}</span>
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

      {/* DataGrid */}
      <Box className='responsive-grid-table' sx={{ height: { xs: 480, md: 525 }, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row?.id}
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

      {/* Modal */}
      {showForm && (
        <ShippingFeeModal
          open={showForm}
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
    </div>
  );
};

export default ShippingFeePage;
