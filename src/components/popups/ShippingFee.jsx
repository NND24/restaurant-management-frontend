"use client";
import React, { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, IconButton, Box } from "@mui/material";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { FaTimes } from "react-icons/fa";

const ShippingFeeModal = ({ open, onClose, onSubmit, initialData = {}, isUpdate = false, readOnly = false }) => {
  const [formData, setFormData] = useState({
    fromDistance: "",
    feePerKm: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (isUpdate && initialData) {
        setFormData({
          fromDistance: initialData.fromDistance ?? "",
          feePerKm: initialData.feePerKm ?? "",
        });
      } else {
        setFormData({
          fromDistance: "",
          feePerKm: "",
        });
      }
    }
  }, [open, isUpdate, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    const { fromDistance, feePerKm } = formData;
    const isPositiveInteger = (val) => /^\d+$/.test(val) && parseInt(val) >= 0;

    if (!isPositiveInteger(fromDistance)) {
      toast.error("Khoảng cách bắt đầu phải là số nguyên dương.");
      return false;
    }
    if (!isPositiveInteger(feePerKm)) {
      toast.error("Phí mỗi km phải là số nguyên dương.");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const confirm = await Swal.fire({
      title: isUpdate ? "Xác nhận cập nhật Phí vận chuyển?" : "Xác nhận thêm mức phí mới?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: isUpdate ? "Cập nhật" : "Thêm",
      cancelButtonText: "Hủy",
    });

    if (!confirm.isConfirmed) return;

    try {
      setLoading(true);
      await onSubmit?.({
        fromDistance: parseInt(formData.fromDistance),
        feePerKm: parseInt(formData.feePerKm),
      });
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(isUpdate ? "Cập nhật thất bại" : "Thêm phí vận chuyển thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle sx={{ fontWeight: "bold", borderBottom: "1px solid #e0e0e0" }}>
        {readOnly ? "Chi tiết Phí vận chuyển" : isUpdate ? "Cập nhật Phí vận chuyển" : "Thêm mức Phí vận chuyển"}
        <IconButton aria-label='close' onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <FaTimes />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box className='grid grid-cols-1 gap-4'>
          <TextField
            label='Từ khoảng cách (km)'
            name='fromDistance'
            type='number'
            value={formData.fromDistance}
            onChange={handleChange}
            fullWidth
            InputProps={{ readOnly: readOnly }}
          />
          <TextField
            label='Phí mỗi km (VND)'
            name='feePerKm'
            type='number'
            value={formData.feePerKm}
            onChange={handleChange}
            fullWidth
            InputProps={{ readOnly: readOnly }}
          />
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

export default ShippingFeeModal;
