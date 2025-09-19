"use client";
import React, { useEffect, useState } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { getAllStaff, deleteStaff, getStaff, createStaff, updateStaff } from "@/service/staff";
import localStorageService from "@/utils/localStorageService";
import { FaTrash, FaEdit } from "react-icons/fa";
import { IconButton, Fab } from "@mui/material";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import StaffModel from "@/components/popups/Staff";
import { viVN } from "@/utils/constants";

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
      const res = await getAllStaff(storeId, { page: 1, limit: 1000 });
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
    role: st.role.includes("manager") ? "Quản lý" : st.role.includes("owner") ? "Chủ nhà hàng" : "Nhân viên",
    avatar: st.avatar.url || "/default-avatar.png",
  }));

  const columns = [
    {
      field: "name",
      headerName: "Họ và tên",
      width: 250,
      renderCell: (params) => (
        <div className='flex items-center gap-2'>
          <img src={params.row.avatar} className='w-8 h-8 rounded-full' />
          <span>{params.row.name}</span>
        </div>
      ),
    },
    { field: "role", headerName: "Chức vụ", width: 180 },
    {
      field: "actions",
      headerName: "Hành động",
      width: 150,
      renderCell: (params) => (
        <div className='flex gap-2'>
          <IconButton
            color='primary'
            onClick={() => {
              /* open edit */
            }}
          >
            <FaEdit />
          </IconButton>
          <IconButton color='error' onClick={() => handleDeleteStaff(params.row.id)}>
            <FaTrash />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <div style={{ height: "80vh", width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={10}
        components={{ Toolbar: GridToolbar }}
        loading={loading}
        localeText={viVN}
      />

      <Fab color='primary' sx={{ position: "fixed", bottom: 24, right: 24 }} onClick={() => setShowForm(true)}>
        +
      </Fab>

      {showForm && (
        <StaffModel
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setStaffBeingEdited(null);
            setViewOnly(false);
          }}
          onSubmit={staffBeingEdited ? updateStaff : createStaff}
          initialData={staffBeingEdited}
          isUpdate={!!staffBeingEdited}
          readOnly={viewOnly}
        />
      )}
    </div>
  );
}
