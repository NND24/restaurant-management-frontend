"use client";

import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { getIngredientCategoriesByStore } from "@/service/ingredientCategory";
import localStorageService from "@/utils/localStorageService";
import { Box, Typography, Tooltip, IconButton } from "@mui/material";
import { FaPlus } from "react-icons/fa";
import IngredientCategoryCreateModal from "@/components/ingredient-category/IngredientCategoryCreateModal";
import { viVN } from "@/utils/constants";
import IngredientCategoryDetailModal from "@/components/ingredient-category/IngredientCategoryDetailModal";
import IngredientCategoryEditModal from "@/components/ingredient-category/IngredientCategoryEditModal";
import Swal from "sweetalert2";
import { deleteIngredientCategory } from "@/service/ingredientCategory";

const page = () => {
  const getRole = localStorageService.getRole();
  const blockEdit = getRole === "staff";
  const storeData = typeof window !== "undefined" && localStorage.getItem("store");
  const storeId = storeData ? JSON.parse(storeData)?._id : "";

  const [allIngredientCategories, setAllIngredientCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCreateIngredientCategory, setOpenCreateIngredientCategory] = useState(false);
  const [openDetailIngredientCategory, setOpenDetailIngredientCategory] = useState(false);
  const [openEditIngredientCategory, setOpenEditIngredientCategory] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const unitData = await getIngredientCategoriesByStore(storeId);
      const list = unitData?.data?.data || unitData?.data || [];
      setAllIngredientCategories(list);
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
      text: "Loại nguyên liệu này sẽ bị xóa vĩnh viễn.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        await deleteIngredientCategory(id);
        Swal.fire("Đã xóa!", "Loại nguyên liệu đã được xóa.", "success");
        fetchData();
      } catch (err) {
        Swal.fire("Lỗi!", err.message || "Xóa loại nguyên liệu thất bại", "error");
      }
    }
  };

  const columns = [
    {
      field: "name",
      headerName: "Tên loại nguyên liệu",
      width: 250,
      headerAlign: "center",
      renderCell: (params) => (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Typography sx={{ fontWeight: 500 }}>{params.value}</Typography>
        </Box>
      ),
    },

    {
      field: "description",
      headerName: "Mô tả",
      headerAlign: "center",
      flex: 1,
      renderCell: (params) => {
        const row = params.row;
        if (!row) return null;
        return <span>{params.row?.description}</span>;
      },
    },
    {
      field: "isActive",
      headerName: "Trạng thái",
      headerAlign: "center",
      align: "center",
      width: 130,
      renderCell: (params) => (
        <span
          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold cursor-pointer ${
            params.row?.isActive ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"
          }`}
        >
          {params.row?.isActive ? "Hoạt động" : "Ngưng"}
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
        <div className='flex justify-center items-center space-x-1 w-full'>
          <Tooltip title='Xem chi tiết' PopperProps={{ strategy: "fixed" }}>
            <IconButton
              size='small'
              color='primary'
              onClick={() => {
                setSelectedCategoryId(params.row._id);
                setOpenDetailIngredientCategory(true);
              }}
            >
              👁️
            </IconButton>
          </Tooltip>

          <Tooltip title='Chỉnh sửa' PopperProps={{ strategy: "fixed" }}>
            <IconButton
              size='small'
              color='info'
              onClick={() => {
                setSelectedCategoryId(params.row._id);
                setOpenEditIngredientCategory(true);
              }}
            >
              ✏️
            </IconButton>
          </Tooltip>

          <Tooltip title='Xoá' PopperProps={{ strategy: "fixed" }}>
            <IconButton
              size='small'
              color='error'
              onClick={() => {
                handleDelete(params.row._id);
              }}
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
      <IngredientCategoryCreateModal
        open={openCreateIngredientCategory}
        onClose={() => setOpenCreateIngredientCategory(false)}
        storeId={storeId}
        onCreated={fetchData}
      />

      <IngredientCategoryDetailModal
        open={openDetailIngredientCategory}
        onClose={() => setOpenDetailIngredientCategory(false)}
        id={selectedCategoryId}
      />

      <IngredientCategoryEditModal
        open={openEditIngredientCategory}
        onClose={() => setOpenEditIngredientCategory(false)}
        id={selectedCategoryId}
        onUpdated={fetchData}
      />

      <div className='flex align-center justify-between mb-2'>
        <span className='font-semibold text-[20px] color-[#4a4b4d]'>Loại nguyên liệu</span>

        {!blockEdit && (
          <div className='flex gap-3 mt-2 md:mt-0 justify-end'>
            <button
              onClick={() => setOpenCreateIngredientCategory(true)}
              className='px-4 py-2 flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-500 text-white font-semibold transition'
            >
              <FaPlus className='text-lg' />
              <span>Thêm</span>
            </button>
          </div>
        )}
      </div>

      <Box sx={{ height: 525, width: "100%" }}>
        <DataGrid
          rows={allIngredientCategories}
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
    </>
  );
};

export default page;
