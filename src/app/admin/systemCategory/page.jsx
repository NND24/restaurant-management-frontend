"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Dropzone from "react-dropzone";
import {
  getAllSystemCategories,
  createSystemCategory,
  updateSystemCategory,
  deleteSystemCategory,
} from "@/service/systemCategory";
import { uploadImages } from "@/service/upload";
import Heading from "@/components/Heading";
import { FiSearch, FiX, FiEdit2, FiTrash2, FiPlus, FiImage } from "react-icons/fi";
import { ThreeDots } from "react-loader-spinner";

const ITEMS_PER_PAGE = 6;

const CategoryFormModal = ({ category, onClose, onSaved }) => {
  const isEdit = !!category;
  const [name, setName] = useState(category?.name || "");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(category?.image?.url || "");
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState("");

  const handleDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      setNameError("Tên danh mục ít nhất 2 ký tự");
      return;
    }
    setSaving(true);
    try {
      let imageData = category?.image || null;
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        const uploadRes = await uploadImages(formData);
        imageData = uploadRes?.data || uploadRes;
      }
      const payload = { name: name.trim(), image: imageData };
      if (isEdit) {
        await updateSystemCategory(category._id, payload);
        toast.success("Cập nhật danh mục thành công!");
      } else {
        await createSystemCategory(payload);
        toast.success("Tạo danh mục thành công!");
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err?.message || (isEdit ? "Cập nhật thất bại!" : "Tạo danh mục thất bại!"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-bold text-gray-800">
            {isEdit ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition">
            <FiX size={20} className="text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Image upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh</label>
            <Dropzone
              maxFiles={1}
              accept={{ "image/*": [] }}
              onDrop={handleDrop}
            >
              {({ getRootProps, getInputProps, isDragActive }) => (
                <div
                  {...getRootProps()}
                  className={`relative border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition min-h-[140px] ${
                    isDragActive ? "border-[#fc6011] bg-orange-50" : "border-gray-200 bg-gray-50 hover:border-[#fc6011]"
                  }`}
                >
                  <input {...getInputProps()} />
                  {previewUrl ? (
                    <div className="relative w-24 h-24">
                      <Image src={previewUrl} alt="preview" fill className="object-cover rounded-xl" />
                    </div>
                  ) : (
                    <>
                      <FiImage size={32} className="text-gray-300 mb-2" />
                      <p className="text-sm text-gray-400 text-center">
                        Kéo thả hoặc click để chọn ảnh
                      </p>
                    </>
                  )}
                </div>
              )}
            </Dropzone>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên danh mục</label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setNameError(""); }}
              placeholder="Nhập tên danh mục..."
              className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition ${
                nameError ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus:border-[#fc6011]"
              }`}
            />
            {nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-[#fc6011] text-white text-sm font-semibold hover:bg-[#e55010] transition disabled:opacity-60"
            >
              {saving ? "Đang lưu..." : isEdit ? "Lưu" : "Tạo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminSystemCategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modal, setModal] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getAllSystemCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Không thể tải danh mục!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (cat) => {
    const result = await Swal.fire({
      title: `Xóa danh mục "${cat.name}"?`,
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#dc2626",
    });
    if (!result.isConfirmed) return;
    try {
      await deleteSystemCategory(cat._id);
      toast.success("Đã xóa danh mục!");
      fetchCategories();
    } catch {
      toast.error("Xóa danh mục thất bại!");
    }
  };

  const filtered = categories.filter((c) =>
    (c.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <ThreeDots visible height="80" width="80" color="#fc6011" radius="9" ariaLabel="loading" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Heading title="Quản lý danh mục" description="" keywords="" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Danh mục</h1>
          <p className="text-sm text-gray-500 mt-0.5">Quản lý danh mục món ăn trên toàn hệ thống</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 flex-1 sm:w-56 shadow-sm">
            <FiSearch className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Tìm danh mục..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")}>
                <FiX className="text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
          <button
            onClick={() => setModal({ category: null })}
            className="flex items-center gap-2 px-4 py-2 bg-[#fc6011] text-white rounded-xl text-sm font-semibold hover:bg-[#e55010] transition shadow-sm whitespace-nowrap"
          >
            <FiPlus size={16} />
            Thêm
          </button>
        </div>
      </div>

      {/* Grid */}
      {paginated.length === 0 ? (
        <div className="text-center text-gray-400 py-16">Không tìm thấy danh mục nào.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {paginated.map((cat) => {
            const hasImage = cat.image?.url;
            return (
              <div
                key={cat._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden group"
              >
                <div className="relative w-full pt-[100%] bg-gray-50">
                  {hasImage ? (
                    <Image src={cat.image.url} alt={cat.name} fill className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FiImage size={32} className="text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-gray-800 truncate">{cat.name}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <button
                      title="Chỉnh sửa"
                      onClick={() => setModal({ category: cat })}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs text-indigo-600 hover:bg-indigo-50 transition font-medium"
                    >
                      <FiEdit2 size={13} />
                      Sửa
                    </button>
                    <button
                      title="Xóa"
                      onClick={() => handleDelete(cat)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs text-red-500 hover:bg-red-50 transition font-medium"
                    >
                      <FiTrash2 size={13} />
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
          >
            Trước
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                currentPage === page
                  ? "bg-[#fc6011] text-white"
                  : "border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
          >
            Sau
          </button>
        </div>
      )}

      {/* Modal */}
      {modal !== null && (
        <CategoryFormModal
          category={modal.category}
          onClose={() => setModal(null)}
          onSaved={fetchCategories}
        />
      )}
    </div>
  );
};

export default AdminSystemCategoryPage;
