"use client";
import React, { useEffect, useState } from "react";
import { getAllStaff, deleteStaff, createStaff, updateStaff } from "@/service/staff";
import localStorageService from "@/utils/localStorageService";
import { FaPlus } from "react-icons/fa";
import { IconButton, Box } from "@mui/material";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { viVN } from "@/utils/constants";
import StaffCreateModal from "@/components/staff/StaffCreateModal";
import { DataGrid } from "@mui/x-data-grid";
import { GridToolbar } from "node_modules/@mui/x-data-grid/internals";
import Heading from "@/components/Heading";
import { useTranslation } from "react-i18next";

export default function StaffDataGrid() {
  const { t } = useTranslation();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [staffBeingEdited, setStaffBeingEdited] = useState(null);
  const [viewOnly, setViewOnly] = useState(false);
  const storeData = typeof window !== "undefined" && localStorage.getItem("store");
  const storeId = storeData ? JSON.parse(storeData)?._id : "";

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await getAllStaff(storeId);
      if (res.success) setStaff(res.data.employees);
    } catch (err) {
      toast.error(t("staff.load_error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [storeId]);

  const handleDeleteStaff = async (staffId) => {
    const result = await Swal.fire({
      title: t("common.are_you_sure"),
      text: t("staff.delete_confirm"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonText: t("common.cancel"),
      confirmButtonText: t("common.delete"),
    });
    if (result.isConfirmed) {
      await deleteStaff({ storeId, userId: staffId });
      fetchStaff();
      Swal.fire(t("common.deleted"), t("staff.deleted_msg"), "success");
    }
  };

  const rows = staff.map((st) => ({
    id: st._id,
    name: st.name,
    phonenumber: st.phonenumber,
    gender: st.gender === "male" ? t("staff.male") : t("staff.female"),
    role: st.role.includes("manager") ? t("staff.manager") : st.role.includes("owner") ? t("staff.owner") : t("staff.staff"),
    avatar: st.avatar.url || "/default-avatar.png",
  }));

  const columns = [
    { field: "id", headerName: t("staff.id"), headerAlign: "center", width: 180 },
    {
      field: "name",
      headerName: t("staff.full_name"),
      width: 250,
      headerAlign: "center",
      renderCell: (params) => (
        <div className='flex items-center gap-2'>
          <img src={params.row.avatar} className='w-8 h-8 rounded-full' />
          <span>{params.row.name}</span>
        </div>
      ),
    },
    { field: "phonenumber", headerName: t("staff.phone"), headerAlign: "center", align: "center", width: 180 },
    { field: "gender", headerName: t("staff.gender"), headerAlign: "center", align: "center", width: 80 },
    { field: "role", headerName: t("staff.role"), headerAlign: "center", align: "center", width: 180 },
    {
      field: "actions",
      headerName: t("common.actions"),
      sortable: false,
      filterable: false,
      headerAlign: "center",
      align: "center",
      width: 150,
      renderCell: (params) => (
        <div className='flex justify-center items-center space-x-1 w-full h-full'>
          <IconButton
            data-tooltip-id='dish-tooltip'
            data-tooltip-content={t("common.view_detail")}
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

          <IconButton
            data-tooltip-id='dish-tooltip'
            data-tooltip-content={t("common.edit")}
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

          <IconButton
            data-tooltip-id='dish-tooltip'
            data-tooltip-content={t("common.delete")}
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
        </div>
      ),
    },
  ];

  return (
    <div className='page-shell'>
      <Heading title={t("staff.title")} description='' keywords='' />
      <div className='flex justify-between gap-2 border-b pb-2 mb-2'>
        <span className='text-xl font-semibold text-[#4a4b4d]'>{t("staff.title")}</span>
        <div className='flex gap-3 mt-2 md:mt-0 justify-end'>
          <button
            onClick={() => setShowForm(true)}
            className='px-4 py-2 flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-500 text-white font-semibold transition'
          >
            <FaPlus className='text-lg' />
            <span>{t("common.add")}</span>
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
                  toast.success(t("staff.update_success"));
                } else {
                  toast.error(t("common.error_occurred"));
                }
              } else {
                // Create
                const res = await createStaff({ storeId, staffData: formData });
                if (res.success) {
                  toast.success(t("staff.create_success"));
                } else {
                  toast.error(t("common.error_occurred"));
                }
              }
              fetchStaff();
              setShowForm(false);
              setStaffBeingEdited(null);
            } catch (err) {
              toast.error(t("common.error_occurred"));
            }
          }}
          initialData={staffBeingEdited}
          isUpdate={!!staffBeingEdited}
          readOnly={viewOnly}
        />
      )}

      <Box className='responsive-grid-table' sx={{ height: { xs: 480, md: 525 }, width: "100%" }}>
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
