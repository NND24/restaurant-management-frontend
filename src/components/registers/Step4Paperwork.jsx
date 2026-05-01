import React, { useState, useEffect } from "react";
import { FaUpload } from "react-icons/fa";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const Step4Paperwork = ({ formData, setFormData, nextStep, prevStep }) => {
  const { t } = useTranslation();
  const [preview, setPreview] = useState({
    IC_front: null,
    IC_back: null,
    businessLicense: null,
    storePicture: [],
  });

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
      toast.error(t("auth.ic_front_required"));
      return;
    }
    if (!IC_back) {
      toast.error(t("auth.ic_back_required"));
      return;
    }
    if (!businessLicense) {
      toast.error(t("auth.business_license_required"));
      return;
    }
    if (!storePicture || storePicture.length === 0) {
      toast.error(t("auth.store_pictures_required"));
      return;
    }

    nextStep();
  };

  const renderFileInput = (label, field, multiple = false) => (
    <div className='mb-4'>
      <label className='block font-medium mb-1'>{label}</label>

      <label className='px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 inline-flex items-center gap-2 mb-2'>
        <FaUpload /> {t("auth.choose_photo")}
        <input
          type='file'
          accept='image/*'
          multiple={multiple}
          onChange={(e) => (multiple ? handleMultipleFileChange(e) : handleFileChange(e, field))}
          className='hidden'
        />
      </label>

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
      <h2 className='text-3xl font-bold text-center text-gray-800 mb-10'>{t("auth.paperwork_title")}</h2>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        {renderFileInput(t("auth.ic_front"), "IC_front")}
        {renderFileInput(t("auth.ic_back"), "IC_back")}
        {renderFileInput(t("auth.business_license"), "businessLicense")}
        {renderFileInput(t("auth.store_pictures"), "storePicture", true)}
      </div>

      {preview.storePicture.length > 0 && (
        <>
          <h3 className='text-lg font-semibold mt-10 mb-2'>{t("auth.store_picture_preview")}</h3>
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
          {t("auth.back")}
        </button>
        <button
          onClick={handleNextStep}
          className='px-6 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-500 text-white font-semibold transition'
        >
          {t("auth.continue")}
        </button>
      </div>
    </div>
  );
};

export default Step4Paperwork;
