"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DataGrid } from "@mui/x-data-grid";
import localStorageService from "@/utils/localStorageService";
import { Box, Tooltip, IconButton } from "@mui/material";
import { FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";
import { viVN } from "@/utils/constants";
import IngredientCategoryCreateModal from "@/components/ingredient-category/IngredientCategoryCreateModal";
import IngredientCategoryDetailModal from "@/components/ingredient-category/IngredientCategoryDetailModal";
import IngredientCategoryEditModal from "@/components/ingredient-category/IngredientCategoryEditModal";
import { getIngredientCategoriesByStore, deleteIngredientCategory } from "@/service/ingredientCategory";
import Heading from "@/components/Heading";

const page = () => {
  const { t } = useTranslation();
  const getRole = localStorageService.getRole();
  const blockEdit = getRole === "staff";
  const storeData = typeof window !== "undefined" && localStorage.getItem("store");
  const storeId = storeData ? JSON.parse(storeData)?._id : "";

  const [allIngredientCategories, setAllIngredientCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCreateIngredientCategory, setOpenCreateIngredientCategory] = useState(false);
  const [openDetailIngredientCategory, setOpenDetailIngredientCategory] = useState(false);
  const [openEditIngredientCategory, setOpenEditIngredientCategory] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const unitData = await getIngredientCategoriesByStore(storeId);
      const list = unitData?.data?.data || unitData?.data || [];
      setAllIngredientCategories(list);
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
      title: t("ingredient_category.delete_confirm_title"),
      text: t("ingredient_category.delete_confirm_text"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: t("common.delete"),
      cancelButtonText: t("common.cancel"),
    });

    if (result.isConfirmed) {
      try {
        await deleteIngredientCategory(id);
        Swal.fire(t("ingredient_category.delete_success_title"), t("ingredient_category.delete_success_text"), "success");
        fetchData();
      } catch (err) {
        Swal.fire(t("common.error"), err.message || t("ingredient_category.delete_error_text"), "error");
      }
    }
  };

  const columns = [
    {
      field: "name",
      headerName: t("ingredient_category.name"),
      width: 250,
      headerAlign: "center",
      renderCell: (params) => <span>{params.row?.name || ""}</span>,
    },

    {
      field: "description",
      headerName: t("common.description"),
      headerAlign: "center",
      flex: 1,
      renderCell: (params) => <span>{params.row?.description || ""}</span>,
    },
    {
      field: "isActive",
      headerName: t("common.status"),
      headerAlign: "center",
      align: "center",
      width: 130,
      renderCell: (params) => (
        <span
          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold cursor-pointer ${
            params.row?.isActive ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"
          }`}
        >
          {params.row?.isActive ? t("common.active") : t("common.inactive")}
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
              setSelectedCategoryId(params.row._id);
              setOpenDetailIngredientCategory(true);
            }}
          >
            👁️
          </IconButton>

          {!blockEdit && (
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
                setSelectedCategoryId(params.row._id);
                setOpenEditIngredientCategory(true);
              }}
            >
              ✏️
            </IconButton>
          )}

          {!blockEdit && (
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
      {openCreateIngredientCategory && (
        <IngredientCategoryCreateModal
          open={openCreateIngredientCategory}
          onClose={() => setOpenCreateIngredientCategory(false)}
          storeId={storeId}
          onCreated={fetchData}
        />
      )}

      {openDetailIngredientCategory && (
        <IngredientCategoryDetailModal
          open={openDetailIngredientCategory}
          onClose={() => setOpenDetailIngredientCategory(false)}
          id={selectedCategoryId}
        />
      )}

      {openEditIngredientCategory && (
        <IngredientCategoryEditModal
          open={openEditIngredientCategory}
          onClose={() => setOpenEditIngredientCategory(false)}
          id={selectedCategoryId}
          onUpdated={fetchData}
        />
      )}

      <div className='mb-3 flex flex-wrap items-center justify-between gap-3'>
        <Heading title={t("ingredient_category.title")} description='' keywords='' />
        <span className='text-xl font-semibold text-[#4a4b4d]'>{t("ingredient_category.title")}</span>

        {!blockEdit && (
          <div className='flex gap-3 mt-2 md:mt-0 justify-end'>
            <button
              onClick={() => setOpenCreateIngredientCategory(true)}
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
          rows={allIngredientCategories}
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
