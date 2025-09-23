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
import { toast } from "react-toastify";
import StoreTime from "@/components/store-info/StoreTime";
import StoreInfo from "@/components/store-info/StoreInfo";
import StoreImages from "@/components/store-info/StoreImage";
import { uploadImages } from "@/service/upload";
import StorePaperwork from "@/components/store-info/StorePaperwork";
import StoreAddress from "@/components/store-info/StoreAddress";

const page = () => {
  const [storeInfo, setStoreInfo] = useState(null);
  const [categories, setCategories] = useState([]);

  const fetchStore = async () => {
    const res = await getInformation();
    if (res.success) {
      setStoreInfo(res.data); // set toàn bộ object vào luôn
    } else {
      console.error("Lỗi khi lấy thông tin cửa hàng:", res.message);
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
        console.error("Không thể tải danh mục cửa hàng:", error);
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
        toast.error("Lỗi khi chuyển trạng thái");
      }
    } catch (error) {
      toast.error("Không thể thay đổi trạng thái mở cửa:", error.message);
    }
  };

  const handleUpdateTime = async (data) => {
    try {
      const res = await updateHours(data);
      console.log(res);
      if (res && res.success === true) {
        // Gọi lại API để lấy dữ liệu mới
        await fetchStore();
        toast.success("Cập nhật giờ thành công");
      } else {
        toast.error("Lỗi khi cập nhật giờ hoạt động");
      }
    } catch (error) {
      toast.error("Không thể cập nhật giờ:", error.message);
    }
  };

  const handleUpdateInfo = async (data) => {
    try {
      const res = await upadteInfo(data); // gọi API update
      if (res && res.success === true) {
        await fetchStore();
        toast.success("Cập nhật thông tin cửa hàng thành công");
      } else {
        toast.error("Cập nhật thất bại");
      }
    } catch (err) {
      toast.error("Lỗi khi cập nhật:", err.message);
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
        console.log("resImg ", res);
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
        toast.success("Cập nhật thông tin cửa hàng thành công");
      } else {
        toast.error("Cập nhật thất bại");
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật:", err);
      toast.error("Lỗi khi cập nhật: " + err.message);
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
          throw new Error("Upload CMND mặt trước thất bại");
        }
      }

      if (files.IC_back) {
        const formData = new FormData();
        formData.append("file", files.IC_back);
        const res = await uploadImages(formData);
        if (Array.isArray(res) && res.length > 0) {
          IC_back_url = res[0].url;
        } else {
          throw new Error("Upload CMND mặt sau thất bại");
        }
      }

      if (files.businessLicense) {
        const formData = new FormData();
        formData.append("file", files.businessLicense);
        const res = await uploadImages(formData);
        if (Array.isArray(res) && res.length > 0) {
          businessLicense_url = res[0].url;
        } else {
          throw new Error("Upload giấy phép kinh doanh thất bại");
        }
      }

      if (files.storePicture && files.storePicture.length > 0) {
        const formData = new FormData();
        files.storePicture.forEach((file) => formData.append("file", file));
        const res = await uploadImages(formData);
        if (Array.isArray(res) && res.length > 0) {
          storePicture_urls = res.map((img) => img.url);
        } else {
          throw new Error("Upload hình ảnh cửa hàng thất bại");
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
        toast.success("Cập nhật giấy tờ thành công");
      } else {
        toast.error("Cập nhật giấy tờ thất bại");
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật giấy tờ:", err);
      toast.error("Lỗi: " + err.message);
    }
  };

  const handleUpdateAddress = async (data) => {
    try {
      const res = await updateAddress(data);
      console.log(res);
      if (res && res.success === true) {
        // Gọi lại API để lấy dữ liệu mới
        await fetchStore();
        toast.success("Cập nhật địa chỉ thành công");
      } else {
        toast.error("Lỗi khi cập nhật địa chỉ");
      }
    } catch (error) {
      toast.error("Không thể cập nhật địa chỉ:", error.message);
    }
  };

  return (
    <>
      <div className='overflow-y-scroll h-full'>
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
