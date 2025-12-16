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
  Divider,
} from "@mui/material";
import { FaTimes } from "react-icons/fa";

import { createBatch } from "@/service/ingredientBatch";
import { getActiveIngredientCategoriesByStore } from "@/service/ingredientCategory";
import { getIngredientsByCategory } from "@/service/ingredient";
import { getUnitsByBaseUnit } from "@/service/unit";

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
  });

  const [categories, setCategories] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedIngredient, setSelectedIngredient] = useState(null);

  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);

  /* ===================== INIT ===================== */
  useEffect(() => {
    if (!open) return;

    getActiveIngredientCategoriesByStore(storeId).then((res) => setCategories(res?.data || []));

    setFormData((p) => ({
      ...p,
      ingredient: "",
      quantity: 0,
      costPerUnit: 0,
      totalCost: 0,
    }));

    setSelectedCategory("");
    setIngredients([]);
    setUnits([]);
    setSelectedUnit(null);
  }, [open, storeId]);

  /* ===================== LOAD INGREDIENT ===================== */
  useEffect(() => {
    if (!selectedCategory) return setIngredients([]);

    getIngredientsByCategory({ storeId, categoryId: selectedCategory }).then((res) => setIngredients(res?.data || []));
  }, [selectedCategory, storeId]);

  /* ===================== LOAD UNIT ===================== */
  useEffect(() => {
    if (!selectedIngredient?.unit?.name) return;

    const baseUnitName = selectedIngredient.unit.baseUnit || selectedIngredient.unit.name;

    getUnitsByBaseUnit(storeId, baseUnitName, true).then((res) => {
      const list = res?.data || [];
      setUnits(list);

      const defaultUnit = list.find((u) => u._id === selectedIngredient.unit._id) || list[0];

      setSelectedUnit(defaultUnit);
    });
  }, [selectedIngredient, storeId]);

  /* ===================== HANDLER ===================== */
  const handleChange = (e) => {
    const { name, value } = e.target;
    const numValue = ["quantity", "costPerUnit"].includes(name) && value !== "" ? Number(value) : value;

    if (name === "ingredient") {
      const ing = ingredients.find((i) => i._id === value);
      setSelectedIngredient(ing || null);
    }

    setFormData((prev) => {
      const updated = { ...prev, [name]: numValue };
      updated.totalCost = updated.quantity * updated.costPerUnit;
      return updated;
    });
  };

  const handleSave = async () => {
    await createBatch({
      storeId,
      ...formData,
      inputUnit: selectedUnit?._id,
    });
    onCreated?.();
    onClose();
  };

  const isValid = formData.ingredient && selectedUnit && formData.quantity > 0 && formData.costPerUnit > 0;

  /* ===================== UI ===================== */
  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>
        Nhập lô nguyên liệu
        <IconButton onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <FaTimes />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box display='flex' flexDirection='column' gap={2}>
          {/* Category + Ingredient */}
          <Box display='flex' gap={2}>
            <TextField
              select
              label='Loại nguyên liệu'
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              fullWidth
            >
              {categories.map((c) => (
                <MenuItem key={c._id} value={c._id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label='Nguyên liệu'
              name='ingredient'
              value={formData.ingredient}
              onChange={handleChange}
              fullWidth
              disabled={!selectedCategory}
            >
              {ingredients.map((i) => (
                <MenuItem key={i._id} value={i._id}>
                  {i.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Unit */}
          <TextField
            select
            label='Đơn vị nhập'
            value={selectedUnit?._id || ""}
            onChange={(e) => setSelectedUnit(units.find((u) => u._id === e.target.value))}
            fullWidth
            disabled={!units.length}
          >
            {units.map((u) => (
              <MenuItem key={u._id} value={u._id}>
                {u.name}
              </MenuItem>
            ))}
          </TextField>

          {selectedUnit?.ratio > 1 && (
            <Box fontSize={12} color='gray'>
              1 {selectedUnit.name} = {selectedUnit.ratio} {selectedUnit.baseUnit}
            </Box>
          )}

          {/* Quantity + Price */}
          <Box display='flex' gap={2}>
            <TextField
              label='Số lượng'
              type='number'
              name='quantity'
              value={formData.quantity}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label={`Giá / ${selectedUnit?.name || "đơn vị"}`}
              type='number'
              name='costPerUnit'
              value={formData.costPerUnit}
              onChange={handleChange}
              fullWidth
            />
          </Box>

          <TextField label='Tổng tiền' value={formData.totalCost} InputProps={{ readOnly: true }} fullWidth />

          <Divider />

          <Box display='flex' gap={2}>
            <TextField
              label='Ngày nhập'
              type='date'
              name='receivedDate'
              value={formData.receivedDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label='Hạn sử dụng'
              type='date'
              name='expiryDate'
              value={formData.expiryDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
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
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3 }}>
        <Button onClick={onClose} color='error' variant='outlined'>
          Hủy
        </Button>
        <Button onClick={handleSave} variant='contained' disabled={!isValid}>
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IngredientBatchCreateModal;
