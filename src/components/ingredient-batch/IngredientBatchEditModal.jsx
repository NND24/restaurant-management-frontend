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
} from "@mui/material";
import { FaTimes } from "react-icons/fa";
import { getBatchById, updateBatch } from "@/service/ingredientBatch";
import { toast } from "react-toastify";

const IngredientBatchEditModal = ({ open, onClose, id, onUpdated }) => {
  const [formData, setFormData] = useState({
    ingredient: { _id: "", name: "" },
    quantity: 0,
    costPerUnit: 0,
    receivedDate: "",
    expiryDate: "",
    supplierName: "",
    storageLocation: "",
    status: "active",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && id) {
      const fetchData = async () => {
        try {
          const res = await getBatchById(id);
          if (res?.success) {
            setFormData(res.data);
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchData();
    }
  }, [open, id]);

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
      await updateBatch({ id, data: formData });
      toast.success("Cập nhật lô nguyên liệu thành công");
      onUpdated();
      onClose();
    } catch (err) {
      console.error("Lỗi khi cập nhật batch:", err);
      toast.error("Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

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
        <Box className='space-y-4'>
          <TextField
            label='Nguyên liệu'
            value={formData.ingredient?.name || ""}
            fullWidth
            InputProps={{ readOnly: true }}
          />

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label='Số lượng nhập'
              type='number'
              value={formData.quantity}
              fullWidth
              InputProps={{ readOnly: true }}
            />
            <TextField
              label='Giá / đơn vị'
              type='number'
              value={formData.costPerUnit}
              fullWidth
              InputProps={{ readOnly: true }}
            />
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label='Ngày nhập'
              type='text'
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
            />
          </Box>

          <TextField
            label='Nhà cung cấp'
            name='supplierName'
            value={formData.supplierName || ""}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            label='Vị trí lưu trữ'
            name='storageLocation'
            value={formData.storageLocation || ""}
            onChange={handleChange}
            fullWidth
          />

          <TextField select label='Trạng thái' name='status' value={formData.status} onChange={handleChange} fullWidth>
            <MenuItem value='active'>Hoạt động</MenuItem>
            <MenuItem value='expired'>Hết hạn</MenuItem>
            <MenuItem value='finished'>Đã kết thúc</MenuItem>
          </TextField>
        </Box>
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
