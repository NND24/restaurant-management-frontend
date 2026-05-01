"use client";

import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { deleteDish, getAllDish } from "@/service/dish";
import Image from "next/image";
import localStorageService from "@/utils/localStorageService";
import { Box, IconButton } from "@mui/material";
import { FaPlus } from "react-icons/fa";
import DishCreateModal from "@/components/dish/DishCreateModal";
import { viVN } from "@/utils/constants";
import DishDetailModal from "@/components/dish/DishDetailModal";
import DishEditModal from "@/components/dish/DishEditModal";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import Heading from "@/components/Heading";
import { useTranslation } from "react-i18next";

const page = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const getRole = localStorageService.getRole();
  const blockEdit = getRole === "staff";
  const storeData = typeof window !== "undefined" && localStorage.getItem("store");
  const storeId = storeData ? JSON.parse(storeData)?._id : "";

  const [allDishes, setAllDishes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCreateDishModal, setOpenCreateDishModal] = useState(false);
  const [openDetailDish, setOpenDetailDish] = useState(false);
  const [openEditDish, setOpenEditDish] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const dishData = await getAllDish(storeId);
      const list = dishData?.data?.data || dishData?.data || [];
      setAllDishes(list);
    } catch (err) {
      console.error("Failed to fetch dishes", err);
      setError(t("dish.load_error"));
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
      text: t("dish.delete_confirm"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: t("common.delete"),
      cancelButtonText: t("common.cancel"),
    });

    if (result.isConfirmed) {
      try {
        await deleteDish(id);
        Swal.fire(t("common.deleted"), t("dish.deleted_msg"), "success");
        fetchData();
      } catch (err) {
        Swal.fire(t("common.error"), err.message || t("common.error"), "error");
      }
    }
  };

  // Cấu hình cột cho DataGrid
  const columns = [
    {
      field: "image",
      headerName: t("dish.image"),
      headerAlign: "center",
      align: "center",
      width: 80,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            src={params.row?.image?.url || "/assets/no-pictures.png"}
            alt={params.row?.name}
            width={40}
            height={40}
            className='rounded-md'
          />
        </Box>
      ),
    },
    {
      field: "name",
      headerName: t("dish.name"),
      headerAlign: "center",
      flex: 1,
      renderCell: (params) => <span>{params.row?.name || ""}</span>,
    },
    {
      field: "price",
      headerName: t("dish.price"),
      width: 120,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const row = params.row;
        if (!row) return null;
        return <span>{params.row?.price ? params.row?.price.toLocaleString() + "₫" : "0₫"}</span>;
      },
    },
    {
      field: "category",
      headerName: t("dish.category"),
      headerAlign: "center",
      align: "center",
      flex: 1,
      renderCell: (params) => <span>{params.row?.category?.name || ""}</span>,
    },
    {
      field: "ingredients",
      headerName: t("dish.ingredients"),
      flex: 1,
      headerAlign: "center",
      renderCell: (params) => (
        <span>{params.row?.ingredients?.map((ing) => ing.ingredient?.name || "").join(", ")}</span>
      ),
    },
    {
      field: "status",
      headerName: t("dish.status"),
      headerAlign: "center",
      align: "center",
      width: 140,
      renderCell: (params) => {
        let label = "";
        let className = "";

        switch (params.value) {
          case "ACTIVE":
            label = t("dish.in_stock");
            className = "bg-green-100 text-green-800";
            break;
          case "OUT_OF_STOCK":
            label = t("dish.out_of_stock");
            className = "bg-red-100 text-red-600";
            break;
          case "INACTIVE":
            label = t("dish.discontinued");
            className = "bg-gray-200 text-gray-700";
            break;
          default:
            label = t("common.unknown");
            className = "bg-gray-100 text-gray-500";
        }

        return (
          <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold cursor-pointer ${className}`}>
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
      width: 180,
      renderCell: (params) => (
        <div className='flex justify-center items-center space-x-1 w-full h-full'>
          <IconButton
            data-tooltip-id='dish-tooltip'
            data-tooltip-content={t("dish.topping_groups_tooltip")}
            size='small'
            color='primary'
            sx={{
              width: 30,
              height: 30,
              fontSize: "16px",
            }}
            onClick={() => {
              router.push(`/dish/${params.row._id}`);
            }}
          >
            🧾
          </IconButton>

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
              setOpenDetailDish(true);
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
                setSelectedId(params.row._id);
                setOpenEditDish(true);
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
              sx={{
                width: 30,
                height: 30,
                fontSize: "16px",
              }}
              color='error'
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
    <div className='page-shell'>
      {openCreateDishModal && (
        <DishCreateModal
          open={openCreateDishModal}
          onClose={() => setOpenCreateDishModal(false)}
          storeId={storeId}
          onCreated={fetchData}
        />
      )}

      {openDetailDish && (
        <DishDetailModal open={openDetailDish} onClose={() => setOpenDetailDish(false)} id={selectedId} />
      )}

      {openEditDish && (
        <DishEditModal
          open={openEditDish}
          onClose={() => setOpenEditDish(false)}
          id={selectedId}
          storeId={storeId}
          onUpdated={fetchData}
        />
      )}

      <div className='flex justify-between gap-2 border-b pb-2 mb-2'>
        <Heading title={t("dish.title")} description='' keywords='' />
        <span className='text-xl font-semibold text-[#4a4b4d]'>{t("dish.title")}</span>

        {!blockEdit && (
          <div className='flex gap-3 mt-2 md:mt-0 justify-end'>
            <button
              onClick={() => setOpenCreateDishModal(true)}
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
          rows={allDishes}
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
