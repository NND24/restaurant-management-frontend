"use client";
import { getAllSystemCategories } from "@/service/systemCategory";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

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

  const handleNextStep = () => {
    if (!formData.store.name || !formData.store.name.trim()) {
      toast.error("Vui lòng nhập tên cửa hàng");
      return;
    }

    if (!formData.store.avatar?.file) {
      toast.error("Vui lòng chọn ảnh đại diện cho cửa hàng");
      return;
    }

    if (!formData.store.storeCategory || formData.store.storeCategory.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 danh mục cho cửa hàng");
      return;
    }

    nextStep();
  };

  return (
    <div className='w-full max-w-4xl mx-auto rounded-3xl bg-white shadow-xl p-8 md:px-12 lg:px-20 xl:px-32'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {/* Tên cửa hàng */}
        <div className='md:col-span-2'>
          <label className='block font-semibold text-gray-700 mb-1'>Tên cửa hàng</label>
          <input
            type='text'
            name='name'
            value={formData.store.name}
            onChange={handleChange}
            placeholder='Nhập tên cửa hàng'
            className='w-full px-3 py-2 border bg-[#f5f5f5] border-gray-300 rounded-lg shadow-sm transition'
          />
        </div>

        {/* Mô tả - cũng chiếm toàn bộ cột */}
        <div className='md:col-span-2'>
          <label className='block font-semibold text-gray-700 mb-1'>Mô tả</label>
          <textarea
            name='description'
            value={formData.store.description}
            onChange={handleChange}
            placeholder='Giới thiệu ngắn về cửa hàng'
            className='w-full px-3 py-2 border bg-[#f5f5f5] border-gray-300 rounded-lg shadow-sm h-[100px] resize-none transition'
          />
        </div>

        {/* Danh mục cửa hàng */}
        <div className='md:col-span-2'>
          <label className='block font-semibold text-gray-700 mb-1'>Danh mục cửa hàng</label>
          <div className='flex flex-wrap gap-3'>
            {categories.map((cat) => (
              <label
                key={cat._id}
                className='flex items-center gap-2 text-base bg-gray-100 px-4 py-2 rounded-xl cursor-pointer hover:bg-gray-200 transition shadow-sm'
              >
                <input
                  type='checkbox'
                  checked={formData.store.storeCategory?.some((c) => c._id === cat._id)}
                  onChange={() => handleCategoryCheckbox(cat._id)}
                  className='w-4 h-4 accent-orange-500 rounded transition duration-200'
                />
                <span className='select-none font-medium'>{cat.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Avatar */}
        <div>
          <label className='block font-semibold text-gray-700 mb-1'>Ảnh đại diện</label>
          <button
            type='button'
            onClick={() => avatarInputRef.current?.click()}
            className='w-full flex justify-center items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-500 text-white transition font-medium'
          >
            Chọn ảnh đại diện
          </button>
          <input
            type='file'
            accept='image/*'
            name='avatar'
            ref={avatarInputRef}
            onChange={handleFileChange}
            className='hidden'
          />
          {formData.store.avatar?.preview && (
            <div className='w-full flex justify-center'>
              <img
                src={formData.store.avatar.preview}
                alt='Avatar'
                className='mt-3 w-28 h-28 object-cover rounded-full border-2 border-gray-200 shadow'
              />
            </div>
          )}
        </div>

        {/* Cover */}
        <div>
          <label className='block font-semibold text-gray-700 mb-1'>Ảnh bìa</label>
          <button
            type='button'
            onClick={() => coverInputRef.current?.click()}
            className='w-full flex justify-center items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-500 text-white transition font-medium'
          >
            Chọn ảnh bìa
          </button>
          <input
            type='file'
            accept='image/*'
            name='cover'
            ref={coverInputRef}
            onChange={handleFileChange}
            className='hidden'
          />
          {formData.store.cover?.preview && (
            <img
              src={formData.store.cover.preview}
              alt='Cover'
              className='mt-3 w-full h-40 object-cover rounded-xl border-2 border-gray-200 shadow'
            />
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className='flex justify-between mt-10'>
        <button
          onClick={prevStep}
          className='px-6 py-2 rounded-xl bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-400 hover:to-gray-500 text-white font-semibold transition'
        >
          Quay lại
        </button>
        <button
          onClick={handleNextStep}
          className='px-6 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-500 text-white font-semibold transition'
        >
          Tiếp tục
        </button>
      </div>
    </div>
  );
};

export default Step2BasicStoreInfo;
