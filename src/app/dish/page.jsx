"use client";

import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { deleteDish, getAllDish, toggleSaleStatus } from "@/service/dish";
import Image from "next/image";
import localStorageService from "@/utils/localStorageService";
import { Box, Tooltip, IconButton } from "@mui/material";
import { FaPlus } from "react-icons/fa";
import DishCreateModal from "@/components/dish/DishCreateModal";
import { viVN } from "@/utils/constants";
import DishDetailModal from "@/components/dish/DishDetailModal";
import DishEditModal from "@/components/dish/DishEditModal";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

const page = () => {
  const router = useRouter();

  const getRole = localStorageService.getRole();
  const blockEdit = getRole === "staff";
  const storeData = typeof window !== "undefined" && localStorage.getItem("store");
  const storeId = storeData ? JSON.parse(storeData)?._id : "";

  const [allDishes, setAllDishes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCreateDishModal, setOpenCreateDishModal] = useState(false);
  const [openDetailDish, setOpenDetailDish] = useState(false);
  const [openEditDish, setOpenEditDish] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const dishData = await getAllDish(storeId);
      const list = dishData?.data?.data || dishData?.data || [];
      setAllDishes(list);
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
        await deleteDish(id);
        Swal.fire("Đã xóa!", "Món thêm đã được xóa.", "success");
        fetchData();
      } catch (err) {
        Swal.fire("Lỗi!", err.message || "Xóa Món thêm thất bại", "error");
      }
    }
  };

  // Cấu hình cột cho DataGrid
  const columns = [
    {
      field: "image",
      headerName: "Ảnh",
      headerAlign: "center",
      align: "center",
      width: 80,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            src={params.row?.image?.url || "/assets/no-pictures.png"}
            alt={params.row?.name}
            width={40}
            height={40}
            className='rounded-md'
          />
        </Box>
      ),
    },
    {
      field: "name",
      headerName: "Tên món",
      headerAlign: "center",
      flex: 1,
      renderCell: (params) => <span>{params.row?.name || ""}</span>,
    },
    {
      field: "price",
      headerName: "Giá",
      width: 120,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const row = params.row;
        if (!row) return null;
        return <span>{params.row?.price ? params.row?.price.toLocaleString() + "₫" : "0₫"}</span>;
      },
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
          <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold cursor-pointer ${className}`}>
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
      width: 180,
      renderCell: (params) => (
        <div className='flex justify-center items-center space-x-1 w-full h-full'>
          <Tooltip title='Danh sách nhóm món thêm của món'>
            <IconButton
              size='small'
              color='primary'
              sx={{
                width: 30,
                height: 30,
                fontSize: "16px",
              }}
              onClick={() => {
                router.push(`/dish/${params.row._id}`);
              }}
            >
              🧾
            </IconButton>
          </Tooltip>

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
                setOpenDetailDish(true);
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
                setOpenEditDish(true);
              }}
            >
              ✏️
            </IconButton>
          </Tooltip>

          <Tooltip title='Xoá' PopperProps={{ strategy: "fixed" }}>
            <IconButton
              size='small'
              sx={{
                width: 30,
                height: 30,
                fontSize: "16px",
              }}
              color='error'
              onClick={() => handleDelete(params.row._id)}
            >
              🗑️
            </IconButton>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className='p-5'>
      {openCreateDishModal && (
        <DishCreateModal
          open={openCreateDishModal}
          onClose={() => setOpenCreateDishModal(false)}
          storeId={storeId}
          onCreated={fetchData}
        />
      )}

      {openDetailDish && (
        <DishDetailModal open={openDetailDish} onClose={() => setOpenDetailDish(false)} id={selectedId} />
      )}

      {openEditDish && (
        <DishEditModal
          open={openEditDish}
          onClose={() => setOpenEditDish(false)}
          id={selectedId}
          storeId={storeId}
          onUpdated={fetchData}
        />
      )}

      <div className='flex justify-between gap-2 border-b pb-2 mb-2'>
        <span className='font-semibold text-[20px] color-[#4a4b4d]'>Món ăn</span>

        {!blockEdit && (
          <div className='flex gap-3 mt-2 md:mt-0 justify-end'>
            <button
              onClick={() => setOpenCreateDishModal(true)}
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
          rows={allDishes}
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
