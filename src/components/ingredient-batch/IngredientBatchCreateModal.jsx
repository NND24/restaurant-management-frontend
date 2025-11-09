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
import { getActiveIngredientCategoriesByStore } from "@/service/ingredientCategory";
import { getIngredientsByCategory } from "@/service/ingredient";

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
  const [allCategories, setAllCategories] = useState([]);
  const [ingredientsByCategory, setIngredientsByCategory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  // Lấy danh sách category khi mở modal
  useEffect(() => {
    if (open) {
      const fetchCategories = async () => {
        const res = await getActiveIngredientCategoriesByStore(storeId);
        setAllCategories(res?.data || []);
      };
      fetchCategories();

      // reset form
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
      setSelectedCategory("");
      setIngredientsByCategory([]);
    }
  }, [open, storeId]);

  // Khi chọn category thì load nguyên liệu
  useEffect(() => {
    if (!selectedCategory) return setIngredientsByCategory([]);
    const fetchIngredients = async () => {
      const res = await getIngredientsByCategory({ storeId, categoryId: selectedCategory });
      setIngredientsByCategory(res?.data || []);
    };
    fetchIngredients();
  }, [selectedCategory, storeId]);

  const [selectedIngredient, setSelectedIngredient] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (["quantity", "costPerUnit"].includes(name)) {
      newValue = parseFloat(value) || 0;
    }

    if (name === "ingredient") {
      const ing = ingredientsByCategory.find((item) => item._id === value);
      setSelectedIngredient(ing || null);
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
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            {/* chọn loại nguyên liệu */}
            <TextField
              select
              label='Loại nguyên liệu'
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setFormData((prev) => ({ ...prev, ingredient: "" }));
              }}
              fullWidth
            >
              {allCategories.map((c) => (
                <MenuItem key={c._id} value={c._id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>

            {/* chọn nguyên liệu theo loại */}
            <TextField
              select
              label='Nguyên liệu'
              name='ingredient'
              value={formData.ingredient}
              onChange={handleChange}
              fullWidth
              required
              disabled={!selectedCategory}
            >
              {ingredientsByCategory.map((ing) => (
                <MenuItem key={ing._id} value={ing._id}>
                  {ing.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>

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
              label={`Giá / ${selectedIngredient?.unit?.name || "đơn vị"}`}
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
              inputProps={{
                min: new Date().toISOString().slice(0, 10),
              }}
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
            <MenuItem value='finished'>Đã dùng hết</MenuItem>
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
