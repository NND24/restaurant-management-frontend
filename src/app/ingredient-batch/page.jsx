"use client";

import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import localStorageService from "@/utils/localStorageService";
import { Box, IconButton } from "@mui/material";
import { FaPlus } from "react-icons/fa";
import { viVN } from "@/utils/constants";
import IngredientBatchCreateModal from "@/components/ingredient-batch/IngredientBatchCreateModal";
import IngredientBatchDetailModal from "@/components/ingredient-batch/IngredientBatchDetailModal";
import IngredientBatchEditModal from "@/components/ingredient-batch/IngredientBatchEditModal";
import Swal from "sweetalert2";
import { getBatchesByStore, deleteBatch } from "@/service/ingredientBatch";
import Heading from "@/components/Heading";

const page = () => {
  const getRole = localStorageService.getRole();
  const blockEdit = getRole === "staff";
  const storeData = typeof window !== "undefined" && localStorage.getItem("store");
  const storeId = storeData ? JSON.parse(storeData)?._id : "";

  const [allIngredientBatches, setAllIngredientBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCreateIngredient, setOpenCreateIngredient] = useState(false);
  const [openDetailIngredient, setOpenDetailIngredient] = useState(false);
  const [openEditIngredient, setOpenEditIngredient] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const unitData = await getBatchesByStore(storeId);
      const list = unitData?.data?.data || unitData?.data || [];
      const transformed = list.map((item) => {
        const inputUnit = item.inputUnit;

        return {
          ...item,
          ingredientName: item.ingredient?.name || "",
          inputUnitName: inputUnit?.name || "",
          inputQuantity: inputUnit ? item.quantity / (inputUnit.ratio || 1) : item.quantity,
        };
      });

      setAllIngredientBatches(transformed);
    } catch (err) {
      console.error("Failed to fetch dishes", err);
      setError("Lỗi tải danh sách món");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [storeId]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Bạn có chắc chắn?",
      text: "Lô nguyên liệu này sẽ bị xóa vĩnh viễn.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        await deleteBatch(id);
        Swal.fire("Đã xóa!", "Lô nguyên liệu đã được xóa.", "success");
        fetchData();
      } catch (err) {
        Swal.fire("Lỗi!", err.message || "Xóa Lô nguyên liệu thất bại", "error");
      }
    }
  };

  const columns = [
    {
      field: "batchCode",
      headerName: "Mã lô",
      width: 160,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => <span>{params.row?.batchCode || "-"}</span>,
    },
    {
      field: "ingredientName",
      headerName: "Lô nguyên liệu",
      width: 200,
      headerAlign: "center",
      renderCell: (params) => <span>{params.row?.ingredientName || ""}</span>,
    },
    {
      field: "remainingQuantity",
      headerName: "Còn lại",
      width: 160,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const unit = params.row?.inputUnit;
        if (!unit) return params.row.remainingQuantity;

        const displayQty = params.row.remainingQuantity / (unit.ratio || 1);

        return (
          <span>
            {displayQty} {unit.name}
          </span>
        );
      },
    },
    {
      field: "totalCost",
      headerName: "Tổng giá",
      width: 150,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => <span>{params.row?.totalCost?.toLocaleString()} ₫</span>,
    },
    {
      field: "expiryDate",
      headerName: "Hạn sử dụng",
      width: 160,
      headerAlign: "center",
      align: "center",
      renderCell: (params) =>
        params.row?.expiryDate ? new Date(params.row.expiryDate).toLocaleDateString("vi-VN") : "",
    },
    {
      field: "status",
      headerName: "Trạng thái",
      width: 130,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            params.row?.status === "active"
              ? "bg-green-100 text-green-800"
              : params.row?.status === "expired"
              ? "bg-red-100 text-red-800"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {params.row?.status === "active" ? "Hoạt động" : params.row?.status === "expired" ? "Hết hạn" : "Hết hàng"}
        </span>
      ),
    },
    {
      field: "actions",
      headerName: "Hành động",
      width: 150,
      headerAlign: "center",
      align: "center",
      sortable: false,
      renderCell: (params) => (
        <div className='flex justify-center items-center space-x-1 w-full h-full'>
          <IconButton
            data-tooltip-id='dish-tooltip'
            data-tooltip-content='Xem chi tiết'
            size='small'
            color='primary'
            sx={{
              width: 30,
              height: 30,
              fontSize: "16px",
            }}
            onClick={() => {
              setSelectedId(params.row._id);
              setOpenDetailIngredient(true);
            }}
          >
            👁️
          </IconButton>

          <IconButton
            data-tooltip-id='dish-tooltip'
            data-tooltip-content='Chỉnh sửa'
            size='small'
            color='info'
            sx={{
              width: 30,
              height: 30,
              fontSize: "16px",
            }}
            onClick={() => {
              setSelectedId(params.row._id);
              setOpenEditIngredient(true);
            }}
          >
            ✏️
          </IconButton>

          {!blockEdit && (
            <IconButton
              data-tooltip-id='dish-tooltip'
              data-tooltip-content='Xoá'
              size='small'
              color='error'
              sx={{
                width: 30,
                height: 30,
                fontSize: "16px",
              }}
              onClick={() => handleDelete(params.row._id)}
            >
              🗑️
            </IconButton>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className='page-shell'>
      {openCreateIngredient && (
        <IngredientBatchCreateModal
          open={openCreateIngredient}
          onClose={() => setOpenCreateIngredient(false)}
          storeId={storeId}
          onCreated={fetchData}
        />
      )}

      {openDetailIngredient && (
        <IngredientBatchDetailModal
          open={openDetailIngredient}
          onClose={() => setOpenDetailIngredient(false)}
          id={selectedId}
        />
      )}

      {openEditIngredient && (
        <IngredientBatchEditModal
          open={openEditIngredient}
          onClose={() => setOpenEditIngredient(false)}
          id={selectedId}
          storeId={storeId}
          onUpdated={fetchData}
        />
      )}

      <div className='mb-3 flex flex-wrap items-center justify-between gap-3'>
        <Heading title='Lô nguyên liệu' description='' keywords='' />
        <span className='text-xl font-semibold text-[#4a4b4d]'>Lô nguyên liệu</span>

        <div className='flex gap-3 mt-2 md:mt-0 justify-end'>
          <button
            onClick={() => setOpenCreateIngredient(true)}
            className='px-4 py-2 flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-500 text-white font-semibold transition'
          >
            <FaPlus className='text-lg' />
            <span>Nhập lô mới</span>
          </button>
        </div>
      </div>

      <Box className='responsive-grid-table' sx={{ height: { xs: 480, md: 525 }, width: "100%" }}>
        <DataGrid
          rows={allIngredientBatches}
          columns={columns}
          getRowId={(row) => row._id}
          pagination
          pageSizeOptions={[]}
          initialState={{
            pagination: { paginationModel: { pageSize: 8 } },
          }}
          loading={isLoading}
          disableRowSelectionOnClick
          localeText={viVN}
        />
      </Box>
    </div>
  );
};

export default page;

