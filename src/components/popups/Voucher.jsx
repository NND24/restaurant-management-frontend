"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  IconButton,
  Box,
} from "@mui/material";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { FaTimes } from "react-icons/fa";
import { getVoucherById } from "@/service/voucher";

const VoucherModal = ({ open, onClose, storeId, voucherId, isUpdate = false, readOnly = false, onSubmit }) => {
  const [initialData, setInitialData] = useState(null);

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
    userLimit: "",
    isActive: true,
    isStackable: false,
    type: "FOOD",
  });
  const [loading, setLoading] = useState(false);

  const formatDateTimeLocal = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return ""; // tránh lỗi Invalid Date

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // load API
  useEffect(() => {
    if (open && voucherId) {
      const fetchData = async () => {
        try {
          const res = await getVoucherById(storeId, voucherId);
          setInitialData(res);
        } catch (err) {
          console.error(err);
        }
      };
      fetchData();
    }
  }, [open, voucherId, storeId]);

  useEffect(() => {
    if (initialData) {
      console.log("InitialData:", initialData);

      setFormData({
        code: initialData.code || "",
        description: initialData.description || "",
        discountType: initialData.discountType || "PERCENTAGE",
        discountValue: initialData.discountValue ?? 0,
        maxDiscount: initialData.maxDiscount ?? "",
        minOrderAmount: initialData.minOrderAmount ?? "",
        startDate: formatDateTimeLocal(initialData.startDate),
        endDate: formatDateTimeLocal(initialData.endDate),
        usageLimit: initialData.usageLimit ?? "",
        userLimit: initialData.userLimit ?? "",
        isActive: Boolean(initialData.isActive),
        isStackable: Boolean(initialData.isStackable),
        type: initialData.type || "FOOD",
      });
    }
  }, [isUpdate, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "isActive" || name === "isStackable" ? value === "true" : value,
    }));
  };

  const validate = () => {
    if (!formData.code.trim()) {
      toast.error("Mã code là bắt buộc.");
      return false;
    }
    if (!formData.discountValue) {
      toast.error("Giá trị giảm là bắt buộc.");
      return false;
    }
    if (!formData.startDate || !formData.endDate) {
      toast.error("Ngày bắt đầu/kết thúc là bắt buộc.");
      return false;
    }
    if (formData.discountValue < 0) {
      toast.error("Giá trị giảm không được âm.");
      return false;
    }
    if (formData.discountType === "PERCENTAGE" && Number(formData.discountValue) > 100) {
      toast.error("Giá trị phần trăm không được vượt quá 100.");
      return false;
    }
    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      toast.error("Ngày kết thúc phải sau ngày bắt đầu.");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const confirm = await Swal.fire({
      title: isUpdate ? "Xác nhận cập nhật voucher?" : "Xác nhận thêm voucher?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: isUpdate ? "Cập nhật" : "Thêm",
      cancelButtonText: "Hủy",
    });

    if (!confirm.isConfirmed) return;

    try {
      setLoading(true);
      await onSubmit?.(formData);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(isUpdate ? "Cập nhật thất bại" : "Thêm voucher thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle sx={{ fontWeight: "bold", borderBottom: "1px solid #e0e0e0" }}>
        {readOnly ? "Chi tiết Voucher" : isUpdate ? "Cập nhật Voucher" : "Thêm Voucher mới"}
        <IconButton aria-label='close' onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <FaTimes />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <TextField
            label='Mã Code'
            name='code'
            value={formData.code}
            onChange={handleChange}
            fullWidth
            InputProps={{ readOnly: readOnly ? true : false }}
          />
          <TextField
            label='Mô tả'
            name='description'
            value={formData.description}
            onChange={handleChange}
            fullWidth
            InputProps={{ readOnly: readOnly ? true : false }}
          />
          <TextField
            select
            label='Loại giảm'
            name='discountType'
            value={formData.discountType}
            onChange={handleChange}
            fullWidth
            InputProps={{ readOnly: readOnly ? true : false }}
          >
            <MenuItem value='PERCENTAGE'>Phần trăm (%)</MenuItem>
            <MenuItem value='FIXED'>Giảm số tiền</MenuItem>
          </TextField>
          <TextField
            label='Giá trị giảm'
            name='discountValue'
            type='number'
            value={formData.discountValue}
            onChange={handleChange}
            fullWidth
            InputProps={{ readOnly: readOnly ? true : false }}
          />
          <TextField
            label='Giảm tối đa'
            name='maxDiscount'
            type='number'
            value={formData.maxDiscount}
            onChange={handleChange}
            fullWidth
            InputProps={{ readOnly: readOnly ? true : false }}
          />
          <TextField
            label='Đơn tối thiểu'
            name='minOrderAmount'
            type='number'
            value={formData.minOrderAmount}
            onChange={handleChange}
            fullWidth
            InputProps={{ readOnly: readOnly ? true : false }}
          />
          <TextField
            label='Ngày bắt đầu'
            name='startDate'
            type='datetime-local'
            value={formData.startDate}
            onChange={handleChange}
            fullWidth
            InputProps={{ readOnly: readOnly ? true : false }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label='Ngày kết thúc'
            name='endDate'
            type='datetime-local'
            value={formData.endDate}
            onChange={handleChange}
            fullWidth
            InputProps={{ readOnly: readOnly ? true : false }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label='Số lượt tối đa'
            name='usageLimit'
            type='number'
            value={formData.usageLimit}
            onChange={handleChange}
            fullWidth
            InputProps={{ readOnly: readOnly ? true : false }}
          />
          <TextField
            label='Giới hạn mỗi người'
            name='userLimit'
            type='number'
            value={formData.userLimit}
            onChange={handleChange}
            fullWidth
            InputProps={{ readOnly: readOnly ? true : false }}
          />
          <TextField
            select
            label='Có thể cộng dồn'
            name='isStackable'
            value={formData?.isStackable?.toString()}
            onChange={handleChange}
            fullWidth
            InputProps={{ readOnly: readOnly ? true : false }}
          >
            <MenuItem value='false'>Không</MenuItem>
            <MenuItem value='true'>Có</MenuItem>
          </TextField>
          <TextField
            select
            label='Trạng thái'
            name='isActive'
            value={formData.isActive.toString()}
            onChange={handleChange}
            fullWidth
            InputProps={{ readOnly: readOnly ? true : false }}
          >
            <MenuItem value='true'>Hoạt động</MenuItem>
            <MenuItem value='false'>Ngưng</MenuItem>
          </TextField>
          <TextField
            select
            label='Áp dụng cho'
            name='type'
            value={formData.type}
            onChange={handleChange}
            fullWidth
            InputProps={{ readOnly: readOnly ? true : false }}
          >
            <MenuItem value='FOOD'>Đồ ăn</MenuItem>
            <MenuItem value='DELIVERY'>Giao hàng</MenuItem>
          </TextField>
        </Box>
      </DialogContent>

      {!readOnly && (
        <DialogActions sx={{ px: 3 }}>
          <Button onClick={onClose} color='error' variant='outlined'>
            Hủy
          </Button>
          <Button onClick={handleSave} color='primary' variant='contained' disabled={loading}>
            {loading ? "Đang lưu..." : isUpdate ? "Cập nhật" : "Lưu"}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default VoucherModal;
