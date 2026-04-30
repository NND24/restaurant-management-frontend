"use client";
import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import localStorageService from "@/utils/localStorageService";
import { Box, IconButton } from "@mui/material";
import { FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";
import { viVN } from "@/utils/constants";
import DishGroupCreateModal from "@/components/Dish-group/DishGroupCreateModal";
import DishGroupDetailModal from "@/components/Dish-group/DishGroupDetailModal";
import DishGroupEditModal from "@/components/Dish-group/DishGroupEditModal";
import { getStoreDishGroups, deleteDishGroupById } from "@/service/dishGroup";
import { useRouter } from "next/navigation";
import Heading from "@/components/Heading";

const page = () => {
  const router = useRouter();

  const getRole = localStorageService.getRole();
  const blockEdit = getRole === "staff";
  const storeData = typeof window !== "undefined" && localStorage.getItem("store");
  const storeId = storeData ? JSON.parse(storeData)?._id : "";

  const [allDishGroups, setAllDishGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCreateDishGroup, setOpenCreateDishGroup] = useState(false);
  const [openDetailDishGroup, setOpenDetailDishGroup] = useState(false);
  const [openEditDishGroup, setOpenEditDishGroup] = useState(false);
  const [selectedDishGroupId, setSelectedDishGroupId] = useState(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const dishGroupData = await getStoreDishGroups(storeId);
      const list = dishGroupData?.data?.data || dishGroupData?.data || [];
      setAllDishGroups(list);
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
      text: "Nhóm món ăn này sẽ bị xóa vĩnh viễn.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        await deleteDishGroupById(id);
        Swal.fire("Đã xóa!", "Nhóm món ăn đã được xóa.", "success");
        fetchData();
      } catch (err) {
        Swal.fire("Lỗi!", err.message || "Xóa Nhóm món ăn thất bại", "error");
      }
    }
  };

  const columns = [
    {
      field: "name",
      headerName: "Tên nhóm món ăn",
      width: 250,
      headerAlign: "center",
      renderCell: (params) => <span>{params.row?.name || ""}</span>,
    },
    {
      field: "dishes",
      headerName: "Danh sách món ăn",
      flex: 1,
      headerAlign: "center",
      renderCell: (params) => <span>{params.row?.dishes?.map((t) => t.name).join(", ") || "—"}</span>,
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
        <div className='flex justify-center items-center space-x-1 w-full h-full'>
          <IconButton
            data-tooltip-id='dish-tooltip'
            data-tooltip-content='Danh sách món ăn phụ thuộc'
            size='small'
            color='primary'
            sx={{
              width: 30,
              height: 30,
              fontSize: "16px",
            }}
            onClick={() => {
              router.push(`/dish-group/${params.row._id}`);
            }}
          >
            🧾
          </IconButton>

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
              setSelectedDishGroupId(params.row._id);
              setOpenDetailDishGroup(true);
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
                setSelectedDishGroupId(params.row._id);
                setOpenEditDishGroup(true);
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
              color='error'
              sx={{
                width: 30,
                height: 30,
                fontSize: "16px",
              }}
              onClick={() => {
                handleDelete(params.row._id);
              }}
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
      {openCreateDishGroup && (
        <DishGroupCreateModal
          open={openCreateDishGroup}
          onClose={() => setOpenCreateDishGroup(false)}
          storeId={storeId}
          onCreated={fetchData}
        />
      )}

      {openDetailDishGroup && (
        <DishGroupDetailModal
          open={openDetailDishGroup}
          onClose={() => setOpenDetailDishGroup(false)}
          id={selectedDishGroupId}
        />
      )}

      {openEditDishGroup && (
        <DishGroupEditModal
          open={openEditDishGroup}
          onClose={() => setOpenEditDishGroup(false)}
          storeId={storeId}
          groupId={selectedDishGroupId}
          onUpdated={fetchData}
        />
      )}

      <div className='mb-3 flex flex-wrap items-center justify-between gap-3'>
        <Heading title='Nhóm món ăn' description='' keywords='' />
        <span className='text-xl font-semibold text-[#4a4b4d]'>Nhóm món ăn</span>

        {!blockEdit && (
          <div className='flex gap-3 mt-2 md:mt-0 justify-end'>
            <button
              onClick={() => setOpenCreateDishGroup(true)}
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
          rows={allDishGroups}
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

