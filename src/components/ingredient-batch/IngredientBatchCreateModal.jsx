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
import { createBatch } from "@/service/ingredientBatch";
import { getIngredientsByStore } from "@/service/ingredient";

const IngredientBatchCreateModal = ({ open, onClose, storeId, onCreated }) => {
  const [formData, setFormData] = useState({
    ingredient: "",
    quantity: 0,
    costPerUnit: 0,
    totalCost: 0,
    receivedDate: new Date().toISOString().slice(0, 10),
    expiryDate: "",
    supplierName: "",
    storageLocation: "",
    status: "active",
  });
  const [loading, setLoading] = useState(false);
  const [allIngredients, setAllIngredients] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getIngredientsByStore(storeId);
      setAllIngredients(res?.data || []);
    };
    if (open) {
      fetchData();
    }
  }, [open, storeId]);

  // reset form khi mở
  useEffect(() => {
    if (open) {
      setFormData({
        ingredient: "",
        quantity: 0,
        costPerUnit: 0,
        totalCost: 0,
        receivedDate: new Date().toISOString().slice(0, 10),
        expiryDate: "",
        supplierName: "",
        storageLocation: "",
        status: "active",
      });
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (["quantity", "costPerUnit"].includes(name)) {
      newValue = parseFloat(value) || 0;
    }
    setFormData((prev) => {
      const updated = { ...prev, [name]: newValue };
      if (name === "quantity" || name === "costPerUnit") {
        updated.totalCost = updated.quantity * updated.costPerUnit;
      }
      return updated;
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await createBatch({
        storeId,
        ...formData,
      });
      onCreated?.();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle sx={{ fontWeight: "bold", borderBottom: "1px solid #e0e0e0" }}>
        Nhập lô nguyên liệu mới
        <IconButton aria-label='close' onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <FaTimes />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box className='space-y-4'>
          <TextField
            select
            label='Nguyên liệu'
            name='ingredient'
            value={formData.ingredient}
            onChange={handleChange}
            fullWidth
            required
          >
            {allIngredients.map((ing) => (
              <MenuItem key={ing._id} value={ing._id}>
                {ing.name}
              </MenuItem>
            ))}
          </TextField>

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label='Số lượng nhập'
              type='number'
              name='quantity'
              value={formData.quantity}
              onChange={handleChange}
              fullWidth
              inputProps={{ min: 0 }}
              required
            />
            <TextField
              label='Giá / đơn vị'
              type='number'
              name='costPerUnit'
              value={formData.costPerUnit}
              onChange={handleChange}
              fullWidth
              inputProps={{ min: 0 }}
              required
            />
          </Box>

          <TextField
            label='Tổng giá'
            type='number'
            name='totalCost'
            value={formData.totalCost}
            fullWidth
            InputProps={{ readOnly: true }}
          />

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label='Ngày nhập'
              type='date'
              name='receivedDate'
              value={formData.receivedDate}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label='Hạn sử dụng'
              type='date'
              name='expiryDate'
              value={formData.expiryDate}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          <TextField
            label='Nhà cung cấp'
            name='supplierName'
            value={formData.supplierName}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            label='Vị trí lưu trữ'
            name='storageLocation'
            value={formData.storageLocation}
            onChange={handleChange}
            fullWidth
          />

          <TextField select label='Trạng thái' name='status' value={formData.status} onChange={handleChange} fullWidth>
            <MenuItem value='active'>Hoạt động</MenuItem>
            <MenuItem value='expired'>Hết hạn</MenuItem>
            <MenuItem value='inactive'>Ngưng</MenuItem>
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

export default IngredientBatchCreateModal;
