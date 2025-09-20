"use client";

import React, { useEffect, useState } from "react";
import LabelWithIcon from "@/components/LableWithIcon";
import Modal from "@/components/Modal";
import { toast } from "react-toastify";
import { getAllCategories, createCategory, updateCategory, deleteCategory } from "@/service/dishCategory";
import { DataGrid } from "@mui/x-data-grid";

const Page = () => {
  const storeData = typeof window !== "undefined" ? localStorage.getItem("store") : null;
  const storeId = storeData ? JSON.parse(storeData)?._id : null;

  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const res = await getAllCategories({ storeId });
      setCategories(res?.data || []);
    } catch (err) {
      toast.error("Lỗi khi tải danh mục");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (storeId) fetchCategories();
  }, [storeId]);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    try {
      await createCategory({ storeId, name: categoryName });
      toast.success("Tạo danh mục thành công");
      setIsModalOpen(false);
      setCategoryName("");
      await fetchCategories();
    } catch (err) {
      toast.error("Tạo danh mục thất bại");
      console.error(err);
    }
  };

  const handleUpdateCategory = async () => {
    if (!categoryName.trim() || !selectedCategory) return;

    try {
      await updateCategory({
        categoryId: selectedCategory._id,
        name: categoryName,
      });
      toast.success("Cập nhật danh mục thành công");
      setIsModalOpen(false);
      setCategoryName("");
      setSelectedCategory(null);
      await fetchCategories();
    } catch (err) {
      toast.error("Cập nhật danh mục thất bại");
      console.error(err);
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;

    try {
      await deleteCategory({ categoryId: selectedCategory._id });
      toast.success("Xóa danh mục thành công");
      setIsDeleteModalOpen(false);
      setSelectedCategory(null);
      await fetchCategories();
    } catch (err) {
      toast.error("Xóa danh mục thất bại");
      console.error(err);
    }
  };

  const columns = [
    { field: "name", headerName: "Tên danh mục", flex: 1 },
    {
      field: "actions",
      headerName: "Hành động",
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <div className='flex space-x-2'>
          <button
            onClick={() => {
              setSelectedCategory(params.row);
              setCategoryName(params.row.name);
              setIsModalOpen(true);
            }}
            className='text-blue-500'
          >
            ✏️
          </button>
          <button
            onClick={() => {
              setSelectedCategory(params.row);
              setIsDeleteModalOpen(true);
            }}
            className='text-red-500'
          >
            🗑️
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      {/* Modal thêm/sửa */}
      <Modal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCategory(null);
        }}
        onConfirm={selectedCategory ? handleUpdateCategory : handleCreateCategory}
        title={selectedCategory ? "Cập nhật danh mục" : "Thêm danh mục"}
        confirmTitle='Lưu'
        closeTitle='Hủy'
      >
        <form onSubmit={selectedCategory ? handleUpdateCategory : handleCreateCategory}>
          <input
            type='text'
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder='Nhập tên danh mục'
            className='w-full p-2 border rounded-md mb-4'
            required
          />
        </form>
      </Modal>

      {/* Modal xóa */}
      <Modal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteCategory}
        title='Xác nhận xóa'
        confirmTitle='Xóa'
        closeTitle='Hủy'
      >
        <p>Bạn có chắc chắn muốn xóa danh mục này?</p>
      </Modal>

      {/* Thanh toolbar */}
      <div className='flex justify-between items-center border-b pb-2 mx-4'>
        <LabelWithIcon title='Thêm' iconPath='/assets/plus.png' onClick={() => setIsModalOpen(true)} />
      </div>

      {/* DataGrid */}
      <DataGrid
        rows={categories.map((c) => ({ id: c._id, ...c }))}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[5, 10, 20]}
        disableRowSelectionOnClick
        loading={isLoading}
      />
    </>
  );
};

export default Page;
