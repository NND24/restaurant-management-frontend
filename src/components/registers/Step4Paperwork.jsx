import React, { useState, useEffect } from "react";
import { FaUpload } from "react-icons/fa";
import { toast } from "react-toastify";

const Step4Paperwork = ({ formData, setFormData, nextStep, prevStep }) => {
  const [preview, setPreview] = useState({
    IC_front: null,
    IC_back: null,
    businessLicense: null,
    storePicture: [],
  });

  // ✅ Sync preview với formData khi component mount hoặc formData thay đổi
  useEffect(() => {
    if (formData.paperWork) {
      setPreview({
        IC_front: formData.paperWork.IC_front ? URL.createObjectURL(formData.paperWork.IC_front) : null,
        IC_back: formData.paperWork.IC_back ? URL.createObjectURL(formData.paperWork.IC_back) : null,
        businessLicense: formData.paperWork.businessLicense
          ? URL.createObjectURL(formData.paperWork.businessLicense)
          : null,
        storePicture: formData.paperWork.storePicture
          ? formData.paperWork.storePicture.map((file) => URL.createObjectURL(file))
          : [],
      });
    }
  }, [formData.paperWork]);

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
        storePicture: [...(prev.paperWork?.storePicture || []), ...files],
      },
    }));

    setPreview((prev) => ({
      ...prev,
      storePicture: [...(prev.storePicture || []), ...files.map((file) => URL.createObjectURL(file))],
    }));
  };

  const handleNextStep = () => {
    const { IC_front, IC_back, businessLicense, storePicture } = formData.paperWork || {};

    if (!IC_front) {
      toast.error("Vui lòng chọn CMND/CCCD mặt trước");
      return;
    }
    if (!IC_back) {
      toast.error("Vui lòng chọn CMND/CCCD mặt sau");
      return;
    }
    if (!businessLicense) {
      toast.error("Vui lòng chọn Giấy phép kinh doanh");
      return;
    }
    if (!storePicture || storePicture.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 ảnh cửa hàng");
      return;
    }

    nextStep();
  };

  const renderFileInput = (label, field, multiple = false) => (
    <div className='mb-4'>
      <label className='block font-medium mb-1'>{label}</label>

      {/* Nút chọn ảnh */}
      <label className='px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 inline-flex items-center gap-2 mb-2'>
        <FaUpload /> Chọn ảnh
        <input
          type='file'
          accept='image/*'
          multiple={multiple}
          onChange={(e) => (multiple ? handleMultipleFileChange(e) : handleFileChange(e, field))}
          className='hidden'
        />
      </label>

      {/* Preview ảnh hiển thị dưới nút */}
      {!multiple && preview[field] && (
        <div className='relative w-48 h-w-48 border rounded-lg overflow-hidden shadow hover:shadow-lg transition'>
          <img src={preview[field]} alt='preview' className='w-full h-full object-cover' />
          <span className='absolute bottom-0 left-0 right-0 bg-black bg-opacity-40 text-white text-xs text-center py-1'>
            {label}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className='w-full rounded-2xl border m-2 border-gray-100 bg-white p-6 md:p-10 lg:p-16 shadow-lg'>
      <h2 className='text-3xl font-bold text-center text-gray-800 mb-10'>Bổ sung giấy tờ</h2>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        {renderFileInput("CMND/CCCD Mặt Trước", "IC_front")}
        {renderFileInput("CMND/CCCD Mặt Sau", "IC_back")}
        {renderFileInput("Giấy phép kinh doanh", "businessLicense")}
        {renderFileInput("Ảnh cửa hàng (nhiều ảnh)", "storePicture", true)}
      </div>

      {preview.storePicture.length > 0 && (
        <>
          <h3 className='text-lg font-semibold mt-10 mb-2'>Xem trước ảnh cửa hàng</h3>
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
            {preview.storePicture.map((src, index) => (
              <img
                key={index}
                src={src}
                alt={`store-pic-${index}`}
                className='w-full h-48 object-cover rounded-lg border'
              />
            ))}
          </div>
        </>
      )}

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

export default Step4Paperwork;
