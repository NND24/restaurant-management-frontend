"use client";

import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { getAllDish, toggleSaleStatus } from "@/service/dish";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import LabelWithIcon from "../../components/LableWithIcon";
import localStorageService from "@/utils/localStorageService";
import { Switch, Box, Typography } from "@mui/material";

const DishMenuTab = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const getRole = localStorageService.getRole();
  const blockEdit = getRole === "staff";
  const storeData = typeof window !== "undefined" && localStorage.getItem("store");
  const storeId = storeData ? JSON.parse(storeData)?._id : "";

  const [allDishes, setAllDishes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const dishData = await getAllDish(storeId);
        const list = dishData?.data?.data || dishData?.data || [];
        setAllDishes(list);
      } catch (err) {
        console.error("Failed to fetch dishes", err);
        setError(t("dishes.load_error"));
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, [storeId]);

  const toggleItemEnabled = async (id) => {
    try {
      await toggleSaleStatus({ dishId: id });
      setAllDishes((prev) =>
        prev.map((item) =>
          item._id === id
            ? {
                ...item,
                status: item.status === "ACTIVE" ? "OUT_OF_STOCK" : "ACTIVE",
              }
            : item
        )
      );
    } catch (err) {
      console.error("Failed to toggle sale status", err);
    }
  };

  function normalize(str = "") {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");
  }

  const filteredDishes = allDishes.filter((dish) => {
    if (!search) return true;
    const dishName = normalize(dish.name);
    const catName = normalize(dish.category?.name || t("dishes.uncategorized"));
    const s = normalize(search);
    return dishName.includes(s) || catName.includes(s);
  });

  const columns = [
    {
      field: "image",
      headerName: t("dishes.col_image"),
      width: 80,
      renderCell: (params) => (
        <Image
          src={params.row?.image?.url || "/assets/no-pictures.png"}
          alt={params.row?.name}
          width={40}
          height={40}
          className='rounded-md'
        />
      ),
      sortable: false,
      filterable: false,
    },
    {
      field: "name",
      headerName: t("dishes.col_name"),
      flex: 1,
      renderCell: (params) => (
        <Typography sx={{ cursor: "pointer", fontWeight: 600 }} onClick={() => router.push(`menu/${params.row?._id}`)}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: "category",
      headerName: t("dishes.col_category"),
      width: 150,
      valueGetter: (params) => params.row?.category?.name || t("dishes.uncategorized"),
    },
    {
      field: "price",
      headerName: t("dishes.col_price"),
      width: 120,
      valueGetter: (params) => (params.row?.price ? params.row?.price.toLocaleString() + "₫" : "0₫"),
    },
    {
      field: "status",
      headerName: t("common.status"),
      width: 130,
      renderCell: (params) => (
        <Switch
          checked={params.row?.status === "ACTIVE"}
          onChange={() => toggleItemEnabled(params.row?._id)}
          disabled={blockEdit}
        />
      ),
    },
  ];

  return (
    <div className='w-full p-4 mb-20'>
      <div className='flex flex-col md:flex-row md:justify-between md:items-center gap-2 border-b pb-2 mb-2'>
        <input
          type='text'
          className='w-full border rounded-lg px-4 py-2'
          placeholder={t("dishes.search_placeholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {!blockEdit && (
          <div className='flex gap-3 mt-2 md:mt-0 justify-end'>
            <LabelWithIcon title={t("common.add")} iconPath='/assets/plus.png' onClick={() => router.push("menu/add")} />
            <LabelWithIcon
              title={t("dishes.edit_categories_btn")}
              iconPath='/assets/editing.png'
              onClick={() => router.push("menu/category")}
            />
          </div>
        )}
      </div>

      <Box className='responsive-grid-table' sx={{ height: { xs: 480, md: 600 }, width: "100%" }}>
        <DataGrid
          rows={filteredDishes}
          columns={columns}
          getRowId={(row) => row._id}
          pageSizeOptions={[5, 10, 20]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          loading={isLoading}
          disableRowSelectionOnClick
        />
      </Box>
    </div>
  );
};

export default DishMenuTab;
