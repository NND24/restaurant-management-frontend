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

const StaffCreateModal = ({ open, onClose, initialData = {}, isUpdate = false, readOnly = false, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phonenumber: "",
    gender: "male",
    role: "staff",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (isUpdate && initialData) {
        setFormData({
          name: initialData.name || "",
          email: initialData.email || "",
          phonenumber: initialData.phonenumber || "",
          gender: initialData.gender || "male",
          // nếu role là array thì lấy phần tử ưu tiên, ví dụ phần tử cuối
          role: Array.isArray(initialData.role)
            ? initialData.role.includes("manager")
              ? "manager"
              : "staff"
            : initialData.role || "staff",
        });
      } else {
        setFormData({
          name: "",
          email: "",
          phonenumber: "",
          gender: "male",
          role: "staff",
        });
      }
    }
  }, [open, isUpdate, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!formData.name.trim()) {
      toast.error("Họ tên không được để trống.");
      return false;
    }
    if (!formData.email.trim()) {
      toast.error("Email không được để trống.");
      return false;
    }
    if (!formData.phonenumber.trim()) {
      toast.error("Số điện thoại không được để trống.");
      return false;
    }
    if (!/^\d+$/.test(formData.phonenumber.trim())) {
      toast.error("Số điện thoại chỉ được chứa chữ số.");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const confirm = await Swal.fire({
      title: isUpdate ? "Xác nhận cập nhật nhân viên?" : "Xác nhận thêm nhân viên?",
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
      toast.error(isUpdate ? "Cập nhật thất bại" : "Thêm nhân viên thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle sx={{ fontWeight: "bold", borderBottom: "1px solid #e0e0e0" }}>
        {readOnly ? "Thông tin nhân viên" : isUpdate ? "Cập nhật nhân viên" : "Thêm nhân viên mới"}
        <IconButton aria-label='close' onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <FaTimes />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box className='space-y-4'>
          <TextField
            label='Họ tên'
            name='name'
            value={formData.name}
            onChange={handleChange}
            fullWidth
            InputProps={{ readOnly: readOnly ? true : false }}
          />
          <TextField
            label='Email'
            name='email'
            value={formData.email}
            onChange={handleChange}
            fullWidth
            InputProps={{ readOnly: readOnly ? true : false }}
          />
          <TextField
            label='Số điện thoại'
            name='phonenumber'
            value={formData.phonenumber}
            onChange={handleChange}
            fullWidth
            InputProps={{ readOnly: readOnly ? true : false }}
          />
          <TextField
            select
            label='Giới tính'
            name='gender'
            value={formData.gender}
            onChange={handleChange}
            fullWidth
            InputProps={{ readOnly: readOnly ? true : false }}
          >
            <MenuItem value='male'>Nam</MenuItem>
            <MenuItem value='female'>Nữ</MenuItem>
            <MenuItem value='other'>Khác</MenuItem>
          </TextField>
          <TextField
            select
            label='Vai trò'
            name='role'
            value={formData.role}
            onChange={handleChange}
            fullWidth
            InputProps={{ readOnly: readOnly ? true : false }}
          >
            <MenuItem value='staff'>Nhân viên</MenuItem>
            <MenuItem value='manager'>Quản lý</MenuItem>
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

export default StaffCreateModal;
