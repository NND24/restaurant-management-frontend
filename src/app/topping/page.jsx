"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DataGrid } from "@mui/x-data-grid";
import localStorageService from "@/utils/localStorageService";
import { Box, Tooltip, IconButton } from "@mui/material";
import { FaPlus } from "react-icons/fa";
import { viVN } from "@/utils/constants";
import ToppingCreateModal from "@/components/topping/ToppingCreateModal";
import ToppingDetailModal from "@/components/topping/ToppingDetailModal";
import ToppingEditModal from "@/components/topping/ToppingEditModal";
import Swal from "sweetalert2";
import { getStoreToppings, deleteTopping } from "@/service/topping";
import Heading from "@/components/Heading";

const page = () => {
  const { t } = useTranslation();
  const getRole = localStorageService.getRole();
  const blockEdit = getRole === "staff";
  const storeData = typeof window !== "undefined" && localStorage.getItem("store");
  const storeId = storeData ? JSON.parse(storeData)?._id : "";

  const [allToppings, setAllToppings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCreateTopping, setOpenCreateTopping] = useState(false);
  const [openDetailTopping, setOpenDetailTopping] = useState(false);
  const [openEditTopping, setOpenEditTopping] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const unitData = await getStoreToppings(storeId);
      const list = unitData?.data?.data || unitData?.data || [];
      setAllToppings(list);
    } catch (err) {
      console.error("Failed to fetch dishes", err);
      setError(t("topping.fetch_error"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [storeId]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: t("common.are_you_sure"),
      text: t("topping.delete_confirm_text"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: t("common.delete"),
      cancelButtonText: t("common.cancel"),
    });

    if (result.isConfirmed) {
      try {
        await deleteTopping(id);
        Swal.fire(t("common.deleted"), t("topping.delete_success_text"), "success");
        fetchData();
      } catch (err) {
        Swal.fire(t("common.error"), err.message || t("topping.delete_failed"), "error");
      }
    }
  };

  const columns = [
    {
      field: "name",
      headerName: t("topping.column_name"),
      width: 200,
      headerAlign: "center",
      renderCell: (params) => <span>{params.row?.name || ""}</span>,
    },
    {
      field: "price",
      headerName: t("topping.column_price"),
      width: 120,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => <span>{params.row?.price?.toLocaleString()}₫</span>,
    },
    {
      field: "ingredients",
      headerName: t("topping.column_ingredients"),
      flex: 1,
      headerAlign: "center",
      renderCell: (params) => (
        <span>{params.row?.ingredients?.map((ing) => ing.ingredient?.name || "").join(", ")}</span>
      ),
    },
    {
      field: "status",
      headerName: t("common.status"),
      headerAlign: "center",
      align: "center",
      width: 140,
      renderCell: (params) => {
        let label = "";
        let className = "";

        switch (params.value) {
          case "ACTIVE":
            label = t("topping.status_in_stock");
            className = "bg-green-100 text-green-800";
            break;
          case "OUT_OF_STOCK":
            label = t("topping.status_out_of_stock");
            className = "bg-red-100 text-red-600";
            break;
          case "INACTIVE":
            label = t("topping.status_stopped");
            className = "bg-gray-200 text-gray-700";
            break;
          default:
            label = t("common.unknown");
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
              setSelectedId(params.row._id);
              setOpenDetailTopping(true);
            }}
          >
            👁️
          </IconButton>

          {!blockEdit && (
            <>
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
                  setOpenEditTopping(true);
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
                onClick={() => handleDelete(params.row._id)}
              >
                🗑️
              </IconButton>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className='page-shell'>
      {openCreateTopping && (
        <ToppingCreateModal
          open={openCreateTopping}
          onClose={() => setOpenCreateTopping(false)}
          storeId={storeId}
          onCreated={fetchData}
        />
      )}

      {openDetailTopping && (
        <ToppingDetailModal open={openDetailTopping} onClose={() => setOpenDetailTopping(false)} id={selectedId} />
      )}

      {openEditTopping && (
        <ToppingEditModal
          open={openEditTopping}
          onClose={() => setOpenEditTopping(false)}
          id={selectedId}
          storeId={storeId}
          onUpdated={fetchData}
        />
      )}

      <div className='mb-3 flex flex-wrap items-center justify-between gap-3'>
        <Heading title={t("topping.title")} description='' keywords='' />
        <span className='text-xl font-semibold text-[#4a4b4d]'>{t("topping.title")}</span>

        {!blockEdit && (
          <div className='flex gap-3 mt-2 md:mt-0 justify-end'>
            <button
              onClick={() => setOpenCreateTopping(true)}
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
          rows={allToppings}
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
