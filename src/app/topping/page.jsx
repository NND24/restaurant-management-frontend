"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LabelWithIcon from "@/components/LableWithIcon";
import { getAllTopping, addToppingGroupOnly } from "@/service/topping";
import localStorageService from "@/utils/localStorageService";

// MUI DataGrid
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Modal from "@/components/Modal";

const ToppingMenuTab = () => {
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
      setError("Lỗi khi tải topping");
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

  // filter accent-insensitive
  const normalized = (s) =>
    s
      ?.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  const filteredGroups = toppingGroups.filter((g) => !search || normalized(g.name).includes(normalized(search)));

  // DataGrid columns
  const columns = [
    {
      field: "name",
      headerName: "Tên nhóm",
      flex: 1,
    },
    {
      field: "toppings",
      headerName: "Số topping",
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
        title='Thêm Nhóm Topping'
        confirmTitle='Lưu'
        closeTitle='Hủy'
      >
        <input
          type='text'
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          placeholder='Nhập tên nhóm topping'
          className='w-full p-2 border rounded-md'
          required
        />
      </Modal>

      <div className='flex justify-between items-center border-b pb-2 mb-3'>
        <input
          type='text'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='Tìm nhóm topping...'
          className='flex-1 border rounded-lg px-4 py-2'
        />
        {!blockEdit && (
          <div className='ml-3'>
            <LabelWithIcon title='Thêm nhóm' iconPath='/assets/plus.png' onClick={() => setIsModalOpen(true)} />
          </div>
        )}
      </div>

      <div className='mt-6 bg-white rounded-md shadow-md'>
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
