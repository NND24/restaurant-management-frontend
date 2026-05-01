"use client";
import {
  getInformation,
  toggleOpenStatus,
  upadteInfo,
  updateAddress,
  updateHours,
  updateImages,
  updatePaperwork,
} from "@/service/storeInfo";
import { getAllSystemCategories } from "@/service/systemCategory";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import StoreTime from "@/components/store-info/StoreTime";
import StoreInfo from "@/components/store-info/StoreInfo";
import StoreImages from "@/components/store-info/StoreImage";
import { uploadImages } from "@/service/upload";
import StorePaperwork from "@/components/store-info/StorePaperwork";
import StoreAddress from "@/components/store-info/StoreAddress";
import Heading from "@/components/Heading";

const page = () => {
  const { t } = useTranslation();
  const [storeInfo, setStoreInfo] = useState(null);
  const [categories, setCategories] = useState([]);

  const fetchStore = async () => {
    const res = await getInformation();
    if (res.success) {
      setStoreInfo(res.data); // set toàn bộ object vào luôn
    } else {
      console.error(t("store.fetch_error"), res.message);
    }
  };

  useEffect(() => {
    fetchStore();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllSystemCategories();
        setCategories(data);
      } catch (error) {
        console.error(t("store.fetch_categories_error"), error);
      }
    };

    fetchCategories();
  }, []);

  // Handle toggle
  const handleToggleOpenStatus = async () => {
    try {
      const res = await toggleOpenStatus();
      if (res && res.data?.openStatus) {
        setStoreInfo((prev) => ({
          ...prev,
          openStatus: res.data.openStatus,
        }));
      } else {
        toast.error(t("store.toggle_status_error"));
      }
    } catch (error) {
      toast.error(t("store.toggle_status_failed") + error.message);
    }
  };

  const handleUpdateTime = async (data) => {
    try {
      const res = await updateHours(data);
      if (res && res.success === true) {
        // Gọi lại API để lấy dữ liệu mới
        await fetchStore();
        toast.success(t("store.update_hours_success"));
      } else {
        toast.error(t("store.update_hours_error"));
      }
    } catch (error) {
      toast.error(t("store.update_hours_failed") + error.message);
    }
  };

  const handleUpdateInfo = async (data) => {
    try {
      const res = await upadteInfo(data); // gọi API update
      if (res && res.success === true) {
        await fetchStore();
        toast.success(t("store.update_info_success"));
      } else {
        toast.error(t("store.update_failed"));
      }
    } catch (err) {
      toast.error(t("store.update_error") + err.message);
    }
  };

  const handleUpdateImages = async (data) => {
    try {
      // Giữ nguyên ảnh cũ nếu không upload mới
      let avatarUrl = data.originalAvatarUrl;
      let coverUrl = data.originalCoverUrl;

      // Upload avatar nếu có
      if (data.avatar) {
        const avatarFormData = new FormData();
        avatarFormData.append("file", data.avatar); // phải đúng field 'images'
        const res = await uploadImages(avatarFormData); // gọi API upload
        if (Array.isArray(res) && res.length > 0) {
          avatarUrl = res[0].url;
        } else {
          throw new Error("Upload avatar failed: " + (res?.message || "Unknown error"));
        }
      }

      // Upload cover nếu có
      if (data.cover) {
        const coverFormData = new FormData();
        coverFormData.append("file", data.cover); // phải đúng field 'images'
        const res = await uploadImages(coverFormData);

        if (Array.isArray(res) && res.length > 0) {
          coverUrl = res[0].url;
        } else {
          throw new Error("Upload cover failed: " + (res?.message || "Unknown error"));
        }
      }

      // Cập nhật store với avatarUrl và coverUrl mới
      const updateRes = await updateImages({ avatarUrl, coverUrl });

      if (updateRes?.success) {
        await fetchStore(); // làm mới dữ liệu hiển thị
        toast.success(t("store.update_info_success"));
      } else {
        toast.error(t("store.update_failed"));
      }
    } catch (err) {
      console.error(t("store.update_error"), err);
      toast.error(t("store.update_error") + err.message);
    }
  };

  const handleUpdatePaperwork = async (data) => {
    try {
      const {
        files, // { IC_front, IC_back, businessLicense, storePicture[] }
        previewUrls, // { IC_front: { url }, ... } dùng nếu không upload mới
      } = data;

      let IC_front_url = previewUrls?.IC_front?.url || "";
      let IC_back_url = previewUrls?.IC_back?.url || "";
      let businessLicense_url = previewUrls?.businessLicense?.url || "";
      let storePicture_urls = previewUrls?.storePicture?.map((img) => img.url) || [];

      // Upload từng ảnh nếu có file mới
      if (files.IC_front) {
        const formData = new FormData();
        formData.append("file", files.IC_front);
        const res = await uploadImages(formData);
        if (Array.isArray(res) && res.length > 0) {
          IC_front_url = res[0].url;
        } else {
          throw new Error(t("store.upload_ic_front_failed"));
        }
      }

      if (files.IC_back) {
        const formData = new FormData();
        formData.append("file", files.IC_back);
        const res = await uploadImages(formData);
        if (Array.isArray(res) && res.length > 0) {
          IC_back_url = res[0].url;
        } else {
          throw new Error(t("store.upload_ic_back_failed"));
        }
      }

      if (files.businessLicense) {
        const formData = new FormData();
        formData.append("file", files.businessLicense);
        const res = await uploadImages(formData);
        if (Array.isArray(res) && res.length > 0) {
          businessLicense_url = res[0].url;
        } else {
          throw new Error(t("store.upload_business_license_failed"));
        }
      }

      if (files.storePicture && files.storePicture.length > 0) {
        const formData = new FormData();
        files.storePicture.forEach((file) => formData.append("file", file));
        const res = await uploadImages(formData);
        if (Array.isArray(res) && res.length > 0) {
          storePicture_urls = res.map((img) => img.url);
        } else {
          throw new Error(t("store.upload_store_picture_failed"));
        }
      }

      // Gửi API cập nhật paperwork (phải đúng định dạng)
      const updateRes = await updatePaperwork({
        IC_front: IC_front_url ? { url: IC_front_url, filePath: "" } : undefined,
        IC_back: IC_back_url ? { url: IC_back_url, filePath: "" } : undefined,
        businessLicense: businessLicense_url ? { url: businessLicense_url, filePath: "" } : undefined,
        storePicture: storePicture_urls.map((url) => ({
          url,
          filePath: "",
        })),
      });

      if (updateRes?.success) {
        await fetchStore(); // làm mới UI
        toast.success(t("store.update_paperwork_success"));
      } else {
        toast.error(t("store.update_paperwork_failed"));
      }
    } catch (err) {
      console.error(t("store.update_paperwork_error"), err);
      toast.error(t("common.error") + ": " + err.message);
    }
  };

  const handleUpdateAddress = async (data) => {
    try {
      const res = await updateAddress(data);
      if (res && res.success === true) {
        // Gọi lại API để lấy dữ liệu mới
        await fetchStore();
        toast.success(t("store.update_address_success"));
      } else {
        toast.error(t("store.update_address_error"));
      }
    } catch (error) {
      toast.error(t("store.update_address_failed") + error.message);
    }
  };

  return (
    <>
      <Heading title={t("store.title")} description='' keywords='' />
      <div className='overflow-y-scroll h-full p-5'>
        {storeInfo && (
          <div className='space-y-6'>
            {/* Giờ hoạt động cửa hàng */}
            <StoreTime
              openHour={storeInfo.openHour}
              closeHour={storeInfo.closeHour}
              openStatus={storeInfo.openStatus}
              onToggle={handleToggleOpenStatus}
              onUpdateTime={handleUpdateTime}
            />

            {/* Thông tin cửa hàng */}
            <StoreInfo storeInfo={storeInfo} categories={categories} onUpdateInfo={handleUpdateInfo} />

            {/* Ảnh cửa hàng */}
            <StoreImages
              avatarUrl={storeInfo.avatar?.url}
              coverUrl={storeInfo.cover?.url}
              onUpdateImages={handleUpdateImages}
            />

            {/* Địa chỉ cửa hàng */}
            <StoreAddress address={storeInfo.address} onUpdateAddress={handleUpdateAddress} />

            {/* Giấy tờ */}
            <StorePaperwork storeInfo={storeInfo} onUpdatePaperwork={handleUpdatePaperwork} />
          </div>
        )}
      </div>
    </>
  );
};

export default page;
