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
import { FaTimes, FaPlus, FaMinus } from "react-icons/fa";
import { createTopping } from "@/service/topping";
import { getActiveIngredientCategoriesByStore } from "@/service/ingredientCategory";
import { getIngredientsByCategory } from "@/service/ingredient";
import { toast } from "react-toastify";

const ToppingCreateToGroupModal = ({ open, onClose, storeId, toppingGroup, onCreated }) => {
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    isActive: true,
    ingredients: [],
  });
  const [allCategories, setAllCategories] = useState([]);
  const [ingredientsByCategory, setIngredientsByCategory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedIngredient, setSelectedIngredient] = useState("");
  const [loading, setLoading] = useState(false);

  // Lấy danh sách loại nguyên liệu
  useEffect(() => {
    if (open) {
      setFormData({ name: "", price: 0, isActive: true, ingredients: [] });
      const fetchCategories = async () => {
        const res = await getActiveIngredientCategoriesByStore(storeId);
        setAllCategories(res?.data || []);
      };
      fetchCategories();
      setSelectedCategory("");
      setIngredientsByCategory([]);
    }
  }, [open, storeId]);

  // Khi chọn loại nguyên liệu → load danh sách nguyên liệu theo loại
  useEffect(() => {
    if (!selectedCategory) return setIngredientsByCategory([]);
    const fetchIngredients = async () => {
      const res = await getIngredientsByCategory({ storeId, categoryId: selectedCategory });
      setIngredientsByCategory(res?.data || []);
    };
    fetchIngredients();
  }, [selectedCategory]);

  const addIngredient = (ingredient) => {
    if (!formData.ingredients.find((i) => i.ingredient._id === ingredient._id)) {
      setFormData((prev) => ({
        ...prev,
        ingredients: [...prev.ingredients, { ingredient, quantity: 1 }],
      }));
    }
  };

  const removeIngredient = (id) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((i) => i.ingredient._id !== id),
    }));
  };

  const updateQuantity = (id, delta) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((i) =>
        i.ingredient._id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i
      ),
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Tên Món thêm là bắt buộc");
      return;
    }

    if (formData.ingredients.length === 0) {
      toast.error("Cần chọn ít nhất 1 nguyên liệu");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: formData.name,
        price: formData.price,
        isActive: formData.isActive,
        ingredients: formData.ingredients.map((i) => ({
          ingredient: i.ingredient._id,
          quantity: i.quantity,
        })),
        toppingGroupIds: [toppingGroup._id],
      };
      await createTopping({ storeId, data: payload });
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
        Thêm món thêm cho nhóm
        <IconButton aria-label='close' onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <FaTimes />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box className='space-y-4'>
          <TextField label='Nhóm món thêm' value={toppingGroup.name} fullWidth InputProps={{ readOnly: true }} />

          <TextField
            label='Tên Món thêm'
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            fullWidth
            required
          />

          <TextField
            label='Giá'
            type='number'
            value={formData.price}
            onChange={(e) => setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))}
            fullWidth
            required
          />

          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            {/* Select loại nguyên liệu */}
            <TextField
              select
              label='Loại nguyên liệu'
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedIngredient(""); // reset khi đổi loại
              }}
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
              {allCategories.map((c) => (
                <MenuItem key={c._id} value={c._id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>

            {/* Select nguyên liệu theo loại */}
            <TextField
              select
              label='Nguyên liệu'
              value={selectedIngredient}
              onChange={(e) => {
                const ingId = e.target.value;
                setSelectedIngredient(ingId);
                const ing = ingredientsByCategory.find((i) => i._id === ingId);
                if (ing) addIngredient(ing);
              }}
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
              disabled={!selectedCategory}
            >
              {ingredientsByCategory.map((ing) => (
                <MenuItem key={ing._id} value={ing._id}>
                  {ing.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Nguyên liệu đã chọn */}
          {formData.ingredients.length > 0 && (
            <Box className='border rounded-md space-y-1'>
              {formData.ingredients.map((i) => {
                // Xác định bước tăng/giảm theo loại unit
                let step = 1;
                let unitLabel = i.ingredient.unit?.name || "";

                switch (i.ingredient.unit?.type) {
                  case "weight":
                    step = 50; // 50g
                    if (!unitLabel) unitLabel = "g";
                    break;
                  case "volume":
                    step = 10; // 10ml
                    if (!unitLabel) unitLabel = "ml";
                    break;
                  case "count":
                    step = 1; // 1 cái
                    if (!unitLabel) unitLabel = "cái";
                    break;
                  default:
                    step = 1;
                }

                return (
                  <Box
                    key={i.ingredient._id}
                    className='flex justify-between items-center py-1 px-2 bg-gray-50 rounded'
                  >
                    <span className='font-medium'>{i.ingredient.name}</span>
                    <Box className='flex items-center gap-1'>
                      <IconButton size='small' onClick={() => updateQuantity(i.ingredient._id, -step)}>
                        <FaMinus />
                      </IconButton>

                      {/* Input để chỉnh số lượng trực tiếp */}
                      <TextField
                        size='small'
                        type='number'
                        value={i.quantity}
                        onChange={(e) => {
                          const val = Math.max(0, Number(e.target.value)); // không cho âm
                          setFormData((prev) => ({
                            ...prev,
                            ingredients: prev.ingredients.map((ing) =>
                              ing.ingredient._id === i.ingredient._id ? { ...ing, quantity: val } : ing
                            ),
                          }));
                        }}
                        inputProps={{ step }}
                        sx={{ width: 70, textAlign: "center" }}
                      />

                      <span>{unitLabel}</span>

                      <IconButton size='small' onClick={() => updateQuantity(i.ingredient._id, step)}>
                        <FaPlus />
                      </IconButton>
                      <IconButton size='small' color='error' onClick={() => removeIngredient(i.ingredient._id)}>
                        🗑️
                      </IconButton>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}

          <TextField
            select
            label='Trạng thái'
            value={formData.isActive}
            onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.value === "true" }))}
            fullWidth
          >
            <MenuItem value='true'>Hoạt động</MenuItem>
            <MenuItem value='false'>Ngưng</MenuItem>
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

export default ToppingCreateToGroupModal;
