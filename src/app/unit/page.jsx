"use client";

import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import localStorageService from "@/utils/localStorageService";
import { Box, IconButton } from "@mui/material";
import { FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";
import { viVN } from "@/utils/constants";
import UnitCreateModal from "@/components/unit/UnitCreateModal";
import UnitDetailModal from "@/components/unit/UnitDetailModal";
import UnitEditModal from "@/components/unit/UnitEditModal";
import { getUnits, deleteUnit } from "@/service/unit";
import Heading from "@/components/Heading";

const page = () => {
  const getRole = localStorageService.getRole();
  const blockEdit = getRole === "staff";
  const storeData = typeof window !== "undefined" && localStorage.getItem("store");
  const storeId = storeData ? JSON.parse(storeData)?._id : "";

  // ✅ đổi lại tên state cho đúng
  const [units, setUnits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [openCreateUnit, setOpenCreateUnit] = useState(false);
  const [openDetailUnit, setOpenDetailUnit] = useState(false);
  const [openEditUnit, setOpenEditUnit] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState(null);

  // 📦 Lấy danh sách đơn vị của cửa hàng
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getUnits(storeId);
      const list = response?.data?.data || response?.data || [];
      setUnits(list);
    } catch (err) {
      console.error("❌ Lỗi tải danh sách đơn vị:", err);
      setError("Không thể tải danh sách đơn vị");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (storeId) fetchData();
  }, [storeId]);

  // 🗑 Xoá đơn vị
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Bạn có chắc chắn muốn xoá?",
      text: "Đơn vị này sẽ bị xóa.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xoá",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        await deleteUnit(id);
        Swal.fire("Đã xoá!", "Đơn vị đã được xóa.", "success");
        fetchData();
      } catch (err) {
        Swal.fire("Lỗi!", err.message || "Xoá đơn vị thất bại", "error");
      }
    }
  };

  // 🧱 Cột DataGrid
  const columns = [
    {
      field: "name",
      headerName: "Tên đơn vị",
      flex: 2,
      headerAlign: "center",
      renderCell: (params) => <span>{params.row?.name || ""}</span>,
    },
    {
      field: "type",
      headerName: "Loại",
      headerAlign: "center",
      align: "center",
      flex: 1,
      renderCell: (params) => {
        const typeMap = {
          weight: "Khối lượng",
          volume: "Thể tích",
          count: "Số lượng",
        };
        return <span>{typeMap[params.row?.type] || params.row?.type}</span>;
      },
    },
    {
      field: "isActive",
      headerName: "Trạng thái",
      headerAlign: "center",
      align: "center",
      flex: 1,
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
      flex: 1,
      renderCell: (params) => (
        <div className='flex justify-center items-center space-x-1 w-full h-full'>
          {/* 👁 Xem chi tiết */}
          <IconButton
            size='small'
            color='primary'
            sx={{ width: 30, height: 30, fontSize: "16px" }}
            onClick={() => {
              setSelectedUnitId(params.row._id);
              setOpenDetailUnit(true);
            }}
          >
            👁️
          </IconButton>

          {/* ✏️ Sửa */}
          {!blockEdit && (
            <IconButton
              size='small'
              color='info'
              sx={{ width: 30, height: 30, fontSize: "16px" }}
              onClick={() => {
                setSelectedUnitId(params.row._id);
                setOpenEditUnit(true);
              }}
            >
              ✏️
            </IconButton>
          )}

          {/* 🗑 Xoá */}
          {!blockEdit && (
            <IconButton
              size='small'
              color='error'
              sx={{ width: 30, height: 30, fontSize: "16px" }}
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
    <div className='p-5'>
      {/* Create Modal */}
      {openCreateUnit && (
        <UnitCreateModal
          open={openCreateUnit}
          onClose={() => setOpenCreateUnit(false)}
          storeId={storeId}
          onCreated={fetchData}
        />
      )}

      {/* Detail Modal */}
      {openDetailUnit && (
        <UnitDetailModal open={openDetailUnit} onClose={() => setOpenDetailUnit(false)} id={selectedUnitId} />
      )}

      {/* Edit Modal */}
      {openEditUnit && (
        <UnitEditModal
          open={openEditUnit}
          onClose={() => setOpenEditUnit(false)}
          id={selectedUnitId}
          onUpdated={fetchData}
        />
      )}

      <div className='flex align-center justify-between mb-2'>
        <Heading title='Đơn vị' description='' keywords='' />
        <span className='font-semibold text-[20px] color-[#4a4b4d]'>Đơn vị</span>

        {!blockEdit && (
          <div className='flex gap-3 mt-2 md:mt-0 justify-end'>
            <button
              onClick={() => setOpenCreateUnit(true)}
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
          rows={units}
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
