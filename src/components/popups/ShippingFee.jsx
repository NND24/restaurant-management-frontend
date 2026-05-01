"use client";
import React, { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, IconButton, Box } from "@mui/material";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { FaTimes } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const ShippingFeeModal = ({ open, onClose, onSubmit, initialData = {}, isUpdate = false, readOnly = false }) => {
  const { t } = useTranslation();
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
      toast.error(t("shipping_fee.validation_from_distance"));
      return false;
    }
    if (!isPositiveInteger(feePerKm)) {
      toast.error(t("shipping_fee.validation_fee_per_km"));
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const confirm = await Swal.fire({
      title: isUpdate ? t("shipping_fee.confirm_update") : t("shipping_fee.confirm_add"),
      icon: "question",
      showCancelButton: true,
      confirmButtonText: isUpdate ? t("common.update") : t("common.add"),
      cancelButtonText: t("common.cancel"),
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
      toast.error(isUpdate ? t("common.update_failed") : t("shipping_fee.add_failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle sx={{ fontWeight: "bold", borderBottom: "1px solid #e0e0e0" }}>
        {readOnly
          ? t("shipping_fee.detail_title")
          : isUpdate
          ? t("shipping_fee.update_title")
          : t("shipping_fee.add_title")}
        <IconButton aria-label='close' onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <FaTimes />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box className='grid grid-cols-1 gap-4'>
          <TextField
            label={t("shipping_fee.from_distance")}
            name='fromDistance'
            type='number'
            value={formData.fromDistance}
            onChange={handleChange}
            fullWidth
            InputProps={{ readOnly: readOnly }}
          />
          <TextField
            label={t("shipping_fee.fee_per_km")}
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

export default ShippingFeeModal;
