import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const ShippingFeeModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = {},
  isUpdate = false,
  readOnly = false,
}) => {
  const [formData, setFormData] = useState({
    fromDistance: "",
    feePerKm: "",
  });

  useEffect(() => {
    if (isOpen && isUpdate && initialData) {
      setFormData({
        fromDistance: initialData.fromDistance || "",
        feePerKm: initialData.feePerKm || "",
      });
    } else if (isOpen && !isUpdate) {
      // Reset form when modal opens for new entry
      setFormData({
        fromDistance: "",
        feePerKm: "",
      });
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = [];

    // Validate số nguyên dương
    const isPositiveInteger = (val) => /^\d+$/.test(val) && parseInt(val) >= 0;

    if (!isPositiveInteger(formData.fromDistance)) {
      errors.push("Khoảng cách bắt đầu phải là số nguyên dương.");
    }
    if (!isPositiveInteger(formData.feePerKm)) {
      errors.push("Phí mỗi km phải là số nguyên dương.");
    }

    if (errors.length > 0) {
      errors.forEach((err) => toast.error(err));
      return;
    }

    const confirm = await Swal.fire({
      title: isUpdate
        ? "Xác nhận cập nhật phí ship?"
        : "Xác nhận thêm mức phí mới?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: isUpdate ? "Cập nhật" : "Thêm",
      cancelButtonText: "Hủy",
    });

    if (confirm.isConfirmed) {
      // Chuyển sang số nguyên
      onSubmit({
        fromDistance: parseInt(formData.fromDistance),
        feePerKm: parseInt(formData.feePerKm),
      });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>

      <div className="fixed top-1/2 left-1/2 z-50 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 transform overflow-y-auto max-h-[90vh] rounded-lg bg-white p-6 shadow-[0_3px_8px_rgba(0,0,0,0.24)]">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">
            {readOnly
              ? "Xem thông tin phí ship"
              : isUpdate
              ? "Cập nhật phí ship"
              : "Thêm mức phí ship"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-xl font-bold"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6">
            <Input
              label="Từ khoảng cách (km)"
              name="fromDistance"
              value={formData.fromDistance}
              onChange={handleChange}
              disabled={readOnly}
              type="number"
              min={0}
            />
            <Input
              label="Phí mỗi km (VND)"
              name="feePerKm"
              value={formData.feePerKm}
              onChange={handleChange}
              disabled={readOnly}
              type="number"
              min={0}
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

// Input Subcomponent
const Input = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  disabled = false,
  min,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      min={min}
      className={`w-full rounded border border-gray-300 px-3 py-2 ${
        disabled ? "bg-gray-100" : ""
      }`}
    />
  </div>
);

export default ShippingFeeModal;
