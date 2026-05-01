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
import { useTranslation } from "react-i18next";

const VoucherModal = ({ open, onClose, storeId, voucherId, isUpdate = false, readOnly = false, onSubmit }) => {
  const { t } = useTranslation();
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
      toast.error(t("voucher.validation_code_required"));
      return false;
    }
    if (!formData.discountValue) {
      toast.error(t("voucher.validation_discount_value_required"));
      return false;
    }
    if (!formData.startDate || !formData.endDate) {
      toast.error(t("voucher.validation_dates_required"));
      return false;
    }
    if (formData.discountValue < 0) {
      toast.error(t("voucher.validation_discount_value_negative"));
      return false;
    }
    if (formData.discountType === "PERCENTAGE" && Number(formData.discountValue) > 100) {
      toast.error(t("voucher.validation_percentage_max"));
      return false;
    }
    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      toast.error(t("voucher.validation_end_date_after_start"));
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const confirm = await Swal.fire({
      title: isUpdate ? t("voucher.confirm_update") : t("voucher.confirm_add"),
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
      toast.error(isUpdate ? t("common.update_failed") : t("voucher.add_failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle sx={{ fontWeight: "bold", borderBottom: "1px solid #e0e0e0" }}>
        {readOnly ? t("voucher.detail_title") : isUpdate ? t("voucher.update_title") : t("voucher.add_title")}
        <IconButton aria-label='close' onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <FaTimes />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <TextField
            label={t("voucher.code")}
            name='code'
            value={formData.code}
            onChange={handleChange}
            fullWidth
            InputProps={{ readOnly: readOnly ? true : false }}
          />
          <TextField
            label={t("common.description")}
            name='description'
            value={formData.description}
            onChange={handleChange}
            fullWidth
            InputProps={{ readOnly: readOnly ? true : false }}
          />
          <TextField
            select
            label={t("voucher.discount_type")}
            name='discountType'
            value={formData.discountType}
            onChange={handleChange}
            fullWidth
            InputProps={{ readOnly: readOnly ? true : false }}
          >
            <MenuItem value='PERCENTAGE'>{t("voucher.discount_type_percentage")}</MenuItem>
            <MenuItem value='FIXED'>{t("voucher.discount_type_fixed")}</MenuItem>
          </TextField>
          <TextField
            label={t("voucher.discount_value")}
            name='discountValue'
            type='number'
            value={formData.discountValue}
            onChange={handleChange}
            fullWidth
            InputProps={{ readOnly: readOnly ? true : false }}
          />
          <TextField
            label={t("voucher.max_discount")}
            name='maxDiscount'
            type='number'
            value={formData.maxDiscount}
            onChange={handleChange}
            fullWidth
            InputProps={{ readOnly: readOnly ? true : false }}
          />
          <TextField
            label={t("voucher.min_order_amount")}
            name='minOrderAmount'
            type='number'
            value={formData.minOrderAmount}
            onChange={handleChange}
            fullWidth
            InputProps={{ readOnly: readOnly ? true : false }}
          />
          <TextField
            label={t("voucher.start_date")}
            name='startDate'
            type='datetime-local'
            value={formData.startDate}
            onChange={handleChange}
            fullWidth
            InputProps={{ readOnly: readOnly ? true : false }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label={t("voucher.end_date")}
            name='endDate'
            type='datetime-local'
            value={formData.endDate}
            onChange={handleChange}
            fullWidth
            InputProps={{ readOnly: readOnly ? true : false }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label={t("voucher.usage_limit")}
            name='usageLimit'
            type='number'
            value={formData.usageLimit}
            onChange={handleChange}
            fullWidth
            InputProps={{ readOnly: readOnly ? true : false }}
          />
          <TextField
            label={t("voucher.user_limit")}
            name='userLimit'
            type='number'
            value={formData.userLimit}
            onChange={handleChange}
            fullWidth
            InputProps={{ readOnly: readOnly ? true : false }}
          />
          <TextField
            select
            label={t("voucher.is_stackable")}
            name='isStackable'
            value={formData?.isStackable?.toString()}
            onChange={handleChange}
            fullWidth
            InputProps={{ readOnly: readOnly ? true : false }}
          >
            <MenuItem value='false'>{t("common.no")}</MenuItem>
            <MenuItem value='true'>{t("common.yes")}</MenuItem>
          </TextField>
          <TextField
            select
            label={t("common.status")}
            name='isActive'
            value={formData.isActive.toString()}
            onChange={handleChange}
            fullWidth
            InputProps={{ readOnly: readOnly ? true : false }}
          >
            <MenuItem value='true'>{t("common.active")}</MenuItem>
            <MenuItem value='false'>{t("common.inactive")}</MenuItem>
          </TextField>
          <TextField
            select
            label={t("voucher.apply_for")}
            name='type'
            value={formData.type}
            onChange={handleChange}
            fullWidth
            InputProps={{ readOnly: readOnly ? true : false }}
          >
            <MenuItem value='FOOD'>{t("voucher.type_food")}</MenuItem>
            <MenuItem value='DELIVERY'>{t("voucher.type_delivery")}</MenuItem>
          </TextField>
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

export default VoucherModal;
