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
import { useTranslation } from "react-i18next";

const StaffCreateModal = ({ open, onClose, initialData = {}, isUpdate = false, readOnly = false, onSubmit }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phonenumber: "",
    gender: "male",
    role: "staff",
    password: "",
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
          password: "",
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
      toast.error(t("staff.validation_name_required"));
      return false;
    }
    if (!formData.email.trim()) {
      toast.error(t("staff.validation_email_required"));
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast.error(t("staff.validation_email_invalid"));
      return false;
    }
    if (!formData.phonenumber.trim()) {
      toast.error(t("staff.validation_phone_required"));
      return false;
    }
    if (!/^\d+$/.test(formData.phonenumber.trim())) {
      toast.error(t("staff.validation_phone_digits_only"));
      return false;
    }

    if (!isUpdate && !formData.password?.trim()) {
      toast.error(t("staff.validation_password_required"));
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const confirm = await Swal.fire({
      title: isUpdate ? t("staff.confirm_update") : t("staff.confirm_add"),
      icon: "question",
      showCancelButton: true,
      confirmButtonText: isUpdate ? t("common.update") : t("common.add"),
      cancelButtonText: t("common.cancel"),
    });

    if (!confirm.isConfirmed) return;

    try {
      setLoading(true);
      await onSubmit?.(formData);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(isUpdate ? t("common.update_failed") : t("staff.add_failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle sx={{ fontWeight: "bold", borderBottom: "1px solid #e0e0e0" }}>
        {readOnly ? t("staff.info_title") : isUpdate ? t("staff.update_title") : t("staff.add_title")}
        <IconButton aria-label='close' onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <FaTimes />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box className='space-y-4'>
          <TextField
            label={t("staff.full_name")}
            name='name'
            value={formData.name}
            onChange={handleChange}
            fullWidth
            InputProps={{ readOnly: readOnly ? true : false }}
          />
          <TextField
            label={t("staff.email")}
            name='email'
            value={formData.email}
            onChange={handleChange}
            fullWidth
            InputProps={{ readOnly: readOnly ? true : false }}
          />
          <TextField
            label={t("staff.phone")}
            name='phonenumber'
            value={formData.phonenumber}
            onChange={handleChange}
            fullWidth
            InputProps={{ readOnly: readOnly ? true : false }}
          />
          <TextField
            select
            label={t("staff.gender")}
            name='gender'
            value={formData.gender}
            onChange={handleChange}
            fullWidth
            InputProps={{ readOnly: readOnly ? true : false }}
          >
            <MenuItem value='male'>{t("staff.male")}</MenuItem>
            <MenuItem value='female'>{t("staff.female")}</MenuItem>
            <MenuItem value='other'>{t("staff.other")}</MenuItem>
          </TextField>
          <TextField
            select
            label={t("staff.role")}
            name='role'
            value={formData.role}
            onChange={handleChange}
            fullWidth
            InputProps={{ readOnly: readOnly ? true : false }}
          >
            <MenuItem value='staff'>{t("staff.staff")}</MenuItem>
            <MenuItem value='manager'>{t("staff.manager")}</MenuItem>
          </TextField>
          {!isUpdate && (
            <TextField
              label={t("staff.password")}
              name='password'
              type='password'
              value={formData.password}
              onChange={handleChange}
              fullWidth
            />
          )}
        </Box>
      </DialogContent>

      {!readOnly && (
        <DialogActions sx={{ px: 3 }}>
          <Button onClick={onClose} color='error' variant='outlined'>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSave} color='primary' variant='contained' disabled={loading}>
            {loading ? t("common.saving") : isUpdate ? t("common.update") : t("common.save")}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default StaffCreateModal;
