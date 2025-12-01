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
import { createIngredient } from "@/service/ingredient";
import { getIngredientCategoriesByStore } from "@/service/ingredientCategory";
import { getUnits } from "@/service/unit";

const IngredientCreateModal = ({ open, onClose, storeId, onCreated }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    unit: "",
    category: "",
    reorderLevel: 0,
    status: "ACTIVE",
  });
  const [loading, setLoading] = useState(false);
  const [allUnits, setAllUnits] = useState([]);
  const [allCategories, setAllCategories] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      const [unitRes, categoryRes] = await Promise.all([
        getUnits(storeId, true),
        getIngredientCategoriesByStore(storeId),
      ]);
      setAllUnits(unitRes?.data || []);
      setAllCategories(categoryRes?.data || []);
    };
    fetchInitialData();
  }, [storeId]);

  useEffect(() => {
    if (open) {
      setFormData({
        name: "",
        description: "",
        unitType: "weight",
        unit: "",
        category: "",
        reorderLevel: 0,
        status: "ACTIVE",
      });
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await createIngredient({
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
        Thêm nguyên liệu
        <IconButton aria-label='close' onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <FaTimes />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box className='space-y-4'>
          <TextField
            label='Tên nguyên liệu'
            name='name'
            value={formData.name}
            onChange={handleChange}
            fullWidth
            required
            error={!formData.name}
            helperText={!formData.name ? "Tên là bắt buộc" : ""}
          />

          <TextField
            label='Mô tả'
            name='description'
            value={formData.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={2}
          />

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              select
              label='Loại đơn vị'
              name='unitType'
              value={formData.unitType || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, unitType: e.target.value, unit: "" }))}
              fullWidth
              required
              sx={{ flex: 1 }}
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    style: {
                      maxHeight: 200,
                    },
                  },
                },
              }}
            >
              <MenuItem value='weight'>Khối lượng</MenuItem>
              <MenuItem value='volume'>Thể tích</MenuItem>
              <MenuItem value='count'>Đếm</MenuItem>
            </TextField>

            <TextField
              select
              label='Đơn vị tính'
              name='unit'
              value={formData.unit}
              onChange={handleChange}
              fullWidth
              required
              sx={{ flex: 1 }}
              disabled={!formData.unitType} // disable nếu chưa chọn loại
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    style: {
                      maxHeight: 200,
                    },
                  },
                },
              }}
            >
              {allUnits
                .filter((u) => u.type === formData.unitType)
                .map((u) => (
                  <MenuItem key={u._id} value={u._id}>
                    {u.name}
                  </MenuItem>
                ))}
            </TextField>
          </Box>

          <TextField
            select
            label='Loại nguyên liệu'
            name='category'
            value={formData.category}
            onChange={handleChange}
            fullWidth
            required
            SelectProps={{
              MenuProps: {
                PaperProps: {
                  style: {
                    maxHeight: 200,
                  },
                },
              },
            }}
          >
            {allCategories.map((c) => (
              <MenuItem key={c._id} value={c._id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>

          {/* <TextField
            label='Ngưỡng tồn kho cảnh báo'
            type='number'
            name='reorderLevel'
            value={formData.reorderLevel}
            onChange={handleChange}
            fullWidth
            inputProps={{ min: 0 }}
          /> */}

          <TextField select label='Trạng thái' name='status' value={formData.status} onChange={handleChange} fullWidth>
            <MenuItem value='ACTIVE'>Đang sử dụng</MenuItem>
            <MenuItem value='OUT_OF_STOCK'>Hết hàng</MenuItem>
            <MenuItem value='INACTIVE'>Ngưng sử dụng</MenuItem>
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

export default IngredientCreateModal;
