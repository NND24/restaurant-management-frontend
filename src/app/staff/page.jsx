"use client";
import React, { useEffect, useState } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { getAllStaff, deleteStaff, createStaff, updateStaff } from "@/service/staff";
import localStorageService from "@/utils/localStorageService";
import { FaPlus } from "react-icons/fa";
import { IconButton, Box, Tooltip } from "@mui/material";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import StaffModel from "@/components/popups/Staff";
import { viVN } from "@/utils/constants";
import StaffCreateModal from "@/components/staff/StaffCreateModal";

export default function StaffDataGrid() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [staffBeingEdited, setStaffBeingEdited] = useState(null);
  const [viewOnly, setViewOnly] = useState(false);
  const storeId = localStorageService.getStoreId();

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await getAllStaff(storeId);
      if (res.success) setStaff(res.data.employees);
    } catch (err) {
      toast.error("Lỗi khi load staff");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [storeId]);

  const handleDeleteStaff = async (staffId) => {
    const result = await Swal.fire({
      title: "Bạn có chắc chắn?",
      text: "Nhân viên này sẽ bị xóa vĩnh viễn.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonText: "Hủy",
      confirmButtonText: "Xóa",
    });
    if (result.isConfirmed) {
      await deleteStaff({ storeId, userId: staffId });
      fetchStaff();
      Swal.fire("Đã xóa!", "Nhân viên đã được xóa.", "success");
    }
  };

  const rows = staff.map((st) => ({
    id: st._id,
    name: st.name,
    phonenumber: st.phonenumber,
    gender: st.gender === "male" ? "Nam" : "Nữ",
    role: st.role.includes("manager") ? "Quản lý" : st.role.includes("owner") ? "Chủ nhà hàng" : "Nhân viên",
    avatar: st.avatar.url || "/default-avatar.png",
  }));

  const columns = [
    { field: "id", headerName: "Mã nhân viên", headerAlign: "center", width: 180 },
    {
      field: "name",
      headerName: "Họ và tên",
      width: 250,
      headerAlign: "center",
      renderCell: (params) => (
        <div className='flex items-center gap-2'>
          <img src={params.row.avatar} className='w-8 h-8 rounded-full' />
          <span>{params.row.name}</span>
        </div>
      ),
    },
    { field: "phonenumber", headerName: "Số điện thoại", headerAlign: "center", align: "center", width: 180 },
    { field: "gender", headerName: "Giới tính", headerAlign: "center", align: "center", width: 80 },
    { field: "role", headerName: "Chức vụ", headerAlign: "center", align: "center", width: 180 },
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
                const staffRaw = staff.find((s) => s._id === params.row.id);
                setViewOnly(true);
                setStaffBeingEdited(staffRaw);
                setShowForm(true);
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
                const staffRaw = staff.find((s) => s._id === params.row.id);
                setStaffBeingEdited(staffRaw);
                setShowForm(true);
              }}
            >
              ✏️
            </IconButton>
          </Tooltip>

          <Tooltip title='Xoá' PopperProps={{ strategy: "fixed" }}>
            <IconButton
              size='small'
              color='error'
              sx={{
                width: 30,
                height: 30,
                fontSize: "16px",
              }}
              onClick={() => handleDeleteStaff(params.row.id)}
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
      <div className='flex justify-between gap-2 border-b pb-2 mb-2'>
        <span className='font-semibold text-[20px] color-[#4a4b4d]'>Nhân viên</span>
        <div className='flex gap-3 mt-2 md:mt-0 justify-end'>
          <button
            onClick={() => setShowForm(true)}
            className='px-4 py-2 flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-500 text-white font-semibold transition'
          >
            <FaPlus className='text-lg' />
            <span>Thêm</span>
          </button>
        </div>
      </div>

      {showForm && (
        <StaffCreateModal
          open={showForm}
          onClose={() => {
            setShowForm(false);
            setStaffBeingEdited(null);
            setViewOnly(false);
          }}
          onSubmit={async (formData) => {
            try {
              if (staffBeingEdited) {
                // Update
                const res = await updateStaff({ userId: staffBeingEdited._id, staffData: formData });
                if (res.success) {
                  toast.success("Cập nhật nhân viên thành công!");
                } else {
                  toast.error("Có lỗi xảy ra!");
                }
              } else {
                // Create
                const res = await createStaff({ storeId, staffData: formData });
                if (res.success) {
                  toast.success("Thêm nhân viên thành công!");
                } else {
                  toast.error("Có lỗi xảy ra!");
                }
              }
              fetchStaff();
              setShowForm(false);
              setStaffBeingEdited(null);
            } catch (err) {
              toast.error("Có lỗi xảy ra!");
            }
          }}
          initialData={staffBeingEdited}
          isUpdate={!!staffBeingEdited}
          readOnly={viewOnly}
        />
      )}

      <Box sx={{ height: 525, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
          pagination
          pageSizeOptions={[]}
          initialState={{
            pagination: { paginationModel: { pageSize: 8 } },
          }}
          loading={loading}
          disableRowSelectionOnClick
          localeText={viVN}
        />
      </Box>
    </div>
  );
}
