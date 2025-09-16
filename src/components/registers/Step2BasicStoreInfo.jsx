"use client";
import { getAllSystemCategories } from "@/service/systemCategory";
import React, { useEffect, useRef, useState } from "react";

const Step2BasicStoreInfo = ({ formData, setFormData, nextStep, prevStep }) => {
  const [categories, setCategories] = useState([]);

  // Ref cho input file
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllSystemCategories();
        setCategories(data);
        console.log(data);
      } catch (error) {
        console.error("Không thể tải danh mục cửa hàng:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      store: {
        ...prev.store,
        [name]: value,
      },
    }));
  };

  const handleCategoryCheckbox = (categoryId) => {
    const prevCategories = formData.store.storeCategory || [];

    const isSelected = prevCategories.some((cat) => cat._id === categoryId);

    if (isSelected) {
      const updated = prevCategories.filter((cat) => cat._id !== categoryId);
      setFormData((prev) => ({
        ...prev,
        store: {
          ...prev.store,
          storeCategory: updated,
        },
      }));
    } else {
      const categoryObj = categories.find((cat) => cat._id === categoryId);
      if (categoryObj) {
        const updated = [...prevCategories, categoryObj];
        setFormData((prev) => ({
          ...prev,
          store: {
            ...prev.store,
            storeCategory: updated,
          },
        }));
      }
    }
  };
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);

    setFormData((prev) => ({
      ...prev,
      store: {
        ...prev.store,
        [name]: {
          file, // <-- Lưu File object thật
          preview: url, // Đổi key từ url → preview (cho rõ ràng)
        },
      },
    }));
  };

  return (
    <div className="w-full max-w-none rounded-2xl border m-2 border-gray-100 bg-white p-8 md:px-12 lg:px-20 xl:px-32 shadow-xl">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
        Thông tin cửa hàng
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tên cửa hàng */}
        <div>
          <label className="block font-semibold mb-2">Tên cửa hàng</label>
          <input
            type="text"
            name="name"
            value={formData.store.name}
            onChange={handleChange}
            placeholder="Nhập tên cửa hàng"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Mô tả */}
        <div>
          <label className="block font-semibold mb-2">Mô tả</label>
          <textarea
            name="description"
            value={formData.store.description}
            onChange={handleChange}
            placeholder="Giới thiệu ngắn về cửa hàng"
            className="w-full p-3 border border-gray-300 rounded-lg h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Danh mục cửa hàng */}
        <div className="md:col-span-2">
          <label className="block font-semibold mb-2">Danh mục cửa hàng</label>
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <label key={cat._id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={formData.store.storeCategory?.some(
                    (c) => c._id === cat._id
                  )}
                  onChange={() => handleCategoryCheckbox(cat._id)}
                  className="accent-blue-600"
                />
                <span>{cat.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Avatar */}
        <div>
          <label className="block font-semibold mb-2">Ảnh đại diện</label>
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Chọn ảnh đại diện
          </button>
          <input
            type="file"
            accept="image/*"
            name="avatar"
            ref={avatarInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          {formData.store.avatar?.preview && (
            <img
              src={formData.store.avatar.preview}
              alt="Avatar"
              className="mt-3 w-24 h-24 object-cover rounded-full border"
            />
          )}
        </div>

        {/* Cover */}
        <div>
          <label className="block font-semibold mb-2">Ảnh bìa</label>
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Chọn ảnh bìa
          </button>
          <input
            type="file"
            accept="image/*"
            name="cover"
            ref={coverInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          {formData.store.cover?.preview && (
            <img
              src={formData.store.cover.preview}
              alt="Cover"
              className="mt-3 w-full h-32 object-cover rounded-lg border"
            />
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-between mt-10">
        <button
          onClick={prevStep}
          className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
        >
          Quay lại
        </button>
        <button
          onClick={nextStep}
          className="px-5 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition"
        >
          Tiếp tục
        </button>
      </div>
    </div>
  );
};

export default Step2BasicStoreInfo;
