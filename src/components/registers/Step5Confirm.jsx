"use client";
import { deleteOwner, registerStore, registerStoreOwner } from "@/service/register";
import { uploadRegisterImages } from "@/service/upload";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { ThreeDots } from "react-loader-spinner";
import { useTranslation } from "react-i18next";

const Step5Confirm = ({ formData, prevStep }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { owner, store, paperWork } = formData;
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    try {
      const ownerRes = await registerStoreOwner(owner);
      if (!ownerRes || ownerRes.status !== 201) {
        toast.error(t("auth.register_owner_failed"));
        return;
      }
      const ownerId = ownerRes.data.data._id;

      const [avatarUrl, coverUrl] = await Promise.all([
        uploadRegisterImages(new FormData().append("file", store.avatar.file)),
        uploadRegisterImages(new FormData().append("file", store.cover.file)),
      ]);

      const IC_front = await uploadRegisterImages(new FormData().append("file", paperWork.IC_front));
      const IC_back = await uploadRegisterImages(new FormData().append("file", paperWork.IC_back));
      const businessLicense = await uploadRegisterImages(new FormData().append("file", paperWork.businessLicense));
      const storePicturesForm = new FormData();
      paperWork.storePicture.forEach((file) => storePicturesForm.append("file", file));
      const storePictures = await uploadRegisterImages(storePicturesForm);

      const storePayload = {
        ...store,
        ownerId,
        avatar: avatarUrl,
        cover: coverUrl,
        paperWork: { IC_front, IC_back, businessLicense, storePicture: storePictures },
      };

      const res = await registerStore(storePayload);
      if (res.status === true) {
        toast.success(t("auth.register_success"));
        router.push("/auth/login");
      } else {
        await deleteOwner(ownerId);
      }
    } catch (error) {
      toast.error(t("auth.register_error"));
    } finally {
      setLoading(false);
    }
  };

  const confirmRegister = async () => {
    const result = await Swal.fire({
      title: t("auth.confirm_submit_title"),
      text: t("auth.confirm_submit_text"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: t("auth.confirm_submit_btn"),
      cancelButtonText: t("auth.cancel"),
    });

    if (result.isConfirmed) {
      handleRegister();
    }
  };

  const ImagePreview = ({ file, label }) => {
    const src = file instanceof File ? URL.createObjectURL(file) : file;
    return (
      <div className='flex flex-col items-center'>
        <p className='text-sm text-gray-600'>{label}</p>
        <img src={src} alt={label} className='w-28 h-28 object-cover rounded border' />
      </div>
    );
  };

  return (
    <div className='w-full max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg'>
      {/* Owner */}
      <section className='mb-6 p-4 bg-gray-50 rounded-lg shadow-sm'>
        <h3 className='text-lg font-semibold text-gray-700 mb-3 border-b pb-2'>{t("auth.confirm_owner_section")}</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          <div className='flex flex-col'>
            <span className='text-gray-500 text-sm'>{t("auth.confirm_owner_name")}</span>
            <span className='font-medium text-gray-800'>{owner.name}</span>
          </div>
          <div className='flex flex-col'>
            <span className='text-gray-500 text-sm'>{t("auth.email")}</span>
            <span className='font-medium text-gray-800'>{owner.email}</span>
          </div>
          <div className='flex flex-col'>
            <span className='text-gray-500 text-sm'>{t("auth.confirm_owner_phone")}</span>
            <span className='font-medium text-gray-800'>{owner.phonenumber}</span>
          </div>
        </div>
      </section>

      {/* Store */}
      <section className='mb-6 p-4 bg-gray-50 rounded-lg shadow-sm'>
        <h3 className='text-lg font-semibold text-gray-700 mb-3 border-b pb-2'>{t("auth.confirm_store_section")}</h3>
        <div className='grid grid-cols-1 gap-3'>
          <div className='flex flex-col'>
            <span className='text-gray-500 text-sm'>{t("auth.confirm_store_name")}</span>
            <span className='font-medium text-gray-800'>{store.name}</span>
          </div>
          <div className='flex flex-col'>
            <span className='text-gray-500 text-sm'>{t("auth.confirm_store_category")}</span>
            <span className='font-medium text-gray-800'>{store.storeCategory.map((c) => c.name).join(", ")}</span>
          </div>
          <div className='flex flex-col'>
            <span className='text-gray-500 text-sm'>{t("auth.confirm_store_description")}</span>
            <span className='font-medium text-gray-800'>{store.description}</span>
          </div>
          <div className='flex gap-4 mt-3'>
            {store.avatar && <ImagePreview file={store.avatar.preview} label='Avatar' />}
            {store.cover && <ImagePreview file={store.cover.preview} label='Cover' />}
          </div>
        </div>
      </section>

      {/* Address */}
      <section className='mb-6 p-4 bg-gray-50 rounded-lg shadow-sm'>
        <h3 className='text-lg font-semibold text-gray-700 mb-3 border-b pb-2'>{t("auth.confirm_address_section")}</h3>
        <div className='grid grid-cols-1 gap-3'>
          <div className='flex flex-col'>
            <span className='text-gray-500 text-sm'>{t("auth.confirm_full_address")}</span>
            <span className='font-medium text-gray-800'>{store.address.full_address}</span>
          </div>
        </div>
      </section>

      {/* Documents */}
      <section className='mb-6 p-4 bg-gray-50 rounded-lg shadow-sm'>
        <h3 className='text-lg font-semibold text-gray-700 mb-3 border-b pb-2'>{t("auth.confirm_paperwork_section")}</h3>
        <div className='flex flex-wrap gap-4 mt-3'>
          {paperWork.IC_front && <ImagePreview file={paperWork.IC_front} label={t("auth.ic_front")} />}
          {paperWork.IC_back && <ImagePreview file={paperWork.IC_back} label={t("auth.ic_back")} />}
          {paperWork.businessLicense && <ImagePreview file={paperWork.businessLicense} label={t("auth.business_license")} />}
        </div>
      </section>

      {/* Store photos */}
      {paperWork.storePicture.length > 0 && (
        <section className='mb-6 p-4 bg-gray-50 rounded-lg shadow-sm'>
          <h3 className='text-lg font-semibold text-gray-700 mb-3 border-b pb-2'>{t("auth.confirm_pictures_section")}</h3>
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-3'>
            {paperWork.storePicture.map((file, idx) => (
              <div key={idx} className='flex flex-col items-center'>
                <img
                  src={URL.createObjectURL(file)}
                  alt={`store-pic-${idx}`}
                  className='w-full h-32 object-cover rounded border'
                />
                <span className='text-sm text-gray-500 mt-1'>Ảnh {idx + 1}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Navigation */}
      <div className='flex justify-between mt-8'>
        <button
          onClick={prevStep}
          className='px-6 py-2 rounded-xl bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-400 hover:to-gray-500 text-white font-semibold transition'
        >
          {t("auth.back")}
        </button>
        <button
          onClick={confirmRegister}
          className='px-6 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-500 text-white font-semibold transition'
        >
          {t("auth.submit_register")}
        </button>
      </div>

      {loading && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50'>
          <ThreeDots visible={true} height='80' width='80' color='#fc6011' radius='9' />
        </div>
      )}
    </div>
  );
};

export default Step5Confirm;
