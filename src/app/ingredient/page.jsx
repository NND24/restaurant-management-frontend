"use client";

import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import localStorageService from "@/utils/localStorageService";
import { Box, IconButton } from "@mui/material";
import { FaPlus } from "react-icons/fa";
import { viVN } from "@/utils/constants";
import IngredientCreateModal from "@/components/ingredient/IngredientCreateModal";
import IngredientDetailModal from "@/components/ingredient/IngredientDetailModal";
import IngredientEditModal from "@/components/ingredient/IngredientEditModal";
import Swal from "sweetalert2";
import { getIngredientsByStore, deleteIngredient } from "@/service/ingredient";
import Heading from "@/components/Heading";

const page = () => {
  const getRole = localStorageService.getRole();
  const blockEdit = getRole === "staff";
  const storeData = typeof window !== "undefined" && localStorage.getItem("store");
  const storeId = storeData ? JSON.parse(storeData)?._id : "";

  const [allIngredients, setAllIngredients] = useState([]);
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
      const unitData = await getIngredientsByStore(storeId);
      const list = unitData?.data?.data || unitData?.data || [];
      const transformed = list.map((item) => ({
        ...item,
        unitName: item.unit?.name || "",
        categoryName: item.category?.name || "",
      }));
      setAllIngredients(transformed);
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

  const handleDelete = async (id, storeId) => {
    const result = await Swal.fire({
      title: "Bạn có chắc chắn?",
      text: "Nguyên liệu này sẽ bị xóa vĩnh viễn.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        await deleteIngredient(id, storeId);
        Swal.fire("Đã xóa!", "Nguyên liệu đã được xóa.", "success");
        fetchData();
      } catch (err) {
        Swal.fire("Lỗi!", err.message || "Xóa nguyên liệu thất bại", "error");
      }
    }
  };

  const columns = [
    {
      field: "name",
      headerName: "Tên nguyên liệu",
      width: 200,
      headerAlign: "center",
      renderCell: (params) => <span>{params.row?.name || ""}</span>,
    },
    {
      field: "unitName",
      headerName: "Đơn vị tính",
      headerAlign: "center",
      align: "center",
      width: 120,
      renderCell: (params) => <span>{params.row?.unitName || ""}</span>,
    },
    {
      field: "categoryName",
      headerName: "Loại nguyên liệu",
      headerAlign: "center",
      width: 160,
      renderCell: (params) => <span>{params.row?.categoryName || ""}</span>,
    },
    // {
    //   field: "reorderLevel",
    //   headerName: "Ngưỡng cảnh báo",
    //   headerAlign: "center",
    //   align: "center",
    //   width: 150,
    //   renderCell: (params) => <span>{params.row?.reorderLevel || ""}</span>,
    // },
    {
      field: "description",
      headerName: "Mô tả",
      flex: 1,
      headerAlign: "center",
      renderCell: (params) => <span>{params.row?.description || ""}</span>,
    },
    {
      field: "status",
      headerName: "Trạng thái",
      headerAlign: "center",
      align: "center",
      width: 130,
      renderCell: (params) => {
        let label = "";
        let className = "";

        switch (params.value) {
          case "ACTIVE":
            label = "Đang sử dụng";
            className = "bg-green-100 text-green-800";
            break;
          case "OUT_OF_STOCK":
            label = "Hết hàng";
            className = "bg-red-100 text-red-600";
            break;
          case "INACTIVE":
            label = "Ngưng sử dụng";
            className = "bg-gray-200 text-gray-700";
            break;
          default:
            label = "Không xác định";
            className = "bg-gray-100 text-gray-500";
        }

        return (
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold cursor-pointer ${className}`}
            onClick={() => toggleItemEnabled(params.row?._id, params.value)}
          >
            {label}
          </span>
        );
      },
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
          {!blockEdit && (
            <>
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
                onClick={() => {
                  handleDelete(params.row._id, storeId);
                }}
              >
                🗑️
              </IconButton>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className='page-shell'>
      {openCreateIngredient && (
        <IngredientCreateModal
          open={openCreateIngredient}
          onClose={() => setOpenCreateIngredient(false)}
          storeId={storeId}
          onCreated={fetchData}
        />
      )}

      {openDetailIngredient && (
        <IngredientDetailModal
          open={openDetailIngredient}
          onClose={() => setOpenDetailIngredient(false)}
          id={selectedId}
        />
      )}

      {openEditIngredient && (
        <IngredientEditModal
          open={openEditIngredient}
          onClose={() => setOpenEditIngredient(false)}
          id={selectedId}
          storeId={storeId}
          onUpdated={fetchData}
        />
      )}

      <div className='mb-3 flex flex-wrap items-center justify-between gap-3'>
        <Heading title='Nguyên liệu' description='' keywords='' />
        <span className='text-xl font-semibold text-[#4a4b4d]'>Nguyên liệu</span>

        {!blockEdit && (
          <div className='flex gap-3 mt-2 md:mt-0 justify-end'>
            <button
              onClick={() => setOpenCreateIngredient(true)}
              className='px-4 py-2 flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-500 text-white font-semibold transition'
            >
              <FaPlus className='text-lg' />
              <span>Thêm</span>
            </button>
          </div>
        )}
      </div>

      <Box className='responsive-grid-table' sx={{ height: { xs: 480, md: 525 }, width: "100%" }}>
        <DataGrid
          rows={allIngredients}
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
