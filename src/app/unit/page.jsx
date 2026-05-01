"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const getRole = localStorageService.getRole();
  const blockEdit = getRole === "staff";
  const storeData = typeof window !== "undefined" && localStorage.getItem("store");
  const storeId = storeData ? JSON.parse(storeData)?._id : "";

  const [units, setUnits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [openCreateUnit, setOpenCreateUnit] = useState(false);
  const [openDetailUnit, setOpenDetailUnit] = useState(false);
  const [openEditUnit, setOpenEditUnit] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState(null);

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

  const handleDelete = async (id, storeId) => {
    const result = await Swal.fire({
      title: t("unit.delete_confirm_title"),
      text: t("unit.delete_confirm_text"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: t("common.delete"),
      cancelButtonText: t("common.cancel"),
    });

    if (result.isConfirmed) {
      try {
        await deleteUnit(id, storeId);
        Swal.fire(t("unit.delete_success_title"), t("unit.delete_success_text"), "success");
        fetchData();
      } catch (err) {
        Swal.fire(t("common.error"), err.message || t("unit.delete_error_text"), "error");
      }
    }
  };

  const columns = [
    {
      field: "name",
      headerName: t("unit.name"),
      flex: 1.5,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "type",
      headerName: t("unit.type"),
      headerAlign: "center",
      align: "center",
      flex: 1,
      renderCell: (params) => {
        const typeMap = {
          weight: t("unit.type_weight"),
          volume: t("unit.type_volume"),
          count: t("unit.type_count"),
        };
        return typeMap[params.row?.type] || params.row?.type;
      },
    },
    {
      field: "conversion",
      headerName: t("unit.conversion"),
      headerAlign: "center",
      align: "center",
      flex: 2,
      valueGetter: (_, row) => {
        if (!row.baseUnit && row.ratio === 1) return t("unit.base_unit");
        return `1 ${row.name} = ${row.ratio} ${row.baseUnit}`;
      },
    },

    {
      field: "isActive",
      headerName: t("common.status"),
      headerAlign: "center",
      align: "center",
      flex: 1,
      renderCell: (params) => (
        <span
          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
            params.row.isActive ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"
          }`}
        >
          {params.row.isActive ? t("common.active") : t("common.inactive")}
        </span>
      ),
    },
    {
      field: "actions",
      headerName: t("common.actions"),
      sortable: false,
      filterable: false,
      headerAlign: "center",
      align: "center",
      flex: 1,
      renderCell: (params) => (
        <div className='flex justify-center items-center space-x-1 w-full h-full'>
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

          {!blockEdit && (
            <IconButton
              size='small'
              color='error'
              sx={{ width: 30, height: 30, fontSize: "16px" }}
              onClick={() => handleDelete(params.row._id, storeId)}
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
          storeId={storeId}
          onUpdated={fetchData}
        />
      )}

      <div className='mb-3 flex flex-wrap items-center justify-between gap-3'>
        <Heading title={t("unit.title")} description='' keywords='' />
        <span className='text-xl font-semibold text-[#4a4b4d]'>{t("unit.title")}</span>

        {!blockEdit && (
          <div className='flex gap-3 mt-2 md:mt-0 justify-end'>
            <button
              onClick={() => setOpenCreateUnit(true)}
              className='px-4 py-2 flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-500 text-white font-semibold transition'
            >
              <FaPlus className='text-lg' />
              <span>{t("common.add")}</span>
            </button>
          </div>
        )}
      </div>

      <Box className='responsive-grid-table' sx={{ height: { xs: 480, md: 525 }, width: "100%" }}>
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
