"use client";

import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { getAllDish, toggleSaleStatus } from "@/service/dish";
import { useRouter } from "next/navigation";
import Image from "next/image";
import localStorageService from "@/utils/localStorageService";
import { Switch, Box, Typography, Tooltip, IconButton } from "@mui/material";
import { FaPlus } from "react-icons/fa";
import DishCreateModal from "@/components/dish/DishCreateModal";
import { viVN } from "@/utils/constants";

const page = () => {
  const router = useRouter();
  const getRole = localStorageService.getRole();
  const blockEdit = getRole === "staff";
  const storeData = typeof window !== "undefined" && localStorage.getItem("store");
  const storeId = storeData ? JSON.parse(storeData)?._id : "";

  const [allDishes, setAllDishes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [openCreateDishModal, setOpenCreateDishModal] = useState(false);

  const fetchAllDishes = async () => {
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
    fetchAllDishes();
  }, [storeId]);

  const toggleItemEnabled = async (id) => {
    try {
      await toggleSaleStatus({ dishId: id });
      setAllDishes((prev) =>
        prev.map((item) =>
          item._id === id
            ? {
                ...item,
                stockStatus: item.stockStatus === "AVAILABLE" ? "OUT_OF_STOCK" : "AVAILABLE",
              }
            : item
        )
      );
    } catch (err) {
      console.error("Failed to toggle sale status", err);
    }
  };

  // chuẩn hóa search
  function normalize(str = "") {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  const filteredDishes = allDishes.filter((dish) => {
    if (!search) return true;
    const dishName = normalize(dish.name);
    const catName = normalize(dish.category?.name || "Khác");
    const s = normalize(search);
    return dishName.includes(s) || catName.includes(s);
  });

  // Cấu hình cột cho DataGrid
  const columns = [
    {
      field: "image",
      headerName: "Ảnh",
      headerAlign: "center",
      width: 80,
      renderCell: (params) => (
        <Image
          src={params.row?.image?.url || "/assets/no-pictures.png"}
          alt={params.row?.name}
          width={40}
          height={40}
          className='rounded-md'
        />
      ),
      sortable: false,
      filterable: false,
    },
    {
      field: "name",
      headerName: "Tên món",
      headerAlign: "center",
      flex: 1,
      renderCell: (params) => (
        <Box
          sx={{
            width: "100%",
            height: "100%", // full height của cell
            display: "flex",
            alignItems: "center", // căn giữa theo chiều dọc
          }}
        >
          <Typography sx={{ cursor: "pointer", fontWeight: 500 }}>{params.value}</Typography>
        </Box>
      ),
    },

    {
      field: "category",
      headerName: "Danh mục",
      headerAlign: "center",
      width: 150,
      renderCell: (params) => {
        const row = params.row;
        if (!row) return null;
        return <span>{params.row?.category?.name}</span>;
      },
    },
    {
      field: "price",
      headerName: "Giá",
      headerAlign: "center",
      width: 120,
      renderCell: (params) => {
        const row = params.row;
        if (!row) return null;
        return <span>{params.row?.price ? params.row?.price.toLocaleString() + "₫" : "0₫"}</span>;
      },
    },
    {
      field: "stockStatus",
      headerName: "Trạng thái",
      headerAlign: "center",
      width: 130,
      renderCell: (params) => (
        <span
          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold cursor-pointer ${
            params.value === "AVAILABLE" ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"
          }`}
          onClick={() => toggleItemEnabled(params.row?._id)}
        >
          {params.value === "AVAILABLE" ? "Hoạt động" : "Ngưng"}
        </span>
      ),
    },
    {
      field: "actions",
      headerName: "Hành động",
      sortable: false,
      filterable: false,
      width: 150,
      renderCell: (params) => (
        <div className='flex space-x-1'>
          <Tooltip title='Xem chi tiết' PopperProps={{ strategy: "fixed" }}>
            <IconButton
              size='small'
              color='primary'
              onClick={() => {
                // Thêm logic xem chi tiết
                console.log("Xem chi tiết", params.row._id);
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
                // Thêm logic chỉnh sửa
                console.log("Chỉnh sửa", params.row._id);
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
                // Thêm logic xoá
                console.log("Xoá", params.row._id);
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
      <DishCreateModal
        open={openCreateDishModal}
        onClose={() => setOpenCreateDishModal(false)}
        storeId={storeId}
        onCreated={fetchAllDishes}
      />

      <div className='flex flex-col justify-between gap-2 border-b pb-2 mb-2'>
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

      <Box sx={{ height: 480, width: "100%" }}>
        <DataGrid
          rows={filteredDishes}
          columns={columns}
          getRowId={(row) => row._id}
          pageSizeOptions={[5, 10, 20]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
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
