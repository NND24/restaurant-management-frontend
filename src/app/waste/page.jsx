"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DataGrid } from "@mui/x-data-grid";
import localStorageService from "@/utils/localStorageService";
import { Box, Tooltip, IconButton } from "@mui/material";
import { FaPlus } from "react-icons/fa";
import { viVN } from "@/utils/constants";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { getWasteList } from "@/service/waste";
import WasteDetailModal from "@/components/waste/WasteDetailModal";
import WasteCreateModal from "@/components/waste/WasteCreateModal";
import WasteEditModal from "@/components/waste/WasteEditModal";
import Heading from "@/components/Heading";

const WastePage = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const getRole = localStorageService.getRole();
  const blockEdit = getRole === "staff";
  const storeData = typeof window !== "undefined" && localStorage.getItem("store");
  const storeId = storeData ? JSON.parse(storeData)?._id : "";

  const [allWastes, setAllWastes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCreateWaste, setOpenCreateWaste] = useState(false);
  const [openDetailWaste, setOpenDetailWaste] = useState(false);
  const [openEditWaste, setOpenEditWaste] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await getWasteList(storeId);
      const list = res?.data?.data || res?.data || [];

      const transformed = list.map((item) => ({
        ...item,
        ingredientName: item?.ingredientBatchId?.ingredient?.name || "",
      }));
      setAllWastes(transformed);
    } catch (err) {
      console.error("Failed to fetch Wastes", err);
      setError("Lỗi tải danh sách waste");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [storeId]);

  const reasonMap = {
    expired: t("waste.reason_expired"),
    spoiled: t("waste.reason_spoiled"),
    damaged: t("waste.reason_damaged"),
    other: t("waste.reason_other"),
  };

  const columns = [
    {
      field: "ingredientName",
      headerName: t("waste.ingredient"),
      flex: 1,
      headerAlign: "center",
      renderCell: (params) => <span>{params.row?.ingredientName || ""}</span>,
    },
    {
      field: "quantity",
      headerName: t("waste.quantity"),
      width: 150,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "reason",
      headerName: t("waste.reason"),
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        if (params.value === "other") {
          return params.row?.otherReason || t("waste.reason_other");
        }
        return reasonMap[params.value] || t("waste.reason_unknown");
      },
    },
    {
      field: "staff",
      headerName: t("waste.staff"),
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => params.row?.staff?.name || t("waste.system_recorded"),
    },
    {
      field: "date",
      headerName: t("waste.date"),
      width: 180,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => new Date(params.value).toLocaleDateString("vi-VN"),
    },
    {
      field: "actions",
      headerName: t("common.actions"),
      sortable: false,
      filterable: false,
      width: 120,
      headerAlign: "center",
      align: "center",
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
              setSelectedId(params.row._id);
              setOpenDetailWaste(true);
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
              setSelectedId(params.row._id);
              setOpenEditWaste(true);
            }}
          >
            ✏️
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <div className='page-shell'>
      {openCreateWaste && (
        <WasteCreateModal
          open={openCreateWaste}
          onClose={() => setOpenCreateWaste(false)}
          storeId={storeId}
          onCreated={fetchData}
        />
      )}

      {openDetailWaste && (
        <WasteDetailModal open={openDetailWaste} onClose={() => setOpenDetailWaste(false)} id={selectedId} />
      )}

      {openEditWaste && (
        <WasteEditModal
          open={openEditWaste}
          onClose={() => setOpenEditWaste(false)}
          id={selectedId}
          storeId={storeId}
          onUpdated={fetchData}
        />
      )}

      <div className='flex justify-between gap-2 border-b pb-2 mb-2'>
        <Heading title={t("waste.title")} description='' keywords='' />
        <span className='text-xl font-semibold text-[#4a4b4d]'>{t("waste.title")}</span>

        {!blockEdit && (
          <div className='flex gap-3 mt-2 md:mt-0 justify-end'>
            <button
              onClick={() => setOpenCreateWaste(true)}
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
          rows={allWastes}
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

export default WastePage;
