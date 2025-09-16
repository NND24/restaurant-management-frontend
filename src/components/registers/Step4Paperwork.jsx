"use client";
import React, { useState } from "react";
import { FaUpload } from "react-icons/fa";

const Step4Paperwork = ({ formData, setFormData, nextStep, prevStep }) => {
  const [preview, setPreview] = useState({
    IC_front: null,
    IC_back: null,
    businessLicense: null,
    storePicture: [],
  });

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      paperWork: {
        ...prev.paperWork,
        [field]: file,
      },
    }));

    setPreview((prev) => ({
      ...prev,
      [field]: URL.createObjectURL(file),
    }));
  };

  const handleMultipleFileChange = (e) => {
    const files = Array.from(e.target.files);

    setFormData((prev) => ({
      ...prev,
      paperWork: {
        ...prev.paperWork,
        storePicture: files,
      },
    }));

    setPreview((prev) => ({
      ...prev,
      storePicture: files.map((file) => URL.createObjectURL(file)),
    }));
  };

  const renderFileInput = (label, field, multiple = false) => (
    <div>
      <label className="block font-medium mb-1">{label}</label>
      <div className="flex items-center gap-4">
        <label className="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 inline-flex items-center gap-2">
          <FaUpload /> Chọn ảnh
          <input
            type="file"
            accept="image/*"
            multiple={multiple}
            onChange={(e) =>
              multiple
                ? handleMultipleFileChange(e)
                : handleFileChange(e, field)
            }
            className="hidden"
          />
        </label>
        {!multiple && preview[field] && (
          <img
            src={preview[field]}
            alt="preview"
            className="h-20 w-100 rounded object-cover border"
          />
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full rounded-2xl border m-2 border-gray-100 bg-white p-6 md:p-10 lg:p-16 shadow-lg">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">
        Bổ sung giấy tờ
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {renderFileInput("CMND/CCCD Mặt Trước", "IC_front")}
        {renderFileInput("CMND/CCCD Mặt Sau", "IC_back")}
        {renderFileInput("Giấy phép kinh doanh", "businessLicense")}
        {renderFileInput("Ảnh cửa hàng (nhiều ảnh)", "storePicture", true)}
      </div>

      {preview.storePicture.length > 0 && (
        <>
          <h3 className="text-lg font-semibold mt-10 mb-2">
            Xem trước ảnh cửa hàng
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {preview.storePicture.map((src, index) => (
              <img
                key={index}
                src={src}
                alt={`store-pic-${index}`}
                className="w-full h-32 object-cover rounded-lg border"
              />
            ))}
          </div>
        </>
      )}

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
          Tiếp theo
        </button>
      </div>
    </div>
  );
};

export default Step4Paperwork;
