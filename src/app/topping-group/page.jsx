"use client";
import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import localStorageService from "@/utils/localStorageService";
import { Box, IconButton } from "@mui/material";
import { FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";
import { viVN } from "@/utils/constants";
import ToppingGroupCreateModal from "@/components/topping-group/ToppingGroupCreateModal";
import ToppingGroupDetailModal from "@/components/topping-group/ToppingGroupDetailModal";
import ToppingGroupEditModal from "@/components/topping-group/ToppingGroupEditModal";
import { getStoreToppingGroups, deleteToppingGroup } from "@/service/topping";
import { useRouter } from "next/navigation";

const page = () => {
  const router = useRouter();

  const getRole = localStorageService.getRole();
  const blockEdit = getRole === "staff";
  const storeData = typeof window !== "undefined" && localStorage.getItem("store");
  const storeId = storeData ? JSON.parse(storeData)?._id : "";

  const [allToppingGroups, setAllToppingGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCreateToppingGroup, setOpenCreateToppingGroup] = useState(false);
  const [openDetailToppingGroup, setOpenDetailToppingGroup] = useState(false);
  const [openEditToppingGroup, setOpenEditToppingGroup] = useState(false);
  const [selectedToppingGroupId, setSelectedToppingGroupId] = useState(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const unitData = await getStoreToppingGroups(storeId);
      const list = unitData?.data?.data || unitData?.data || [];
      setAllToppingGroups(list);
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
      text: "Nhóm món thêm này sẽ bị xóa vĩnh viễn.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        await deleteToppingGroup(id);
        Swal.fire("Đã xóa!", "Nhóm món thêm đã được xóa.", "success");
        fetchData();
      } catch (err) {
        Swal.fire("Lỗi!", err.message || "Xóa Nhóm món thêm thất bại", "error");
      }
    }
  };

  const columns = [
    {
      field: "name",
      headerName: "Tên nhóm món thêm",
      width: 250,
      headerAlign: "center",
      renderCell: (params) => <span>{params.row?.name || ""}</span>,
    },
    {
      field: "toppings",
      headerName: "Danh sách món thêm",
      flex: 1,
      headerAlign: "center",
      renderCell: (params) => <span>{params.row?.toppings?.map((t) => t.name).join(", ") || "—"}</span>,
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
      width: 180,
      renderCell: (params) => (
        <div className='flex justify-center items-center space-x-1 w-full h-full'>
          <IconButton
            data-tooltip-id='dish-tooltip'
            data-tooltip-content='Danh sách món thêm phụ thuộc'
            size='small'
            color='primary'
            sx={{
              width: 30,
              height: 30,
              fontSize: "16px",
            }}
            onClick={() => {
              router.push(`/topping-group/${params.row._id}`);
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
              setSelectedToppingGroupId(params.row._id);
              setOpenDetailToppingGroup(true);
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
                setSelectedToppingGroupId(params.row._id);
                setOpenEditToppingGroup(true);
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
    <div className='p-5'>
      {openCreateToppingGroup && (
        <ToppingGroupCreateModal
          open={openCreateToppingGroup}
          onClose={() => setOpenCreateToppingGroup(false)}
          storeId={storeId}
          onCreated={fetchData}
        />
      )}

      {openDetailToppingGroup && (
        <ToppingGroupDetailModal
          open={openDetailToppingGroup}
          onClose={() => setOpenDetailToppingGroup(false)}
          id={selectedToppingGroupId}
        />
      )}

      {openEditToppingGroup && (
        <ToppingGroupEditModal
          open={openEditToppingGroup}
          onClose={() => setOpenEditToppingGroup(false)}
          storeId={storeId}
          groupId={selectedToppingGroupId}
          onUpdated={fetchData}
        />
      )}

      <div className='flex align-center justify-between mb-2'>
        <span className='font-semibold text-[20px] color-[#4a4b4d]'>Nhóm món thêm</span>

        {!blockEdit && (
          <div className='flex gap-3 mt-2 md:mt-0 justify-end'>
            <button
              onClick={() => setOpenCreateToppingGroup(true)}
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
          rows={allToppingGroups}
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
