import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const VoucherModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = {},
  isUpdate = false,
  readOnly = false,
}) => {
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "PERCENTAGE",
    discountValue: 0,
    maxDiscount: "",
    minOrderAmount: "",
    startDate: "",
    endDate: "",
    usageLimit: "",
    usedCount: 0,
    userLimit: "",
    isActive: true,
    isStackable: false,
    type: "FOOD",
  });

  useEffect(() => {
    if (isOpen && isUpdate && initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        startDate: initialData.startDate
          ? new Date(initialData.startDate).toISOString().slice(0, 16)
          : "",
        endDate: initialData.endDate
          ? new Date(initialData.endDate).toISOString().slice(0, 16)
          : "",
      }));
    } else if (isOpen && !isUpdate) {
      // reset khi mở modal mới
      setFormData({
        code: "",
        description: "",
        discountType: "PERCENTAGE",
        discountValue: 0,
        maxDiscount: "",
        minOrderAmount: "",
        startDate: "",
        endDate: "",
        usageLimit: "",
        usedCount: 0,
        userLimit: "",
        isActive: true,
        isStackable: false,
        type: "FOOD",
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
    if (!formData.code.trim()) errors.push("Mã code là bắt buộc.");
    if (!formData.discountValue) errors.push("Giá trị giảm là bắt buộc.");
    if (!formData.startDate) errors.push("Ngày bắt đầu là bắt buộc.");
    if (!formData.endDate) errors.push("Ngày kết thúc là bắt buộc.");

    if (formData.discountValue < 0) errors.push("Giá trị giảm không được âm.");
    if (formData.maxDiscount < 0) errors.push("Giảm tối đa không được âm.");
    if (formData.minOrderAmount < 0)
      errors.push("Đơn tối thiểu không được âm.");
    if (formData.usageLimit < 0) errors.push("Số lượt tối đa không được âm.");
    if (formData.userLimit < 0)
      errors.push("Giới hạn mỗi người không được âm.");

    if (
      formData.discountType === "PERCENTAGE" &&
      Number(formData.discountValue) > 100
    ) {
      errors.push("Giá trị phần trăm không được vượt quá 100.");
    }

    const now = new Date();
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    if (!isUpdate && start < now.setHours(0, 0, 0, 0)) {
      errors.push("Ngày bắt đầu phải là hôm nay hoặc sau.");
    }

    if (end <= start) {
      errors.push("Ngày kết thúc phải sau ngày bắt đầu.");
    }

    if (errors.length > 0) {
      errors.forEach((err) => toast.error(err));
      return;
    }

    // ✅ Hiện swal để xác nhận hành động
    const confirmResult = await Swal.fire({
      title: isUpdate ? "Xác nhận cập nhật?" : "Xác nhận thêm mới?",
      text: isUpdate
        ? "Bạn có chắc muốn cập nhật voucher này không?"
        : "Bạn có chắc muốn thêm voucher này không?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: isUpdate ? "Cập nhật" : "Thêm",
      cancelButtonText: "Hủy",
    });

    if (confirmResult.isConfirmed) {
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
              ? "Chi tiết Voucher"
              : isUpdate
              ? "Cập nhật Voucher"
              : "Tạo Voucher"}
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
              label="Mã Code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              disabled={readOnly}
            />
            <Input
              label="Mô tả"
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={readOnly}
            />

            <Select
              label="Loại giảm"
              name="discountType"
              value={formData.discountType}
              onChange={handleChange}
              options={[
                { label: "Phần trăm (%)", value: "PERCENTAGE" },
                { label: "Giảm số tiền", value: "FIXED" },
              ]}
              disabled={readOnly}
            />

            <Input
              label="Giá trị giảm"
              name="discountValue"
              type="number"
              value={formData.discountValue}
              onChange={handleChange}
              disabled={readOnly}
            />
            <Input
              label="Giảm tối đa"
              name="maxDiscount"
              type="number"
              value={formData.maxDiscount}
              onChange={handleChange}
              disabled={readOnly}
            />
            <Input
              label="Đơn tối thiểu"
              name="minOrderAmount"
              type="number"
              value={formData.minOrderAmount}
              onChange={handleChange}
              disabled={readOnly}
            />
            <Input
              label="Ngày bắt đầu"
              name="startDate"
              type="datetime-local"
              value={formData.startDate}
              onChange={handleChange}
              disabled={readOnly}
            />
            <Input
              label="Ngày kết thúc"
              name="endDate"
              type="datetime-local"
              value={formData.endDate}
              onChange={handleChange}
              disabled={readOnly}
            />
            <Input
              label="Số lượt tối đa"
              name="usageLimit"
              type="number"
              value={formData.usageLimit}
              onChange={handleChange}
              disabled={readOnly}
            />
            <Input
              label="Giới hạn mỗi người"
              name="userLimit"
              type="number"
              value={formData.userLimit}
              onChange={handleChange}
              disabled={readOnly}
            />

            <Select
              label="Có thể cộng dồn"
              name="isStackable"
              value={formData.isStackable.toString()}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  isStackable: e.target.value === "true",
                }))
              }
              options={[
                { label: "Không", value: "false" },
                { label: "Có", value: "true" },
              ]}
              disabled={readOnly}
            />

            <Select
              label="Trạng thái"
              name="isActive"
              value={formData.isActive.toString()}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  isActive: e.target.value === "true",
                }))
              }
              options={[
                { label: "Hoạt động", value: "true" },
                { label: "Ngưng", value: "false" },
              ]}
              disabled={readOnly}
            />

            <Select
              label="Áp dụng cho"
              name="type"
              value={formData.type}
              onChange={handleChange}
              options={[
                { label: "Đồ ăn", value: "FOOD" },
                { label: "Giao hàng", value: "DELIVERY" },
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

export default VoucherModal;
