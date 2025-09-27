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
import { getIngredientById, updateIngredient } from "@/service/ingredient";
import { getUnits } from "@/service/unit";
import { getIngredientCategoriesByStore } from "@/service/ingredientCategory";
import { toast } from "react-toastify";

const IngredientEditModal = ({ open, onClose, id, storeId, onUpdated }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    unitType: "",
    unit: "",
    category: "",
    reorderLevel: 0,
    status: "ACTIVE", // thay vì isActive
  });

  const [allUnits, setAllUnits] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load Units + Categories
  useEffect(() => {
    if (open) {
      getUnits().then((res) => {
        if (res?.success) setAllUnits(res.data);
      });
      getIngredientCategoriesByStore(storeId).then((res) => {
        if (res?.success) setAllCategories(res.data);
      });
    }
  }, [open, storeId]);

  // Load Ingredient by id
  useEffect(() => {
    if (open && id) {
      const fetchData = async () => {
        try {
          const res = await getIngredientById(id);
          if (res?.success === true) {
            const ing = res.data;
            setFormData({
              name: ing.name,
              description: ing.description || "",
              unitType: ing.unit?.type || "",
              unit: ing.unit?._id || "",
              category: ing.category?._id || "",
              reorderLevel: ing.reorderLevel || 0,
              status: ing.status || "ACTIVE",
            });
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

    if (!formData.name || formData.name.trim() === "") {
      toast.error("Tên nguyên liệu là bắt buộc");
      return;
    }

    if (!formData.unit || !formData.category) {
      toast.error("Đơn vị tính và loại nguyên liệu là bắt buộc");
      return;
    }

    try {
      setLoading(true);
      await updateIngredient({ id, data: formData });
      toast.success("Cập nhật nguyên liệu thành công");
      onUpdated?.();
      onClose();
    } catch (err) {
      console.error("Lỗi khi cập nhật nguyên liệu:", err);
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
        Chỉnh sửa nguyên liệu
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
          />

          <TextField
            label='Mô tả'
            name='description'
            value={formData.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
          />

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              select
              label='Loại đơn vị'
              name='unitType'
              value={formData.unitType}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  unitType: e.target.value,
                  unit: "",
                }))
              }
              fullWidth
              required
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
          >
            {allCategories.map((c) => (
              <MenuItem key={c._id} value={c._id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label='Ngưỡng tồn kho cảnh báo'
            type='number'
            name='reorderLevel'
            value={formData.reorderLevel}
            onChange={handleChange}
            fullWidth
            inputProps={{ min: 0 }}
          />

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

export default IngredientEditModal;
