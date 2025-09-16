import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const StaffModel = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = {},
  isUpdate = false,
  readOnly = false,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phonenumber: "",
    gender: "male",
    role: "staff",
  });

  useEffect(() => {
    if (isOpen && isUpdate && initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
      }));
    } else if (isOpen && !isUpdate) {
      // reset khi mở modal mới
      setFormData({
        name: "",
        email: "",
        phonenumber: "",
        gender: "male",
        role: "staff",
      });
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = [];

    // Validate các trường bắt buộc
    if (!formData.name.trim()) errors.push("Họ tên không được để trống.");
    if (!formData.email.trim()) errors.push("Email không được để trống.");
    if (!formData.phonenumber.trim())
      errors.push("Số điện thoại không được để trống.");
    else if (!/^\d+$/.test(formData.phonenumber.trim()))
      errors.push("Số điện thoại chỉ được chứa chữ số.");

    if (errors.length > 0) {
      errors.forEach((err) => toast.error(err)); // hoặc alert(err)
      return;
    }

    // Có thể xác nhận bằng swal nếu muốn
    const confirm = await Swal.fire({
      title: isUpdate
        ? "Xác nhận cập nhật nhân viên?"
        : "Xác nhận thêm mới nhân viên?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: isUpdate ? "Cập nhật" : "Thêm",
      cancelButtonText: "Hủy",
    });

    if (confirm.isConfirmed) {
      onSubmit(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>

      <div className="fixed top-1/2 left-1/2 z-50 w-full max-w-5xl -translate-x-1/2 -translate-y-1/2 transform overflow-y-auto max-h-[90vh] rounded-lg bg-white p-6 shadow-[0_3px_8px_rgba(0,0,0,0.24)]">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">
            {readOnly
              ? "Thông tin nhân viên"
              : isUpdate
              ? "Cập nhật nhân viên"
              : "Thêm nhân viên mới"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-xl font-bold"
          >
            &times;
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Họ tên"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={readOnly}
            />
            <Input
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={readOnly}
            />

            <Select
              label="Giới tính"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              options={[
                { label: "Nam", value: "male" },
                { label: "Nữ", value: "female" },
                { label: "Khác", value: "other" },
              ]}
              disabled={readOnly}
            />

            <Input
              label="Số điện thoại"
              name="phonenumber"
              value={formData.phonenumber}
              onChange={handleChange}
              disabled={readOnly}
            />
            <Select
              label="Vai trò"
              name="role"
              value={formData.role}
              onChange={handleChange}
              options={[
                { label: "Nhân viên", value: "staff" },
                { label: "Quản lý", value: "manager" },
              ]}
              disabled={readOnly}
            />
          </div>

          {!readOnly && (
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
              >
                {isUpdate ? "Cập nhật" : "Lưu"}
              </button>
            </div>
          )}
        </form>
      </div>
    </>
  );
};

// Subcomponent Input
const Input = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  disabled = false,
  readOnly = false, // ✅ thêm prop
}) => (
  <div className={`${readOnly ? "hidden" : ""}`}>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full rounded border-solid border-gray-300 border-[1px] px-3 py-2 ${
        disabled ? "bg-gray-100" : ""
      }`}
    />
  </div>
);

// Subcomponent Select
const Select = ({
  label,
  name,
  value,
  onChange,
  options,
  disabled = false,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled} // ✅ THÊM VÀO ĐÂY
      className={`w-full rounded border-solid border-gray-300 border-[1px] px-3 py-2 ${
        disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
      }`}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

export default StaffModel;
