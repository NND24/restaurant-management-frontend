import { checkOwnerInfo } from "@/service/register";
import React, { useState } from "react";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { toast } from "react-toastify";

const Step1OwnerAccount = ({ formData, setFormData, nextStep }) => {
  const [localOwner, setLocalOwner] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phonenumber: "",
    gender: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalOwner((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNext = async () => {
    const { name, email, phonenumber, gender, password, confirmPassword } =
      localOwner;

    // ✅ Local validation
    if (!name.trim()) {
      return toast.error("Tên không được để trống");
    }

    if (!email.includes("@")) {
      return toast.error("Email không hợp lệ");
    }

    if (!/^\d{9,11}$/.test(phonenumber)) {
      return toast.error("Số điện thoại không hợp lệ");
    }

    if (!password || password.length < 6) {
      return toast.error("Mật khẩu phải có ít nhất 6 ký tự");
    }

    if (password !== confirmPassword) {
      return toast.error("Mật khẩu nhập lại không khớp");
    }

    if (!gender) {
      return toast.error("Vui lòng chọn giới tính");
    }

    // ✅ Gọi API check trên server
    const res = await checkOwnerInfo(localOwner);
    if (res.status !== "success") {
      toast.error(res.message || "Đã xảy ra lỗi khi kiểm tra");
      return;
    }

    // ✅ Hợp lệ → lưu và chuyển bước
    setFormData((prev) => ({
      ...prev,
      owner: localOwner,
    }));
    nextStep();
  };

  const fields = [
    {
      label: "Họ tên",
      name: "name",
      placeholder: "Nhập họ tên",
      icon: <FaUser className="text-gray-400" />,
    },
    {
      label: "Email",
      name: "email",
      placeholder: "example@gmail.com",
      icon: <FaEnvelope className="text-gray-400" />,
    },
    {
      label: "Mật khẩu",
      name: "password",
      placeholder: "********",
      icon: <FaLock className="text-gray-400" />,
      isPassword: true,
      show: showPassword,
      toggleShow: () => setShowPassword(!showPassword),
    },
    {
      label: "Nhập lại mật khẩu",
      name: "confirmPassword",
      placeholder: "********",
      icon: <FaLock className="text-gray-400" />,
      isPassword: true,
      show: showConfirmPassword,
      toggleShow: () => setShowConfirmPassword(!showConfirmPassword),
    },
    {
      label: "Số điện thoại",
      name: "phonenumber",
      placeholder: "Nhập số điện thoại",
      icon: <FaPhone className="text-gray-400" />,
    },
  ];

  return (
    <div className="w-full max-w-none rounded-2xl border m-2 border-gray-100 bg-white p-[50px] shadow-lg md:px-12 lg:px-24 xl:px-32">
      <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
        Nhập thông tin tài khoản
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field, idx) => (
          <div key={idx}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            <div className="relative flex items-center border rounded-md px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 transition">
              {field.icon}
              <input
                type={
                  field.isPassword ? (field.show ? "text" : "password") : "text"
                }
                name={field.name}
                value={localOwner[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                className="ml-2 w-full pr-8 outline-none text-gray-700 bg-transparent"
              />
              {field.isPassword && (
                <button
                  type="button"
                  onClick={field.toggleShow}
                  className="absolute right-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {field.show ? <FaEyeSlash /> : <FaEye />}
                </button>
              )}
            </div>
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Giới tính
          </label>
          <div className="relative flex items-center border rounded-md px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 transition">
            <select
              name="gender"
              value={localOwner.gender}
              onChange={handleChange}
              className="w-full bg-transparent outline-none text-gray-700"
            >
              <option value="">-- Chọn giới tính --</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>
        </div>
      </div>

      <button
        onClick={handleNext}
        className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg shadow-md transition transform hover:-translate-y-0.5"
      >
        Tiếp tục
      </button>
    </div>
  );
};

export default Step1OwnerAccount;
