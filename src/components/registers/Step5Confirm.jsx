"use client";
import {
  deleteOwner,
  registerStore,
  registerStoreOwner,
} from "@/service/register";
import { uploadRegisterImages } from "@/service/upload";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { ThreeDots } from "react-loader-spinner";

const Step5Confirm = ({ formData, prevStep }) => {
  const router = useRouter();
  const { owner, store, paperWork } = formData;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("🧾 paperWork hiện tại:", formData?.paperWork);

    if (formData?.paperWork) {
      const { IC_front, IC_back, businessLicense, storePicture } =
        formData.paperWork;
      console.log("🪪 CMND Mặt Trước:", IC_front?.name);
      console.log("🪪 CMND Mặt Sau:", IC_back?.name);
      console.log("📄 Giấy phép KD:", businessLicense?.name);
      console.log(
        "🏪 Ảnh cửa hàng:",
        storePicture?.map((file) => file.name)
      );
    }
  }, [formData.paperWork]);

  const handleRegister = async () => {
    setLoading(true);
    console.log("Paper work: ", paperWork);
    try {
      // 1. Register owner
      const ownerRes = await registerStoreOwner(owner);
      if (!ownerRes || ownerRes.status !== 201) {
        toast.error(" Đăng ký chủ cửa hàng thất bại");
        return;
      }

      const ownerId = ownerRes.data.data._id;

      // 2. Upload avatar & cover
      const avatarForm = new FormData();
      avatarForm.append("file", store.avatar.file);
      const [avatarUrl] = await uploadRegisterImages(avatarForm);

      const coverForm = new FormData();
      coverForm.append("file", store.cover.file);
      const [coverUrl] = await uploadRegisterImages(coverForm);

      // 3. Upload paperwork
      // Upload IC_front
      const icFrontForm = new FormData();
      icFrontForm.append("file", paperWork.IC_front);
      const [IC_front] = await uploadRegisterImages(icFrontForm);

      // Upload IC_back
      const icBackForm = new FormData();
      icBackForm.append("file", paperWork.IC_back);
      const [IC_back] = await uploadRegisterImages(icBackForm);

      // Upload businessLicense
      const licenseForm = new FormData();
      licenseForm.append("file", paperWork.businessLicense);
      const [businessLicense] = await uploadRegisterImages(licenseForm);

      // Upload storePictures (mảng nhiều ảnh)
      const storePicsForm = new FormData();
      paperWork.storePicture.forEach((file) => {
        storePicsForm.append("file", file);
      });
      const storePictures = await uploadRegisterImages(storePicsForm);

      // 4. Final store payload
      const storePayload = {
        ...store,
        ownerId: ownerId,
        avatar: avatarUrl,
        cover: coverUrl,
        paperWork: {
          IC_front,
          IC_back,
          businessLicense,
          storePicture: storePictures,
        },
      };

      console.log("Register payload ", storePayload);
      // 5. Register store
      const res = await registerStore(storePayload);
      if (res.status === true) {
        toast.success("Đăng ký cửa hàng thành công!");
        router.push("/auth/login");
      } else {
        await deleteOwner(ownerId);
      }
    } catch (error) {
      toast.error("⚠️ Có lỗi xảy ra khi đăng ký.");
    } finally {
      setLoading(false);
    }
  };

  const confirmRegister = async () => {
    const result = await Swal.fire({
      title: "Xác nhận gửi đăng ký?",
      text: "Bạn chắc chắn muốn gửi thông tin đăng ký cửa hàng?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Gửi đăng ký",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      handleRegister();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        Xác nhận thông tin
      </h2>

      {/* Chủ cửa hàng */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Thông tin chủ cửa hàng
        </h3>
        <p>
          <strong>Họ tên:</strong> {owner.name}
        </p>
        <p>
          <strong>Email:</strong> {owner.email}
        </p>
        <p>
          <strong>Số điện thoại:</strong> {owner.phonenumber}
        </p>
      </div>

      {/* Cửa hàng */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Thông tin cửa hàng
        </h3>
        <p>
          <strong>Tên cửa hàng:</strong> {store.name}
        </p>
        <p>
          <strong>Danh mục:</strong>{" "}
          {store.storeCategory.map((cat) => cat.name).join(", ")}
        </p>
        <p>
          <strong>Mô tả:</strong> {store.description}
        </p>

        <div className="flex gap-4 mt-4">
          {store.avatar && (
            <div>
              <p className="text-sm text-gray-600">Ảnh đại diện:</p>
              <img
                src={store.avatar.preview}
                alt="avatar"
                className="w-32 h-32 object-cover rounded border"
              />
            </div>
          )}
          {store.cover && (
            <div>
              <p className="text-sm text-gray-600">Ảnh bìa:</p>
              <img
                src={store.cover.preview}
                alt="cover"
                className="w-max h-32 object-cover rounded border"
              />
            </div>
          )}
        </div>
      </div>

      {/* Địa chỉ */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Địa chỉ</h3>
        <p>
          <strong>Địa chỉ đầy đủ:</strong> {store.address.full_address}
        </p>
        <p>
          <strong>Latitude:</strong> {store.address.lat}
        </p>
        <p>
          <strong>Longitude:</strong> {store.address.lon}
        </p>
      </div>

      {/* Giấy tờ */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Giấy tờ</h3>
        <div className="grid grid-cols-2 gap-4">
          {paperWork.IC_front && (
            <div>
              <p className="text-sm">CMND/CCCD mặt trước:</p>
              <img
                src={URL.createObjectURL(paperWork.IC_front)}
                alt="IC Front"
                className="w-full h-32 object-cover rounded border"
              />
            </div>
          )}
          {paperWork.IC_back && (
            <div>
              <p className="text-sm">CMND/CCCD mặt sau:</p>
              <img
                src={URL.createObjectURL(paperWork.IC_back)}
                alt="IC Back"
                className="w-full h-32 object-cover rounded border"
              />
            </div>
          )}
          {paperWork.businessLicense && (
            <div>
              <p className="text-sm">Giấy phép kinh doanh:</p>
              <img
                src={URL.createObjectURL(paperWork.businessLicense)}
                alt="Business License"
                className="w-full h-32 object-cover rounded border"
              />
            </div>
          )}
        </div>
      </div>

      {/* Ảnh cửa hàng */}
      {paperWork.storePicture.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Ảnh cửa hàng
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {paperWork.storePicture.map((src, index) => (
              <img
                key={index}
                src={URL.createObjectURL(src)}
                alt={`store-pic-${index}`}
                className="w-full h-32 object-cover rounded border"
              />
            ))}
          </div>
        </div>
      )}

      {/* Nút điều hướng */}
      <div className="flex justify-between mt-8">
        <button
          onClick={prevStep}
          className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
        >
          Quay lại
        </button>
        <button
          onClick={confirmRegister}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          Gửi đăng ký
        </button>
      </div>
      {loading && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <ThreeDots
            visible={true}
            height="80"
            width="80"
            color="#fc6011"
            radius="9"
            ariaLabel="three-dots-loading"
          />
        </div>
      )}
    </div>
  );
};

export default Step5Confirm;
