"use client";

import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import localStorageService from "@/utils/localStorageService";
import { Box, Tooltip, IconButton } from "@mui/material";
import { FaPlus } from "react-icons/fa";
import { viVN } from "@/utils/constants";
import ToppingCreateModal from "@/components/topping/ToppingCreateModal";
import ToppingDetailModal from "@/components/topping/ToppingDetailModal";
import ToppingEditModal from "@/components/topping/ToppingEditModal";
import Swal from "sweetalert2";
import { getStoreToppings, deleteTopping } from "@/service/topping";

const page = () => {
  const getRole = localStorageService.getRole();
  const blockEdit = getRole === "staff";
  const storeData = typeof window !== "undefined" && localStorage.getItem("store");
  const storeId = storeData ? JSON.parse(storeData)?._id : "";

  const [allToppings, setAllToppings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCreateTopping, setOpenCreateTopping] = useState(false);
  const [openDetailTopping, setOpenDetailTopping] = useState(false);
  const [openEditTopping, setOpenEditTopping] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const unitData = await getStoreToppings(storeId);
      const list = unitData?.data?.data || unitData?.data || [];
      setAllToppings(list);
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
      text: "Món thêm này sẽ bị xóa vĩnh viễn.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        await deleteTopping(id);
        Swal.fire("Đã xóa!", "Món thêm đã được xóa.", "success");
        fetchData();
      } catch (err) {
        Swal.fire("Lỗi!", err.message || "Xóa Món thêm thất bại", "error");
      }
    }
  };

  const columns = [
    {
      field: "name",
      headerName: "Tên Món thêm",
      width: 200,
      headerAlign: "center",
      renderCell: (params) => <span>{params.row?.name || ""}</span>,
    },
    {
      field: "price",
      headerName: "Giá",
      width: 120,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => <span>{params.row?.price?.toLocaleString()}₫</span>,
    },
    {
      field: "ingredients",
      headerName: "Nguyên liệu",
      flex: 1,
      headerAlign: "center",
      renderCell: (params) => (
        <span>{params.row?.ingredients?.map((ing) => ing.ingredient?.name || "").join(", ")}</span>
      ),
    },
    {
      field: "status",
      headerName: "Trạng thái",
      headerAlign: "center",
      align: "center",
      width: 140,
      renderCell: (params) => {
        let label = "";
        let className = "";

        switch (params.value) {
          case "ACTIVE":
            label = "Còn hàng";
            className = "bg-green-100 text-green-800";
            break;
          case "OUT_OF_STOCK":
            label = "Hết hàng";
            className = "bg-red-100 text-red-600";
            break;
          case "INACTIVE":
            label = "Ngừng bán";
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
              setOpenDetailTopping(true);
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
                  setOpenEditTopping(true);
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
                onClick={() => handleDelete(params.row._id)}
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
    <div className='p-5'>
      {openCreateTopping && (
        <ToppingCreateModal
          open={openCreateTopping}
          onClose={() => setOpenCreateTopping(false)}
          storeId={storeId}
          onCreated={fetchData}
        />
      )}

      {openDetailTopping && (
        <ToppingDetailModal open={openDetailTopping} onClose={() => setOpenDetailTopping(false)} id={selectedId} />
      )}

      {openEditTopping && (
        <ToppingEditModal
          open={openEditTopping}
          onClose={() => setOpenEditTopping(false)}
          id={selectedId}
          storeId={storeId}
          onUpdated={fetchData}
        />
      )}

      <div className='flex align-center justify-between mb-2'>
        <span className='font-semibold text-[20px] color-[#4a4b4d]'>Món thêm</span>

        {!blockEdit && (
          <div className='flex gap-3 mt-2 md:mt-0 justify-end'>
            <button
              onClick={() => setOpenCreateTopping(true)}
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
          rows={allToppings}
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
