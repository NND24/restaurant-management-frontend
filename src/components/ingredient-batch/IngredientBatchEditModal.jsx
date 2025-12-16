"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { FaTimes } from "react-icons/fa";
import { getBatchById, updateBatch } from "@/service/ingredientBatch";
import { toast } from "react-toastify";

const IngredientBatchEditModal = ({ open, onClose, id, onUpdated }) => {
  const [formData, setFormData] = useState({
    batchCode: "",
    ingredient: {
      _id: "",
      name: "",
      unit: { name: "" },
    },
    quantity: 0, // base quantity
    remainingQuantity: 0,
    costPerUnit: 0,
    receivedDate: "",
    expiryDate: "",
    supplierName: "",
    storageLocation: "",
    status: "active",
    inputUnit: null, // 👈 thêm inputUnit
  });

  const [loading, setLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  /* ================= DERIVED ================= */
  const inputUnit = formData.inputUnit;

  // hiển thị số lượng theo đơn vị nhập
  const displayQuantity =
    inputUnit?.ratio && inputUnit.ratio > 1 ? formData.quantity / inputUnit.ratio : formData.quantity;

  const totalCost = formData.quantity * formData.costPerUnit;

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    if (!open || !id) return;

    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        const res = await getBatchById(id);
        if (res?.success) {
          setFormData(res.data);
        }
      } catch (err) {
        console.error(err);
        toast.error("Không thể tải dữ liệu lô nguyên liệu");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [open, id]);

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!id) return;

    try {
      setLoading(true);

      // ⚠️ chỉ gửi field cho phép update
      const payload = {
        expiryDate: formData.expiryDate,
        supplierName: formData.supplierName,
        storageLocation: formData.storageLocation,
        status: formData.status,
      };

      await updateBatch({ id, data: payload });

      toast.success("Cập nhật lô nguyên liệu thành công");
      onUpdated?.();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  /* ================= RENDER ================= */
  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle
        sx={{
          m: 0,
          py: 1,
          fontWeight: "bold",
          fontSize: "1.25rem",
          color: "#4a4b4d",
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        Chỉnh sửa lô nguyên liệu
        <IconButton aria-label='close' onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <FaTimes />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {isLoadingData ? (
          <Box className='flex justify-center items-center h-40'>
            <CircularProgress color='warning' />
          </Box>
        ) : (
          <Box className='space-y-4'>
            {/* Mã lô */}
            <TextField label='Mã lô' value={formData.batchCode || ""} fullWidth InputProps={{ readOnly: true }} />

            {/* Nguyên liệu */}
            <TextField
              label='Nguyên liệu'
              value={formData.ingredient?.name || ""}
              fullWidth
              InputProps={{ readOnly: true }}
            />

            {/* Quy đổi đơn vị */}
            {inputUnit?.ratio > 1 && (
              <Box fontSize={12} color='gray'>
                (Quy đổi: 1 {inputUnit.name} = {inputUnit.ratio} {inputUnit.baseUnit})
              </Box>
            )}

            {/* Số lượng */}
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label={`Số lượng nhập (${inputUnit?.name || ""})`}
                type='number'
                value={displayQuantity}
                fullWidth
                InputProps={{ readOnly: true }}
              />
              <TextField
                label='Số lượng còn lại'
                type='number'
                value={formData.remainingQuantity}
                fullWidth
                InputProps={{ readOnly: true }}
              />
            </Box>

            {/* Giá */}
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label={`Giá / ${inputUnit?.name || "đơn vị"}`}
                type='number'
                value={formData.costPerUnit}
                fullWidth
                InputProps={{ readOnly: true }}
              />
              <TextField label='Tổng giá' type='number' value={totalCost} fullWidth InputProps={{ readOnly: true }} />
            </Box>

            {/* Ngày */}
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label='Ngày nhập'
                value={formData.receivedDate ? new Date(formData.receivedDate).toLocaleDateString() : ""}
                fullWidth
                InputProps={{ readOnly: true }}
              />
              <TextField
                label='Hạn sử dụng'
                type='date'
                name='expiryDate'
                value={formData.expiryDate ? formData.expiryDate.split("T")[0] : ""}
                onChange={handleChange}
                fullWidth
                inputProps={{
                  min: new Date().toISOString().slice(0, 10),
                }}
              />
            </Box>

            {/* Nhà cung cấp */}
            <TextField
              label='Nhà cung cấp'
              name='supplierName'
              value={formData.supplierName || ""}
              onChange={handleChange}
              fullWidth
            />

            {/* Vị trí */}
            <TextField
              label='Vị trí lưu trữ'
              name='storageLocation'
              value={formData.storageLocation || ""}
              onChange={handleChange}
              fullWidth
            />

            {/* Trạng thái */}
            <TextField
              select
              label='Trạng thái'
              name='status'
              value={formData.status}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value='active'>Hoạt động</MenuItem>
              <MenuItem value='expired'>Hết hạn</MenuItem>
              <MenuItem value='finished'>Đã dùng hết</MenuItem>
            </TextField>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3 }}>
        <Button onClick={onClose} color='error' variant='outlined'>
          Hủy
        </Button>
        <Button onClick={handleSave} color='primary' variant='contained' disabled={loading}>
          {loading ? "Đang lưu..." : "Lưu"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IngredientBatchEditModal;
