"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import LabelWithIcon from "@/components/LableWithIcon";
import Modal from "../Modal";
import { getAllTopping, addToppingGroupOnly } from "@/service/topping";
import Loading from "@/components/Loading";
import localStorageService from "@/utils/localStorageService";

import { DataGrid } from "@mui/x-data-grid";

const ToppingMenuTab = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const storeData = localStorage.getItem("store");
  const storeId = JSON.parse(storeData)?._id;
  const role = localStorageService.getRole();
  const blockEdit = role === "staff";

  const [toppingGroups, setToppingGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [search, setSearch] = useState("");

  const fetchToppings = async () => {
    try {
      setIsLoading(true);
      const response = await getAllTopping({ storeId });
      setToppingGroups(response?.data || []);
    } catch (err) {
      console.error("Error fetching toppings:", err);
      setError(t("toppings.load_error"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchToppings();
  }, [storeId]);

  const handleAddGroup = async () => {
    if (!newGroupName.trim()) return;

    try {
      await addToppingGroupOnly({
        storeId,
        name: newGroupName,
      });
      await fetchToppings();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to add topping group:", err);
    }
  };

  const normalized = (s) =>
    s
      ?.toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");
  const filteredGroups = toppingGroups.filter((g) => !search || normalized(g.name).includes(normalized(search)));

  const columns = [
    {
      field: "name",
      headerName: t("toppings.col_group_name"),
      flex: 1,
    },
    {
      field: "toppings",
      headerName: t("toppings.col_topping_count"),
      width: 150,
      valueGetter: (params) => params.row?.toppings?.length || 0,
    },
  ];

  return (
    <div className='w-full p-4 mb-20'>
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleAddGroup}
        title={t("toppings.add_group_modal_title")}
        confirmTitle={t("common.save")}
        closeTitle={t("common.cancel")}
      >
        <input
          type='text'
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          placeholder={t("toppings.group_name_placeholder")}
          className='w-full p-2 border rounded-md'
          required
        />
      </Modal>

      <div className='flex justify-between items-center border-b pb-2 mb-3'>
        <input
          type='text'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("toppings.search_placeholder")}
          className='flex-1 border rounded-lg px-4 py-2'
        />
        {!blockEdit && (
          <div className='ml-3'>
            <LabelWithIcon title={t("toppings.add_group_btn")} iconPath='/assets/plus.png' onClick={() => setIsModalOpen(true)} />
          </div>
        )}
      </div>

      <div className='responsive-grid-table mt-6 rounded-md bg-white shadow-md'>
        <DataGrid
          autoHeight
          rows={filteredGroups.map((g) => ({ ...g, id: g._id }))}
          columns={columns}
          pageSizeOptions={[5, 10, 20]}
          onRowClick={(params) => router.push(`menu/topping/${params.row?._id}`)}
          disableRowSelectionOnClick
          loading={isLoading}
        />
      </div>
    </div>
  );
};

export default ToppingMenuTab;
