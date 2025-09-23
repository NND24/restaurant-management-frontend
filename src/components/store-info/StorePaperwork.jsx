"use client";

import React, { useState } from "react";
import { FaPen, FaCheck, FaTimes } from "react-icons/fa";

const StorePaperwork = ({ storeInfo, onUpdatePaperwork }) => {
  const initialPaperwork = storeInfo?.paperWork || {};

  const [isEditing, setIsEditing] = useState(false);
  const [paperwork, setPaperwork] = useState(initialPaperwork);
  const [files, setFiles] = useState({
    IC_front: null,
    IC_back: null,
    businessLicense: null,
    storePicture: [],
  });

  const handleSelectFile = (e, key, isMultiple = false) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    if (isMultiple) {
      const newFiles = Array.from(fileList);
      setFiles((prev) => ({
        ...prev,
        [key]: newFiles,
      }));
      setPaperwork((prev) => ({
        ...prev,
        [key]: newFiles.map((file) => ({
          url: URL.createObjectURL(file),
        })),
      }));
    } else {
      const file = fileList[0];
      setFiles((prev) => ({ ...prev, [key]: file }));
      setPaperwork((prev) => ({
        ...prev,
        [key]: { url: URL.createObjectURL(file) },
      }));
    }
  };

  const handleSave = () => {
    onUpdatePaperwork({
      files,
      previewUrls: paperwork,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setPaperwork(initialPaperwork);
    setFiles({
      IC_front: null,
      IC_back: null,
      businessLicense: null,
      storePicture: [],
    });
    setIsEditing(false);
  };

  return (
    <div className='space-y-6 rounded-xl bg-white p-6 shadow-md'>
      <div className='flex items-center justify-between'>
        <h2 className='text-xl font-semibold text-gray-800'>Giấy tờ cửa hàng</h2>
        {!isEditing && (
          <button
            className='text-orange-600 hover:text-orange-800'
            onClick={() => setIsEditing(true)}
            title='Chỉnh sửa'
          >
            <FaPen />
          </button>
        )}
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {/* CMND Mặt Trước */}
        <div>
          <p className='font-medium mb-2'>CMND - Mặt trước</p>
          {paperwork?.IC_front?.url && (
            <img
              src={paperwork.IC_front.url}
              alt='CMND Mặt trước'
              className='w-full h-40 object-cover rounded-lg border'
            />
          )}
          {isEditing && (
            <label className='mt-2 inline-block cursor-pointer bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600'>
              Chọn ảnh
              <input
                type='file'
                accept='image/*'
                className='hidden'
                onChange={(e) => handleSelectFile(e, "IC_front")}
              />
            </label>
          )}
        </div>

        {/* CMND Mặt Sau */}
        <div>
          <p className='font-medium mb-2'>CMND - Mặt sau</p>
          {paperwork?.IC_back?.url && (
            <img
              src={paperwork.IC_back.url}
              alt='CMND Mặt sau'
              className='w-full h-40 object-cover rounded-lg border'
            />
          )}
          {isEditing && (
            <label className='mt-2 inline-block cursor-pointer bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600'>
              Chọn ảnh
              <input type='file' accept='image/*' className='hidden' onChange={(e) => handleSelectFile(e, "IC_back")} />
            </label>
          )}
        </div>

        {/* Giấy phép kinh doanh */}
        <div>
          <p className='font-medium mb-2'>Giấy phép kinh doanh</p>
          {paperwork?.businessLicense?.url && (
            <img
              src={paperwork.businessLicense.url}
              alt='Giấy phép kinh doanh'
              className='w-full h-40 object-cover rounded-lg border'
            />
          )}
          {isEditing && (
            <label className='mt-2 inline-block cursor-pointer bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600'>
              Chọn ảnh
              <input
                type='file'
                accept='image/*'
                className='hidden'
                onChange={(e) => handleSelectFile(e, "businessLicense")}
              />
            </label>
          )}
        </div>
      </div>

      {/* Hình ảnh cửa hàng */}
      <div className='mt-6'>
        <p className='font-medium mb-2'>Hình ảnh cửa hàng</p>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          {paperwork?.storePicture?.map((img, index) => (
            <img
              key={index}
              src={img.url}
              alt={`Hình cửa hàng ${index + 1}`}
              className='w-full h-32 object-cover rounded-lg border'
            />
          ))}
        </div>
        {isEditing && (
          <label className='mt-2 inline-block cursor-pointer bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600'>
            Thêm ảnh
            <input
              type='file'
              accept='image/*'
              multiple
              className='hidden'
              onChange={(e) => handleSelectFile(e, "storePicture", true)}
            />
          </label>
        )}
      </div>

      {/* Buttons */}
      {isEditing && (
        <div className='flex justify-end gap-4 mt-4'>
          <button className='text-green-600 hover:text-green-800' onClick={handleSave} title='Lưu'>
            <FaCheck />
          </button>
          <button className='text-red-600 hover:text-red-800' onClick={handleCancel} title='Hủy'>
            <FaTimes />
          </button>
        </div>
      )}
    </div>
  );
};

export default StorePaperwork;
