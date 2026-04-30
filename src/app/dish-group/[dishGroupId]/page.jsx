"use client";

import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import localStorageService from "@/utils/localStorageService";
import { Box, IconButton } from "@mui/material";
import { FaCog, FaPlus } from "react-icons/fa";
import { viVN } from "@/utils/constants";
import Swal from "sweetalert2";
import { deleteDish } from "@/service/dish";
import { getDishGroupById } from "@/service/dishGroup";
import { useParams } from "next/navigation";
import DishGroupManageModal from "@/components/dish-group/DishGroupManageModal";
import DishCreateToGroupModal from "@/components/dish/DishCreateToGroupModal";
import Image from "next/image";
import DishDetailModal from "@/components/dish/DishDetailModal";
import DishEditModal from "@/components/dish/DishEditModal";
import Heading from "@/components/Heading";

const page = () => {
  const { dishGroupId } = useParams();

  const getRole = localStorageService.getRole();
  const blockEdit = getRole === "staff";
  const storeData = typeof window !== "undefined" && localStorage.getItem("store");
  const storeId = storeData ? JSON.parse(storeData)?._id : "";

  const [allDishes, setAllDishes] = useState([]);
  const [dishGroup, setDishGroup] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openManage, setOpenManage] = useState(false);
  const [openCreateDishModal, setOpenCreateDishModal] = useState(false);
  const [openDetailDish, setOpenDetailDish] = useState(false);
  const [openEditDish, setOpenEditDish] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await getDishGroupById(dishGroupId);
      const list = res?.data?.data?.dishes || res?.data?.dishes || [];
      setDishGroup(res?.data);
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
      text: "Món ăn này nhóm sẽ bị xóa vĩnh viễn.",
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
        Swal.fire("Đã xóa!", "Món ăn đã  nhómđược xóa.", "success");
        fetchData();
      } catch (err) {
        Swal.fire("Lỗi!", err.message || "Xóa Món ăn thấ nhómt bại", "error");
      }
    }
  };

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
          case "INACTIVE": // hoặc DISABLED tùy backend
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
              setOpenDetailDish(true);
            }}
          >
            👁️
          </IconButton>

          {!blockEdit && (
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
                setOpenEditDish(true);
              }}
            >
              ✏️
            </IconButton>
          )}

          {!blockEdit && (
            <IconButton
              data-tooltip-id='dish-tooltip'
              data-tooltip-content='Xoá'
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
          )}
        </div>
      ),
    },
  ];

  return (
    <div className='page-shell'>
      {openCreateDishModal && (
        <DishCreateToGroupModal
          open={openCreateDishModal}
          onClose={() => setOpenCreateDishModal(false)}
          storeId={storeId}
          dishGroup={dishGroup}
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

      {openManage && (
        <DishGroupManageModal
          open={openManage}
          onClose={() => setOpenManage(false)}
          groupId={dishGroupId}
          storeId={storeId}
          currentDishes={allDishes}
          onUpdated={fetchData}
        />
      )}

      <div className='mb-3 flex flex-wrap items-center justify-between gap-3'>
        <Heading title={`Món ăn của nhóm ${dishGroup?.name ?? ""}`} description='' keywords='' />
        <span className='text-xl font-semibold text-[#4a4b4d]'>Món ăn của nhóm {dishGroup?.name}</span>

        <div className='flex gap-2'>
          {!blockEdit && (
            <div className='flex gap-3 mt-2 md:mt-0 justify-end'>
              <button
                onClick={() => setOpenManage(true)}
                className='px-4 py-2 flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-500 text-white font-semibold transition'
              >
                <FaCog className='text-lg' />
                <span> Quản lý</span>
              </button>
            </div>
          )}

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
      </div>

      <Box className='responsive-grid-table' sx={{ height: { xs: 480, md: 525 }, width: "100%" }}>
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
